import { describe, expect, it } from "vitest";
import { normalizeResumeProfile, ownedResumePath, resumeProfileSchema, validateResumeFile } from "./resume-profile";

const extracted = { full_name: "  Asha Patil ", phone: null, city: "Pune", state: null, current_job_title: "Safety Officer", experience_years: 3.5, education: "B.Sc.", skills: ["Fire Safety", "First Aid"], professional_summary: "Safety officer with 3.5 years of experience." };
describe("resume profile extraction rules", () => {
  it("retains the resume's skills, experience and summary as editable profile data", () => {
    const result = normalizeResumeProfile(resumeProfileSchema.parse(extracted));
    expect(result.full_name).toBe("Asha Patil");
    expect(result.skills).toEqual(["Fire Safety", "First Aid"]);
    expect(result.experience_years).toBe(3.5);
    expect(result.professional_summary).toBe("Safety officer with 3.5 years of experience.");
  });
  it("does not fabricate missing details", () => { expect(normalizeResumeProfile(extracted).phone).toBeNull(); });
  it("accepts existing PDF and Word resume formats", () => {
    for (const name of ["cv.pdf", "cv.doc", "cv.docx"]) expect(validateResumeFile({name, size:1024})).toBe(name.split(".")[1]);
  });
  it("rejects resumes above the existing 5MB upload limit", () => { expect(() => validateResumeFile({name:"cv.pdf",size:5*1024*1024+1})).toThrow(); });
  it("rejects another candidate's resume path and path traversal", () => {
    expect(ownedResumePath("candidate-a/resume.pdf", "candidate-a")).toBe(true);
    expect(ownedResumePath("candidate-b/resume.pdf", "candidate-a")).toBe(false);
    expect(ownedResumePath("candidate-a/../candidate-b/resume.pdf", "candidate-a")).toBe(false);
  });
  it("deduplicates skills without inventing experience", () => {
    const result = normalizeResumeProfile({...extracted,skills:["First Aid","first aid",""],experience_years:-1});
    expect(result.skills).toEqual(["first aid"]); expect(result.experience_years).toBeNull();
  });
});