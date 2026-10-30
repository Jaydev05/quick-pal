import logo from "@/assets/jaydev-logo.png.asset.json";

export const htmlEscape = (v: string) => v.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] ?? c);
export async function sendStaffEmail(to: string, subject: string, content: string, key: string) {
  const gatewayKey = process.env["LOVABLE_API_KEY"];
  const connectionKey = process.env["RESEND_API_KEY"];
  if (!gatewayKey || !connectionKey) throw new Error("Email service is unavailable.");
  const html = `<!doctype html><html><body style="margin:0;background:#f3f4f6;font:15px Arial,sans-serif;color:#171717"><table role="presentation" width="100%"><tr><td align="center" style="padding:24px 12px"><table role="presentation" width="100%" style="max-width:600px;background:#fff"><tr><td style="background:#101010;border-top:4px solid #c8a24d;padding:24px;text-align:center"><img src="${logo.url}" width="160" alt="Jaydev Associates"></td></tr><tr><td style="padding:30px;line-height:1.7"><h1 style="font-size:23px">${htmlEscape(subject)}</h1>${content}<p>Regards,<br><strong>Jaydev Associates</strong><br>Your Growth, Our Commitment</p><p style="font-size:12px;color:#525252">+91 7744975512 | +91 9322021991<br>info@jaydevassociates.com</p></td></tr></table></td></tr></table></body></html>`;
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