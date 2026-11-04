import { candidateSchema, type DeskCandidateInput } from "./desk";

export const resumeProfileFields = ["full_name", "phone", "email", "designation", "company", "education", "specialization", "college", "skills", "location", "summary", "experience_years"] as const;
export function resumeProfilePatch(value: Record<string, unknown>): Partial<DeskCandidateInput> {
  const patch: Record<string, unknown> = {};
  for (const field of resumeProfileFields) {
    const raw = value[field];
    if (raw === null || raw === undefined || raw === "") continue;
    const item = Array.isArray(raw) ? raw.join(", ") : raw;
    const limit = field === "full_name" ? 120 : field === "phone" ? 30 : field === "education" ? 2000 : field === "skills" ? 3000 : field === "summary" ? 5000 : 300;
    const result = candidateSchema.shape[field].safeParse(typeof item === "string" ? item.trim().slice(0, limit) : item);
    if (result.success) patch[field] = result.data;
  }
  return patch;
}
export function experienceLabel(years: number | null, designation: string) {
  const experience = years === null ? "Experience not recorded" : years === 0 ? "Fresher" : `${years} ${years === 1 ? "year" : "years"} experience`;
  return [experience, designation].filter(Boolean).join(" · ");
}