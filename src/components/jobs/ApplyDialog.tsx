import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FileText, Upload } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { fetchMyProfile, randomCode, type JobWithCategory } from "@/lib/api";

const schema = z.object({
  full_name: z.string().trim().min(2, "Enter your full name").max(120),
  phone: z.string().trim().min(8, "Enter a valid phone number").max(20),
  experience_years: z.number().min(0).max(60),
  cover_note: z.string().trim().max(1200).optional(),
});

const MAX_RESUME_MB = 5;

export function ApplyDialog({
  job,
  open,
  onOpenChange,
}: {
  job: JobWithCategory;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: () => fetchMyProfile(user!.id),
    enabled: Boolean(user && open),
  });

  const apply = useMutation({
    mutationFn: async (values: z.infer<typeof schema>) => {
      if (!user) throw new Error("Please sign in to apply");
      let resumePath = profile?.resume_path ?? null;
      let resumeName = profile?.resume_name ?? null;

      if (file) {
        if (file.size > MAX_RESUME_MB * 1024 * 1024)
          throw new Error(`Resume must be under ${MAX_RESUME_MB}MB`);
        const ext = file.name.split(".").pop()?.toLowerCase() ?? "pdf";
        if (!["pdf", "doc", "docx"].includes(ext))
          throw new Error("Resume must be a PDF or Word document");
        const path = `${user.id}/${Date.now()}-resume.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("resumes")
          .upload(path, file, { upsert: true });
        if (uploadError) throw uploadError;
        resumePath = path;
        resumeName = file.name;
      }

      if (!resumePath) throw new Error("Please upload your resume");

      const { error: profileError } = await supabase.from("profiles").upsert({
        id: user.id,
        full_name: values.full_name,
        phone: values.phone,
        email: user.email ?? null,
        experience_years: values.experience_years,
        resume_path: resumePath,
        resume_name: resumeName,
        resume_uploaded_at: file ? new Date().toISOString() : profile?.resume_uploaded_at,
      });
      if (profileError) throw profileError;

      const { error } = await supabase.from("applications").insert({
        job_id: job.id,
        candidate_id: user.id,
        application_code: randomCode("JA-APP"),
        cover_note: values.cover_note || null,
        resume_path: resumePath,
      });
      if (error) {
        if (error.code === "23505") throw new Error("You have already applied to this job");
        throw error;
      }
    },
    onSuccess: () => {
      toast.success("Application submitted. Track it from your dashboard.");
      onOpenChange(false);
      setFile(null);
      void queryClient.invalidateQueries({ queryKey: ["my-application", job.id, user?.id] });
      void queryClient.invalidateQueries({ queryKey: ["my-applications"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fd = new FormData(event.currentTarget);
    const parsed = schema.safeParse({
      full_name: fd.get("full_name"),
      phone: fd.get("phone"),
      experience_years: Number(fd.get("experience_years") ?? 0),
      cover_note: fd.get("cover_note") || undefined,
    });
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) next[String(issue.path[0])] = issue.message;
      setErrors(next);
      return;
    }
    setErrors({});
    apply.mutate(parsed.data);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display">Apply for {job.title}</DialogTitle>
          <DialogDescription>
            {job.job_code} · Your details are shared with our recruitment team only.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <div>
            <Label htmlFor="full_name">Full name *</Label>
            <Input
              id="full_name"
              name="full_name"
              className="mt-2"
              defaultValue={profile?.full_name ?? ""}
              maxLength={120}
            />
            {errors["full_name"] && (
              <p className="mt-1.5 text-xs text-destructive">{errors["full_name"]}</p>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                name="phone"
                className="mt-2"
                defaultValue={profile?.phone ?? ""}
                maxLength={20}
              />
              {errors["phone"] && (
                <p className="mt-1.5 text-xs text-destructive">{errors["phone"]}</p>
              )}
            </div>
            <div>
              <Label htmlFor="experience_years">Experience (years) *</Label>
              <Input
                id="experience_years"
                name="experience_years"
                type="number"
                min={0}
                max={60}
                step={1}
                className="mt-2"
                defaultValue={profile?.experience_years ?? 0}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="resume">Resume {profile?.resume_path ? "(optional)" : "*"}</Label>
            <div className="mt-2 rounded-lg border border-dashed border-border p-4">
              <Input
                id="resume"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
              <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                {file ? (
                  <>
                    <Upload className="size-3.5" /> {file.name}
                  </>
                ) : profile?.resume_name ? (
                  <>
                    <FileText className="size-3.5" /> Using saved resume: {profile.resume_name}
                  </>
                ) : (
                  <>PDF or Word, max {MAX_RESUME_MB}MB</>
                )}
              </p>
            </div>
          </div>

          <div>
            <Label htmlFor="cover_note">Cover note (optional)</Label>
            <Textarea
              id="cover_note"
              name="cover_note"
              rows={4}
              className="mt-2"
              maxLength={1200}
              placeholder="Why are you a good fit for this role?"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={apply.isPending}>
              {apply.isPending ? "Submitting…" : "Submit Application"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
