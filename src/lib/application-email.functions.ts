import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { APPLICATION_STATUS_LIST, type ApplicationStatus } from "@/lib/status";
import { sendApplicationEmail } from "@/lib/application-email.server";

const applicationIdSchema = z.object({ applicationId: z.string().uuid() });
const statusSchema = z.object({
  applicationId: z.string().uuid(),
  status: z.enum(APPLICATION_STATUS_LIST as [ApplicationStatus, ...ApplicationStatus[]]),
});

type NotificationKind = "application_confirmation" | "status_change";

async function authorizeAdmin(
  supabase: Parameters<Parameters<typeof requireSupabaseAuth>[0]>[0] extends never ? never : never,
) {
  return supabase;
}

async function claimNotification(
  applicationId: string,
  candidateId: string,
  email: string,
  notificationType: NotificationKind,
  previousStatus: ApplicationStatus | null,
  newStatus: ApplicationStatus,
  statusHistoryId?: string,
) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("notification_logs")
    .insert({
      application_id: applicationId,
      candidate_id: candidateId,
      email,
      notification_type: notificationType,
      previous_status: previousStatus,
      new_status: newStatus,
      status_history_id: statusHistoryId ?? null,
    })
    .select("id")
    .single();

  if (error?.code === "23505") return null;
  if (error) throw error;
  return data.id;
}

async function finishNotification(logId: string, sent: boolean, errorMessage?: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { error } = await supabaseAdmin
    .from("notification_logs")
    .update({
      delivery_status: sent ? "sent" : "failed",
      sent_at: sent ? new Date().toISOString() : null,
      error_message: errorMessage?.slice(0, 500) ?? null,
    })
    .eq("id", logId);
  if (error) console.error("Could not update notification log", error.message);
}

export const sendApplicationConfirmation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => applicationIdSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: application, error } = await supabaseAdmin
      .from("applications")
      .select("id, application_code, applied_at, candidate_id, current_status, jobs(title), profiles:candidate_id(full_name, email)")
      .eq("id", data.applicationId)
      .eq("candidate_id", context.userId)
      .maybeSingle();
    if (error || !application) throw new Error("Application not found");

    const profile = application.profiles as unknown as { full_name: string | null; email: string | null } | null;
    const job = application.jobs as unknown as { title: string } | null;
    if (!profile?.email || !job?.title) {
      console.error("Application confirmation skipped because recipient data is incomplete", application.id);
      return { sent: false, duplicate: false };
    }

    const logId = await claimNotification(
      application.id,
      application.candidate_id,
      profile.email,
      "application_confirmation",
      null,
      application.current_status,
    );
    if (!logId) return { sent: false, duplicate: true };

    try {
      await sendApplicationEmail(
        {
          to: profile.email,
          candidateName: profile.full_name ?? "Candidate",
          jobTitle: job.title,
          applicationCode: application.application_code,
          eventDate: application.applied_at,
          idempotencyKey: `application-confirmation-${application.id}`,
        },
        "confirmation",
      );
      await finishNotification(logId, true);
      return { sent: true, duplicate: false };
    } catch (emailError) {
      const message = emailError instanceof Error ? emailError.message : "Unknown email error";
      console.error("Application confirmation email failed", application.id, message);
      await finishNotification(logId, false, message);
      return { sent: false, duplicate: false };
    }
  });

export const updateApplicationStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => statusSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { data: isAdmin, error: roleError } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (roleError || !isAdmin) throw new Error("Forbidden");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: application, error: loadError } = await supabaseAdmin
      .from("applications")
      .select("id, application_code, candidate_id, current_status, jobs(title), profiles:candidate_id(full_name, email)")
      .eq("id", data.applicationId)
      .maybeSingle();
    if (loadError || !application) throw new Error("Application not found");

    const previousStatus = application.current_status;
    if (previousStatus === data.status) return { updated: false, notificationSent: false, duplicate: true };

    const { error: updateError } = await context.supabase
      .from("applications")
      .update({ current_status: data.status })
      .eq("id", data.applicationId);
    if (updateError) throw updateError;

    const { data: history } = await supabaseAdmin
      .from("application_status_history")
      .select("id, created_at")
      .eq("application_id", application.id)
      .eq("previous_status", previousStatus)
      .eq("new_status", data.status)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const profile = application.profiles as unknown as { full_name: string | null; email: string | null } | null;
    const job = application.jobs as unknown as { title: string } | null;
    if (!profile?.email || !job?.title || !history) {
      console.error("Status email skipped because notification data is incomplete", application.id);
      return { updated: true, notificationSent: false, duplicate: false };
    }

    const logId = await claimNotification(
      application.id,
      application.candidate_id,
      profile.email,
      "status_change",
      previousStatus,
      data.status,
      history.id,
    );
    if (!logId) return { updated: true, notificationSent: false, duplicate: true };

    const { data: interview } = data.status === "interview_scheduled"
      ? await supabaseAdmin
          .from("interviews")
          .select("interview_date, interview_time, mode, location_or_link")
          .eq("application_id", application.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle()
      : { data: null };

    try {
      await sendApplicationEmail(
        {
          to: profile.email,
          candidateName: profile.full_name ?? "Candidate",
          jobTitle: job.title,
          applicationCode: application.application_code,
          eventDate: history.created_at,
          previousStatus,
          newStatus: data.status,
          interview: interview
            ? {
                date: interview.interview_date,
                time: interview.interview_time,
                mode: interview.mode,
                locationOrLink: interview.location_or_link,
              }
            : null,
          idempotencyKey: `application-status-${history.id}`,
        },
        "status",
      );
      await finishNotification(logId, true);
      return { updated: true, notificationSent: true, duplicate: false };
    } catch (emailError) {
      const message = emailError instanceof Error ? emailError.message : "Unknown email error";
      console.error("Application status email failed", application.id, message);
      await finishNotification(logId, false, message);
      return { updated: true, notificationSent: false, duplicate: false };
    }
  });