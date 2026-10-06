import { createServerFn } from "@tanstack/react-start";
import { APICallError, NoObjectGeneratedError } from "ai";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { ownedResumePath, validateResumeFile, type ResumeProfile } from "./resume-profile";
import { extractResumeProfile } from "./resume-analysis.server";

export type ResumeAnalysisResult = { data: ResumeProfile | null; error: string | null; paused?: boolean };
export const analyseMyResume = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ path: z.string().max(300), filename: z.string().max(255) }))
  .handler(async ({ data, context }): Promise<ResumeAnalysisResult> => {
    if (!ownedResumePath(data.path, context.userId)) throw new Error("You can only analyse your own resume.");
    const { data: file, error } = await context.supabase.storage.from("resumes").download(data.path);
    if (error || !file) return { data: null, error: "Resume could not be read. Please try uploading it again." };
    let extension: string;
    try { extension = validateResumeFile({ name: data.path, size: file.size }); }
    catch (error) { return { data: null, error: error instanceof Error ? error.message : "Invalid resume." }; }
    // Service-role access is only for durable AI service-state, never candidate reads.
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: state, error: stateError } = await supabaseAdmin.from("resume_analysis_service_state").select("paused,message").eq("feature", "resume_profile").single();
    if (stateError) return { data: null, error: "Resume autofill is temporarily unavailable. You can still save your resume and enter details manually." };
    if (state.paused) return { data: null, error: state.message || "Resume analysis is paused. Please contact Jaydev Associates.", paused: true };
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) return { data: null, error: "Resume autofill is not configured. You can still complete your profile manually." };
    try {
      return { data: await extractResumeProfile(new Uint8Array(await file.arrayBuffer()), extension, data.filename, apiKey), error: null };
    } catch (error) {
      let message = "Resume autofill could not finish. You can still save the resume and complete your profile manually.";
      let status = 0;
      if (APICallError.isInstance(error)) {
        status = error.statusCode ?? 0;
        if ([402,403].includes(status)) {
          try { const body = JSON.parse(error.responseBody ?? "{}"); message = typeof body.message === "string" ? body.message : typeof body.error?.message === "string" ? body.error.message : "Resume analysis is unavailable due to an AI access or credit limit. Please contact Jaydev Associates."; } catch { /* use safe fallback */ }
          await supabaseAdmin.from("resume_analysis_service_state").update({paused:true,status_code:status,message,updated_at:new Date().toISOString()}).eq("feature","resume_profile");
        } else if (status === 429) message = "Resume analysis is busy. Please try again later; manual profile entry is still available.";
        else if (status === 401) message = "Resume autofill needs a service configuration update. Please contact Jaydev Associates.";
        else if (status === 404) message = "Resume autofill is currently unavailable. Please enter your profile details manually.";
      } else if (NoObjectGeneratedError.isInstance(error)) message = "The resume could not be read clearly. Please check your file or enter your details manually.";
      else if (error instanceof Error && /valid PDF|valid Word|Legacy|readable text|too long|No readable/.test(error.message)) message = error.message;
      console.error("Resume analysis failed", {status, type:error instanceof Error ? error.name : "unknown"});
      return { data: null, error: message, paused: [402,403].includes(status) };
    }
  });

export const resumeAnalysisAccess = createServerFn({method:"POST"})
  .middleware([requireSupabaseAuth])
  .handler(async ({context}) => {
    const {data:role,error} = await context.supabase.from("user_roles").select("role").eq("user_id",context.userId).eq("role","admin").maybeSingle();
    if (error || !role) throw new Error("Admin access required.");
    const {supabaseAdmin} = await import("@/integrations/supabase/client.server");
    const {error:saveError} = await supabaseAdmin.from("resume_analysis_service_state").update({paused:false,status_code:null,message:null,updated_at:new Date().toISOString()}).eq("feature","resume_profile");
    if(saveError) throw new Error("Could not resume analysis.");
    return {ok:true};
  });