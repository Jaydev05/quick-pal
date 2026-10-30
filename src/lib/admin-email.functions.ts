import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { composedEmailSchema, type ReceivedEmail } from "./admin-email";

export const sendAdminEmail = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator((input) => {
    const result = composedEmailSchema.safeParse(input);
    if (!result.success) throw new Error(result.error.issues.map((issue) => issue.message).join(" "));
    return result.data;
  }).handler(async ({ context, data }) => {
    const { assertStaff } = await import("./staff-access.server");
    await assertStaff(context.supabase, context.userId, true);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { sendComposedEmail } = await import("./admin-email.server");
    return sendComposedEmail(context.supabase, context.userId, data, supabaseAdmin);
  });

export const getReceivedEmails = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { assertStaff } = await import("./staff-access.server");
    await assertStaff(context.supabase, context.userId, true);
    const { readResend } = await import("./admin-email.server");
    const result = await readResend("/emails/receiving?limit=50");
    if (!result.available) return { available: false as const, message: result.message, emails: [] as ReceivedEmail[] };
    const rows = z.array(z.object({ id: z.string().uuid(), from: z.string(), to: z.array(z.string()), subject: z.string(), created_at: z.string() })).safeParse(result.data.data);
    if (!rows.success) throw new Error("Received emails could not be loaded.");
    return { available: true as const, message: "", emails: rows.data.map((row) => ({ id: row.id, from: row.from, to: row.to, subject: row.subject, createdAt: row.created_at })) };
  });

export const getReceivedEmail = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ context, data }) => {
    const { assertStaff } = await import("./staff-access.server");
    await assertStaff(context.supabase, context.userId, true);
    const { readResend } = await import("./admin-email.server");
    const result = await readResend(`/emails/receiving/${encodeURIComponent(data.id)}`);
    if (!result.available) throw new Error(result.message);
    return { html: typeof result.data.html === "string" ? result.data.html : null, text: typeof result.data.text === "string" ? result.data.text : "" };
  });