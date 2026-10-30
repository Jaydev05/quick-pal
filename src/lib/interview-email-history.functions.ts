import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { EmailHistoryEntry } from "./interview-email-history";

export const getInterviewEmailHistory = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<EmailHistoryEntry[]> => {
    const { assertStaff } = await import("./staff-access.server");
    await assertStaff(context.supabase, context.userId, true);
    const { data, error } = await context.supabase.from("admin_activity_logs")
      .select("id,details").eq("entity_type", "interview_email")
      .order("created_at", { ascending: false }).limit(200);
    if (error) throw new Error("Email history could not be loaded.");
    return (data ?? []).map((row) => {
      const d = row.details as Record<string, unknown> | null;
      const text = (key: string) => typeof d?.[key] === "string" ? d[key] as string : null;
      return { id: row.id, recipient: text("recipient") ?? "—", subject: text("subject") ?? "—",
        sentAt: text("sentAt"), status: text("status") ?? "unknown", providerId: text("providerId"), html: text("html") };
    });
  });