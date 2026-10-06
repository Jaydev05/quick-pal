import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
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
import { CandidateProfileFields } from "@/components/jobs/CandidateProfileFields";
import { ResumeUpload } from "@/components/jobs/ResumeUpload";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { fetchMyProfile, randomCode, type JobWithCategory } from "@/lib/api";
import { sendApplicationConfirmation } from "@/lib/application-email.functions";
import { fillEmptyProfileFields, readCandidateProfileForm, type UploadedResume } from "@/lib/resume-profile";

const schema = z.object({
  full_name: z.string().trim().min(2, "Enter your full name").max(120),
  phone: z.string().trim().min(8, "Enter a valid phone number").max(20),
  experience_years: z.number().min(0).max(60).nullable(),
  cover_note: z.string().trim().max(1200).optional(),
});

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
  const [resume, setResume] = useState<UploadedResume | null>(null);
  const [reading, setReading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const sendConfirmation = useServerFn(sendApplicationConfirmation);

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: () => user ? fetchMyProfile(user.id) : Promise.resolve(null),
    enabled: Boolean(user && open),
  });

  const apply = useMutation({
    mutationFn: async ({values, profileValues}: {values:z.infer<typeof schema>;profileValues:ReturnType<typeof readCandidateProfileForm>}) => {
      if (!user) throw new Error("Please sign in to apply");
      const resumePath = resume?.path ?? profile?.resume_path ?? null;
      const resumeName = resume?.name ?? profile?.resume_name ?? null;

      if (!resumePath) throw new Error("Please upload your resume");

      const { error: profileError } = await supabase.from("profiles").upsert({
        id: user.id,
        ...profileValues,
        expected_salary: profile?.expected_salary ?? null,
        preferred_location: profile?.preferred_location ?? null,
        full_name: values.full_name,
        phone: values.phone,
        email: user.email ?? null,
        experience_years: values.experience_years,
        resume_path: resumePath,
        resume_name: resumeName,
        resume_uploaded_at: resume?.uploadedAt ?? profile?.resume_uploaded_at ?? null,
      });
      if (profileError) throw profileError;

      const { data: application, error } = await supabase
        .from("applications")
        .insert({
          job_id: job.id,
          candidate_id: user.id,
          application_code: randomCode("JA-APP"),
          cover_note: values.cover_note || null,
          resume_path: resumePath,
        })
        .select("id")
        .single();
      if (error) {
        if (error.code === "23505") throw new Error("You have already applied to this job");
        throw error;
      }
      try {
        await sendConfirmation({ data: { applicationId: application.id } });
      } catch (emailError) {
        console.error("Application submitted, but confirmation email could not be requested", emailError);
      }
    },
    onSuccess: () => {
      toast.success("Application submitted. Track it from your dashboard.");
      onOpenChange(false);
      setResume(null);
      void queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
      void queryClient.invalidateQueries({ queryKey: ["admin-candidates"] });
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
      experience_years: fd.get("experience_years") ? Number(fd.get("experience_years")) : null,
      cover_note: fd.get("cover_note") || undefined,
    });
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) next[String(issue.path[0])] = issue.message;
      setErrors(next);
      return;
    }
    setErrors({});
    try { apply.mutate({values:parsed.data,profileValues:readCandidateProfileForm(event.currentTarget)}); }
    catch(error) { toast.error(error instanceof z.ZodError ? error.issues[0]?.message ?? "Check your profile details." : "Check your profile details."); }
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

        <form ref={formRef} onSubmit={onSubmit} className="space-y-4" noValidate>
          {user && <ResumeUpload userId={user.id} savedName={resume?.name ?? profile?.resume_name} onUploaded={setResume} onBusyChange={setReading} disabled={apply.isPending} onExtracted={(values) => fillEmptyProfileFields(formRef.current,values)} />}
          <CandidateProfileFields profile={profile} application />
          {Object.entries(errors).map(([field,message]) => <p key={field} className="text-xs text-destructive">{message}</p>)}

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
            <Button type="submit" disabled={apply.isPending || reading}>
              {apply.isPending ? "Submitting…" : "Submit Application"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
