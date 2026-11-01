import {describe,it,expect} from "vitest";
import {callSchema, itemSchema, identityKeys, activityState, reportCounts, priorities, taskStatuses, callOutcomes, interests} from "./desk";
import {profileFromText} from "./desk-resume";
describe("desk business rules",()=>{
  it("allows precisely the four requested priorities",()=>expect(priorities).toEqual(["Low","Medium","High","Urgent"]));
  it("allows the three task statuses",()=>expect(taskStatuses).toEqual(["Pending","In Progress","Completed"]));
  it("allows the requested call outcomes",()=>expect(callOutcomes).toEqual(["Connected","Not Answered","Busy","Switched Off","Call Back"]));
  it("allows the requested interest states",()=>expect(interests).toEqual(["Interested","Not Interested","Maybe"]));
  it("rejects arbitrary call status",()=>expect(callSchema.safeParse({candidate_id:"00000000-0000-4000-8000-000000000001",subject:"Course",called_at:"2026-11-01T10:00:00Z",outcome:"Deleted",interest:"Interested"}).success).toBe(false));
  it("normalizes duplicate phone and email identities",()=>expect(identityKeys(" Candidate@Example.com ","+91 7744975512")).toEqual({email:"candidate@example.com",phone:"7744975512"}));
  it("completed items are never overdue",()=>expect(activityState({status:"Completed",deadline:"2026-10-01T00:00:00Z",scheduled_at:null},new Date("2026-11-01"))).toBe("Completed"));
  it("pending past deadlines are overdue",()=>expect(activityState({status:"Pending",deadline:"2026-10-01T00:00:00Z",scheduled_at:null},new Date("2026-11-01"))).toBe("Overdue"));
  it("rejects an empty task title",()=>expect(itemSchema.safeParse({kind:"task",title:""}).success).toBe(false));
  it("searchable content retains Chemical Engineering beyond filename",()=>{const p=profileFromText("Tanishk Patil\ntanishk@example.com\nB.Tech Chemical Engineering\nTECHNICAL SKILLS\nJava, process safety\nEXPERIENCE\n2 years experience");expect(p.specialization).toContain("Chemical Engineering");expect(p.extracted_text).toContain("Java");expect(p.email).toBe("tanishk@example.com");expect(p.experience_years).toBe(2);});
  it("does not invent missing email or experience",()=>{const p=profileFromText("Curriculum Vitae\nMechanical Engineering");expect(p.email).toBe("");expect(p.experience_years).toBe(null);});
  it("counts unique contacted candidates and selected report dates",()=>{const report=reportCounts([], [{candidate_id:"a",interest:"Interested",called_at:"2026-11-01T10:00:00Z"},{candidate_id:"a",interest:"Maybe",called_at:"2026-11-01T11:00:00Z"},{candidate_id:"b",interest:"Interested",called_at:"2026-10-31T10:00:00Z"}],[],"2026-11-01T00:00:00Z","2026-11-02T00:00:00Z");expect(report.calls).toBe(2);expect(report.contacted).toBe(1);expect(report.interested).toBe(1);});
});