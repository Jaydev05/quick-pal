import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { PublicShell } from "@/components/layout/PublicShell";
import { Section, SectionHeading } from "@/components/home/Section";
import { Button } from "@/components/ui/button";
import { SERVICES } from "@/lib/site";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Our Services | Jaydev Associates" },
      {
        name: "description",
        content:
          "Recruitment solutions, security services, facility management, IT solutions and real estate services from Jaydev Associates.",
      },
      { property: "og:title", content: "Our Services | Jaydev Associates" },
      {
        property: "og:description",
        content:
          "Five service verticals covering hiring, security, facilities, technology and property.",
      },
    ],
  }),
  component: ServicesPage,
});

function ServicesPage() {
  return (
    <PublicShell>
      <Section dark className="py-16 md:py-20">
        <SectionHeading
          align="left"
          eyebrow="Services"
          title="Complete professional service solutions"
          description="One partner across recruitment, security, facility management, IT and real estate."
        />
      </Section>

      {SERVICES.map((service, index) => (
        <Section key={service.slug} id={service.slug} className={index % 2 ? "bg-muted/40" : ""}>
          <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-start">
            <div>
              <p className="eyebrow">Service {String(index + 1).padStart(2, "0")}</p>
              <h2 className="font-display mt-2 text-3xl font-bold text-foreground">
                {service.name}
              </h2>
              <div className="gold-rule mt-5" />
              <p className="mt-5 text-muted-foreground">{service.short}</p>
              <Button asChild className="mt-7">
                <Link to={service.slug === "recruitment" ? "/jobs" : "/contact"}>
                  {service.cta} <ArrowRight />
                </Link>
              </Button>
            </div>
            <ul className="grid gap-3 sm:grid-cols-2">
              {service.points.map((point) => (
                <li
                  key={point}
                  className="flex items-start gap-2.5 rounded-lg border border-border bg-card p-4 text-sm text-card-foreground"
                >
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-gold" />
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </Section>
      ))}
    </PublicShell>
  );
}
