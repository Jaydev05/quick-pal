import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FileText } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/PortalShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { fetchMyProfile } from "@/lib/api";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/dashboard/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const { user } = useAuth();
  const uid = user!.id;
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile", uid],
    queryFn: () => fetchMyProfile(uid),
  });

  const save = useMutation({
    mutationFn: async (form: HTMLFormElement) => {
      const fd = new FormData(form);
      let resume_path = profile?.resume_path ?? null;
      let resume_name = profile?.resume_name ?? null;

      if (file) {
        if (file.size > 5 * 1024 * 1024) throw new Error("Resume must be under 5MB");
        const ext = file.name.split(".").pop()?.toLowerCase() ?? "pdf";
        if (!["pdf", "doc", "docx"].includes(ext)) throw new Error("Use a PDF or Word file");
        const path = `${uid}/${Date.now()}-resume.${ext}`;
        const { error } = await supabase.storage.from("resumes").upload(path, file);
        if (error) throw error;
        resume_path = path;
        resume_name = file.name;
      }

      const { error } = await supabase.from("profiles").upsert({
        id: uid,
        full_name: String(fd.get("full_name") ?? "").trim().slice(0, 120),
        email: user!.email ?? null,
        phone: String(fd.get("phone") ?? "").slice(0, 20),
        city: String(fd.get("city") ?? "").slice(0, 80) || null,
        state: String(fd.get("state") ?? "").slice(0, 80) || null,
        education: String(fd.get("education") ?? "").slice(0, 200) || null,
        current_job_title: String(fd.get("current_job_title") ?? "").slice(0, 120) || null,
        experience_years: Number(fd.get("experience_years") ?? 0),
        expected_salary: fd.get("expected_salary") ? Number(fd.get("expected_salary")) : null,
        preferred_location: String(fd.get("preferred_location") ?? "").slice(0, 120) || null,
        skills: String(fd.get("skills") ?? "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
          .slice(0, 25),
        resume_path,
        resume_name,
        resume_uploaded_at: file ? new Date().toISOString() : profile?.resume_uploaded_at,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Profile saved");
      setFile(null);
      void queryClient.invalidateQueries({ queryKey: ["profile", uid] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading profile…</p>;

  return (
    <>
      <PageHeader title="My Profile" description="Keep your details current for faster shortlisting." />
      <form
        className="max-w-3xl rounded-xl border border-border bg-card p-6"
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate(e.currentTarget);
        }}
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <F label="Full name" name="full_name" defaultValue={profile?.full_name ?? ""} />
          <F label="Phone" name="phone" defaultValue={profile?.phone ?? ""} />
          <F label="City" name="city" defaultValue={profile?.city ?? ""} />
          <F label="State" name="state" defaultValue={profile?.state ?? ""} />
          <F label="Highest education" name="education" defaultValue={profile?.education ?? ""} />
          <F
            label="Current job title"
            name="current_job_title"
            defaultValue={profile?.current_job_title ?? ""}
          />
          <F
            label="Experience (years)"
            name="experience_years"
            type="number"
            defaultValue={String(profile?.experience_years ?? 0)}
          />
          <F
            label="Expected salary (₹ / year)"
            name="expected_salary"
            type="number"
            defaultValue={profile?.expected_salary ? String(profile.expected_salary) : ""}
          />
          <F
            label="Preferred location"
            name="preferred_location"
            defaultValue={profile?.preferred_location ?? ""}
          />
          <div className="sm:col-span-2">
            <Label htmlFor="skills">Skills (comma separated)</Label>
            <Textarea
              id="skills"
              name="skills"
              rows={3}
              className="mt-2"
              defaultValue={(profile?.skills ?? []).join(", ")}
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="resume">Resume</Label>
            <Input
              id="resume"
              type="file"
              accept=".pdf,.doc,.docx"
              className="mt-2"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            {profile?.resume_name && (
              <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                <FileText className="size-3.5" /> {profile.resume_name} · uploaded{" "}
                {formatDate(profile.resume_uploaded_at)}
              </p>
            )}
          </div>
        </div>
        <Button type="submit" className="mt-6" disabled={save.isPending}>
          {save.isPending ? "Saving…" : "Save profile"}
        </Button>
      </form>
    </>
  );
}

function F({
  label,
  name,
  defaultValue,
  type = "text",
}: {
  label: string;
  name: string;
  defaultValue?: string;
  type?: string;
}) {
  return (
    <div>
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} type={type} className="mt-2" defaultValue={defaultValue} />
    </div>
  );
}
