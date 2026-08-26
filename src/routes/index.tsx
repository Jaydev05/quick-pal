import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  Building2,
  Cpu,
  Home,
  ShieldCheck,
  Sparkles,
  UserCheck,
  CheckCircle2,
} from "lucide-react";
import { PublicShell } from "@/components/layout/PublicShell";
import { Section, SectionHeading } from "@/components/home/Section";
import { JobCard, JobCardSkeleton } from "@/components/jobs/JobCard";
import { Button } from "@/components/ui/button";
import { fetchFeaturedJobs } from "@/lib/api";
import { COMPANY, INDUSTRIES, SERVICES, WHY_US } from "@/lib/site";
import heroImage from "@/assets/hero-office.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Jaydev Associates | Recruitment, Security & Facility Services" },
      {
        name: "description",
        content:
          "Jaydev Associates delivers recruitment, security, facility management, IT and real estate services across Maharashtra. Your Growth, Our Commitment.",
      },
      { property: "og:title", content: "Jaydev Associates | Your Growth, Our Commitment" },
      {
        property: "og:description",
        content:
          "Multi-domain business services: recruitment, security, facility management, IT solutions and real estate.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

const SERVICE_ICONS = {
  recruitment: UserCheck,
  security: ShieldCheck,
  "facility-management": Building2,
  "it-solutions": Cpu,
  "real-estate": Home,
} as const;

function HomePage() {
  const { data: jobs, isLoading } = useQuery({
    queryKey: ["featured-jobs"],
    queryFn: () => fetchFeaturedJobs(6),
  });

  return (
    <PublicShell>
      {/* Hero */}
      <section className="surface-dark relative isolate overflow-hidden bg-background">
        <img
          src={heroImage}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 size-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-ink opacity-80" />
        <div className="container-x relative py-24 md:py-32">
          <div className="max-w-3xl">
            <p className="eyebrow">{COMPANY.tagline}</p>
            <h1 className="font-display mt-4 text-4xl leading-tight font-extrabold tracking-tight text-foreground md:text-6xl">
              Professional services that move your business{" "}
              <span className="text-gradient-gold">forward</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
              {COMPANY.name} brings recruitment, security, facility management, IT solutions and
              real estate services together under one trusted partner.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/jobs">
                  Find Jobs <ArrowRight />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/contact">Hire Talent</Link>
              </Button>
              <Button asChild size="lg" variant="ghost">
                <Link to="/services">Our Services</Link>
              </Button>
            </div>
            <dl className="mt-12 grid max-w-xl grid-cols-2 gap-6 sm:grid-cols-4">
              {[
                { k: "5", v: "Service verticals" },
                { k: "24/7", v: "Availability" },
                { k: "Multi", v: "Industry reach" },
                { k: "End-to-end", v: "Solutions" },
              ].map((s) => (
                <div key={s.v}>
                  <dt className="font-display text-2xl font-bold text-gold">{s.k}</dt>
                  <dd className="mt-1 text-xs text-muted-foreground">{s.v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* Services */}
      <Section>
        <SectionHeading
          eyebrow="What we do"
          title="Five verticals, one commitment"
          description="Recruitment is our core business, supported by four complementary service lines."
        />
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((service) => {
            const Icon = SERVICE_ICONS[service.slug];
            return (
              <article
                key={service.slug}
                className="flex h-full flex-col rounded-xl border border-border bg-card p-6 shadow-card transition-all hover:-translate-y-0.5 hover:border-gold/50"
              >
                <span className="flex size-11 items-center justify-center rounded-lg bg-gradient-gold text-ink">
                  <Icon className="size-5" />
                </span>
                <h3 className="font-display mt-5 text-lg font-semibold text-card-foreground">
                  {service.name}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">{service.short}</p>
                <ul className="mt-4 space-y-1.5 text-sm text-muted-foreground">
                  {service.points.slice(0, 4).map((p) => (
                    <li key={p} className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-gold" />
                      {p}
                    </li>
                  ))}
                </ul>
                <Button asChild variant="link" className="mt-5 justify-start px-0">
                  <Link
                    to={service.slug === "recruitment" ? "/jobs" : "/services"}
                    hash={service.slug === "recruitment" ? undefined : service.slug}
                  >
                    {service.cta} <ArrowRight />
                  </Link>
                </Button>
              </article>
            );
          })}
        </div>
      </Section>

      {/* Featured jobs */}
      <Section dark>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            align="left"
            eyebrow="Recruitment"
            title="Latest opportunities"
            description="Live openings from our client network. Apply online and track your application end to end."
          />
          <Button asChild variant="outline">
            <Link to="/jobs">
              View all jobs <ArrowRight />
            </Link>
          </Button>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {isLoading &&
            Array.from({ length: 3 }).map((_, i) => <JobCardSkeleton key={i} />)}
          {!isLoading && jobs?.length === 0 && (
            <p className="text-muted-foreground">
              No live openings right now — new roles are added regularly.
            </p>
          )}
          {jobs?.map((job) => <JobCard key={job.id} job={job} />)}
        </div>
      </Section>

      {/* Why us */}
      <Section>
        <SectionHeading
          eyebrow="Why Jaydev Associates"
          title="A partner built for operational excellence"
        />
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {WHY_US.map((item) => (
            <div key={item.title} className="rounded-xl border border-border bg-card p-6">
              <Sparkles className="size-5 text-gold" />
              <h3 className="font-display mt-4 text-base font-semibold text-card-foreground">
                {item.title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">{item.body}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Industries */}
      <Section dark className="py-14 md:py-16">
        <SectionHeading eyebrow="Industries served" title="Sectors we work with" />
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
      </Section>

      {/* CTA */}
      <Section className="py-14 md:py-20">
        <div className="rounded-2xl bg-gradient-gold px-6 py-12 text-center shadow-gold md:px-12">
          <h2 className="font-display text-3xl font-bold text-ink md:text-4xl">
            Ready to work with us?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-ink/80">
            Whether you are hiring, seeking a role, or need security, facility, IT or property
            support — our team is ready.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" variant="ink">
              <Link to="/contact">Request a Callback</Link>
            </Button>
            <Button asChild size="lg" variant="inkOutline">
              <Link to="/jobs">Browse Jobs</Link>
            </Button>
          </div>
        </div>
      </Section>
    </PublicShell>
  );
}
