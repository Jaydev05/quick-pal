import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { employeeSchema, MAIN_ADMIN_EMAIL, validatePasswordChange } from "./staff-access";

function authClient() {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) throw new Error("Sign-in is unavailable.");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false }, global: { fetch: (input, init) => {
    const headers = new Headers(init?.headers);
    if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) headers.delete("Authorization");
    headers.set("apikey", key);
    return fetch(input, { ...init, headers });
  } } });
}

export const requestAdminCode = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ password: z.string().min(8).max(72) }).parse(input))
  .handler(async ({ data }) => {
    const client = authClient();
    const { data: login, error } = await client.auth.signInWithPassword({ email: MAIN_ADMIN_EMAIL, password: data.password });
    if (error || !login.user) throw new Error("Invalid administrator credentials.");
    const userId = login.user.id;
    await client.auth.signOut({ scope: "local" });
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: role } = await supabaseAdmin.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle();
    if (!role) throw new Error("Administrator access required.");
    const { data: recent } = await supabaseAdmin.from("admin_login_challenges").select("id")
      .eq("user_id", userId).gte("created_at", new Date(Date.now() - 60000).toISOString()).limit(1);
    if (recent?.length) throw new Error("Please wait one minute before requesting another code.");
    const { data: link, error: linkError } = await supabaseAdmin.auth.admin.generateLink({ type: "magiclink", email: MAIN_ADMIN_EMAIL });
    if (linkError || !link.properties?.hashed_token) throw new Error("Could not prepare verification.");
    const id = crypto.randomUUID();
    const random = crypto.getRandomValues(new Uint32Array(1))[0] ?? 0;
    const code = String(100000 + (random % 900000));
    const { codeDigest } = await import("./staff-access.server");
    const { error: saveError } = await supabaseAdmin.from("admin_login_challenges").insert({
      id, user_id: userId, code_digest: await codeDigest(id, code), auth_token_hash: link.properties.hashed_token,
      expires_at: new Date(Date.now() + 10 * 60000).toISOString(),
    });
    if (saveError) throw new Error("Could not prepare verification.");
    const { sendStaffEmail } = await import("./staff-email.server");
    try {
      await sendStaffEmail(MAIN_ADMIN_EMAIL, "Your OTP for admin login | Jaydev Associates",
        `<p>Your one-time code for admin login is:</p><p style="font-size:34px;font-weight:bold;text-align:center">${code}</p><p>This code expires in 10 minutes. Do not share it with anyone.</p><p>If you did not request this sign-in, ignore this email.</p>`, `admin-otp-${id}`);
    } catch (error) {
      await supabaseAdmin.from("admin_login_challenges").update({ consumed: true }).eq("id", id);
      throw error;
    }
    return { challengeId: id };
  });

export const verifyAdminCode = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ challengeId: z.string().uuid(), code: z.string().regex(/^\d{6}$/) }).parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { codeDigest } = await import("./staff-access.server");
    const { data: result, error } = await supabaseAdmin.rpc("consume_admin_login_challenge", { challenge_id: data.challengeId, digest: await codeDigest(data.challengeId, data.code) });
    const challenge = result?.[0];
    if (error || !challenge) throw new Error("The code is invalid or expired. Request a new code after five unsuccessful attempts.");
    const client = authClient();
    const { data: verified, error: verifyError } = await client.auth.verifyOtp({ token_hash: challenge.auth_token_hash, type: "magiclink" });
    if (verifyError || !verified.session || verified.user?.id !== challenge.user_id || verified.user.email?.toLowerCase() !== MAIN_ADMIN_EMAIL) throw new Error("Verification failed. Request a new code.");
    const payload = JSON.parse(atob(verified.session.access_token.split(".")[1]?.replace(/-/g, "+").replace(/_/g, "/") ?? "")) as { session_id?: string };
    if (!payload.session_id) throw new Error("Verification failed.");
    const { error: sessionError } = await supabaseAdmin.from("admin_verified_sessions").insert({ session_id: payload.session_id, user_id: challenge.user_id, expires_at: new Date(Date.now() + 12 * 3600000).toISOString() });
    if (sessionError) { await client.auth.signOut({ scope: "local" }); throw new Error("Could not activate administrator access."); }
    return { access_token: verified.session.access_token, refresh_token: verified.session.refresh_token };
  });

export const getStaffAccess = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: main } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (main) return { main: true, employee: null };
    const { data: employee, error } = await context.supabase.from("employee_access").select("*").eq("user_id", context.userId).maybeSingle();
    if (error) throw new Error("Could not check employee access.");
    return { main: false, employee };
  });

export const listEmployees = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { assertStaff } = await import("./staff-access.server");
    await assertStaff(context.supabase, context.userId, true);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin.from("employee_access").select("*").order("created_at", { ascending: false });
    if (error) throw new Error("Could not load employees.");
    return data;
  });

export const createEmployee = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator((input) => employeeSchema.parse(input))
  .handler(async ({ context, data }) => {
    const { assertStaff, temporaryPassword } = await import("./staff-access.server");
    await assertStaff(context.supabase, context.userId, true);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const password = temporaryPassword();
    const { data: account, error } = await supabaseAdmin.auth.admin.createUser({ email: data.email, password, email_confirm: true, user_metadata: { full_name: data.fullName } });
    if (error || !account.user) throw new Error("Could not create this account. Its email may already be registered.");
    const userId = account.user.id;
    const { error: profileError } = await supabaseAdmin.from("employee_access").insert({ user_id: userId, full_name: data.fullName, designation: data.designation, phone: data.phone, email: data.email, joining_date: data.joiningDate, notes: data.notes, created_by: context.userId });
    const { error: roleError } = profileError ? { error: profileError } : await supabaseAdmin.from("user_roles").insert({ user_id: userId, role: "recruiter" });
    if (profileError || roleError) {
      await supabaseAdmin.auth.admin.deleteUser(userId);
      await supabaseAdmin.from("employee_access").delete().eq("user_id", userId);
      throw new Error("Could not activate employee access.");
    }
    const { sendStaffEmail, htmlEscape } = await import("./staff-email.server");
    let emailAccepted = false;
    try {
      await sendStaffEmail(data.email, "Your employee access | Jaydev Associates", `<p>Dear ${htmlEscape(data.fullName)},</p><p>Your employee profile and access have been created.</p><p>Designation: ${htmlEscape(data.designation)}<br>Email: ${htmlEscape(data.email)}<br>Temporary password: <strong>${htmlEscape(password)}</strong></p><p>Sign in at <a href="https://jaydevassociates.com/auth">jaydevassociates.com/auth</a>. You must choose a new password before using the admin panel.</p>`, `employee-created-${userId}`);
      emailAccepted = true;
    } catch { /* Employee remains created; a reset issues new credentials. */ }
    await supabaseAdmin.from("admin_activity_logs").insert({ actor_id: context.userId, action: "employee_created", entity_type: "employee_access", entity_id: userId, details: { emailAccepted } });
    return { emailAccepted };
  });

export const manageEmployee = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ userId: z.string().uuid(), action: z.enum(["deactivate", "activate", "reset"]) }).parse(input))
  .handler(async ({ context, data }) => {
    const { assertStaff, temporaryPassword } = await import("./staff-access.server");
    await assertStaff(context.supabase, context.userId, true);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: employee } = await supabaseAdmin.from("employee_access").select("*").eq("user_id", data.userId).maybeSingle();
    if (!employee || employee.email === MAIN_ADMIN_EMAIL) throw new Error("Employee not found.");
    let emailAccepted = false;
    if (data.action === "reset") {
      const { error: lockError } = await supabaseAdmin.from("employee_access").update({ must_change_password: true, updated_at: new Date().toISOString() }).eq("user_id", employee.user_id);
      if (lockError) throw new Error("Could not reset employee access.");
      const password = temporaryPassword();
      const { error } = await supabaseAdmin.auth.admin.updateUserById(employee.user_id, { password });
      if (error) throw new Error("Could not reset employee password.");
      const { sendStaffEmail, htmlEscape } = await import("./staff-email.server");
      try {
        await sendStaffEmail(employee.email, "Employee password reset | Jaydev Associates", `<p>Dear ${htmlEscape(employee.full_name)},</p><p>Your temporary password is <strong>${htmlEscape(password)}</strong>.</p><p>Sign in at <a href="https://jaydevassociates.com/auth">jaydevassociates.com/auth</a> and set a new password before accessing the admin panel.</p>`, `employee-reset-${crypto.randomUUID()}`);
        emailAccepted = true;
      } catch { /* Keep reset enforced even when sending fails. */ }
    } else {
      const { error } = await supabaseAdmin.from("employee_access").update({ active: data.action === "activate", updated_at: new Date().toISOString() }).eq("user_id", employee.user_id);
      if (error) throw new Error("Could not update employee access.");
    }
    await supabaseAdmin.from("admin_activity_logs").insert({ actor_id: context.userId, action: `employee_${data.action}`, entity_type: "employee_access", entity_id: employee.user_id, details: { emailAccepted } });
    return { emailAccepted };
  });

export const changeEmployeePassword = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator(validatePasswordChange)
  .handler(async ({ context, data }) => {
    if (data.password === data.currentPassword) throw new Error("Choose a different password.");
    const { data: employee } = await context.supabase.from("employee_access").select("email,active,must_change_password").eq("user_id", context.userId).maybeSingle();
    if (!employee?.active || !employee.must_change_password) throw new Error("Password update is unavailable.");
    const client = authClient();
    const { data: login, error: loginError } = await client.auth.signInWithPassword({ email: employee.email, password: data.currentPassword });
    if (loginError || login.user?.id !== context.userId) throw new Error("The current password is incorrect.");
    const { error } = await client.auth.updateUser({ password: data.password, current_password: data.currentPassword });
    await client.auth.signOut({ scope: "local" });
    if (error) throw new Error("Could not update your password.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error: unlockError } = await supabaseAdmin.from("employee_access").update({ must_change_password: false, updated_at: new Date().toISOString() }).eq("user_id", context.userId).eq("active", true);
    if (unlockError) throw new Error("Password changed, but access could not be activated. Contact the administrator.");
    return { updated: true };
  });