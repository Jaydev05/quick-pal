import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { companySchema } from "./desk";

export const crmCompanies = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { assertStaff } = await import("./staff-access.server");
  await assertStaff(context.supabase, context.userId, true);
  const rows = [];
  for (let page = 0; ; page++) {
    const { data, error } = await context.supabase.from("crm_companies").select("*").order("name").order("id").range(page * 500, page * 500 + 499);
    if (error) throw new Error("Partner companies could not be loaded.");
    rows.push(...(data ?? []));
    if ((data?.length ?? 0) < 500) break;
  }
  return rows;
});
export const crmSaveCompany = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator(companySchema).handler(async ({ data, context }) => {
  const { assertStaff } = await import("./staff-access.server");
  await assertStaff(context.supabase, context.userId, true);
  const { id, ...fields } = data;
  const query = id ? context.supabase.from("crm_companies").update(fields).eq("id", id) : context.supabase.from("crm_companies").insert(fields);
  const { data: row, error } = await query.select("id").single();
  if (error || !row) throw new Error("Partner company could not be saved.");
  return row;
});
export const crmOfferUrl = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator(z.object({ id: z.string().uuid() })).handler(async ({ data, context }) => {
  const { assertStaff } = await import("./staff-access.server");
  await assertStaff(context.supabase, context.userId, true);
  const { data: row, error } = await context.supabase.from("desk_candidates").select("offer_path").eq("id", data.id).single();
  if (error || !row?.offer_path) throw new Error("No offer letter is attached.");
  const { data: signed, error: fileError } = await context.supabase.storage.from("desk-resumes").createSignedUrl(row.offer_path, 120);
  if (fileError || !signed) throw new Error("Offer letter could not be opened.");
  return { url: signed.signedUrl };
});