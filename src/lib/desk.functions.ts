import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { candidateSchema, companySchema, itemSchema, callSchema, searchSchema, identityKeys } from "./desk";

const idSchema = z.object({ id: z.string().uuid() });
async function authorize(context: {
  supabase: import("@supabase/supabase-js").SupabaseClient<
    import("@/integrations/supabase/types").Database
  >;
  userId: string;
}) {
  const { assertStaff } = await import("./staff-access.server");
  await assertStaff(context.supabase, context.userId, true);
}
export const deskAccess = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await authorize(context);
    return { allowed: true };
  });
export const deskSnapshot = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await authorize(context);
    const client = context.supabase;
    const allItems = [];
    const allCalls = [];
    const allCandidates = [];
    for (let page = 0; ; page++) {
      const { data, error } = await client
        .from("desk_items")
        .select("*")
        .order("created_at", { ascending: false })
        .order("id")
        .range(page * 500, page * 500 + 499);
      if (error) throw new Error("Could not load activities.");
      allItems.push(...(data ?? []));
      if ((data?.length ?? 0) < 500) break;
    }
    for (let page = 0; ; page++) {
      const { data, error } = await client
        .from("desk_calls")
        .select("*, candidate:desk_candidates(id,full_name,phone,email)")
        .order("called_at", { ascending: false })
        .order("id")
        .range(page * 500, page * 500 + 499);
      if (error) throw new Error("Could not load call history.");
      allCalls.push(...(data ?? []));
      if ((data?.length ?? 0) < 500) break;
    }
    for (let page = 0; ; page++) {
      const { data, error } = await client
        .from("desk_candidates")
        .select("id,full_name,phone,email,created_at,resume_path")
        .order("id")
        .range(page * 500, page * 500 + 499);
      if (error) throw new Error("Could not load candidate totals.");
      allCandidates.push(...(data ?? []));
      if ((data?.length ?? 0) < 500) break;
    }
    const activity = [];
    for (let page = 0; ; page++) {
      const { data, error } = await client
        .from("desk_activity")
        .select("*")
        .order("created_at", { ascending: false })
        .order("id")
        .range(page * 500, page * 500 + 499);
      if (error) throw new Error("Could not load activity history.");
      activity.push(...(data ?? []));
      if ((data?.length ?? 0) < 500) break;
    }
    return {
      items: allItems,
      calls: allCalls,
      candidates: allCandidates,
      activity,
      searches: activity
        .filter((a) => a.action === "search")
        .map((a) => ({ label: a.label, created_at: a.created_at })),
    };
  });
export type DeskSnapshot = Awaited<ReturnType<typeof deskSnapshot>>;
export type DeskItem = DeskSnapshot["items"][number];
export type DeskCall = DeskSnapshot["calls"][number];
export const deskCandidates = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(searchSchema)
  .handler(async ({ data, context }) => {
    await authorize(context);
    let query = context.supabase
      .from("desk_candidates")
      .select(
        "id,full_name,phone,email,education,specialization,college,skills,experience_years,designation,company,location,preferred_location,summary,keywords,resume_path,resume_name,processing_status,created_at,updated_at,recruitment_status,source,desired_job,arrived_on,interview_on,placed_on,placement_company,partner_id,salary_package,offer_path,offer_name,notes",
        { count: "exact" },
      );
    if (data.q)
      query = query.textSearch("search_vector", data.q, { type: "websearch", config: "english" });
    if (data.status) query = query.eq("recruitment_status", data.status);
    if (data.placed === "only") query = query.eq("recruitment_status", "Placed");
    if (data.placed === "exclude") query = query.neq("recruitment_status", "Placed");
    if (data.resumesOnly) query = query.neq("resume_path", "");
    for (const key of ["education", "specialization", "skills", "location", "designation"] as const)
      if (data[key]) query = query.ilike(key, `%${data[key].replace(/[%_]/g, "\\$&")}%`);
    if (data.min !== undefined) query = query.gte("experience_years", data.min);
    if (data.max !== undefined) query = query.lte("experience_years", data.max);
    if (data.uploadedAfter) query = query.gte("created_at", data.uploadedAfter);
    query =
      data.sort === "name"
        ? query.order("full_name")
        : data.sort === "experience"
          ? query.order("experience_years", { ascending: false, nullsFirst: false })
          : query.order("created_at", { ascending: false });
    const {
      data: rows,
      error,
      count,
    } = await query.order("id").range(data.page * 50, data.page * 50 + 49);
    if (error) throw new Error("Candidate search could not finish.");
    return { rows: rows ?? [], count: count ?? 0 };
  });
export type DeskCandidate = Awaited<ReturnType<typeof deskCandidates>>["rows"][number];
export const deskRecordSearch = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ q: z.string().trim().min(1).max(300) }))
  .handler(async ({ data, context }) => {
    await authorize(context);
    const { error } = await context.supabase
      .from("desk_activity")
      .insert({
        entity_type: "resume_search",
        action: "search",
        label: data.q,
        actor_id: context.userId,
      });
    if (error) throw new Error("Could not record search.");
    return { ok: true };
  });
export const deskSaveCandidate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(candidateSchema)
  .handler(async ({ data, context }) => {
    await authorize(context);
    if (data.resume_path && !data.resume_path.startsWith(`${context.userId}/`))
      throw new Error("Invalid private resume reference.");
    if (data.offer_path && !data.offer_path.startsWith(`${context.userId}/`))
      throw new Error("Invalid private offer-letter reference.");
    const keys = identityKeys(data.email, data.phone);
    const { id, ...fields } = data;
    const record = { ...fields, email: keys.email, email_key: keys.email, phone_key: keys.phone };
    const query = id
      ? context.supabase.from("desk_candidates").update(record).eq("id", id)
      : context.supabase.from("desk_candidates").insert(record);
    const { data: saved, error } = await query.select("id").single();
    if (error?.code === "23505")
      throw new Error(
        "This email, mobile number or resume is already stored. Open that candidate to replace the resume.",
      );
    if (error || !saved) throw new Error("Candidate could not be saved.");
    return saved;
  });
export const deskCandidateDetails = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(idSchema)
  .handler(async ({ data, context }) => {
    await authorize(context);
    const { data: row, error } = await context.supabase
      .from("desk_candidates")
      .select("*")
      .eq("id", data.id)
      .single();
    if (error || !row) throw new Error("Candidate could not be opened.");
    const { search_vector: _vector, ...profile } = row;
    return profile;
  });
export const deskDuplicate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ hash: z.string().length(64) }))
  .handler(async ({ data, context }) => {
    await authorize(context);
    const { data: row, error } = await context.supabase
      .from("desk_candidates")
      .select("id,full_name")
      .eq("file_hash", data.hash)
      .maybeSingle();
    if (error) throw new Error("Could not check this resume.");
    return row;
  });
export const deskSaveItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(itemSchema)
  .handler(async ({ data, context }) => {
    await authorize(context);
    const { id, ...fields } = data;
    const query = id
      ? context.supabase.from("desk_items").update(fields).eq("id", id)
      : context.supabase.from("desk_items").insert(fields);
    const { error } = await query.select("id").single();
    if (error) throw new Error("Activity could not be saved.");
    return { ok: true };
  });
export const deskSaveCall = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(callSchema)
  .handler(async ({ data, context }) => {
    await authorize(context);
    // Every discussion is an immutable new call; rescheduling belongs to its linked follow-up.
    if (data.id) throw new Error("Record a new call to preserve previous discussions.");
    const { id: _id, ...fields } = data;
    const { error } = await context.supabase.from("desk_calls").insert(fields);
    if (error) throw new Error("Call could not be saved.");
    return { ok: true };
  });
export const deskRemove = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid(), type: z.enum(["candidate", "item"]) }))
  .handler(async ({ data, context }) => {
    await authorize(context);
    if (data.type === "candidate") {
      const { data: row, error } = await context.supabase
        .from("desk_candidates")
        .select("resume_path")
        .eq("id", data.id)
        .single();
      if (error) throw new Error("Candidate could not be found.");
      if (row.resume_path) {
        const { error: fileError } = await context.supabase.storage
          .from("desk-resumes")
          .remove([row.resume_path]);
        if (fileError) throw new Error("Private resume could not be deleted. Please retry.");
      }
    }
    const { error } = await context.supabase
      .from(data.type === "candidate" ? "desk_candidates" : "desk_items")
      .delete()
      .eq("id", data.id)
      .select("id")
      .single();
    if (error) throw new Error("Record could not be deleted.");
    return { ok: true };
  });
export const deskResumeUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(idSchema.extend({ download: z.boolean().default(false) }))
  .handler(async ({ data, context }) => {
    await authorize(context);
    const { data: row, error } = await context.supabase
      .from("desk_candidates")
      .select("resume_path,resume_name")
      .eq("id", data.id)
      .single();
    if (error || !row?.resume_path) throw new Error("No resume is attached.");
    const { data: url, error: urlError } = await context.supabase.storage
      .from("desk-resumes")
      .createSignedUrl(
        row.resume_path,
        120,
        data.download ? { download: row.resume_name } : undefined,
      );
    if (urlError || !url) throw new Error("Resume could not be opened.");
    return { url: url.signedUrl };
  });

export const deskAiResume = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ text: z.string().min(20).max(60000) }))
  .handler(async ({ data, context }) => {
    await authorize(context);
    const { groqResumeProfile } = await import("./groq-resume.server");
    return groqResumeProfile(data.text);
  });

// Read the authorized record first; privileged storage access avoids signing/proxy failures.
export const deskDocument = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(idSchema.extend({ offer: z.boolean().default(false) }))
  .handler(async ({ data, context }) => {
    await authorize(context);
    const { data: row, error } = await context.supabase.from("desk_candidates")
      .select("resume_path,resume_name,offer_path,offer_name,extracted_text").eq("id", data.id).single();
    const path = data.offer ? row?.offer_path : row?.resume_path;
    if (error || !row || !path) throw new Error("No document is attached.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: file, error: fileError } = await supabaseAdmin.storage.from("desk-resumes").download(path);
    if (fileError || !file) throw new Error("Document could not be read. Please retry.");
    if (file.size > 10 * 1024 * 1024) throw new Error("This document is too large to preview.");
    const { Buffer } = await import("node:buffer");
    return { base64: Buffer.from(await file.arrayBuffer()).toString("base64"), name: (data.offer ? row.offer_name : row.resume_name) || path.split("/").pop() || "document.pdf", text: data.offer ? "" : row.extracted_text };
  });

// One resume per request keeps costs bounded and lets the caller stop between records.
export const deskRepairResume = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(idSchema.extend({ text: z.string().max(60000).optional() }))
  .handler(async ({ data, context }) => {
    await authorize(context);
    const { data: row, error } = await context.supabase.from("desk_candidates").select("id,extracted_text,file_hash,resume_path,updated_at").eq("id", data.id).single();
    if (error || !row?.resume_path) return { status: "failed" as const, message: "No resume is attached." };
    const text = data.text || row.extracted_text;
    if (text.trim().length < 20) return { status: "unreadable" as const, message: "This resume needs text extraction or manual review." };
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`crm-profile-v2:${text}`));
    const hash = Array.from(new Uint8Array(digest), n => n.toString(16).padStart(2, "0")).join("");
    const { data: cached, error: cacheError } = await context.supabase.from("desk_activity").select("id").eq("entity_id", row.id).eq("action", "resume_enriched").eq("label", hash).limit(1);
    if (cacheError) return { status: "failed" as const, message: "Could not check previous analysis." };
    if (cached?.length) return { status: "cached" as const, message: "Already analysed." };
    try {
      const { groqResumeProfile } = await import("./groq-resume.server");
      const { resumeProfilePatch } = await import("./crm-resume");
      const patch = resumeProfilePatch(await groqResumeProfile(text));
      if (!Object.keys(patch).length) return { status: "failed" as const, message: "No reliable details were found." };
      const { data: saved, error: updateError } = await context.supabase.from("desk_candidates").update({ ...patch, extracted_text: text, processing_status: "Needs review" }).eq("id", row.id).eq("updated_at", row.updated_at).select("id").maybeSingle();
      if (updateError || !saved) return { status: "failed" as const, message: "Record changed or could not be saved. Please review it." };
      const { error: logError } = await context.supabase.from("desk_activity").insert({ entity_id: row.id, entity_type: "desk_candidates", action: "resume_enriched", label: hash, actor_id: context.userId });
      return { status: "updated" as const, message: logError ? "Updated; analysis cache could not be recorded." : "Resume details updated." };
    } catch (e) { return { status: "failed" as const, message: e instanceof Error ? e.message : "Resume analysis could not finish." }; }
  });
