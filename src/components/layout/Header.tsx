import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Instagram,
  LayoutDashboard,
  Linkedin,
  LogOut,
  Menu,
  MessageCircle,
  Phone,
  ShieldCheck,
  User2,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { COMPANY, whatsappLink } from "@/lib/site";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/jobs", label: "Jobs" },
  { to: "/services", label: "Services" },
  { to: "/about", label: "About Us" },
  { to: "/why-jaydev-associates", label: "Why Jaydev" },
  { to: "/contact", label: "Contact" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  const { user, isStaff, isAdmin, signOut } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <header className="surface-dark sticky top-0 z-50 border-b border-border/60 bg-background/95 backdrop-blur">
      <div className="container-x flex h-18 items-center justify-between gap-4 py-3">
        <Logo height={38} />

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV.map((item) => {
            const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors",
                  "hover:bg-secondary hover:text-foreground",
                  active && "text-gold",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-1 md:flex">
            <Button asChild variant="ghost" size="icon" aria-label="Chat on WhatsApp">
              <a
                href={whatsappLink("Hello Jaydev Associates, I would like to know more.")}
                target="_blank"
                rel="noreferrer noopener"
              >
                <MessageCircle />
              </a>
            </Button>
            <Button asChild variant="ghost" size="icon" aria-label="Open Instagram">
              <a href={COMPANY.instagram} target="_blank" rel="noreferrer noopener">
                <Instagram />
              </a>
            </Button>
            <Button asChild variant="ghost" size="icon" aria-label="Open LinkedIn">
              <a href={COMPANY.linkedin} target="_blank" rel="noreferrer noopener">
                <Linkedin />
              </a>
            </Button>
          </div>

          <Button asChild variant="ghost" size="sm" className="hidden xl:inline-flex">
            <a href={COMPANY.phoneHref}>
              <Phone /> {COMPANY.phone}
            </a>
          </Button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <User2 /> <span className="hidden sm:inline">Account</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="truncate px-2 py-1.5 text-xs text-muted-foreground">
                  {user.email}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/dashboard">
                    <LayoutDashboard /> Candidate Dashboard
                  </Link>
                </DropdownMenuItem>
                {isStaff && (
                  <DropdownMenuItem asChild>
                    <Link to="/admin">
                      <ShieldCheck /> {isAdmin ? "Admin Panel" : "Recruiter Panel"}
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => void signOut()}>
                  <LogOut /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                <Link to="/login">Sign in</Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
                <Link to="/login" search={{ redirect: "/dashboard" }}>
                  Create account
                </Link>
              </Button>
            </>
          )}

          <Button asChild size="sm" className="hidden md:inline-flex">
            <Link to="/jobs">Find Jobs</Link>
          </Button>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="surface-dark w-[86vw] max-w-sm bg-background p-0">
              <div className="border-b border-border px-5 py-4">
                <Logo height={34} />
              </div>
              <nav className="flex flex-col gap-1 px-3 py-4">
                {NAV.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className="rounded-md px-3 py-3 text-base font-medium text-foreground hover:bg-secondary"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
              <div className="mt-auto flex flex-col gap-2 px-5 pb-6">
                <div className="flex items-center justify-center gap-2 py-2">
                  <Button asChild variant="ghost" size="icon" aria-label="Chat on WhatsApp">
                    <a
                      href={whatsappLink("Hello Jaydev Associates, I would like to know more.")}
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      <MessageCircle />
                    </a>
                  </Button>
                  <Button asChild variant="ghost" size="icon" aria-label="Open Instagram">
                    <a href={COMPANY.instagram} target="_blank" rel="noreferrer noopener">
                      <Instagram />
                    </a>
                  </Button>
                  <Button asChild variant="ghost" size="icon" aria-label="Open LinkedIn">
                    <a href={COMPANY.linkedin} target="_blank" rel="noreferrer noopener">
                      <Linkedin />
                    </a>
                  </Button>
                </div>
                <Button asChild onClick={() => setOpen(false)}>
                  <Link to="/jobs">Find Jobs</Link>
                </Button>
                <Button asChild variant="outline" onClick={() => setOpen(false)}>
                  <Link to={user ? "/dashboard" : "/login"}>
                    {user ? "Dashboard" : "Sign in / Create account"}
                  </Link>
                </Button>

                <Button asChild variant="ghost">
                  <a href={COMPANY.phoneHref}>
                    <Phone /> {COMPANY.phone}
                  </a>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
