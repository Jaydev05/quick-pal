import { Link } from "@tanstack/react-router";
import { Banknote, Briefcase, Clock, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JobStatusBadge } from "@/components/brand/StatusBadge";
import { EMPLOYMENT_TYPE, type JobStatus } from "@/lib/status";
import { formatExperience, formatSalary, jobLocation, relativeDate } from "@/lib/format";
import type { JobWithCategory } from "@/lib/api";
import { cn } from "@/lib/utils";

export function JobCard({ job, className }: { job: JobWithCategory; className?: string }) {
  return (
    <article
      className={cn(
        "group flex h-full flex-col rounded-xl border border-border bg-card p-5 shadow-card transition-all hover:-translate-y-0.5 hover:border-gold/50",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {job.categories?.name ?? job.department ?? "Open Role"} · {job.job_code}
          </p>
          <h3 className="font-display mt-1 truncate text-lg font-semibold text-card-foreground">
            <Link to="/jobs/$slug" params={{ slug: job.slug }} className="hover:text-gold">
              {job.title}
            </Link>
          </h3>
        </div>
        <JobStatusBadge status={job.status as JobStatus} />
      </div>

      <dl className="mt-4 grid grid-cols-1 gap-2 text-sm text-muted-foreground sm:grid-cols-2">
        <div className="flex items-center gap-2">
          <MapPin className="size-4 shrink-0 text-gold" />
          <span className="truncate">{jobLocation(job)}</span>
        </div>
        <div className="flex items-center gap-2">
          <Briefcase className="size-4 shrink-0 text-gold" />
          <span>{EMPLOYMENT_TYPE[job.employment_type]}</span>
        </div>
        <div className="flex items-center gap-2">
          <Banknote className="size-4 shrink-0 text-gold" />
          <span className="truncate">
            {formatSalary(job.salary_min, job.salary_max, job.salary_visible)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="size-4 shrink-0 text-gold" />
          <span>{formatExperience(job.min_experience, job.max_experience)}</span>
        </div>
      </dl>

      {job.skills?.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-1.5">
          {job.skills.slice(0, 4).map((s) => (
            <li
              key={s}
              className="rounded-full bg-secondary px-2.5 py-1 text-xs text-secondary-foreground"
            >
              {s}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-5 flex items-center justify-between gap-3 border-t border-border pt-4">
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="size-3.5" /> {relativeDate(job.created_at)}
        </span>
        <Button asChild size="sm">
          <Link to="/jobs/$slug" params={{ slug: job.slug }}>
            View & Apply
          </Link>
        </Button>
      </div>
    </article>
  );
}

export function JobCardSkeleton() {
  return (
    <div className="h-64 animate-pulse rounded-xl border border-border bg-card p-5">
      <div className="h-4 w-24 rounded bg-muted" />
      <div className="mt-3 h-6 w-3/4 rounded bg-muted" />
      <div className="mt-6 space-y-3">
        <div className="h-4 w-full rounded bg-muted" />
        <div className="h-4 w-2/3 rounded bg-muted" />
        <div className="h-4 w-1/2 rounded bg-muted" />
      </div>
    </div>
  );
}
