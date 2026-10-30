import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import type { JobFilters, JobWithCategory } from "./api";
import { OPEN_JOB_STATUSES } from "./status";

export function publicJobsClient() {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) throw new Error("Public job listings are temporarily unavailable.");
  return createClient<Database>(url, key, { auth: { persistSession: false, autoRefreshToken: false }, global: { fetch: (input, init) => {
    const headers = new Headers(init?.headers);
    if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) headers.delete("Authorization");
    headers.set("apikey", key);
    return fetch(input, { ...init, headers });
  } } });
}
// Never project internal staff notes or audit ownership into public loader data.
const columns = "id,job_code,title,slug,category_id,department,client_name,city,state,country,employment_type,min_experience,max_experience,salary_min,salary_max,salary_visible,openings,education,skills,description,responsibilities,qualifications,benefits,additional_info,deadline,status,is_featured,is_public,accepting_applications,poster_path,instagram_url,instagram_posted,created_at,updated_at,categories(id,name,slug)";
function publicRow(row: Record<string, unknown>): JobWithCategory {
  return { ...row, internal_notes: null, created_by: null, social_caption: null, ...(!row["salary_visible"] ? { salary_min: null, salary_max: null } : {}) } as JobWithCategory;
}
export async function readPublicJob(slug: string) {
  const { data, error } = await publicJobsClient().from("jobs").select(columns).eq("slug", slug).eq("is_public", true).in("status", OPEN_JOB_STATUSES).maybeSingle();
  if (error) throw new Error("This job could not be loaded. Please try again.");
  return data ? publicRow(data) : null;
}
export async function readPublicJobs(filters: JobFilters = {}, featured = false) {
  const perPage = filters.perPage ?? 9;
  const page = filters.page ?? 1;
  let query = publicJobsClient().from("jobs").select(columns, { count: "exact" }).eq("is_public", true).in("status", OPEN_JOB_STATUSES);
  // Escape filter control characters before constructing PostgREST OR filters.
  const term = (value: string) => `%${value.replace(/[%_(),.\\]/g, " ").trim()}%`;
  if (filters.q) { const q = term(filters.q); query = query.or(`title.ilike.${q},description.ilike.${q},department.ilike.${q},job_code.ilike.${q}`); }
  if (filters.location) { const q = term(filters.location); query = query.or(`city.ilike.${q},state.ilike.${q}`); }
  if (filters.category && filters.category !== "all") query = query.eq("category_id", filters.category);
  if (filters.type && filters.type !== "all") query = query.eq("employment_type", filters.type);
  if (filters.experience && filters.experience !== "all") {
    const [min, max] = filters.experience.split("-");
    if (min) query = query.gte("min_experience", Number(min));
    if (max && max !== "plus") query = query.lte("min_experience", Number(max));
  }
  if (filters.sort === "salary") query = query.order("salary_max", { ascending: false, nullsFirst: false });
  else if (filters.sort === "title") query = query.order("title");
  else query = query.order("is_featured", { ascending: false }).order("created_at", { ascending: false });
  query = query.order("id");
  const { data, error, count } = await query.range(featured ? 0 : (page - 1) * perPage, featured ? perPage - 1 : page * perPage - 1);
  if (error) throw new Error("Job listings could not be loaded. Please try again.");
  return { jobs: (data ?? []).map(publicRow), count: count ?? 0, page, perPage };
}