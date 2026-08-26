import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { z } from "zod";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset Password | Jaydev Associates" },
      {
        name: "description",
        content: "Set a new password for your Jaydev Associates candidate account.",
      },
      { property: "og:title", content: "Reset Password | Jaydev Associates" },
      { property: "og:description", content: "Choose a new password for your candidate account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPasswordPage,
});

const passwordSchema = z.string().min(8, "Password must be at least 8 characters").max(72);

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fd = new FormData(event.currentTarget);
    const password = passwordSchema.safeParse(fd.get("password"));
    if (!password.success) return toast.error(password.error.issues[0]!.message);
    if (password.data !== fd.get("confirm")) return toast.error("Passwords do not match");

    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: password.data });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Password updated");
    void navigate({ to: "/dashboard" });
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
        <form
          onSubmit={onSubmit}
          className="w-full max-w-md rounded-2xl border border-border bg-card p-7 shadow-card"
          noValidate
        >
          <h1 className="font-display text-2xl font-bold text-card-foreground">
            Set a new password
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Open this page from the reset link in your email.
          </p>
          <div className="mt-6 space-y-4">
            <div>
              <Label htmlFor="password">New password</Label>
              <Input id="password" name="password" type="password" className="mt-2" />
            </div>
            <div>
              <Label htmlFor="confirm">Confirm password</Label>
              <Input id="confirm" name="confirm" type="password" className="mt-2" />
            </div>
          </div>
          <Button type="submit" className="mt-6 w-full" disabled={busy}>
            Update password
          </Button>
        </form>
      </main>
    </div>
  );
}
