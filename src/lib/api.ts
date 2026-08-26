import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { OPEN_JOB_STATUSES, type EmploymentType, type JobStatus } from "@/lib/status";

export type Job = Database["public"]["Tables"]["jobs"]["Row"];
export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Application = Database["public"]["Tables"]["applications"]["Row"];
export type Interview = Database["public"]["Tables"]["interviews"]["Row"];
export type Payment = Database["public"]["Tables"]["payments"]["Row"];
export type Enquiry = Database["public"]["Tables"]["service_enquiries"]["Row"];
export type StatusHistory = Database["public"]["Tables"]["application_status_history"]["Row"];

export type JobWithCategory = Job & { categories: Pick<Category, "id" | "name" | "slug"> | null };

export type JobFilters = {
  q?: string;
  location?: string;
  category?: string;
  type?: EmploymentType | "all";
  experience?: string;
  sort?: "recent" | "salary" | "title";
  page?: number;
  perPage?: number;
};

export async function fetchCategories() {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("active", true)
    .order("name");
  if (error) throw error;
  return data;
}

export async function fetchPublicJobs(filters: JobFilters = {}) {
  const perPage = filters.perPage ?? 9;
  const page = filters.page ?? 1;

  let query = supabase
    .from("jobs")
    .select("*, categories(id, name, slug)", { count: "exact" })
    .eq("is_public", true)
    .in("status", OPEN_JOB_STATUSES);

  if (filters.q) {
    const term = `%${filters.q}%`;
    query = query.or(
      `title.ilike.${term},description.ilike.${term},department.ilike.${term},job_code.ilike.${term}`,
    );
  }
  if (filters.location) {
    const term = `%${filters.location}%`;
    query = query.or(`city.ilike.${term},state.ilike.${term}`);
  }
  if (filters.category && filters.category !== "all") {
    query = query.eq("category_id", filters.category);
  }
  if (filters.type && filters.type !== "all") {
    query = query.eq("employment_type", filters.type);
  }
  if (filters.experience && filters.experience !== "all") {
    const [min, max] = filters.experience.split("-");
    if (min) query = query.gte("min_experience", Number(min));
    if (max && max !== "plus") query = query.lte("min_experience", Number(max));
  }

  if (filters.sort === "salary") query = query.order("salary_max", { ascending: false, nullsFirst: false });
  else if (filters.sort === "title") query = query.order("title");
  else query = query.order("is_featured", { ascending: false }).order("created_at", { ascending: false });

  const from = (page - 1) * perPage;
  const { data, error, count } = await query.range(from, from + perPage - 1);
  if (error) throw error;
  return { jobs: (data ?? []) as JobWithCategory[], count: count ?? 0, page, perPage };
}

export async function fetchFeaturedJobs(limit = 6) {
  const { data, error } = await supabase
    .from("jobs")
    .select("*, categories(id, name, slug)")
    .eq("is_public", true)
    .in("status", OPEN_JOB_STATUSES)
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as JobWithCategory[];
}

export async function fetchJobBySlug(slug: string) {
  const { data, error } = await supabase
    .from("jobs")
    .select("*, categories(id, name, slug)")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return (data as JobWithCategory | null) ?? null;
}

export async function fetchSimilarJobs(job: JobWithCategory, limit = 3) {
  let query = supabase
    .from("jobs")
    .select("*, categories(id, name, slug)")
    .eq("is_public", true)
    .in("status", OPEN_JOB_STATUSES)
    .neq("id", job.id)
    .limit(limit);
  if (job.category_id) query = query.eq("category_id", job.category_id);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as JobWithCategory[];
}

export function jobIsOpen(job: Pick<Job, "status" | "accepting_applications" | "deadline">) {
  if (!job.accepting_applications) return false;
  if (!OPEN_JOB_STATUSES.includes(job.status as JobStatus)) return false;
  if (job.deadline && new Date(job.deadline).getTime() < Date.now() - 86400000) return false;
  return true;
}

export async function signedPosterUrl(path?: string | null) {
  if (!path) return null;
  const { data } = await supabase.storage.from("job-posters").createSignedUrl(path, 3600);
  return data?.signedUrl ?? null;
}

export async function signedResumeUrl(path?: string | null) {
  if (!path) return null;
  const { data } = await supabase.storage.from("resumes").createSignedUrl(path, 3600);
  return data?.signedUrl ?? null;
}

export async function fetchMyProfile(userId: string) {
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
  if (error) throw error;
  return data;
}

export async function fetchMyApplications(userId: string) {
  const { data, error } = await supabase
    .from("applications")
    .select("*, jobs(id, title, slug, city, state, job_code, employment_type, status)")
    .eq("candidate_id", userId)
    .order("applied_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchSavedJobs(userId: string) {
  const { data, error } = await supabase
    .from("saved_jobs")
    .select("id, created_at, job_id, jobs(*, categories(id, name, slug))")
    .eq("candidate_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchNotifications(userId: string) {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(30);
  if (error) throw error;
  return data ?? [];
}

export function randomCode(prefix: string) {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}${Math.floor(Math.random() * 900 + 100)}`;
}
