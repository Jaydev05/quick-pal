import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/PortalShell";
import { JobCard } from "@/components/jobs/JobCard";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { fetchSavedJobs, type JobWithCategory } from "@/lib/api";

export const Route = createFileRoute("/dashboard/saved")({
  component: SavedJobsPage,
});

function SavedJobsPage() {
  const { user } = useAuth();
  const uid = user!.id;
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["saved-jobs", uid],
    queryFn: () => fetchSavedJobs(uid),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("saved_jobs").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Removed from saved jobs");
      void queryClient.invalidateQueries({ queryKey: ["saved-jobs", uid] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <>
      <PageHeader title="Saved Jobs" description="Roles you bookmarked for later." />

      {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}

      {!isLoading && (data ?? []).length === 0 && (
        <div className="rounded-xl border border-dashed border-border p-12 text-center">
          <h2 className="font-display text-lg font-semibold text-foreground">No saved jobs</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Tap Save on any job to keep it here.
          </p>
          <Button asChild className="mt-6">
            <Link to="/jobs">Browse jobs</Link>
          </Button>
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {(data ?? []).map((row) => {
          const job = row.jobs as unknown as JobWithCategory | null;
          if (!job) return null;
          return (
            <div key={row.id} className="relative">
              <JobCard job={job} />
              <Button
                variant="ghost"
                size="icon"
                aria-label="Remove saved job"
                className="absolute top-3 right-3"
                onClick={() => remove.mutate(row.id)}
              >
                <Trash2 />
              </Button>
            </div>
          );
        })}
      </div>
    </>
  );
}
