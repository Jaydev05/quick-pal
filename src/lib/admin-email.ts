import { z } from "zod";
import logo from "@/assets/jaydev-logo.png.asset.json";

export const composedEmailSchema = z.object({
  requestId: z.string().uuid(),
  recipient: z.string().trim().email("Enter a valid recipient email address.").max(255),
  recipientName: z.string().trim().max(120, "Use no more than 120 characters.").default(""),
  subject: z.string().trim().min(1, "Enter an email subject.").max(200, "Use no more than 200 characters.").refine((value) => !/[\r\n]/.test(value), "Keep the subject on one line."),
  message: z.string().trim().min(1, "Write your message.").max(15000, "Use no more than 15,000 characters."),
});
export type ComposedEmail = z.infer<typeof composedEmailSchema>;
export const escapeEmailText = (value: string) => value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character] ?? character);

export function brandedEmailHtml(subject: string, content: string) {
  return `<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width, initial-scale=1"></head><body style="margin:0;background:#ffffff;font:15px Arial,sans-serif;color:#171717"><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center" style="padding:24px 12px"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff"><tr><td style="background:#101010;border-top:4px solid #c8a24d;padding:24px;text-align:center"><img src="${logo.url}" width="160" alt="Jaydev Associates" style="max-width:100%;height:auto"></td></tr><tr><td style="padding:30px 24px;line-height:1.7;overflow-wrap:anywhere"><h1 style="font-size:23px;line-height:1.35">${escapeEmailText(subject)}</h1>${content}<p>Regards,<br><strong>Jaydev Associates</strong><br>Your Growth, Our Commitment</p></td></tr><tr><td style="border-top:1px solid #e5e5e5;padding:20px 24px;font-size:12px;line-height:1.8;color:#525252">+91 7744975512 | +91 9322021991<br><a href="mailto:info@jaydevassociates.com" style="color:#525252">info@jaydevassociates.com</a><br><a href="https://jaydevassociates.com" style="color:#525252">www.jaydevassociates.com</a></td></tr></table></td></tr></table></body></html>`;
}

export function renderComposedEmail(data: Pick<ComposedEmail, "recipientName" | "subject" | "message">) {
  const greeting = data.recipientName ? `<p>Dear ${escapeEmailText(data.recipientName)},</p>` : "";
  const paragraphs = data.message.split(/\n\s*\n/).map((paragraph) => `<p>${escapeEmailText(paragraph).replace(/\n/g, "<br>")}</p>`).join("");
  return brandedEmailHtml(data.subject, greeting + paragraphs);
}

export type ReceivedEmail = { id: string; from: string; to: string[]; subject: string; createdAt: string };