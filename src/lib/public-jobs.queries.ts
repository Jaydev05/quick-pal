import { queryOptions } from "@tanstack/react-query";
import { getPublicJob, getPublicJobs, getFeaturedPublicJobs } from "./public-jobs.functions";
import type { z } from "zod";
import type { publicJobFilters } from "./public-jobs.functions";

export const publicJobQuery = (slug: string) => queryOptions({ queryKey: ["public-job", slug], queryFn: () => getPublicJob({ data: { slug } }), staleTime: 60000 });
export const publicJobsQuery = (search: z.infer<typeof publicJobFilters>) => queryOptions({ queryKey: ["public-jobs", search], queryFn: () => getPublicJobs({ data: { ...search, perPage: 9 } }), staleTime: 30000 });
export const featuredPublicJobsQuery = queryOptions({ queryKey: ["public-featured-jobs"], queryFn: () => getFeaturedPublicJobs(), staleTime: 30000 });