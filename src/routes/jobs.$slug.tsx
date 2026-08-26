import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Banknote,
  BookmarkPlus,
  BookmarkCheck,
  Briefcase,
  CalendarClock,
  GraduationCap,
  MapPin,
  Share2,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { PublicShell } from "@/components/layout/PublicShell";
import { Section } from "@/components/home/Section";
import { JobCard } from "@/components/jobs/JobCard";
import { JobStatusBadge } from "@/components/brand/StatusBadge";
import { Button } from "@/components/ui/button";
import { ApplyDialog } from "@/components/jobs/ApplyDialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  fetchJobBySlug,
  fetchSimilarJobs,
  jobIsOpen,
  signedPosterUrl,
  type JobWithCategory,
} from "@/lib/api";
import { EMPLOYMENT_TYPE, type JobStatus } from "@/lib/status";
import { formatDate, formatExperience, formatSalary, jobLocation } from "@/lib/format";
import { COMPANY, whatsappLink } from "@/lib/site";

export const Route = createFileRoute("/jobs/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `Job Opening | Jaydev Associates` },
      {
        name: "description",
        content: `Details and online application for the ${params.slug.replace(/-/g, " ")} opening at Jaydev Associates.`,
      },
      { property: "og:title", content: "Job Opening | Jaydev Associates" },
      {
        property: "og:description",
        content: "View the role details and apply online with Jaydev Associates.",
      },
    ],
  }),
  component: JobDetailPage,
});

function JobDetailPage() {
  const { slug } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [applyOpen, setApplyOpen] = useState(false);

  const { data: job, isLoading } = useQuery({
    queryKey: ["job", slug],
    queryFn: () => fetchJobBySlug(slug),
  });

  const { data: poster } = useQuery({
    queryKey: ["job-poster", job?.poster_path],
    queryFn: () => signedPosterUrl(job?.poster_path),
    enabled: Boolean(job?.poster_path),
  });

  const { data: similar } = useQuery({
    queryKey: ["similar-jobs", job?.id],
    queryFn: () => fetchSimilarJobs(job as JobWithCategory),
    enabled: Boolean(job),
  });

  const { data: existingApplication } = useQuery({
    queryKey: ["my-application", job?.id, user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("applications")
        .select("id, application_code, current_status")
        .eq("job_id", job!.id)
        .eq("candidate_id", user!.id)
        .maybeSingle();
      return data;
    },
    enabled: Boolean(job && user),
  });

  const { data: saved } = useQuery({
    queryKey: ["saved-job", job?.id, user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("saved_jobs")
        .select("id")
        .eq("job_id", job!.id)
        .eq("candidate_id", user!.id)
        .maybeSingle();
      return data;
    },
    enabled: Boolean(job && user),
  });

  const toggleSave = useMutation({
    mutationFn: async () => {
      if (!user || !job) throw new Error("Sign in to save jobs");
      if (saved) {
        const { error } = await supabase.from("saved_jobs").delete().eq("id", saved.id);
        if (error) throw error;
        return "removed";
      }
      const { error } = await supabase
        .from("saved_jobs")
        .insert({ job_id: job.id, candidate_id: user.id });
      if (error) throw error;
      return "saved";
    },
    onSuccess: (result) => {
      toast.success(result === "saved" ? "Job saved" : "Removed from saved jobs");
      void queryClient.invalidateQueries({ queryKey: ["saved-job", job?.id, user?.id] });
      void queryClient.invalidateQueries({ queryKey: ["saved-jobs"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  useEffect(() => {
    if (!isLoading && !job) toast.error("This job is no longer available");
  }, [isLoading, job]);

  if (isLoading) {
    return (
      <PublicShell>
        <Section>
          <div className="h-96 animate-pulse rounded-xl bg-muted" />
        </Section>
      </PublicShell>
    );
  }

  if (!job) {
    return (
      <PublicShell>
        <Section className="text-center">
          <h1 className="font-display text-2xl font-bold text-foreground">Job not found</h1>
          <p className="mt-3 text-muted-foreground">
            This opening may have been closed or removed.
          </p>
          <Button asChild className="mt-6">
            <Link to="/jobs">Browse all jobs</Link>
          </Button>
        </Section>
      </PublicShell>
    );
  }

  const open = jobIsOpen(job);

  function handleApply() {
    if (!user) {
      void navigate({ to: "/login", search: { redirect: `/jobs/${slug}` } });
      return;
    }
    setApplyOpen(true);
  }

  async function share() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: job!.title, url });
        return;
      } catch {
        /* cancelled */
      }
    }
    await navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard");
  }

  return (
    <PublicShell>
      <Section dark className="py-10 md:py-14">
        <Button asChild variant="ghost" size="sm" className="-ml-3">
          <Link to="/jobs">
            <ArrowLeft /> All jobs
          </Link>
        </Button>
        <div className="mt-5 flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-2xl">
            <p className="eyebrow">
              {job.categories?.name ?? job.department ?? "Opening"} · {job.job_code}
            </p>
            <h1 className="font-display mt-3 text-3xl font-bold text-foreground md:text-4xl">
              {job.title}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <MapPin className="size-4 text-gold" /> {jobLocation(job)}
              </span>
              <span className="flex items-center gap-1.5">
                <Briefcase className="size-4 text-gold" /> {EMPLOYMENT_TYPE[job.employment_type]}
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="size-4 text-gold" />{" "}
                {job.openings} {job.openings === 1 ? "opening" : "openings"}
              </span>
              <JobStatusBadge status={job.status as JobStatus} />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="lg" onClick={handleApply} disabled={!open || Boolean(existingApplication)}>
              {existingApplication
                ? `Applied · ${existingApplication.application_code}`
                : open
                  ? "Apply Now"
                  : "Applications Closed"}
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() =>
                user
                  ? toggleSave.mutate()
                  : void navigate({ to: "/login", search: { redirect: `/jobs/${slug}` } })
              }
            >
              {saved ? <BookmarkCheck /> : <BookmarkPlus />} {saved ? "Saved" : "Save"}
            </Button>
            <Button variant="ghost" size="lg" onClick={() => void share()}>
              <Share2 /> Share
            </Button>
          </div>
        </div>
      </Section>

      <Section className="pt-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <div className="space-y-8">
            {poster && (
              <img
                src={poster}
                alt={`${job.title} poster`}
                className="w-full rounded-xl border border-border"
              />
            )}
            <Block title="Job description" body={job.description} />
            {job.responsibilities && (
              <Block title="Key responsibilities" body={job.responsibilities} />
            )}
            {job.qualifications && <Block title="Qualifications" body={job.qualifications} />}
            {job.benefits && <Block title="Benefits" body={job.benefits} />}
            {job.additional_info && <Block title="Additional information" body={job.additional_info} />}
            {job.skills?.length > 0 && (
              <div>
                <h2 className="font-display text-xl font-semibold text-foreground">
                  Skills required
                </h2>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {job.skills.map((s) => (
                    <li
                      key={s}
                      className="rounded-full bg-secondary px-3 py-1.5 text-sm text-secondary-foreground"
                    >
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <aside className="h-fit space-y-4 lg:sticky lg:top-24">
            <div className="rounded-xl border border-border bg-card p-5">
              <h2 className="font-display text-sm font-semibold text-card-foreground">
                Job summary
              </h2>
              <dl className="mt-4 space-y-3 text-sm">
                <Row
                  icon={<Banknote className="size-4 text-gold" />}
                  label="Salary"
                  value={formatSalary(job.salary_min, job.salary_max, job.salary_visible)}
                />
                <Row
                  icon={<Users className="size-4 text-gold" />}
                  label="Experience"
                  value={formatExperience(job.min_experience, job.max_experience)}
                />
                {job.education && (
                  <Row
                    icon={<GraduationCap className="size-4 text-gold" />}
                    label="Education"
                    value={job.education}
                  />
                )}
                <Row
                  icon={<CalendarClock className="size-4 text-gold" />}
                  label="Apply before"
                  value={job.deadline ? formatDate(job.deadline) : "Open until filled"}
                />
                <Row
                  icon={<Briefcase className="size-4 text-gold" />}
                  label="Department"
                  value={job.department ?? "—"}
                />
              </dl>
              <Button
                className="mt-5 w-full"
                onClick={handleApply}
                disabled={!open || Boolean(existingApplication)}
              >
                {existingApplication ? "Application submitted" : open ? "Apply Now" : "Closed"}
              </Button>
              <Button asChild variant="outline" className="mt-2 w-full">
                <a
                  href={whatsappLink(`Hello, I'm interested in ${job.title} (${job.job_code}).`)}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  Enquire on WhatsApp
                </a>
              </Button>
            </div>
            <div className="rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">
              <p className="font-semibold text-card-foreground">Need help?</p>
              <p className="mt-2">
                Call{" "}
                <a href={COMPANY.phoneHref} className="text-gold">
                  {COMPANY.phone}
                </a>{" "}
                or email{" "}
                <a href={COMPANY.emailHref} className="break-all text-gold">
                  {COMPANY.email}
                </a>
                .
              </p>
            </div>
          </aside>
        </div>
      </Section>

      {similar && similar.length > 0 && (
        <Section dark className="py-14">
          <h2 className="font-display text-2xl font-bold text-foreground">Similar openings</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {similar.map((s) => (
              <JobCard key={s.id} job={s} />
            ))}
          </div>
        </Section>
      )}

      <ApplyDialog job={job} open={applyOpen} onOpenChange={setApplyOpen} />
    </PublicShell>
  );
}

function Block({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <h2 className="font-display text-xl font-semibold text-foreground">{title}</h2>
      <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
        {body}
      </p>
    </div>
  );
}

function Row({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="flex items-center gap-2 text-muted-foreground">
        {icon} {label}
      </dt>
      <dd className="text-right font-medium text-card-foreground">{value}</dd>
    </div>
  );
}
