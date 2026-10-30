import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { composedEmailSchema, renderComposedEmail, type ComposedEmail } from "./admin-email";
import { assertStaff } from "./staff-access.server";
import { sendStaffEmail } from "./staff-email.server";

type AdminClient = SupabaseClient<Database>;
type SendResult = { status: "accepted" | "failed" | "pending"; duplicate?: boolean };

export async function sendComposedEmail(client: AdminClient, userId: string, input: ComposedEmail, audit: AdminClient): Promise<SendResult> {
  await assertStaff(client, userId, true);
  const data = composedEmailSchema.parse(input);
  const html = renderComposedEmail(data);
  const details = { recipient: data.recipient, subject: data.subject, html, sentAt: null as string | null, status: "pending", providerId: null as string | null };
  // The request UUID is the audit row primary key; it atomically claims this send.
  const { error: reserveError } = await audit.from("admin_activity_logs").insert({ id: data.requestId, actor_id: userId, action: "email_composed", entity_type: "composed_email", entity_id: data.requestId, details });
  if (reserveError) {
    if (reserveError.code !== "23505") throw new Error("Could not record this email. Nothing was sent.");
    const { data: previous, error } = await client.from("admin_activity_logs").select("details").eq("id", data.requestId).eq("actor_id", userId).eq("entity_type", "composed_email").maybeSingle();
    if (error || !previous) throw new Error("Could not verify the previous send. Refresh email history before trying again.");
    const status = (previous.details as Record<string, unknown> | null)?.status;
    return { status: status === "accepted" ? "accepted" : status === "failed" ? "failed" : "pending", duplicate: true };
  }
  try {
    details.providerId = await sendStaffEmail(data.recipient, data.subject, "", `composed-email-${data.requestId}`, html);
    details.status = "accepted";
    details.sentAt = new Date().toISOString();
  } catch {
    details.status = "failed";
  }
  const { error } = await audit.from("admin_activity_logs").update({ details }).eq("id", data.requestId).eq("actor_id", userId);
  if (error) console.error("Email history outcome could not be saved", error.code);
  return { status: details.status === "accepted" ? "accepted" : "failed" };
}

export async function readResend(path: string) {
  const gatewayKey = process.env["LOVABLE_API_KEY"];
  const connectionKey = process.env["RESEND_API_KEY"];
  if (!gatewayKey || !connectionKey) return { available: false as const, message: "Email service is unavailable." };
  const response = await fetch(`https://connector-gateway.lovable.dev/resend${path}`, { headers: { Authorization: `Bearer ${gatewayKey}`, "X-Connection-Api-Key": connectionKey } });
  if (!response.ok) {
    const body = await response.text();
    // Do not log message bodies or account data.
    console.error("Resend email read rejected", response.status);
    return { available: false as const, message: body.includes("restricted_api_key") ? "Your Resend connection has sending-only access. Received emails need a Full access key and a domain configured for receiving in Resend. Your existing mailbox is unchanged." : "Received emails could not be loaded. Check receiving access in Resend." };
  }
  return { available: true as const, data: await response.json() as Record<string, unknown> };
}