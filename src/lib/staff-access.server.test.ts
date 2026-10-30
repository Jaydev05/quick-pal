import { describe, it, expect, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { assertStaff } from "./staff-access.server";

function client(main: boolean, employee: boolean, email = "worker@example.test") {
  return { auth: { getUser: vi.fn(async () => ({ data: { user: { id: "caller", email } }, error: null })) },
    rpc: vi.fn(async (_name: string, input: { _role: string }) => ({ data: input._role === "admin" ? main : employee })) } as unknown as SupabaseClient<Database>;
}
describe("server staff boundary", () => {
  it("rejects a main admin without a verified OTP session", async () => {
    await expect(assertStaff(client(false, false, "jaydevassociates25@gmail.com"), "caller", true)).rejects.toThrow();
  });
  it("accepts the verified designated main admin", async () => {
    await expect(assertStaff(client(true, false, "jaydevassociates25@gmail.com"), "caller", true)).resolves.toBe("admin");
  });
  it("allows active employees to use staff functions", async () => {
    await expect(assertStaff(client(false, true), "caller")).resolves.toBe("employee");
  });
  it("rejects employees from account-management functions", async () => {
    await expect(assertStaff(client(false, true), "caller", true)).rejects.toThrow();
  });
  it("rejects inactive or password-change-pending employees", async () => {
    await expect(assertStaff(client(false, false), "caller")).rejects.toThrow();
  });
  it("rejects mismatched authenticated identities", async () => {
    await expect(assertStaff(client(true, true), "other")).rejects.toThrow();
  });
});