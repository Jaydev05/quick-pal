import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Profile } from "@/lib/api";

export function CandidateProfileFields({profile,application = false}: {profile?: Profile | null; application?: boolean}) {
  return <div className="grid min-w-0 gap-5 sm:grid-cols-2">
    <Field label="Full name *" name="full_name" defaultValue={profile?.full_name ?? ""} maxLength={120} required />
    <Field label={application ? "Phone *" : "Phone"} name="phone" defaultValue={profile?.phone ?? ""} maxLength={20} required={application} />
    <Field label="City" name="city" defaultValue={profile?.city ?? ""} maxLength={80} />
    <Field label="State" name="state" defaultValue={profile?.state ?? ""} maxLength={80} />
    <Field label="Current job title" name="current_job_title" defaultValue={profile?.current_job_title ?? ""} maxLength={120} />
    <Field label="Experience (years)" name="experience_years" defaultValue={profile?.experience_years == null ? "" : String(profile.experience_years)} type="number" min={0} max={60} step={0.1} />
    {!application && <>
      <Field label="Expected salary (₹ / year)" name="expected_salary" defaultValue={profile?.expected_salary == null ? "" : String(profile.expected_salary)} type="number" min={0} />
      <Field label="Preferred location" name="preferred_location" defaultValue={profile?.preferred_location ?? ""} maxLength={120} />
    </>}
    <div className="sm:col-span-2"><Label htmlFor="education">Education</Label><Textarea id="education" name="education" defaultValue={profile?.education ?? ""} maxLength={1000} rows={2} className="mt-2" /></div>
    <div className="sm:col-span-2"><Label htmlFor="skills">Skills (comma separated)</Label><Textarea id="skills" name="skills" defaultValue={(profile?.skills ?? []).join(", ")} rows={3} className="mt-2" /></div>
    <div className="sm:col-span-2"><Label htmlFor="professional_summary">Professional summary</Label><Textarea id="professional_summary" name="professional_summary" defaultValue={profile?.professional_summary ?? ""} maxLength={3000} rows={4} className="mt-2" /></div>
  </div>;
}

function Field({label,name,...props}: React.ComponentProps<typeof Input> & {label:string;name:string}) {
  return <div className="min-w-0"><Label htmlFor={name}>{label}</Label><Input id={name} name={name} className="mt-2" {...props} /></div>;
}