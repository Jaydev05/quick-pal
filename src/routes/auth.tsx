import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { z } from "zod";
import { useServerFn } from "@tanstack/react-start";
import { requestAdminCode, verifyAdminCode } from "@/lib/staff-access.functions";
import { MAIN_ADMIN_EMAIL } from "@/lib/staff-access";
import { KeyRound, Loader2, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { COMPANY } from "@/lib/site";

type AuthSearch = { redirect?: string };

export const ADMIN_EMAIL = MAIN_ADMIN_EMAIL;

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): AuthSearch => ({
    redirect:
      typeof search["redirect"] === "string" && search["redirect"].startsWith("/") && !search["redirect"].startsWith("//")
        ? search["redirect"]
        : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Admin Login | Jaydev Associates" },
      {
        name: "description",
        content:
          "Secure administrator sign-in for the Jaydev Associates recruitment portal. Authorised staff only.",
      },
      { property: "og:title", content: "Admin Login | Jaydev Associates" },
      { property: "og:description", content: "Secure administrator access to the Jaydev Associates portal." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AuthPage,
});

const emailSchema = z.string().trim().email("Enter a valid email").max(255);
const passwordSchema = z.string().min(8, "Password must be at least 8 characters").max(72);

function AuthPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { refreshRoles } = useAuth();
  const [busy, setBusy] = useState(false);
  const [awaitingOtp, setAwaitingOtp] = useState(false);
  const [challengeId, setChallengeId] = useState("");
  const sendCode = useServerFn(requestAdminCode);
  const verifyCode = useServerFn(verifyAdminCode);

  const redirectTo = search.redirect ?? "/admin";

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fd = new FormData(event.currentTarget);
    const password = passwordSchema.safeParse(fd.get("password"));
    if (!password.success) {
      toast.error("Invalid credentials");
      return;
    }
    setBusy(true);
    const email = emailSchema.safeParse(fd.get("email"));
    try {
      if (!email.success) throw new Error("Enter a valid email.");
      if (email.data.toLowerCase() === ADMIN_EMAIL) {
        const result = await sendCode({ data: { password: password.data } });
        setChallengeId(result.challengeId);
        setAwaitingOtp(true);
        toast.success("Your six-digit admin login code has been sent.");
      } else {
        const { data: login, error } = await supabase.auth.signInWithPassword({ email: email.data.toLowerCase(), password: password.data });
        if (error || !login.user) throw new Error("Invalid credentials.");
        const { data: employee } = await supabase.from("employee_access").select("active").eq("user_id", login.user.id).maybeSingle();
        if (!employee?.active) {
          await supabase.auth.signOut();
          throw new Error("Employee access is unavailable. Contact the administrator.");
        }
        await refreshRoles(login.user.id);
        void navigate({ to: "/admin", replace: true });
      }
    } catch (error) { toast.error(error instanceof Error ? error.message : "Sign-in failed."); }
    finally { setBusy(false); }
  }

  async function handleOtp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const token = String(new FormData(event.currentTarget).get("otp") ?? "").trim();
    if (!/^\d{6}$/.test(token)) { toast.error("Enter the six-digit code."); return; }
    setBusy(true);
    try {
      const tokens = await verifyCode({ data: { challengeId, code: token } });
      const { data, error } = await supabase.auth.setSession(tokens);
      if (error || !data.user) throw new Error("Could not complete sign-in.");
      await refreshRoles(data.user.id);
      toast.success("Administrator verified.");
      void navigate({ to: redirectTo, replace: true });
    } catch (error) { toast.error(error instanceof Error ? error.message : "Verification failed."); }
    finally { setBusy(false); }
  }

  async function handleReset(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fd = new FormData(event.currentTarget);
    const email = emailSchema.safeParse(fd.get("reset_email"));
    setBusy(true);
    // Only the single administrator account may request a password reset.
    if (email.success && email.data.toLowerCase() === ADMIN_EMAIL) {
      const { error } = await supabase.auth.resetPasswordForEmail(email.data.toLowerCase(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) {
        setBusy(false);
        toast.error(error.message);
        return;
      }
    }
    setBusy(false);
    toast.success("If this address is the administrator account, a reset link has been sent.");
  }

  return (
    <div className="surface-dark flex min-h-screen flex-col bg-background">
      <header className="container-x flex items-center justify-between py-6">
        <Logo height={38} />
        <Button asChild variant="ghost" size="sm">
          <Link to="/">Back to site</Link>
        </Button>
      </header>

      <main className="container-x flex flex-1 items-center justify-center py-10">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-7 shadow-card">
          <p className="eyebrow">Administrator access</p>
          <h1 className="font-display mt-2 text-2xl font-bold text-card-foreground">
            {COMPANY.name}
          </h1>
          <p className="mt-2 flex items-start gap-2 text-sm text-muted-foreground">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-gold" />
            Restricted staff access. Sign in with your registered email and password.
          </p>

          {!awaitingOtp ? <form onSubmit={handleLogin} className="mt-6 space-y-4" noValidate>
            <div>
              <Label htmlFor="email">Staff email</Label>
              <Input id="email" name="email" type="email" autoComplete="username" className="mt-2" defaultValue={ADMIN_EMAIL} />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                className="mt-2"
              />
            </div>
            <Button type="submit" className="w-full" disabled={busy}>
              {busy && <Loader2 className="animate-spin" />} Continue securely
            </Button>
          </form> : <form onSubmit={handleOtp} className="mt-6 space-y-4" noValidate>
            <div>
              <Label htmlFor="otp">Email verification code</Label>
              <Input
                id="otp"
                name="otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                className="mt-2 text-center text-lg"
                placeholder="6-digit code"
              />
            </div>
            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? <Loader2 className="animate-spin" /> : <KeyRound />}
              Verify and open admin panel
            </Button>
            <Button type="button" variant="ghost" className="w-full" onClick={() => setAwaitingOtp(false)}>
              Use password again
            </Button>
          </form>}

          <form onSubmit={handleReset} className="mt-6 border-t border-border pt-5">
            <Label htmlFor="reset_email" className="text-xs text-muted-foreground">
              Forgot password? Enter the administrator email
            </Label>
            <div className="mt-2 flex gap-2">
              <Input id="reset_email" name="reset_email" type="email" autoComplete="email" />
              <Button type="submit" variant="outline" disabled={busy}>
                Send link
              </Button>
            </div>
          </form>

          <p className="mt-6 text-xs text-muted-foreground">
            Public account registration is disabled. Contact {COMPANY.name} for access.
          </p>
        </div>
      </main>
    </div>
  );
}
