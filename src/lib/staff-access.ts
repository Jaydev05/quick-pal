import { z } from "zod";

export const MAIN_ADMIN_EMAIL = "jaydevassociates25@gmail.com";
export const EMPLOYEE_SECTIONS = ["jobs", "candidates", "applications", "enquiries"] as const;
export const employeeSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  designation: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(7).max(25),
  email: z.string().trim().email().max(255).transform((v) => v.toLowerCase())
    .refine((v) => v !== MAIN_ADMIN_EMAIL, "The main administrator cannot be an employee."),
  joiningDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  notes: z.string().trim().max(2000).default(""),
});
export const newStaffPassword = z.string().min(12, "Use at least 12 characters.").max(72, "Use no more than 72 characters.")
  .regex(/[A-Z]/, "Include an uppercase letter.")
  .regex(/[a-z]/, "Include a lowercase letter.")
  .regex(/[0-9]/, "Include a number.");
export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, "Enter your current password.").max(72, "Use no more than 72 characters."),
  password: newStaffPassword,
});
export function validatePasswordChange(input: unknown) {
  const result = passwordChangeSchema.safeParse(input);
  if (!result.success) throw new Error(result.error.issues.map((issue) => issue.message).join(" "));
  return result.data;
}
export function staffCanAccess(section: string, mainAdmin: boolean, activeEmployee: boolean) {
  return mainAdmin || (activeEmployee && EMPLOYEE_SECTIONS.some((item) => item === section));
}