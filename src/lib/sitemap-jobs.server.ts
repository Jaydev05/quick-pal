import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { OPEN_JOB_STATUSES } from "./status";

export async function readSitemapJobs(client: SupabaseClient<Database>, pageSize = 1000) {
  const jobs: { slug: string }[] = [];
  for (let offset = 0; ; ) {
    const { data, error } = await client.from("jobs").select("slug").eq("is_public", true).in("status", OPEN_JOB_STATUSES).order("id").range(offset, offset + pageSize - 1);
    if (error) throw new Error("Could not read public sitemap jobs.");
    if (!data?.length) break;
    jobs.push(...data);
    offset += data.length;
  }
  return jobs;
}