import { createFileRoute, Link } from "@tanstack/react-router";
import { BadgeCheck } from "lucide-react";
import { PublicShell } from "@/components/layout/PublicShell";
import { Section, SectionHeading } from "@/components/home/Section";
import { Button } from "@/components/ui/button";
import { WHY_US } from "@/lib/site";

export const Route = createFileRoute("/why-jaydev-associates")({
  head: () => ({
    meta: [
      { title: "Why Choose Jaydev Associates" },
      {
        name: "description",
        content:
          "Multi-domain services, an experienced team, 24/7 availability and a client-focused approach — why businesses choose Jaydev Associates.",
      },
      { property: "og:title", content: "Why Choose Jaydev Associates" },
      {
        property: "og:description",
        content: "Six reasons businesses partner with Jaydev Associates.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: WhyPage,
});

function WhyPage() {
  return (
    <PublicShell>
      <Section dark className="py-16 md:py-20">
        <SectionHeading
          align="left"
          eyebrow="Why us"
          title="Built around your operational reality"
          description="One accountable partner instead of five separate vendors."
        />
      </Section>

      <Section>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {WHY_US.map((item, i) => (
            <article key={item.title} className="rounded-xl border border-border bg-card p-6">
              <span className="font-display text-sm font-bold text-gold">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h2 className="font-display mt-3 flex items-center gap-2 text-lg font-semibold text-card-foreground">
                <BadgeCheck className="size-5 text-gold" /> {item.title}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">{item.body}</p>
            </article>
          ))}
        </div>
        <div className="mt-12 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg">
            <Link to="/contact">Request a Callback</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/jobs">Browse Jobs</Link>
          </Button>
        </div>
      </Section>
    </PublicShell>
  );
}
