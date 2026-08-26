import type { Database } from "@/integrations/supabase/types";

export type JobStatus = Database["public"]["Enums"]["job_status"];
export type ApplicationStatus = Database["public"]["Enums"]["application_status"];
export type EmploymentType = Database["public"]["Enums"]["employment_type"];
export type PaymentStatus = Database["public"]["Enums"]["payment_status"];
export type EnquiryStatus = Database["public"]["Enums"]["enquiry_status"];

type Tone = "gold" | "positive" | "neutral" | "warn" | "danger";

export const JOB_STATUS: Record<JobStatus, { label: string; public: string; tone: Tone }> = {
  draft: { label: "Draft", public: "Draft", tone: "neutral" },
  published: { label: "Published", public: "Open for Applications", tone: "gold" },
  hiring: { label: "Hiring", public: "Actively Hiring", tone: "positive" },
  interviewing: { label: "Interviewing", public: "Interviews In Progress", tone: "gold" },
  on_hold: { label: "On Hold", public: "On Hold", tone: "warn" },
  closed: { label: "Closed", public: "Applications Closed", tone: "danger" },
  filled: { label: "Filled", public: "Position Filled", tone: "neutral" },
  expired: { label: "Expired", public: "Applications Closed", tone: "neutral" },
};

/** Statuses that still accept new applications (subject to the job's own flag). */
export const OPEN_JOB_STATUSES: JobStatus[] = ["published", "hiring", "interviewing"];

export const APPLICATION_STATUS: Record<ApplicationStatus, { label: string; tone: Tone }> = {
  applied: { label: "Applied", tone: "neutral" },
  under_review: { label: "Under Review", tone: "gold" },
  shortlisted: { label: "Shortlisted", tone: "gold" },
  interview_scheduled: { label: "Interview Scheduled", tone: "gold" },
  interview_completed: { label: "Interview Completed", tone: "gold" },
  document_verification: { label: "Document Verification", tone: "gold" },
  offer_released: { label: "Offer Released", tone: "positive" },
  selected: { label: "Selected", tone: "positive" },
  placed: { label: "Placed", tone: "positive" },
  payment_completed: { label: "Payment Completed", tone: "positive" },
  rejected: { label: "Rejected", tone: "danger" },
  withdrawn: { label: "Withdrawn", tone: "neutral" },
  on_hold: { label: "On Hold", tone: "warn" },
  not_responding: { label: "Not Responding", tone: "warn" },
};

/** The happy-path pipeline used for the candidate progress tracker. */
export const APPLICATION_PIPELINE: ApplicationStatus[] = [
  "applied",
  "under_review",
  "shortlisted",
  "interview_scheduled",
  "interview_completed",
  "selected",
  "placed",
  "payment_completed",
];

export const APPLICATION_STATUS_LIST = Object.keys(APPLICATION_STATUS) as ApplicationStatus[];
export const JOB_STATUS_LIST = Object.keys(JOB_STATUS) as JobStatus[];

export const EMPLOYMENT_TYPE: Record<EmploymentType, string> = {
  full_time: "Full Time",
  part_time: "Part Time",
  contract: "Contract",
  temporary: "Temporary",
  internship: "Internship",
};
export const EMPLOYMENT_TYPE_LIST = Object.keys(EMPLOYMENT_TYPE) as EmploymentType[];

export const PAYMENT_STATUS: Record<PaymentStatus, { label: string; tone: Tone }> = {
  not_applicable: { label: "Not Applicable", tone: "neutral" },
  pending: { label: "Pending", tone: "warn" },
  partially_paid: { label: "Partially Paid", tone: "gold" },
  paid: { label: "Paid", tone: "positive" },
  failed: { label: "Failed", tone: "danger" },
  refunded: { label: "Refunded", tone: "neutral" },
};
export const PAYMENT_STATUS_LIST = Object.keys(PAYMENT_STATUS) as PaymentStatus[];

export const ENQUIRY_STATUS: Record<EnquiryStatus, { label: string; tone: Tone }> = {
  new: { label: "New", tone: "gold" },
  contacted: { label: "Contacted", tone: "neutral" },
  in_progress: { label: "In Progress", tone: "warn" },
  converted: { label: "Converted", tone: "positive" },
  closed: { label: "Closed", tone: "neutral" },
};
export const ENQUIRY_STATUS_LIST = Object.keys(ENQUIRY_STATUS) as EnquiryStatus[];

export const toneClass: Record<Tone, string> = {
  gold: "bg-accent text-accent-foreground border-transparent",
  positive: "bg-success/12 text-success border-success/25",
  neutral: "bg-muted text-muted-foreground border-transparent",
  warn: "bg-warning/15 text-warning border-warning/30",
  danger: "bg-destructive/12 text-destructive border-destructive/25",
};

export const EXPERIENCE_BANDS = [
  { label: "Fresher", min: 0, max: 0 },
  { label: "0–1 years", min: 0, max: 1 },
  { label: "1–3 years", min: 1, max: 3 },
  { label: "3–5 years", min: 3, max: 5 },
  { label: "5–10 years", min: 5, max: 10 },
  { label: "10+ years", min: 10, max: null },
] as const;
