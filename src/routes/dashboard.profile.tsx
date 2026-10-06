import { useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/PortalShell";
import { Button } from "@/components/ui/button";
import { ResumeUpload } from "@/components/jobs/ResumeUpload";
import { CandidateProfileFields } from "@/components/jobs/CandidateProfileFields";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { fetchMyProfile } from "@/lib/api";
import { fillEmptyProfileFields, readCandidateProfileForm, type UploadedResume } from "@/lib/resume-profile";

export const Route = createFileRoute("/dashboard/profile")({
  head: () => ({
    meta: [
      { title: "My Profile | Jaydev Associates" },
      {
        name: "description",
        content: "Manage your Jaydev Associates candidate profile, resume and job preferences.",
      },
      { property: "og:title", content: "My Profile | Jaydev Associates" },
      { property: "og:description", content: "Manage your Jaydev Associates candidate profile." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user } = useAuth();
  const uid = user?.id;
  const queryClient = useQueryClient();
  const [resume, setResume] = useState<UploadedResume | null>(null);
  const [reading, setReading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile", uid],
    queryFn: () => uid ? fetchMyProfile(uid) : Promise.resolve(null),
    enabled: Boolean(uid),
  });

  const save = useMutation({
    mutationFn: async (form: HTMLFormElement) => {
      if (!uid || !user) throw new Error("Please sign in to save your profile.");
      const values = readCandidateProfileForm(form);
      const { error } = await supabase.from("profiles").upsert({
        id: uid,
        ...values,
        email: user.email ?? null,
        resume_path: resume?.path ?? profile?.resume_path ?? null,
        resume_name: resume?.name ?? profile?.resume_name ?? null,
        resume_uploaded_at: resume?.uploadedAt ?? profile?.resume_uploaded_at ?? null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Profile saved");
      setResume(null);
      void queryClient.invalidateQueries({ queryKey: ["profile", uid] });
      void queryClient.invalidateQueries({ queryKey: ["admin-candidates"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading || !uid) return <p className="text-sm text-muted-foreground">Loading profile…</p>;

  return (
    <>
      <PageHeader title="My Profile" description="Keep your details current for faster shortlisting." />
      <form
        ref={formRef}
        className="max-w-3xl rounded-xl border border-border bg-card p-6"
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate(e.currentTarget);
        }}
      >
        <div className="mb-6 border-b border-border pb-6"><ResumeUpload userId={uid} savedName={resume?.name ?? profile?.resume_name} onUploaded={setResume} onBusyChange={setReading} disabled={save.isPending} onExtracted={(values) => fillEmptyProfileFields(formRef.current, values)} /></div>
        <CandidateProfileFields profile={profile} />
        <Button type="submit" className="mt-6" disabled={save.isPending || reading}>
          {save.isPending ? "Saving…" : "Save profile"}
        </Button>
      </form>
    </>
  );
}
