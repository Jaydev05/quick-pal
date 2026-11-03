import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/desk")({
  ssr: false,
  staticData: { sitemap: "exclude-subtree" },
  beforeLoad: () => { throw redirect({ to: "/crm", replace: true }); },
  head: () => ({
    meta: [
      { title: "Daily Desk | Jaydev Associates" },
      {
        name: "description",
        content: "Private super-admin daily operations, candidate calls and resume management.",
      },
      { property: "og:title", content: "Daily Desk | Jaydev Associates" },
      {
        property: "og:description",
        content: "Jaydev Associates private daily operations workspace.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),

});
