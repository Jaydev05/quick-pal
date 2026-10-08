import type { ApplicationStatus } from "@/lib/status";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/resend";
const SITE_URL = "https://jaydevassociates.com";
const LOGO_URL = `${SITE_URL}/media/jaydev-logo.png`;
const FROM = "Jaydev Associates <info@jaydevassociates.com>";
const REPLY_TO = "info@jaydevassociates.com";

const STATUS_LABELS: Record<ApplicationStatus, string> = {
  applied: "Applied",
  under_review: "Under Review",
  shortlisted: "Shortlisted",
  interview_scheduled: "Interview Scheduled",
  interview_completed: "Interview Completed",
  document_verification: "Document Verification",
  offer_released: "Offer Released",
  selected: "Selected",
  placed: "Placed",
  payment_completed: "Payment Completed",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
  on_hold: "On Hold",
  not_responding: "Not Responding",
};

const STATUS_MESSAGES: Record<ApplicationStatus, string> = {
  applied: "We have received your application and it is now under consideration by our recruitment team.",
  under_review: "Your application is currently being reviewed by our recruitment team. We will contact you when there is a further update.",
  shortlisted: "Congratulations, your application has been shortlisted for the next stage of the recruitment process.",
  interview_scheduled: "Your interview has been scheduled. Please review the interview details below and be available at the stated time.",
  interview_completed: "Your interview has been completed. Our team is reviewing the outcome and will share the next steps with you.",
  document_verification: "Your application has moved to document verification. Our team will contact you if any additional documents are required.",
  offer_released: "An offer has been released for your application. Please sign in to review the update and follow the instructions shared by our team.",
  selected: "Congratulations, you have been selected. Our team will contact you with the next steps.",
  placed: "Congratulations on your placement. We wish you every success in your new role.",
  payment_completed: "The payment connected with your application has been confirmed as completed.",
  rejected: "Thank you for your interest and the time you invested in the process. We are unable to progress this application further, but we appreciate the opportunity to consider your profile.",
  withdrawn: "Your application has been marked as withdrawn. Please contact our team if you believe this needs to be reviewed.",
  on_hold: "Your application is currently on hold. We will contact you when the recruitment process resumes or further information is available.",
  not_responding: "Your application has been marked as not responding. Please contact Jaydev Associates if you would like to continue the process.",
};

export type InterviewEmailDetails = {
  date?: string | null;
  time?: string | null;
  mode?: string | null;
  locationOrLink?: string | null;
};

type EmailData = {
  to: string;
  candidateName: string;
  jobTitle: string;
  applicationCode: string;
  eventDate: string;
  idempotencyKey: string;
  previousStatus?: ApplicationStatus | null;
  newStatus?: ApplicationStatus;
  interview?: InterviewEmailDetails | null;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(new Date(value));
}

function detailRow(label: string, value: string) {
  return `<tr><td style="padding:8px 12px;color:#6b7280;font-size:13px;width:42%">${escapeHtml(label)}</td><td style="padding:8px 12px;color:#171717;font-size:13px;font-weight:600">${escapeHtml(value)}</td></tr>`;
}

function layout(title: string, preview: string, content: string) {
  return `<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="x-apple-disable-message-reformatting"><title>${escapeHtml(title)}</title></head><body style="margin:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;color:#171717"><div style="display:none;max-height:0;overflow:hidden;opacity:0">${escapeHtml(preview)}</div><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f3f4f6"><tr><td align="center" style="padding:28px 12px"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#ffffff;border:1px solid #e5e7eb"><tr><td style="background:#101010;border-top:4px solid #c8a24d;padding:22px 28px;text-align:center"><img src="${LOGO_URL}" width="150" alt="Jaydev Associates" style="display:inline-block;max-width:150px;height:auto"></td></tr><tr><td style="padding:34px 30px 18px"><h1 style="margin:0 0 18px;font-size:25px;line-height:1.3;color:#171717">${escapeHtml(title)}</h1>${content}</td></tr><tr><td style="padding:20px 30px 30px"><p style="margin:0 0 5px;color:#404040;font-size:14px">Regards,<br><strong>Jaydev Associates</strong></p><p style="margin:14px 0 0;color:#6b7280;font-size:12px;line-height:1.7">+91 7744975512 &nbsp;|&nbsp; +91 9322021991<br><a href="mailto:info@jaydevassociates.com" style="color:#9a7728">info@jaydevassociates.com</a><br>488, C/O Jaydev Associates LLP, Near SBI Bank, A/P Goregaon, Tal. Mangaon, Raigad, Maharashtra – 402103, India</p></td></tr></table></td></tr></table></body></html>`;
}

export function buildApplicationConfirmationEmail(data: EmailData) {
  const title = `Application Received – ${data.jobTitle} | Jaydev Associates`;
  const content = `<p style="margin:0 0 16px;font-size:15px;line-height:1.7">Dear ${escapeHtml(data.candidateName || "Candidate")},</p><p style="margin:0 0 20px;font-size:15px;line-height:1.7">Thank you for applying through Jaydev Associates. We have received your application and it is now under consideration by our recruitment team.</p><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 22px;background:#faf8f1;border-left:3px solid #c8a24d">${detailRow("Job title", data.jobTitle)}${detailRow("Application ID", data.applicationCode)}${detailRow("Application date", formatDate(data.eventDate))}${detailRow("Status", "Applied")}</table><p style="margin:0 0 24px;font-size:14px;line-height:1.7;color:#525252">We will notify you by email when the status of your application changes.</p><a href="${SITE_URL}/dashboard/applications" style="display:inline-block;background:#171717;color:#ffffff;text-decoration:none;padding:12px 20px;font-size:14px;font-weight:700">View My Application</a>`;
  return { subject: title, html: layout("Application received", title, content) };
}

export function buildStatusChangeEmail(data: EmailData) {
  const newStatus = data.newStatus ?? "applied";
  const title = `Application Status Updated – ${data.jobTitle} | Jaydev Associates`;
  const rows = [
    detailRow("Job title", data.jobTitle),
    detailRow("Application ID", data.applicationCode),
    detailRow("Previous status", data.previousStatus ? STATUS_LABELS[data.previousStatus] : "Not available"),
    detailRow("New status", STATUS_LABELS[newStatus]),
    detailRow("Updated on", formatDate(data.eventDate)),
  ];
  if (newStatus === "interview_scheduled" && data.interview) {
    if (data.interview.date) rows.push(detailRow("Interview date", formatDate(data.interview.date)));
    if (data.interview.time) rows.push(detailRow("Interview time", data.interview.time));
    if (data.interview.mode) rows.push(detailRow("Interview mode", data.interview.mode));
    if (data.interview.locationOrLink) rows.push(detailRow("Location / meeting link", data.interview.locationOrLink));
  }
  const content = `<p style="margin:0 0 16px;font-size:15px;line-height:1.7">Dear ${escapeHtml(data.candidateName || "Candidate")},</p><p style="margin:0 0 20px;font-size:15px;line-height:1.7">${escapeHtml(STATUS_MESSAGES[newStatus])}</p><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 24px;background:#faf8f1;border-left:3px solid #c8a24d">${rows.join("")}</table><a href="${SITE_URL}/dashboard/applications" style="display:inline-block;background:#171717;color:#ffffff;text-decoration:none;padding:12px 20px;font-size:14px;font-weight:700">View Application</a>`;
  return { subject: title, html: layout("Application status updated", title, content) };
}

export async function sendApplicationEmail(data: EmailData, kind: "confirmation" | "status") {
  const lovableApiKey = process.env["LOVABLE_API_KEY"];
  const resendApiKey = process.env["RESEND_API_KEY"];
  if (!lovableApiKey || !resendApiKey) throw new Error("Email service is not configured");

  const email = kind === "confirmation" ? buildApplicationConfirmationEmail(data) : buildStatusChangeEmail(data);
  const response = await fetch(`${GATEWAY_URL}/emails`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${lovableApiKey}`,
      "X-Connection-Api-Key": resendApiKey,
      "Idempotency-Key": data.idempotencyKey,
    },
    body: JSON.stringify({
      from: FROM,
      to: [data.to],
      reply_to: REPLY_TO,
      subject: email.subject,
      html: email.html,
    }),
  });
  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`Resend email failed [${response.status}]: ${errorBody}`);
    throw new Error(`Email provider rejected the request with status ${response.status}`);
  }
  const receipt = await response.json() as { id?: string };
  if (kind === "status" && data.newStatus === "interview_scheduled") {
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { error } = await supabaseAdmin.from("admin_activity_logs").insert({
        action: "interview_email_sent", entity_type: "interview_email", entity_id: receipt.id ?? data.idempotencyKey,
        details: { recipient: data.to, subject: email.subject, html: email.html, sentAt: new Date().toISOString(), status: "accepted", providerId: receipt.id ?? null },
      });
      if (error) console.error("Interview email history could not be recorded", error.code);
    } catch { console.error("Interview email history could not be recorded"); }
  }
}