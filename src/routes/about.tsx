import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicShell } from "@/components/layout/PublicShell";
import { Section, SectionHeading } from "@/components/home/Section";
import { Button } from "@/components/ui/button";
import { COMPANY, INDUSTRIES, SERVICES } from "@/lib/site";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us | Jaydev Associates" },
      {
        name: "description",
        content:
          "Jaydev Associates is a multi-domain service provider in Mangaon, Raigad offering recruitment, security, facility management, IT and real estate services.",
      },
      { property: "og:title", content: "About Jaydev Associates" },
      {
        property: "og:description",
        content: "Who we are, what we do and the industries we serve.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <PublicShell>
      <Section dark className="py-16 md:py-20">
        <SectionHeading
          align="left"
          eyebrow="About us"
          title="Your Growth, Our Commitment"
          description={`${COMPANY.name} is a multi-domain professional services firm supporting businesses with the people, protection, facilities, technology and property they need to operate well.`}
        />
      </Section>

      <Section>
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground">Our mission</h2>
            <p className="mt-4 text-muted-foreground">
              To be a single, dependable partner for business requirements that are usually split
              across many vendors — delivering recruitment, security, facility management, IT
              solutions and real estate services with consistent professional standards.
            </p>
            <h2 className="font-display mt-10 text-2xl font-bold text-foreground">Our approach</h2>
            <p className="mt-4 text-muted-foreground">
              Every engagement starts with understanding the operational requirement. We then
              assemble the right combination of people, process and technology, and stay
              accountable for the outcome.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="font-display text-lg font-semibold text-card-foreground">
              What we deliver
            </h3>
            <ul className="mt-4 space-y-4">
              {SERVICES.map((s) => (
                <li key={s.slug}>
                  <p className="text-sm font-semibold text-card-foreground">{s.name}</p>
                  <p className="text-sm text-muted-foreground">{s.short}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section dark className="py-14 md:py-16">
        <SectionHeading eyebrow="Reach" title="Industries we serve" />
        <ul className="mt-10 flex flex-wrap justify-center gap-2.5">
          {INDUSTRIES.map((i) => (
            <li
              key={i}
              className="rounded-full border border-border bg-card px-4 py-2 text-sm text-card-foreground"
            >
              {i}
            </li>
          ))}
        </ul>
        <div className="mt-10 text-center">
          <Button asChild>
            <Link to="/contact">Talk to our team</Link>
          </Button>
        </div>
      </Section>
    </PublicShell>
  );
}
