import { z } from "zod";

export const priorities = ["Low", "Medium", "High", "Urgent"] as const;
export const taskStatuses = ["Pending", "In Progress", "Completed"] as const;
export const callOutcomes = ["Connected", "Not Answered", "Busy", "Switched Off", "Call Back"] as const;
export const interests = ["Interested", "Not Interested", "Maybe"] as const;
const text = (max = 300) => z.string().trim().max(max).default("");
const instant = z.string().datetime({ offset: true }).nullable().default(null);
export const candidateSchema = z.object({
  id: z.string().uuid().optional(), full_name: text(120), phone: text(30), email: z.union([z.string().email(), z.literal("")]).default(""),
  education: text(2000), specialization: text(), college: text(), skills: text(3000), experience_years: z.number().min(0).max(60).nullable().default(null),
  designation: text(), company: text(), location: text(), preferred_location: text(), summary: text(5000), keywords: text(3000), extracted_text: text(60000),
  resume_path: text(300), resume_name: text(), file_hash: text(64), processing_status: z.enum(["Ready", "Needs review", "Manual entry"]).default("Manual entry"),
});
export type DeskCandidateInput = z.infer<typeof candidateSchema>;
export const itemSchema = z.object({
  id: z.string().uuid().optional(), kind: z.enum(["task", "followup", "meeting", "reminder"]), title: z.string().trim().min(1, "Enter a title.").max(200),
  description: text(5000), notes: text(5000), priority: z.enum(priorities).default("Medium"), status: z.enum(taskStatuses).default("Pending"),
  scheduled_at: instant, deadline: instant, reminder_at: instant, candidate_id: z.string().uuid().nullable().default(null), call_id: z.string().uuid().nullable().default(null),
});
export const callSchema = z.object({
  id: z.string().uuid().optional(), candidate_id: z.string().uuid(), subject: z.string().trim().min(1, "Enter the subject discussed.").max(300), company: text(),
  called_at: z.string().datetime({ offset: true }), outcome: z.enum(callOutcomes), interest: z.enum(interests), discussion: text(5000), expectations: text(3000), remarks: text(3000), followup_at: instant,
});
export type DeskItemInput = z.infer<typeof itemSchema>;
export type DeskCallInput = z.infer<typeof callSchema>;
export const searchSchema = z.object({q:text(), education:text(), specialization:text(), skills:text(), location:text(), designation:text(), min:z.number().min(0).optional(), max:z.number().max(60).optional(), uploadedAfter:z.string().optional(), sort:z.enum(["newest", "name", "experience"]).default("newest"), page:z.number().int().min(0).default(0)});
export function identityKeys(email: string, phone: string) {
  return { email: email.trim().toLowerCase(), phone: phone.replace(/\D/g, "").replace(/^91(?=\d{10}$)/, "") };
}
export function activityState(item: {status: string; deadline: string | null; scheduled_at: string | null}, now = new Date()) {
  if (item.status === "Completed") return "Completed";
  const date = item.deadline || item.scheduled_at;
  return date && new Date(date) < now ? "Overdue" : item.status;
}
export function reportCounts(items: {kind:string;status:string;created_at:string;updated_at:string}[], calls: {candidate_id:string;interest:string;called_at:string}[], candidates: {created_at:string}[], start:string, end:string) {
  const inside = (s:string) => s >= start && s < end;
  const periodCalls = calls.filter(c=>inside(c.called_at));
  const tasks = items.filter(i=>i.kind === "task" && (inside(i.created_at) || inside(i.updated_at)));
  const followups = items.filter(i=>i.kind === "followup" && (inside(i.created_at) || inside(i.updated_at)));
  return {calls:periodCalls.length, contacted:new Set(periodCalls.map(c=>c.candidate_id)).size, interested:periodCalls.filter(c=>c.interest==="Interested").length, tasksCompleted:tasks.filter(i=>i.status==="Completed").length, tasksRemaining:tasks.filter(i=>i.status!=="Completed").length, followupsCompleted:followups.filter(i=>i.status==="Completed").length, followupsPending:followups.filter(i=>i.status!=="Completed").length, resumes:candidates.filter(c=>inside(c.created_at)).length};
}