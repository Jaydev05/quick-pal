import { useEffect } from "react";
import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { Bookmark, FileText, LayoutDashboard, UserCog } from "lucide-react";
import { PortalShell, type NavItem } from "@/components/layout/PortalShell";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Candidate Dashboard | Jaydev Associates" },
      {
        name: "description",
        content: "Track your job applications, saved jobs and profile with Jaydev Associates.",
      },
      { property: "og:title", content: "Candidate Dashboard | Jaydev Associates" },
      { property: "og:description", content: "Your Jaydev Associates candidate portal." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DashboardLayout,
});

const NAV: NavItem[] = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/dashboard/applications", label: "My Applications", icon: FileText },
  { to: "/dashboard/saved", label: "Saved Jobs", icon: Bookmark },
  { to: "/dashboard/profile", label: "My Profile", icon: UserCog },
];

function DashboardLayout() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) void navigate({ to: "/login", search: { redirect: "/dashboard" } });
  }, [user, loading, navigate]);

  if (loading || !user) {
    return (
      <div className="surface-dark flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Loading your dashboard…</p>
      </div>
    );
  }

  return (
    <PortalShell items={NAV} title="Candidate Portal">
      <Outlet />
    </PortalShell>
  );
}
