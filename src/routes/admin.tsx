import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Briefcase, Download, Inbox, Users } from "lucide-react";
import { PortalShell, PageHeader } from "@/components/layout/PortalShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ApplicationStatusBadge,
  EnquiryStatusBadge,
  JobStatusBadge,
} from "@/components/brand/StatusBadge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { fetchCategories, randomCode, signedResumeUrl } from "@/lib/api";
import { downloadCsv, formatDate, slugify } from "@/lib/format";
import {
  APPLICATION_STATUS,
  APPLICATION_STATUS_LIST,
  EMPLOYMENT_TYPE,
  EMPLOYMENT_TYPE_LIST,
  ENQUIRY_STATUS_LIST,
  ENQUIRY_STATUS,
  JOB_STATUS,
  JOB_STATUS_LIST,
  type ApplicationStatus,
  type EnquiryStatus,
  type JobStatus,
} from "@/lib/status";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Panel | Jaydev Associates" },
      { name: "description", content: "Manage jobs, applications and enquiries." },
      { property: "og:title", content: "Admin Panel | Jaydev Associates" },
      { property: "og:description", content: "Internal recruitment management console." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const { user, loading, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) void navigate({ to: "/auth", search: { redirect: "/admin" } });
  }, [user, loading, navigate]);

  if (loading || !user) {
    return (
      <div className="surface-dark flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="surface-dark flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-6 text-center">
        <h1 className="font-display text-2xl font-bold text-foreground">Admin sign-in required</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          This area is for the Jaydev Associates administrator account. Sign in with the admin credentials to continue.
        </p>
        <Button
          onClick={async () => {
            await signOut();
            void navigate({ to: "/auth", search: { redirect: "/admin" }, replace: true });
          }}
        >
          Sign in as admin
        </Button>
        <Button variant="outline" onClick={() => void navigate({ to: "/" })}>
          Back to website
        </Button>
      </div>
    );
  }

  return (
    <PortalShell
      items={[
        { to: "/admin", label: "Console", icon: Briefcase },
        { to: "/dashboard", label: "My candidate view", icon: Users },
      ]}
      title="Admin Panel"
    >
      <PageHeader
        title="Recruitment console"
        description="Manage job postings, applications and service enquiries."
      />
      <Tabs defaultValue="jobs">
        <TabsList>
          <TabsTrigger value="jobs">Jobs</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="enquiries">Enquiries</TabsTrigger>
        </TabsList>
        <TabsContent value="jobs" className="pt-6">
          <JobsAdmin />
        </TabsContent>
        <TabsContent value="applications" className="pt-6">
          <ApplicationsAdmin />
        </TabsContent>
        <TabsContent value="enquiries" className="pt-6">
          <EnquiriesAdmin />
        </TabsContent>
      </Tabs>
    </PortalShell>
  );
}

/* ---------------- Jobs ---------------- */

function JobsAdmin() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<string | "new" | null>(null);

  const { data: jobs } = useQuery({
    queryKey: ["admin-jobs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: JobStatus }) => {
      const { error } = await supabase.from("jobs").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Job status updated");
      void queryClient.invalidateQueries({ queryKey: ["admin-jobs"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const current = jobs?.find((j) => j.id === editing);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between gap-3">
        <p className="text-sm text-muted-foreground">{jobs?.length ?? 0} job postings</p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() =>
              downloadCsv(
                "jobs.csv",
                (jobs ?? []).map((j) => ({
                  code: j.job_code,
                  title: j.title,
                  status: j.status,
                  city: j.city ?? "",
                  openings: j.openings,
                  created: j.created_at,
                })),
              )
            }
          >
            <Download /> Export
          </Button>
          <Button onClick={() => setEditing("new")}>Post a job</Button>
        </div>
      </div>

      {(editing === "new" || current) && (
        <JobForm
          job={current ?? null}
          onDone={() => {
            setEditing(null);
            void queryClient.invalidateQueries({ queryKey: ["admin-jobs"] });
          }}
        />
      )}

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-secondary/60 text-left text-xs uppercase">
            <tr>
              <Th>Job</Th>
              <Th>Location</Th>
              <Th>Type</Th>
              <Th>Status</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {(jobs ?? []).map((job) => (
              <tr key={job.id}>
                <Td>
                  <p className="font-medium text-foreground">{job.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {job.job_code} · {formatDate(job.created_at)}
                  </p>
                </Td>
                <Td>{[job.city, job.state].filter(Boolean).join(", ") || "—"}</Td>
                <Td>{EMPLOYMENT_TYPE[job.employment_type]}</Td>
                <Td>
                  <JobStatusBadge status={job.status as JobStatus} publicLabel={false} />
                </Td>
                <Td>
                  <div className="flex items-center gap-2">
                    <Select
                      value={job.status}
                      onValueChange={(v) => updateStatus.mutate({ id: job.id, status: v as JobStatus })}
                    >
                      <SelectTrigger className="h-8 w-36">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {JOB_STATUS_LIST.map((s) => (
                          <SelectItem key={s} value={s}>
                            {JOB_STATUS[s].label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button size="sm" variant="outline" onClick={() => setEditing(job.id)}>
                      Edit
                    </Button>
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


function JobForm({
  job,
  onDone,
}: {
  job: Record<string, unknown> | null;
  onDone: () => void;
}) {
  const j = job as null | {
    id: string;
    title: string;
    description: string;
    city: string | null;
    state: string | null;
    department: string | null;
    employment_type: keyof typeof EMPLOYMENT_TYPE;
    status: JobStatus;
    openings: number;
    min_experience: number;
    max_experience: number | null;
    salary_min: number | null;
    salary_max: number | null;
    skills: string[];
    qualifications: string | null;
    responsibilities: string | null;
  };
  const [type, setType] = useState<string>(j?.employment_type ?? "full_time");
  const [status, setStatus] = useState<string>(j?.status ?? "published");
  const [isPublic, setIsPublic] = useState<boolean>(
    (j as { is_public?: boolean } | null)?.is_public ?? true,
  );
  const qc = useQueryClient();
  const { data: categories } = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });
  const [categoryId, setCategoryId] = useState<string>(
    (j as { category_id?: string | null } | null)?.category_id ?? "none",
  );
  const [newCategory, setNewCategory] = useState("");

  const resolveCategoryId = async () => {
    if (categoryId === "none") return null;
    if (categoryId !== "__other") return categoryId;
    const name = newCategory.trim();
    if (!name) throw new Error("Enter the new category name");
    const slug = slugify(name);
    const existing = (categories ?? []).find(
      (c) => c.slug === slug || c.name.toLowerCase() === name.toLowerCase(),
    );
    if (existing) return existing.id;
    const { data, error } = await supabase
      .from("categories")
      .insert({ name, slug, active: true })
      .select("id")
      .single();
    if (error) throw error;
    return data.id;
  };

  const save = useMutation({
    mutationFn: async (form: HTMLFormElement) => {
      const fd = new FormData(form);
      const title = String(fd.get("title") ?? "").trim();
      if (title.length < 3) throw new Error("Enter a job title");
      const category_id = await resolveCategoryId();
      const payload = {
        category_id,
        title,
        description: String(fd.get("description") ?? "").trim(),
        responsibilities: String(fd.get("responsibilities") ?? "").trim() || null,
        qualifications: String(fd.get("qualifications") ?? "").trim() || null,
        department: String(fd.get("department") ?? "").trim() || null,
        city: String(fd.get("city") ?? "").trim() || null,
        state: String(fd.get("state") ?? "").trim() || null,
        employment_type: type as never,
        status: status as never,
        is_public: isPublic && status !== "draft",

        openings: Number(fd.get("openings") ?? 1),
        min_experience: Number(fd.get("min_experience") ?? 0),
        max_experience: fd.get("max_experience") ? Number(fd.get("max_experience")) : null,
        salary_min: fd.get("salary_min") ? Number(fd.get("salary_min")) : null,
        salary_max: fd.get("salary_max") ? Number(fd.get("salary_max")) : null,
        skills: String(fd.get("skills") ?? "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      };

      if (j) {
        const { error } = await supabase.from("jobs").update(payload).eq("id", j.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("jobs").insert({
          ...payload,
          job_code: randomCode("JA-JOB"),
          slug: `${slugify(title)}-${Math.random().toString(36).slice(2, 6)}`,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(j ? "Job updated" : "Job posted");
      qc.invalidateQueries({ queryKey: ["categories"] });
      onDone();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <form
      className="rounded-xl border border-border bg-card p-6"
      onSubmit={(e) => {
        e.preventDefault();
        save.mutate(e.currentTarget);
      }}
    >
      <h2 className="font-display text-lg font-semibold text-card-foreground">
        {j ? "Edit job" : "Post a new job"}
      </h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <AF label="Job title *" name="title" defaultValue={j?.title} />
        <AF label="Department" name="department" defaultValue={j?.department ?? ""} />
        <div className="sm:col-span-2">
          <Label>Category</Label>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No category</SelectItem>
              {(categories ?? []).map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
              <SelectItem value="__other">Other (type manually)</SelectItem>
            </SelectContent>
          </Select>
          {categoryId === "__other" && (
            <Input
              className="mt-2"
              placeholder="New category name, e.g. Information Technology"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
            />
          )}
        </div>
        <AF label="City" name="city" defaultValue={j?.city ?? ""} />
        <AF label="State" name="state" defaultValue={j?.state ?? ""} />
        <div>
          <Label>Employment type</Label>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {EMPLOYMENT_TYPE_LIST.map((t) => (
                <SelectItem key={t} value={t}>
                  {EMPLOYMENT_TYPE[t]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Status</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {JOB_STATUS_LIST.map((s) => (
                <SelectItem key={s} value={s}>
                  {JOB_STATUS[s].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="sm:col-span-2 flex items-center gap-3 rounded-lg border border-border p-3">
          <input
            id="is_public"
            type="checkbox"
            className="size-4 accent-current"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
          />
          <Label htmlFor="is_public" className="cursor-pointer">
            Show this job publicly on the website
            <span className="ml-2 text-xs text-muted-foreground">
              (drafts are never shown publicly)
            </span>
          </Label>
        </div>

        <AF label="Openings" name="openings" type="number" defaultValue={String(j?.openings ?? 1)} />
        <AF
          label="Min experience (years)"
          name="min_experience"
          type="number"
          defaultValue={String(j?.min_experience ?? 0)}
        />
        <AF
          label="Max experience (years)"
          name="max_experience"
          type="number"
          defaultValue={j?.max_experience != null ? String(j.max_experience) : ""}
        />
        <AF
          label="Salary min (₹)"
          name="salary_min"
          type="number"
          defaultValue={j?.salary_min != null ? String(j.salary_min) : ""}
        />
        <AF
          label="Salary max (₹)"
          name="salary_max"
          type="number"
          defaultValue={j?.salary_max != null ? String(j.salary_max) : ""}
        />
        <AF label="Skills (comma separated)" name="skills" defaultValue={(j?.skills ?? []).join(", ")} />
        <div className="sm:col-span-2">
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            name="description"
            rows={5}
            className="mt-2"
            defaultValue={j?.description ?? ""}
          />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="responsibilities">Responsibilities</Label>
          <Textarea
            id="responsibilities"
            name="responsibilities"
            rows={4}
            className="mt-2"
            defaultValue={j?.responsibilities ?? ""}
          />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="qualifications">Qualifications</Label>
          <Textarea
            id="qualifications"
            name="qualifications"
            rows={3}
            className="mt-2"
            defaultValue={j?.qualifications ?? ""}
          />
        </div>
      </div>
      <div className="mt-6 flex gap-2">
        <Button type="submit" disabled={save.isPending}>
          {save.isPending ? "Saving…" : j ? "Save changes" : "Publish job"}
        </Button>
        <Button type="button" variant="ghost" onClick={onDone}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

/* ---------------- Applications ---------------- */

function ApplicationsAdmin() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<string>("all");

  const { data, error, isLoading } = useQuery({
    queryKey: ["admin-applications"],
    queryFn: async () => {
      const { data: applications, error } = await supabase
        .from("applications")
        .select("*, jobs(title, job_code)")
        .order("applied_at", { ascending: false });
      if (error) throw error;
      const candidateIds = [...new Set((applications ?? []).map((application) => application.candidate_id))];
      if (candidateIds.length === 0) return [];
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, phone, email")
        .in("id", candidateIds);
      if (profilesError) throw profilesError;
      const profilesById = new Map((profiles ?? []).map((profile) => [profile.id, profile]));
      return (applications ?? []).map((application) => ({
        ...application,
        profiles: profilesById.get(application.candidate_id) ?? null,
      }));
    },
    refetchInterval: 10000,
  });

  const setStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ApplicationStatus }) => {
      const { error } = await supabase
        .from("applications")
        .update({ current_status: status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Application updated");
      void queryClient.invalidateQueries({ queryKey: ["admin-applications"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const rows = (data ?? []).filter((a) => filter === "all" || a.current_status === filter);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {APPLICATION_STATUS_LIST.map((s) => (
              <SelectItem key={s} value={s}>
                {APPLICATION_STATUS[s].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          onClick={() =>
            downloadCsv(
              "applications.csv",
              rows.map((a) => {
                const r = a as unknown as {
                  application_code: string;
                  current_status: string;
                  applied_at: string;
                  jobs?: { title?: string };
                  profiles?: { full_name?: string; phone?: string; email?: string };
                };
                return {
                  code: r.application_code,
                  candidate: r.profiles?.full_name ?? "",
                  phone: r.profiles?.phone ?? "",
                  email: r.profiles?.email ?? "",
                  job: r.jobs?.title ?? "",
                  status: r.current_status,
                  applied: r.applied_at,
                };
              }),
            )
          }
        >
          <Download /> Export
        </Button>
      </div>

      {isLoading && (
        <p className="rounded-xl border border-border p-4 text-sm text-muted-foreground">
          Loading applications…
        </p>
      )}

      {error && (
        <p className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          Could not load applications: {error.message}
        </p>
      )}

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[800px] text-sm">
          <thead className="bg-secondary/60 text-left text-xs uppercase">
            <tr>
              <Th>Candidate</Th>
              <Th>Job</Th>
              <Th>Applied</Th>
              <Th>Status</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((a) => {
              const r = a as unknown as {
                id: string;
                application_code: string;
                applied_at: string;
                current_status: ApplicationStatus;
                resume_path: string | null;
                jobs?: { title?: string; job_code?: string };
                profiles?: { full_name?: string; phone?: string; email?: string };
              };
              return (
                <tr key={r.id}>
                  <Td>
                    <p className="font-medium text-foreground">{r.profiles?.full_name ?? "—"}</p>
                    <p className="text-xs text-muted-foreground">
                      {r.profiles?.phone} · {r.profiles?.email}
                    </p>
                  </Td>
                  <Td>
                    <p>{r.jobs?.title ?? "—"}</p>
                    <p className="text-xs text-muted-foreground">{r.application_code}</p>
                  </Td>
                  <Td>{formatDate(r.applied_at)}</Td>
                  <Td>
                    <ApplicationStatusBadge status={r.current_status} />
                  </Td>
                  <Td>
                    <div className="flex items-center gap-2">
                      <Select
                        value={r.current_status}
                        onValueChange={(v) =>
                          setStatus.mutate({ id: r.id, status: v as ApplicationStatus })
                        }
                      >
                        <SelectTrigger className="h-8 w-44">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {APPLICATION_STATUS_LIST.map((s) => (
                            <SelectItem key={s} value={s}>
                              {APPLICATION_STATUS[s].label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {r.resume_path && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={async () => {
                            const url = await signedResumeUrl(r.resume_path);
                            if (url) window.open(url, "_blank", "noopener");
                            else toast.error("Resume unavailable");
                          }}
                        >
                          Resume
                        </Button>
                      )}
                    </div>
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {rows.length === 0 && (
          <p className="p-8 text-center text-sm text-muted-foreground">No applications yet.</p>
        )}
      </div>
    </div>
  );
}

/* ---------------- Enquiries ---------------- */

function EnquiriesAdmin() {
  const queryClient = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin-enquiries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_enquiries")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const setStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: EnquiryStatus }) => {
      const { error } = await supabase.from("service_enquiries").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Enquiry updated");
      void queryClient.invalidateQueries({ queryKey: ["admin-enquiries"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-4">
      {(data ?? []).length === 0 && (
        <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          <Inbox className="mx-auto size-5 text-gold" />
          <p className="mt-2">No service enquiries yet.</p>
        </div>
      )}
      {(data ?? []).map((e) => (
        <article key={e.id} className="rounded-xl border border-border bg-card p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-display font-semibold text-card-foreground">
                {e.name} · {e.service}
              </p>
              <p className="text-xs text-muted-foreground">
                {e.enquiry_code} · {formatDate(e.created_at)} · {e.phone} · {e.email}
                {e.company ? ` · ${e.company}` : ""}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <EnquiryStatusBadge status={e.status as EnquiryStatus} />
              <Select
                value={e.status}
                onValueChange={(v) => setStatus.mutate({ id: e.id, status: v as EnquiryStatus })}
              >
                <SelectTrigger className="h-8 w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ENQUIRY_STATUS_LIST.map((s) => (
                    <SelectItem key={s} value={s}>
                      {ENQUIRY_STATUS[s].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <p className="mt-3 text-sm whitespace-pre-line text-muted-foreground">{e.message}</p>
        </article>
      ))}
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-3 font-semibold text-muted-foreground">{children}</th>;
}
function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-4 py-3 align-top text-muted-foreground">{children}</td>;
}
function AF({
  label,
  name,
  type = "text",
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
}) {
  return (
    <div>
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} type={type} className="mt-2" defaultValue={defaultValue} />
    </div>
  );
}
