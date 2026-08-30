import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { z } from "zod";
import { KeyRound, Loader2, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { COMPANY } from "@/lib/site";

type AuthSearch = { redirect?: string };

export const ADMIN_EMAIL = "jaydevassociates25@gmail.com";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): AuthSearch => ({
    redirect:
      typeof search["redirect"] === "string" && search["redirect"].startsWith("/")
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
    const { data, error } = await supabase.auth.signInWithPassword({
      email: ADMIN_EMAIL,
      password: password.data,
    });
    if (error) {
      setBusy(false);
      if (error.code === "email_not_confirmed") {
        await supabase.auth.resend({
          type: "signup",
          email: ADMIN_EMAIL,
          options: { emailRedirectTo: window.location.origin },
        });
        toast.error("Administrator email is not confirmed. We sent a new confirmation link.");
        return;
      }
      toast.error("Invalid credentials");
      return;
    }

    const userId = data.user?.id;
    if (!userId) {
      await supabase.auth.signOut();
      setBusy(false);
      toast.error("Administrator sign-in could not be verified.");
      return;
    }
    const { data: role } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    await supabase.auth.signOut();
    if (!role) {
      setBusy(false);
      toast.error("This account is not authorised for administrator access.");
      return;
    }

    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: ADMIN_EMAIL,
      options: { shouldCreateUser: false },
    });
    setBusy(false);
    if (otpError) {
      toast.error(otpError.message);
      return;
    }
    setAwaitingOtp(true);
    toast.success("A one-time login code was sent to the administrator email.");
  }

  async function handleOtp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const token = String(new FormData(event.currentTarget).get("otp") ?? "").trim();
    if (!/^\d{6}$/.test(token)) {
      toast.error("Enter the 6-digit code from the administrator email.");
      return;
    }
    setBusy(true);
    const { data, error } = await supabase.auth.verifyOtp({
      email: ADMIN_EMAIL,
      token,
      type: "email",
    });
    if (error || data.user?.email?.toLowerCase() !== ADMIN_EMAIL) {
      setBusy(false);
      toast.error("The code is invalid or has expired.");
      return;
    }
    const { data: role } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", data.user.id)
      .eq("role", "admin")
      .maybeSingle();
    if (!role) {
      await supabase.auth.signOut();
      setBusy(false);
      toast.error("This account is not authorised for administrator access.");
      return;
    }
    await refreshRoles(data.user.id);
    setBusy(false);
    toast.success("Administrator verified.");
    void navigate({ to: redirectTo });
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
            Restricted area. Sign in with the official administrator credentials.
          </p>

          {!awaitingOtp ? <form onSubmit={handleLogin} className="mt-6 space-y-4" noValidate>
            <div>
              <Label>Admin email</Label>
              <p className="mt-2 rounded-md border border-border bg-secondary px-3 py-2 text-sm text-card-foreground">
                {ADMIN_EMAIL}
              </p>
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
