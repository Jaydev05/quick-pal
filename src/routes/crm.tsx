import { createFileRoute, redirect } from "@tanstack/react-router";
import { deskAccess } from "@/lib/desk.functions";
import { CrmWorkspace } from "@/components/desk/CrmWorkspace";
export const Route = createFileRoute("/crm")({
  ssr: false,
  staticData: { sitemap: "exclude-subtree" },
  beforeLoad: async () => { try { await deskAccess(); } catch { throw redirect({ to: "/auth", search: { redirect: "/crm" } }); } },
  head: () => ({ meta: [
    { title: "Recruitment CRM | Jaydev Associates" },
    { name: "description", content: "Private candidate, resume, partner company and task management for Jaydev Associates." },
    { property: "og:title", content: "Recruitment CRM | Jaydev Associates" },
    { property: "og:description", content: "Jaydev Associates private recruitment CRM." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex, nofollow" },
  ] }), component: CrmWorkspace,
});
