import { z } from "zod";

export const MAX_RESUME_BYTES = 5 * 1024 * 1024;
export const resumeProfileSchema = z.object({
  full_name: z.string().nullable(),
  phone: z.string().nullable(),
  city: z.string().nullable(),
  state: z.string().nullable(),
  current_job_title: z.string().nullable(),
  experience_years: z.number().nullable(),
  education: z.string().nullable(),
  skills: z.array(z.string()),
  professional_summary: z.string().nullable(),
}).strict();
export type ResumeProfile = z.infer<typeof resumeProfileSchema>;
export type UploadedResume = { path: string; name: string; uploadedAt: string };

export function validateResumeFile(file: Pick<File, "name" | "size">) {
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (!extension || !["pdf", "doc", "docx"].includes(extension)) throw new Error("Use a PDF or Word resume.");
  if (!file.size || file.size > MAX_RESUME_BYTES) throw new Error("Resume must be a non-empty file under 5MB.");
  return extension;
}

export function ownedResumePath(path: string, userId: string) {
  return path.startsWith(`${userId}/`) && !path.includes("..") && !path.includes("\\") && path.split("/").length === 2;
}

export function normalizeResumeProfile(input: ResumeProfile): ResumeProfile {
  const text = (value: string | null, length: number) => value?.replace(/\u0000/g, "").trim().slice(0, length) || null;
  const skills = [...new Map(input.skills.map((skill) => skill.trim().slice(0, 100)).filter(Boolean).map((skill) => [skill.toLowerCase(), skill])).values()].slice(0, 50);
  return {
    full_name: text(input.full_name, 120), phone: text(input.phone, 20), city: text(input.city, 80), state: text(input.state, 80),
    current_job_title: text(input.current_job_title, 120), education: text(input.education, 1000), professional_summary: text(input.professional_summary, 3000), skills,
    experience_years: input.experience_years !== null && Number.isFinite(input.experience_years) && input.experience_years >= 0 && input.experience_years <= 60 ? Math.round(input.experience_years * 10) / 10 : null,
  };
}

// Only populate empty fields: existing profile values and candidate edits win.
export function fillEmptyProfileFields(form: HTMLFormElement | null, data: ResumeProfile) {
  if (!form) return 0;
  let filled = 0;
  for (const [name, value] of Object.entries(data)) {
    const field = form.elements.namedItem(name);
    if (!(field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement) || field.value.trim()) continue;
    if (value == null || (Array.isArray(value) && !value.length)) continue;
    field.value = Array.isArray(value) ? value.join(", ") : String(value);
    field.dispatchEvent(new Event("input", { bubbles: true }));
    filled += 1;
  }
  return filled;
}

export const candidateProfileFormSchema = z.object({
  full_name: z.string().trim().min(2, "Enter your full name").max(120),
  phone: z.string().trim().max(20), city: z.string().trim().max(80), state: z.string().trim().max(80),
  current_job_title: z.string().trim().max(120), education: z.string().trim().max(1000),
  experience_years: z.number().min(0).max(60).nullable(), expected_salary: z.number().min(0).nullable(),
  preferred_location: z.string().trim().max(120), skills: z.array(z.string().max(100)).max(50),
  professional_summary: z.string().trim().max(3000),
});

export function readCandidateProfileForm(form: HTMLFormElement) {
  const fd = new FormData(form);
  const text = (name: string) => String(fd.get(name) ?? "").trim();
  return candidateProfileFormSchema.parse({
    full_name: text("full_name"), phone: text("phone"), city: text("city"), state: text("state"),
    current_job_title: text("current_job_title"), education: text("education"), professional_summary: text("professional_summary"),
    experience_years: text("experience_years") ? Number(text("experience_years")) : null,
    expected_salary: text("expected_salary") ? Number(text("expected_salary")) : null,
    preferred_location: text("preferred_location"), skills: [...new Set(text("skills").split(",").map((s) => s.trim()).filter(Boolean))],
  });
}