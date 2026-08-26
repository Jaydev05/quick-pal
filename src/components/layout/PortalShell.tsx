import type { ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { LogOut, ExternalLink } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

export type NavItem = { to: string; label: string; icon: React.ComponentType<{ className?: string }> };

export function PortalShell({
  items,
  title,
  children,
}: {
  items: NavItem[];
  title: string;
  children: ReactNode;
}) {
  const { user, signOut } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="surface-dark flex min-h-screen bg-background">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border lg:flex">
        <div className="border-b border-border px-5 py-5">
          <Logo height={34} />
          <p className="mt-3 text-xs tracking-wide text-muted-foreground uppercase">{title}</p>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {items.map((item) => {
            const active =
              item.to === pathname || (item.to !== "/dashboard" && item.to !== "/admin" && pathname.startsWith(item.to));
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-2.5 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
                  active && "bg-secondary text-gold",
                )}
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="space-y-2 border-t border-border p-3">
          <p className="truncate px-2 text-xs text-muted-foreground">{user?.email}</p>
          <Button asChild variant="ghost" size="sm" className="w-full justify-start">
            <Link to="/">
              <ExternalLink /> View website
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            onClick={() => void signOut()}
          >
            <LogOut /> Sign out
          </Button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 lg:hidden">
          <Logo height={30} />
          <Button variant="ghost" size="sm" onClick={() => void signOut()}>
            <LogOut /> Sign out
          </Button>
        </header>
        <nav className="flex gap-1 overflow-x-auto border-b border-border px-3 py-2 lg:hidden">
          {items.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-md px-3 py-2 text-xs font-medium whitespace-nowrap text-muted-foreground hover:bg-secondary"
              activeProps={{ className: "text-gold bg-secondary" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <main className="flex-1 overflow-x-hidden p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground md:text-3xl">{title}</h1>
        {description && <p className="mt-2 text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}
