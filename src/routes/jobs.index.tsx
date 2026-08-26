import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { PublicShell } from "@/components/layout/PublicShell";
import { Section, SectionHeading } from "@/components/home/Section";
import { JobCard, JobCardSkeleton } from "@/components/jobs/JobCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchCategories, fetchPublicJobs } from "@/lib/api";
import { EMPLOYMENT_TYPE, EMPLOYMENT_TYPE_LIST } from "@/lib/status";

type JobSearch = {
  q?: string;
  location?: string;
  category?: string;
  type?: string;
  experience?: string;
  sort?: "recent" | "salary" | "title";
  page?: number;
};

export const Route = createFileRoute("/jobs/")({
  validateSearch: (search: Record<string, unknown>): JobSearch => ({
    q: typeof search["q"] === "string" ? search["q"] : undefined,
    location: typeof search["location"] === "string" ? search["location"] : undefined,
    category: typeof search["category"] === "string" ? search["category"] : undefined,
    type: typeof search["type"] === "string" ? search["type"] : undefined,
    experience: typeof search["experience"] === "string" ? search["experience"] : undefined,
    sort:
      search["sort"] === "salary" || search["sort"] === "title"
        ? search["sort"]
        : search["sort"] === "recent"
          ? "recent"
          : undefined,
    page: Number(search["page"]) > 1 ? Number(search["page"]) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Current Job Openings | Jaydev Associates" },
      {
        name: "description",
        content:
          "Browse live job openings from Jaydev Associates across IT, healthcare, manufacturing, security and facility roles. Apply online and track your application.",
      },
      { property: "og:title", content: "Current Job Openings | Jaydev Associates" },
      {
        property: "og:description",
        content: "Search and apply for live vacancies with Jaydev Associates.",
      },
    ],
  }),
  component: JobsPage,
});

const EXPERIENCE_OPTIONS = [
  { value: "all", label: "Any experience" },
  { value: "0-1", label: "0 – 1 years" },
  { value: "1-3", label: "1 – 3 years" },
  { value: "3-5", label: "3 – 5 years" },
  { value: "5-10", label: "5 – 10 years" },
  { value: "10-plus", label: "10+ years" },
];

const PER_PAGE = 9;

function JobsPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });

  const { data: categories } = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["jobs", search],
    queryFn: () =>
      fetchPublicJobs({
        q: search.q,
        location: search.location,
        category: search.category,
        type: search.type as never,
        experience: search.experience,
        sort: search.sort ?? "recent",
        page: search.page ?? 1,
        perPage: PER_PAGE,
      }),
    placeholderData: keepPreviousData,
  });

  function setParam(patch: Partial<JobSearch>) {
    void navigate({
      search: (prev) => {
        const next = { ...prev, ...patch, page: patch.page ?? undefined } as JobSearch;
        for (const key of Object.keys(next) as (keyof JobSearch)[]) {
          const v = next[key];
          if (v === "" || v === "all" || v === undefined) delete next[key];
        }
        return next;
      },
    });
  }

  const total = data?.count ?? 0;
  const page = search.page ?? 1;
  const pages = Math.max(1, Math.ceil(total / PER_PAGE));
  const hasFilters = Boolean(
    search.q || search.location || search.category || search.type || search.experience,
  );

  return (
    <PublicShell>
      <Section dark className="py-14 md:py-16">
        <SectionHeading
          align="left"
          eyebrow="Recruitment"
          title="Current job openings"
          description="Live vacancies from our client network. Create a free candidate account to apply and track progress."
        />

        <form
          className="mt-10 grid gap-3 rounded-xl border border-border bg-card p-4 md:grid-cols-[1.4fr_1fr_auto]"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            setParam({
              q: String(fd.get("q") ?? ""),
              location: String(fd.get("location") ?? ""),
            });
          }}
        >
          <div>
            <Label htmlFor="q" className="sr-only">
              Search jobs
            </Label>
            <Input
              id="q"
              name="q"
              defaultValue={search.q ?? ""}
              placeholder="Job title, skill or job code"
              maxLength={100}
            />
          </div>
          <div>
            <Label htmlFor="location" className="sr-only">
              Location
            </Label>
            <Input
              id="location"
              name="location"
              defaultValue={search.location ?? ""}
              placeholder="City or state"
              maxLength={80}
            />
          </div>
          <Button type="submit">
            <Search /> Search
          </Button>
        </form>
      </Section>

      <Section className="pt-10">
        <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
          <aside className="h-fit rounded-xl border border-border bg-card p-5 lg:sticky lg:top-24">
            <h2 className="font-display flex items-center gap-2 text-sm font-semibold text-card-foreground">
              <SlidersHorizontal className="size-4 text-gold" /> Filters
            </h2>
            <div className="mt-5 space-y-5">
              <FilterSelect
                label="Category"
                value={search.category ?? "all"}
                onChange={(v) => setParam({ category: v })}
                options={[
                  { value: "all", label: "All categories" },
                  ...(categories ?? []).map((c) => ({ value: c.id, label: c.name })),
                ]}
              />
              <FilterSelect
                label="Employment type"
                value={search.type ?? "all"}
                onChange={(v) => setParam({ type: v })}
                options={[
                  { value: "all", label: "All types" },
                  ...EMPLOYMENT_TYPE_LIST.map((t) => ({ value: t, label: EMPLOYMENT_TYPE[t] })),
                ]}
              />
              <FilterSelect
                label="Experience"
                value={search.experience ?? "all"}
                onChange={(v) => setParam({ experience: v })}
                options={EXPERIENCE_OPTIONS}
              />
              <FilterSelect
                label="Sort by"
                value={search.sort ?? "recent"}
                onChange={(v) => setParam({ sort: v as JobSearch["sort"] })}
                options={[
                  { value: "recent", label: "Most recent" },
                  { value: "salary", label: "Highest salary" },
                  { value: "title", label: "Title A–Z" },
                ]}
              />
              {hasFilters && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => void navigate({ search: {} })}
                >
                  <X /> Clear filters
                </Button>
              )}
            </div>
          </aside>

          <div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {isLoading ? "Loading roles…" : `${total} ${total === 1 ? "job" : "jobs"} found`}
              </p>
              {isFetching && !isLoading && (
                <span className="text-xs text-muted-foreground">Updating…</span>
              )}
            </div>

            <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {isLoading && Array.from({ length: 6 }).map((_, i) => <JobCardSkeleton key={i} />)}
              {data?.jobs.map((job) => <JobCard key={job.id} job={job} />)}
            </div>

            {!isLoading && total === 0 && (
              <div className="mt-10 rounded-xl border border-dashed border-border p-12 text-center">
                <h3 className="font-display text-lg font-semibold text-foreground">
                  No jobs match your search
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Try broadening the filters, or check back soon — new roles are added regularly.
                </p>
                <Button className="mt-6" onClick={() => void navigate({ search: {} })}>
                  Reset search
                </Button>
              </div>
            )}

            {pages > 1 && (
              <nav className="mt-10 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setParam({ page: page - 1 })}
                >
                  Previous
                </Button>
                <span className="px-3 text-sm text-muted-foreground">
                  Page {page} of {pages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= pages}
                  onClick={() => setParam({ page: page + 1 })}
                >
                  Next
                </Button>
              </nav>
            )}
          </div>
        </div>
      </Section>
    </PublicShell>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <Label className="text-xs text-muted-foreground uppercase">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="mt-2 w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
