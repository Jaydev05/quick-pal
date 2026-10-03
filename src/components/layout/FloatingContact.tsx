import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, ExternalLink, Phone, UsersRound } from "lucide-react";
import { COMPANY, whatsappLink } from "@/lib/site";
import { JOB_ALERT_GROUPS } from "@/lib/job-alert-groups";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export function FloatingContact() {
  const [expanded, setExpanded] = useState(false);
  const [groupsOpen, setGroupsOpen] = useState(false);
  const collapseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const reveal = () => {
      setExpanded(true);
      if (collapseTimer.current) clearTimeout(collapseTimer.current);
      collapseTimer.current = setTimeout(() => setExpanded(false), 2800);
    };
    document.addEventListener("pointerdown", reveal);
    document.addEventListener("keydown", reveal);
    return () => {
      document.removeEventListener("pointerdown", reveal);
      document.removeEventListener("keydown", reveal);
      if (collapseTimer.current) clearTimeout(collapseTimer.current);
    };
  }, []);

  const showLabel = expanded || groupsOpen;

  return (
    <div className="fixed right-4 bottom-4 z-40 flex flex-col items-end gap-2 md:right-6 md:bottom-6">
      <Popover open={groupsOpen} onOpenChange={setGroupsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="secondary"
            aria-label="View WhatsApp job alert groups"
            title="Job alert groups"
            className={`h-12 min-w-12 gap-0 overflow-hidden rounded-md border border-gold/50 bg-ink text-gold shadow-card transition-[padding,background-color,border-color] duration-300 hover:bg-ink/90 focus-visible:ring-gold motion-reduce:transition-none ${showLabel ? "px-3" : "px-0"}`}
          >
            <UsersRound className="size-5 shrink-0" />
            <span
              aria-hidden="true"
              className={`block overflow-hidden whitespace-nowrap text-sm font-semibold transition-[max-width,opacity,margin] duration-300 motion-reduce:transition-none ${showLabel ? "ml-2 max-w-32 opacity-100" : "ml-0 max-w-0 opacity-0"}`}
            >
              Job alert groups
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          side="top"
          align="end"
          sideOffset={12}
          className="max-h-[min(70dvh,30rem)] w-[min(22rem,calc(100vw-2rem))] overflow-y-auto rounded-md border border-border bg-card p-0 text-card-foreground shadow-card"
        >
          <div className="bg-ink px-5 py-5 text-gold">
            <div className="mb-3 flex size-9 items-center justify-center rounded-md border border-gold/40 bg-gold/10">
              <UsersRound className="size-5" aria-hidden="true" />
            </div>
            <h2 className="font-display text-lg font-bold leading-snug">WhatsApp job alert groups</h2>
            <p className="mt-1 text-xs leading-relaxed text-gold-soft">Career opportunities from Jaydev Associates</p>
          </div>
          <ul className="divide-y divide-border">
            {JOB_ALERT_GROUPS.map((group) => (
              <li key={group.href} className="min-w-0 space-y-4 px-5 py-5">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-success/10 text-success"><UsersRound className="size-4" aria-hidden="true" /></span>
                  <p className="min-w-0 break-words text-sm font-semibold text-card-foreground">{group.name}</p>
                </div>
                <Button asChild size="default" className="w-full bg-success text-success-foreground hover:bg-success/90">
                  <a href={group.href} target="_blank" rel="noreferrer noopener" aria-label={`${group.label}: ${group.name}`}>
                    {group.label} <ArrowUpRight />
                  </a>
                </Button>
              </li>
            ))}
          </ul>
          <div className="flex items-center justify-between border-t border-border bg-muted/50 px-5 py-3 text-xs text-muted-foreground">
            <span>Opens in WhatsApp</span><ExternalLink className="size-3.5" aria-hidden="true" />
          </div>
        </PopoverContent>
      </Popover>
      <a
        href={whatsappLink("Hello Jaydev Associates, I would like to know more.")}
        target="_blank"
        rel="noreferrer noopener"
        aria-label={`Chat on WhatsApp ${COMPANY.phone}`}
        className="flex size-12 items-center justify-center rounded-full bg-success text-success-foreground shadow-card transition-transform hover:scale-105"
      >
        <svg viewBox="0 0 24 24" className="size-6" fill="currentColor" aria-hidden="true">
          <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.64-2.05-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.2-.24-.58-.48-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.06 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.09 1.75-.72 2-1.41.25-.69.25-1.28.17-1.41-.07-.13-.27-.2-.57-.35M12.05 21.5h-.01a9.4 9.4 0 0 1-4.79-1.31l-.34-.2-3.56.93.95-3.47-.22-.36a9.38 9.38 0 0 1-1.44-5.01c0-5.18 4.22-9.4 9.42-9.4a9.35 9.35 0 0 1 6.65 2.76 9.32 9.32 0 0 1 2.75 6.65c0 5.18-4.22 9.41-9.41 9.41M20.42 3.64A11.28 11.28 0 0 0 12.05 0C5.8 0 .72 5.08.72 11.32c0 2 .52 3.94 1.52 5.66L.62 24l7.18-1.88a11.3 11.3 0 0 0 5.4 1.38h.01c6.24 0 11.32-5.08 11.32-11.32 0-3.03-1.18-5.87-3.32-8.01" />
        </svg>
      </a>
      <a
        href={COMPANY.phoneHref}
        aria-label="Call Jaydev Associates"
        className="flex size-12 items-center justify-center rounded-full bg-gradient-gold text-ink shadow-gold transition-transform hover:scale-105"
      >
        <Phone className="size-5" />
      </a>
    </div>
  );
}
