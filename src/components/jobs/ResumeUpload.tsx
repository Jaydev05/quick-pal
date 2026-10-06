import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { FileText, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { analyseMyResume } from "@/lib/resume-analysis.functions";
import { validateResumeFile, type ResumeProfile, type UploadedResume } from "@/lib/resume-profile";

export function ResumeUpload({ userId, savedName, disabled, onUploaded, onExtracted, onBusyChange }: {
  userId: string; savedName?: string | null; disabled?: boolean;
  onUploaded: (resume: UploadedResume) => void;
  onExtracted: (profile: ResumeProfile) => void;
  onBusyChange: (busy: boolean) => void;
}) {
  const analyse = useServerFn(analyseMyResume);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);
  const sequence = useRef(0);

  async function select(file: File | undefined) {
    if (!file) return;
    const attempt = ++sequence.current;
    setFailed(false); setMessage("");
    let extension: string;
    try { extension = validateResumeFile(file); }
    catch(error) { setFailed(true); setMessage(error instanceof Error ? error.message : "Invalid resume."); return; }
    setBusy(true); onBusyChange(true); setMessage("Uploading resume…");
    try {
      const path = `${userId}/${crypto.randomUUID()}-resume.${extension}`;
      const {error} = await supabase.storage.from("resumes").upload(path,file);
      if(error) throw new Error("Resume upload failed. Please try again.");
      onUploaded({path,name:file.name,uploadedAt:new Date().toISOString()});
      setMessage("Reading resume details…");
      const result = await analyse({data:{path,filename:file.name}});
      if(attempt !== sequence.current) return;
      if(result.data) { onExtracted(result.data); setMessage("Resume read. Check your profile details before saving."); }
      else { setFailed(true); setMessage(result.error ?? "Autofill unavailable. Your resume is uploaded; enter details manually."); }
    } catch(error) {
      setFailed(true); setMessage(error instanceof Error ? error.message : "Resume analysis could not finish. Enter details manually.");
    } finally { if(attempt === sequence.current) {setBusy(false);onBusyChange(false);} }
  }
  return <div className="space-y-2">
    <Label htmlFor="resume">Resume</Label>
    <Input id="resume" type="file" accept=".pdf,.doc,.docx" disabled={busy || disabled} onChange={(event) => void select(event.target.files?.[0])} />
    {savedName && <p className="flex items-center gap-1.5 break-all text-xs text-muted-foreground"><FileText className="size-3.5 shrink-0" />{savedName}</p>}
    <p className="text-xs text-muted-foreground">PDF or Word · up to 5MB</p>
    {message && <p role="status" className={`flex items-start gap-2 text-sm ${failed ? "text-destructive" : "text-muted-foreground"}`}>{busy && <Loader2 className="mt-0.5 size-4 shrink-0 animate-spin" />}{message}</p>}
  </div>;
}