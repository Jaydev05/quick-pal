import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Bell, Bookmark, FileText, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/layout/PortalShell";
import { ApplicationStatusBadge } from "@/components/brand/StatusBadge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { fetchMyApplications, fetchMyProfile, fetchNotifications, fetchSavedJobs } from "@/lib/api";
import { formatDate, relativeDate } from "@/lib/format";
import type { ApplicationStatus } from "@/lib/status";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardOverview,
});

function DashboardOverview() {
  const { user } = useAuth();
  const uid = user!.id;

  const { data: profile } = useQuery({ queryKey: ["profile", uid], queryFn: () => fetchMyProfile(uid) });
  const { data: applications } = useQuery({
    queryKey: ["my-applications", uid],
    queryFn: () => fetchMyApplications(uid),
  });
  const { data: saved } = useQuery({ queryKey: ["saved-jobs", uid], queryFn: () => fetchSavedJobs(uid) });
  const { data: notifications } = useQuery({
    queryKey: ["notifications", uid],
    queryFn: () => fetchNotifications(uid),
  });

  const active = (applications ?? []).filter(
    (a) => !["rejected", "withdrawn"].includes(a.current_status),
  ).length;

  const completeness = (() => {
    if (!profile) return 0;
    const fields = [
      profile.full_name,
      profile.phone,
      profile.city,
      profile.education,
      profile.current_job_title,
      profile.resume_path,
      profile.skills?.length ? "y" : "",
    ];
    return Math.round((fields.filter(Boolean).length / fields.length) * 100);
  })();

  return (
    <>
      <PageHeader
        title={`Welcome${profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}`}
        description="Track your applications and keep your profile up to date."
        action={
          <Button asChild>
            <Link to="/jobs">
              Browse jobs <ArrowRight />
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={FileText} label="Applications" value={applications?.length ?? 0} />
        <Stat icon={TrendingUp} label="In progress" value={active} />
        <Stat icon={Bookmark} label="Saved jobs" value={saved?.length ?? 0} />
        <Stat icon={Bell} label="Notifications" value={notifications?.filter((n) => !n.read).length ?? 0} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-card-foreground">
              Recent applications
            </h2>
            <Button asChild variant="link" size="sm">
              <Link to="/dashboard/applications">View all</Link>
            </Button>
          </div>
          <ul className="mt-4 divide-y divide-border">
            {(applications ?? []).slice(0, 5).map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <Link
                    to="/dashboard/applications"
                    className="truncate text-sm font-medium text-card-foreground hover:text-gold"
                  >
                    {(a as { jobs?: { title?: string } }).jobs?.title ?? "Job"}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {a.application_code} · {formatDate(a.applied_at)}
                  </p>
                </div>
                <ApplicationStatusBadge status={a.current_status as ApplicationStatus} />
              </li>
            ))}
            {applications?.length === 0 && (
              <li className="py-6 text-sm text-muted-foreground">
                No applications yet.{" "}
                <Link to="/jobs" className="text-gold">
                  Find your next role
                </Link>
                .
              </li>
            )}
          </ul>
        </section>

        <div className="space-y-6">
          <section className="rounded-xl border border-border bg-card p-5">
            <h2 className="font-display text-lg font-semibold text-card-foreground">
              Profile strength
            </h2>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-secondary">
              <div className="h-full bg-gradient-gold" style={{ width: `${completeness}%` }} />
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{completeness}% complete</p>
            <Button asChild variant="outline" size="sm" className="mt-4">
              <Link to="/dashboard/profile">Update profile</Link>
            </Button>
          </section>

          <section className="rounded-xl border border-border bg-card p-5">
            <h2 className="font-display text-lg font-semibold text-card-foreground">Updates</h2>
            <ul className="mt-4 space-y-3">
              {(notifications ?? []).slice(0, 5).map((n) => (
                <li key={n.id} className="text-sm">
                  <p className="font-medium text-card-foreground">{n.title}</p>
                  {n.body && <p className="text-muted-foreground">{n.body}</p>}
                  <p className="mt-0.5 text-xs text-muted-foreground">{relativeDate(n.created_at)}</p>
                </li>
              ))}
              {notifications?.length === 0 && (
                <li className="text-sm text-muted-foreground">No updates yet.</li>
              )}
            </ul>
          </section>
        </div>
      </div>
    </>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <Icon className="size-5 text-gold" />
      <p className="font-display mt-3 text-2xl font-bold text-card-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
