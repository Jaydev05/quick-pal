import { createFileRoute } from "@tanstack/react-router";
import { getRouterInstance } from "@tanstack/react-start";
import { isSitemapRouteIncluded, sitemapPathForLocation, sitemapStaticPaths, sitemapXML, type SitemapEntry } from "@/lib/sitemap";

const BASE_URL = "https://jaydevassociates.com";
export const Route = createFileRoute("/sitemap.xml")({
  staticData: { sitemap: false },
  server: { handlers: { GET: async () => {
    try {
      const router = await getRouterInstance();
      const entries: SitemapEntry[] = sitemapStaticPaths(router).map((path) => ({ path }));
      const routeId = "/jobs/$slug";
      if (isSitemapRouteIncluded(router.routesById[routeId])) {
        const { createClient } = await import("@supabase/supabase-js");
        const { readSitemapJobs } = await import("@/lib/sitemap-jobs.server");
        const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
        const url = process.env["SUPABASE_URL"];
        if (!key || !url) throw new Error("Public job source is unavailable.");
        const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false }, global: { fetch: (input, init) => {
          const headers = new Headers(init?.headers);
          if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) headers.delete("Authorization");
          headers.set("apikey", key);
          return fetch(input, { ...init, headers });
        } } });
        const jobs = await readSitemapJobs(client);
        for (const job of jobs) {
          const location = router.buildLocation({ to: "/jobs/$slug", params: { slug: job.slug }, search: () => ({}), hash: "" });
          const path = sitemapPathForLocation(router, location, routeId);
          if (path) entries.push({ path });
        }
      }
      if (!entries.length) return new Response("No public sitemap pages configured.", { status: 404, headers: { "Cache-Control": "no-store" } });
      return new Response(sitemapXML(BASE_URL, entries), { headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" } });
    } catch {
      return new Response("Sitemap is temporarily unavailable.", { status: 503, headers: { "Cache-Control": "no-store" } });
    }
  } } },
});