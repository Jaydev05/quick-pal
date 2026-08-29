import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { z } from "zod";
import { Loader2, ShieldCheck, UserRoundPlus } from "lucide-react";
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
  const { user, loading } = useAuth();
  const [busy, setBusy] = useState(false);

  const redirectTo = search.redirect ?? "/admin";

  useEffect(() => {
    if (!loading && user) void navigate({ to: redirectTo, replace: true });
  }, [user, loading, redirectTo, navigate]);

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fd = new FormData(event.currentTarget);
    const email = emailSchema.safeParse(fd.get("email"));
    const password = passwordSchema.safeParse(fd.get("password"));
    if (!email.success || !password.success) {
      toast.error("Invalid credentials");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.data.toLowerCase(),
      password: password.data,
    });
    setBusy(false);
    if (error) {
      if (error.code === "email_not_confirmed") {
        toast.error("Please confirm the administrator email first, then sign in.");
        return;
      }
      toast.error("Invalid credentials");
      return;
    }
    toast.success("Welcome back");
    void navigate({ to: redirectTo });
  }

  async function handleAdminSetup(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fd = new FormData(event.currentTarget);
    const email = emailSchema.safeParse(fd.get("setup_email"));
    const password = passwordSchema.safeParse(fd.get("setup_password"));
    if (!email.success || email.data.toLowerCase() !== ADMIN_EMAIL || !password.success) {
      toast.error("Enter the official administrator email and a valid password.");
      return;
    }

    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email: email.data.toLowerCase(),
      password: password.data,
      options: {
        emailRedirectTo: window.location.origin,
        data: { full_name: "Jaydev Associates Administrator" },
      },
    });
    setBusy(false);

    if (error) {
      toast.error(error.message);
      return;
    }
    if (!data.session) {
      toast.error("This administrator account already exists. Use Sign in or Forgot password.");
      return;
    }
    toast.success("Administrator account created.");
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

          <form onSubmit={handleLogin} className="mt-6 space-y-4" noValidate>
            <div>
              <Label htmlFor="email">Admin email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="username"
                className="mt-2"
                placeholder="you@example.com"
              />
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
              {busy && <Loader2 className="animate-spin" />} Sign in
            </Button>
          </form>

          <details className="mt-5 border-t border-border pt-5">
            <summary className="cursor-pointer text-sm font-medium text-card-foreground">
              First-time administrator setup
            </summary>
            <form onSubmit={handleAdminSetup} className="mt-4 space-y-3" noValidate>
              <div>
                <Label htmlFor="setup_email">Official administrator email</Label>
                <Input
                  id="setup_email"
                  name="setup_email"
                  type="email"
                  autoComplete="email"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="setup_password">Set password</Label>
                <Input
                  id="setup_password"
                  name="setup_password"
                  type="password"
                  autoComplete="new-password"
                  className="mt-2"
                />
              </div>
              <Button type="submit" variant="secondary" className="w-full" disabled={busy}>
                {busy ? <Loader2 className="animate-spin" /> : <UserRoundPlus />}
                Create administrator account
              </Button>
            </form>
          </details>

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
