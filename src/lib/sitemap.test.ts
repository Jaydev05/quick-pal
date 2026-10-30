import { describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import type { AnyRoute } from "@tanstack/react-router";
import { isSitemapRouteIncluded, sitemapXML } from "./sitemap";
import { readSitemapJobs } from "./sitemap-jobs.server";

describe("public sitemap", () => {
  it("excludes private descendants even if they opt in", () => {
    const parent = { options: { staticData: { sitemap: "exclude-subtree" } } } as unknown as AnyRoute;
    const child = { options: { staticData: { sitemap: true } }, parentRoute: parent } as unknown as AnyRoute;
    expect(isSitemapRouteIncluded(child)).toBe(false);
  });
  it("uses the public domain without fabricated lastmod dates", () => {
    const xml = sitemapXML("https://jaydevassociates.com", [{ path: "/courses" }, { path: "/courses" }]);
    expect(xml).toContain("https://jaydevassociates.com/courses");
    expect(xml).not.toContain("lastmod");
    expect(xml.match(/<url>/g)).toHaveLength(1);
  });
  it("rejects unsafe paths", () => {
    expect(() => sitemapXML("https://jaydevassociates.com", [{ path: "//another.test" }])).toThrow();
  });
  function source(failSecond = false) {
    const range = vi.fn(async (offset: number) => offset === 0 ? { data: [{ slug: "first" }, { slug: "second" }], error: null } : offset === 2 ? failSecond ? { data: null, error: { message: "failed" } } : { data: [{ slug: "third" }], error: null } : { data: [], error: null });
    const filter = vi.fn(() => ({ order: () => ({ range }) }));
    const visible = vi.fn(() => ({ in: filter }));
    const client = { from: () => ({ select: () => ({ eq: visible }) }) } as unknown as SupabaseClient<Database>;
    return { client, range, visible, filter };
  }
  it("paginates all public active job batches", async () => {
    const s = source();
    expect(await readSitemapJobs(s.client, 2)).toEqual([{ slug: "first" }, { slug: "second" }, { slug: "third" }]);
    expect(s.range.mock.calls).toEqual([[0, 1], [2, 3], [3, 4]]);
    expect(s.visible).toHaveBeenCalledWith("is_public", true);
    expect(s.filter).toHaveBeenCalledWith("status", ["published", "hiring", "interviewing"]);
  });
  it("rejects a later-batch failure instead of returning partial entries", async () => {
    await expect(readSitemapJobs(source(true).client, 2)).rejects.toThrow();
  });
});