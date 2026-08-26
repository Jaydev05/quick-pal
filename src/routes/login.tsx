import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { z } from "zod";
import { Loader2, UserPlus } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

type LoginSearch = { redirect?: string };

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>): LoginSearch => ({
    redirect:
      typeof search["redirect"] === "string" && search["redirect"].startsWith("/")
        ? search["redirect"]
        : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Candidate Login & Sign Up | Jaydev Associates" },
      {
        name: "description",
        content:
          "Create your free candidate account or sign in to track job applications, save jobs and manage your profile with Jaydev Associates.",
      },
      { property: "og:title", content: "Candidate Login & Sign Up | Jaydev Associates" },
      {
        property: "og:description",
        content: "Sign in or create a candidate account to apply for jobs with Jaydev Associates.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LoginPage,
});

const emailSchema = z.string().trim().email("Enter a valid email").max(255);
const passwordSchema = z.string().min(8, "Password must be at least 8 characters").max(72);
const nameSchema = z.string().trim().min(2, "Enter your full name").max(120);

function LoginPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState("signin");

  const redirectTo = search.redirect ?? "/dashboard";

  useEffect(() => {
    if (!loading && user) void navigate({ to: redirectTo, replace: true });
  }, [user, loading, redirectTo, navigate]);

  async function handleSignIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fd = new FormData(event.currentTarget);
    const email = emailSchema.safeParse(fd.get("email"));
    const password = passwordSchema.safeParse(fd.get("password"));
    if (!email.success || !password.success) {
      toast.error(
        !email.success
          ? (email.error?.issues[0]?.message ?? "Enter a valid email")
          : (password.error?.issues[0]?.message ?? "Invalid password"),
      );
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.data.toLowerCase(),
      password: password.data,
    });
    setBusy(false);
    if (error) {
      toast.error("Invalid email or password");
      return;
    }
    toast.success("Welcome back");
    void navigate({ to: redirectTo });
  }

  async function handleSignUp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fd = new FormData(event.currentTarget);
    const name = nameSchema.safeParse(fd.get("full_name"));
    const email = emailSchema.safeParse(fd.get("signup_email"));
    const password = passwordSchema.safeParse(fd.get("signup_password"));
    if (!name.success || !email.success || !password.success) {
      const err = !name.success ? name.error : !email.success ? email.error : password.error;
      toast.error(err?.issues[0]?.message ?? "Please check your details");
      return;
    }
    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email: email.data.toLowerCase(),
      password: password.data,
      options: {
        emailRedirectTo: window.location.origin,
        data: { full_name: name.data },
      },
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (data.session) {
      toast.success("Account created. Welcome!");
      void navigate({ to: redirectTo });
      return;
    }
    toast.success("Account created. Check your email to confirm, then sign in.");
    setTab("signin");
  }

  async function handleReset(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fd = new FormData(event.currentTarget);
    const email = emailSchema.safeParse(fd.get("reset_email"));
    if (!email.success) {
      toast.error("Enter a valid email");
      return;
    }
    setBusy(true);
    await supabase.auth.resetPasswordForEmail(email.data.toLowerCase(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setBusy(false);
    toast.success("If an account exists for this email, a reset link has been sent.");
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
          <p className="eyebrow">Candidate portal</p>
          <h1 className="font-display mt-2 text-2xl font-bold text-card-foreground">
            Sign in or create your account
          </h1>
          <p className="mt-2 flex items-start gap-2 text-sm text-muted-foreground">
            <UserPlus className="mt-0.5 size-4 shrink-0 text-gold" />
            Apply faster, track applications and save jobs you like.
          </p>

          <Tabs value={tab} onValueChange={setTab} className="mt-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign in</TabsTrigger>
              <TabsTrigger value="signup">Create account</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4" noValidate>
                <div>
                  <Label htmlFor="email">Email</Label>
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

              <form onSubmit={handleReset} className="mt-6 border-t border-border pt-5">
                <Label htmlFor="reset_email" className="text-xs text-muted-foreground">
                  Forgot password? Enter your email
                </Label>
                <div className="mt-2 flex gap-2">
                  <Input id="reset_email" name="reset_email" type="email" autoComplete="email" />
                  <Button type="submit" variant="outline" disabled={busy}>
                    Send link
                  </Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4" noValidate>
                <div>
                  <Label htmlFor="full_name">Full name</Label>
                  <Input
                    id="full_name"
                    name="full_name"
                    autoComplete="name"
                    className="mt-2"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <Label htmlFor="signup_email">Email</Label>
                  <Input
                    id="signup_email"
                    name="signup_email"
                    type="email"
                    autoComplete="email"
                    className="mt-2"
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="signup_password">Password</Label>
                  <Input
                    id="signup_password"
                    name="signup_password"
                    type="password"
                    autoComplete="new-password"
                    className="mt-2"
                  />
                  <p className="mt-1.5 text-xs text-muted-foreground">At least 8 characters.</p>
                </div>
                <Button type="submit" className="w-full" disabled={busy}>
                  {busy && <Loader2 className="animate-spin" />} Create account
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
