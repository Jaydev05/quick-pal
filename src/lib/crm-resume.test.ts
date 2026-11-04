import { describe, it, expect } from "vitest";
import { experienceLabel, resumeProfilePatch } from "./crm-resume";
describe("CRM resume corrections", () => {
  it("never changes placement, status, notes or document references from resume output", () => {
    expect(resumeProfilePatch({ full_name: "Candidate", recruitment_status: "Placed", placement_company: "Wrong", notes: "Wrong", resume_path: "other/file" })).toEqual({ full_name: "Candidate" });
  });
  it("rejects invalid email and impossible experience without losing valid fields", () => {
    expect(resumeProfilePatch({ email: "not an email", experience_years: 99, education: "Diploma in Electrical Engineering" })).toEqual({ education: "Diploma in Electrical Engineering" });
  });
  it("keeps existing data when extraction has no supported fact", () => {
    expect(resumeProfilePatch({ email: "", experience_years: null })).toEqual({});
  });
  it("shows explicit zero as fresher without inventing experience for unknown values", () => {
    expect(experienceLabel(0, "")).toBe("Fresher");
    expect(experienceLabel(null, "Safety Officer")).toBe("Experience not recorded · Safety Officer");
    expect(experienceLabel(2, "Safety Officer")).toBe("2 years experience · Safety Officer");
  });
});