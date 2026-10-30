import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { readPublicJob, readPublicJobs } from "./public-jobs.server";

export const publicJobFilters = z.object({
  q: z.string().trim().max(100).optional(), location: z.string().trim().max(80).optional(),
  category: z.union([z.string().uuid(), z.literal("all")]).optional(),
  type: z.enum(["full_time", "part_time", "contract", "temporary", "internship", "all"]).optional(),
  experience: z.enum(["all", "0-1", "1-3", "3-5", "5-10", "10-plus"]).optional(),
  sort: z.enum(["recent", "salary", "title"]).optional(), page: z.number().int().min(1).max(10000).optional(),
  perPage: z.number().int().min(1).max(50).optional(),
});
export const getPublicJob = createServerFn({ method: "GET" }).inputValidator((input) => z.object({ slug: z.string().min(1).max(180).regex(/^[a-zA-Z0-9_-]+$/) }).parse(input)).handler(({ data }) => readPublicJob(data.slug));
export const getPublicJobs = createServerFn({ method: "GET" }).inputValidator((input) => publicJobFilters.parse(input)).handler(({ data }) => readPublicJobs(data));
export const getFeaturedPublicJobs = createServerFn({ method: "GET" }).handler(async () => (await readPublicJobs({ perPage: 6 }, true)).jobs);