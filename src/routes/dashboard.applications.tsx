import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Circle, MapPin } from "lucide-react";
import { PageHeader } from "@/components/layout/PortalShell";
import { ApplicationStatusBadge } from "@/components/brand/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { fetchMyApplications } from "@/lib/api";
import { formatDate, formatDateTime } from "@/lib/format";
import {
  APPLICATION_PIPELINE,
  APPLICATION_STATUS,
  type ApplicationStatus,
} from "@/lib/status";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard/applications")({
  component: MyApplications,
});

type AppRow = Awaited<ReturnType<typeof fetchMyApplications>>[number] & {
  jobs?: { title: string; slug: string; city: string | null; state: string | null; job_code: string } | null;
};

function MyApplications() {
  const { user } = useAuth();
  const uid = user!.id;
  const { data, isLoading } = useQuery({
    queryKey: ["my-applications", uid],
    queryFn: () => fetchMyApplications(uid),
  });

  const applications = (data ?? []) as AppRow[];

  return (
    <>
      <PageHeader
        title="My Applications"
        description="Every application and its live status."
        action={
          <Button asChild variant="outline">
            <Link to="/jobs">Find more jobs</Link>
          </Button>
        }
      />

      {isLoading && <p className="text-sm text-muted-foreground">Loading applications…</p>}

      {!isLoading && applications.length === 0 && (
        <div className="rounded-xl border border-dashed border-border p-12 text-center">
          <h2 className="font-display text-lg font-semibold text-foreground">
            You haven't applied yet
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Browse live openings and submit your first application.
          </p>
          <Button asChild className="mt-6">
            <Link to="/jobs">Browse jobs</Link>
          </Button>
        </div>
      )}

      <Accordion type="single" collapsible className="space-y-3">
        {applications.map((app) => (
          <AccordionItem
            key={app.id}
            value={app.id}
            className="rounded-xl border border-border bg-card px-5"
          >
            <AccordionTrigger className="py-4 hover:no-underline">
              <div className="flex w-full flex-wrap items-center justify-between gap-3 pr-3 text-left">
                <div className="min-w-0">
                  <p className="font-display truncate text-base font-semibold text-card-foreground">
                    {app.jobs?.title ?? "Job"}
                  </p>
                  <p className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                    {app.application_code} · applied {formatDate(app.applied_at)}
                    {app.jobs?.city && (
                      <span className="flex items-center gap-1">
                        <MapPin className="size-3" /> {app.jobs.city}
                      </span>
                    )}
                  </p>
                </div>
                <ApplicationStatusBadge status={app.current_status as ApplicationStatus} />
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-6">
              <Timeline applicationId={app.id} current={app.current_status as ApplicationStatus} />
              {app.jobs?.slug && (
                <Button asChild variant="outline" size="sm" className="mt-6">
                  <Link to="/jobs/$slug" params={{ slug: app.jobs.slug }}>
                    View job posting
                  </Link>
                </Button>
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </>
  );
}

function Timeline({ applicationId, current }: { applicationId: string; current: ApplicationStatus }) {
  const { data: history } = useQuery({
    queryKey: ["app-history", applicationId],
    queryFn: async () => {
      const { data } = await supabase
        .from("application_status_history")
        .select("id, new_status, candidate_visible_note, created_at")
        .eq("application_id", applicationId)
        .order("created_at", { ascending: true });
      return data ?? [];
    },
  });

  const { data: interviews } = useQuery({
    queryKey: ["app-interviews", applicationId],
    queryFn: async () => {
      const { data } = await supabase
        .from("interviews")
        .select("*")
        .eq("application_id", applicationId)
        .order("interview_date", { ascending: true });
      return data ?? [];
    },
  });

  const currentIndex = APPLICATION_PIPELINE.indexOf(current);
  const terminal = ["rejected", "withdrawn"].includes(current);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-card-foreground">Progress</h3>
        <ol className="mt-4 space-y-3">
          {APPLICATION_PIPELINE.map((stage, i) => {
            const done = !terminal && currentIndex >= i;
            return (
              <li key={stage} className="flex items-center gap-3 text-sm">
                {done ? (
                  <CheckCircle2 className="size-4 shrink-0 text-gold" />
                ) : (
                  <Circle className="size-4 shrink-0 text-muted-foreground" />
                )}
                <span className={cn(done ? "text-card-foreground" : "text-muted-foreground")}>
                  {APPLICATION_STATUS[stage].label}
                </span>
              </li>
            );
          })}
          {terminal && (
            <li className="text-sm text-destructive">
              Status: {APPLICATION_STATUS[current].label}
            </li>
          )}
        </ol>
      </div>

      {interviews && interviews.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-card-foreground">Interviews</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {interviews.map((iv) => (
              <li key={iv.id} className="rounded-lg border border-border p-3">
                <p className="text-card-foreground">
                  {formatDate(iv.interview_date)} {iv.interview_time ?? ""} · {iv.mode ?? "TBC"}
                </p>
                {iv.location_or_link && <p className="mt-1 break-all">{iv.location_or_link}</p>}
                {iv.interviewer && <p className="mt-1">Interviewer: {iv.interviewer}</p>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {history && history.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-card-foreground">History</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {history.map((h) => (
              <li key={h.id} className="border-l-2 border-border pl-3">
                <p className="text-card-foreground">
                  {APPLICATION_STATUS[h.new_status as ApplicationStatus].label}
                </p>
                {h.candidate_visible_note && (
                  <p className="text-muted-foreground">{h.candidate_visible_note}</p>
                )}
                <p className="text-xs text-muted-foreground">{formatDateTime(h.created_at)}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
