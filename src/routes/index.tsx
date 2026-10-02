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
  ExternalLink,
  UsersRound,
} from "lucide-react";
import { PublicShell } from "@/components/layout/PublicShell";
import { Section, SectionHeading } from "@/components/home/Section";
import { JobCard, JobCardSkeleton } from "@/components/jobs/JobCard";
import { Button } from "@/components/ui/button";
import { fetchFeaturedJobs } from "@/lib/api";
import { COMPANY, INDUSTRIES, SERVICES, WHY_US } from "@/lib/site";
import { JOB_ALERT_GROUPS } from "@/lib/job-alert-groups";
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

      {/* WhatsApp job alerts */}
      <Section className="bg-muted/50 py-14 md:py-16">
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-card">
          <div className="h-1 bg-gradient-gold" />
          <div className="grid min-w-0 gap-8 p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:p-10">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-success text-success-foreground">
                  <svg viewBox="0 0 24 24" className="size-6" fill="currentColor" aria-hidden="true">
                    <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.64-2.05-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.2-.24-.58-.48-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.06 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.09 1.75-.72 2-1.41.25-.69.25-1.28.17-1.41-.07-.13-.27-.2-.57-.35M12.05 21.5h-.01a9.4 9.4 0 0 1-4.79-1.31l-.34-.2-3.56.93.95-3.47-.22-.36a9.38 9.38 0 0 1-1.44-5.01c0-5.18 4.22-9.4 9.42-9.4a9.35 9.35 0 0 1 6.65 2.76 9.32 9.32 0 0 1 2.75 6.65c0 5.18-4.22 9.41-9.41 9.41M20.42 3.64A11.28 11.28 0 0 0 12.05 0C5.8 0 .72 5.08.72 11.32c0 2 .52 3.94 1.52 5.66L.62 24l7.18-1.88a11.3 11.3 0 0 0 5.4 1.38h.01c6.24 0 11.32-5.08 11.32-11.32 0-3.03-1.18-5.87-3.32-8.01" />
                  </svg>
                </span>
                <div className="min-w-0">
                  <p className="eyebrow">Career Opportunities</p>
                  <h2 className="font-display mt-1 text-2xl font-bold text-card-foreground sm:text-3xl">
                    Join Our WhatsApp Job Alert Group
                  </h2>
                </div>
              </div>
              <p className="mt-5 max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">
                Stay updated with the latest job opportunities shared by HR professionals and recruiters. Join our WhatsApp group to receive the latest job vacancies, direct recruitment opportunities, job openings from multiple HRs, and regular career updates.
              </p>
              <div className="mt-5 flex items-center gap-2 text-sm font-medium text-card-foreground">
                <UsersRound className="size-4 shrink-0 text-success" />
                Direct job and recruitment updates
              </div>
            </div>

            <div className="grid min-w-0 gap-3 lg:min-w-64">
              {JOB_ALERT_GROUPS.map((group) => (
                <Button key={group.href} asChild size="lg" className="w-full bg-success text-success-foreground hover:bg-success/90">
                  <a
                    href={group.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label={`${group.label}: ${group.name}`}
                  >
                    {group.label} <ExternalLink />
                  </a>
                </Button>
              ))}
              <p className="text-center text-xs text-muted-foreground">Opens securely in WhatsApp</p>
            </div>
          </div>
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
