import { brandedEmailHtml, escapeEmailText } from "./admin-email";

export const htmlEscape = escapeEmailText;
export async function sendStaffEmail(to: string, subject: string, content: string, key: string, fullHtml?: string) {
  const gatewayKey = process.env["LOVABLE_API_KEY"];
  const connectionKey = process.env["RESEND_API_KEY"];
  if (!gatewayKey || !connectionKey) throw new Error("Email service is unavailable.");
  const html = fullHtml ?? brandedEmailHtml(subject, content);
  const response = await fetch("https://connector-gateway.lovable.dev/resend/emails", {
    method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${gatewayKey}`, "X-Connection-Api-Key": connectionKey, "Idempotency-Key": key },
    body: JSON.stringify({ from: "Jaydev Associates <info@jaydevassociates.com>", reply_to: "info@jaydevassociates.com", to: [to], subject, html }),
  });
  if (!response.ok) {
    // Do not log the request body: it contains one-time credentials.
    console.error("Staff email rejected", response.status);
    throw new Error("The email could not be sent. Please try again.");
  }
  return (await response.json() as { id: string }).id;
}