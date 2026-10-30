import { describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { composedEmailSchema, renderComposedEmail } from "./admin-email";
import { sendComposedEmail } from "./admin-email.server";

vi.mock("./staff-email.server", () => ({ sendStaffEmail: vi.fn() }));
import { sendStaffEmail } from "./staff-email.server";
const data = { requestId: "bc26867f-5f3d-4b92-a86d-885d2378e195", recipient: "person@example.test", recipientName: "Person", subject: "Interview follow-up", message: "Your interview is scheduled." };
function clients(main = true, reserveError: { code: string } | null = null) {
  const update = vi.fn(() => ({ eq: () => ({ eq: async () => ({ error: null }) }) }));
  const client = { auth: { getUser: async () => ({ data: { user: { id: "caller", email: "jaydevassociates25@gmail.com" } }, error: null }) }, rpc: async () => ({ data: main }), from: () => ({ select: () => ({ eq: () => ({ eq: () => ({ eq: () => ({ maybeSingle: async () => ({ data: { details: { status: "accepted" } }, error: null }) }) }) }) }) }) } as unknown as SupabaseClient<Database>;
  const insert = vi.fn(async () => ({ error: reserveError }));
  const audit = { from: () => ({ insert, update }) } as unknown as SupabaseClient<Database>;
  return { client, audit, insert, update };
}
describe("super-admin email composition", () => {
  it("accepts only a single valid recipient", () => {
    expect(composedEmailSchema.safeParse({ ...data, recipient: "one@example.test,two@example.test" }).success).toBe(false);
    expect(composedEmailSchema.safeParse(data).success).toBe(true);
  });
  it("escapes untrusted message HTML", () => {
    const html = renderComposedEmail({ ...data, message: "<script>alert(1)</script>" });
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });
  it("blocks employees before sending or recording", async () => {
    vi.mocked(sendStaffEmail).mockClear();
    const c = clients(false);
    await expect(sendComposedEmail(c.client, "caller", data, c.audit)).rejects.toThrow();
    expect(c.insert).not.toHaveBeenCalled(); expect(sendStaffEmail).not.toHaveBeenCalled();
  });
  it("records an accepted send with its provider identifier", async () => {
    vi.mocked(sendStaffEmail).mockResolvedValue("provider-id");
    const c = clients();
    expect(await sendComposedEmail(c.client, "caller", data, c.audit)).toEqual({ status: "accepted" });
    expect(c.update).toHaveBeenCalledWith({ details: expect.objectContaining({ status: "accepted", providerId: "provider-id", recipient: "person@example.test" }) });
  });
  it("never resends a duplicate request", async () => {
    vi.mocked(sendStaffEmail).mockClear();
    const c = clients(true, { code: "23505" });
    expect(await sendComposedEmail(c.client, "caller", data, c.audit)).toEqual({ status: "accepted", duplicate: true });
    expect(sendStaffEmail).not.toHaveBeenCalled();
  });
  it("records failed sending without losing history", async () => {
    vi.mocked(sendStaffEmail).mockRejectedValue(new Error("provider failure"));
    const c = clients();
    expect(await sendComposedEmail(c.client, "caller", data, c.audit)).toEqual({ status: "failed" });
    expect(c.update).toHaveBeenCalledWith({ details: expect.objectContaining({ status: "failed", providerId: null }) });
  });
});