import { describe, it, expect } from "vitest";
import { EMPLOYEE_SECTIONS, employeeSchema, MAIN_ADMIN_EMAIL, newStaffPassword, staffCanAccess } from "./staff-access";

describe("employee access rules", () => {
  it("reserves the supplied main administrator email", () => {
    expect(MAIN_ADMIN_EMAIL).toBe("jaydevassociates25@gmail.com");
    expect(employeeSchema.safeParse({ fullName: "Test Person", designation: "Recruiter", phone: "9876543210", email: "jaydevassociates25@gmail.com", joiningDate: "2026-10-30" }).success).toBe(false);
  });
  it("allows only jobs, candidates, applications and enquiries for active employees", () => {
    expect([...EMPLOYEE_SECTIONS]).toEqual(["jobs", "candidates", "applications", "enquiries"]);
    for (const section of ["jobs", "candidates", "applications", "enquiries"]) expect(staffCanAccess(section, false, true)).toBe(true);
    expect(staffCanAccess("employees", false, true)).toBe(false);
    expect(staffCanAccess("emails", false, true)).toBe(false);
  });
  it("deactivated employees cannot use assigned sections", () => {
    for (const section of EMPLOYEE_SECTIONS) expect(staffCanAccess(section, false, false)).toBe(false);
  });
  it("the main administrator retains all sections", () => {
    for (const section of [...EMPLOYEE_SECTIONS, "employees", "emails"]) expect(staffCanAccess(section, true, false)).toBe(true);
  });
  it("requires a strong replacement password", () => {
    expect(newStaffPassword.safeParse("short").success).toBe(false);
    expect(newStaffPassword.safeParse("abcdefghijkl").success).toBe(false);
    expect(newStaffPassword.safeParse("NewSecurePass2026").success).toBe(true);
  });
});