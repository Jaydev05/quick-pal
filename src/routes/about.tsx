import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Download, ExternalLink, FileText } from "lucide-react";
import { PublicShell } from "@/components/layout/PublicShell";
import { Section } from "@/components/home/Section";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import founder from "@/assets/jay-doshi-founder.jpeg.asset.json";
import aboutBackdrop from "@/assets/hero-office.jpg";
import mcaPreview from "@/assets/mca-website-copy.png.asset.json";
import mcaDocument from "@/assets/mca-website-copy.pdf.asset.json";
import udyamPreview from "@/assets/udyam-website-copy.png.asset.json";
import udyamDocument from "@/assets/udyam-website-copy.pdf.asset.json";
import isoPreview from "@/assets/iso-9001-2015-certificate.jpg.asset.json";
import isoDocument from "@/assets/iso-9001-2015-certificate.pdf.asset.json";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [
    { title: "About Jaydev Associates LLP | Our Story, Leadership & Registrations" },
    { name: "description", content: "Learn about Jaydev Associates LLP, founder Jay Doshi, our professional services, company credentials and official registrations." },
    { property: "og:title", content: "About Jaydev Associates LLP" },
    { property: "og:description", content: "Our story, leadership, services and official company registrations." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: AboutPage,
});

const services = [
  ["Recruitment Solutions", "Our primary business service, supporting organizations with their recruitment and staffing requirements. We work to understand role requirements and help connect organizations with suitable talent."],
  ["Security Services", "Professional security support for residential, commercial and business premises, based on the security requirements of the client and property."],
  ["Facility Management", "Operational and facility support services focused on the day-to-day upkeep, maintenance coordination and overall support of different types of premises."],
  ["IT Solutions", "Technology and digital solutions designed around business, operational and technology requirements, helping organizations address their evolving digital needs."],
  ["Real Estate Services", "Professional real estate support for property owners, occupiers and investors, covering property-related requirements and assistance."],
] as const;

const credentials = [
  ["Legal Name", "JAYDEV ASSOCIATES LLP"],
  ["Entity Type", "Limited Liability Partnership"],
  ["LLPIN", "ACV-7448"],
  ["Date of Incorporation", "25 February 2026"],
  ["Registration Authority", "Ministry of Corporate Affairs, Government of India"],
  ["Governing Law", "Limited Liability Partnership Act, 2008"],
  ["Udyam Registration No.", "UDYAM-MH-27-0251675"],
  ["Enterprise Type", "Micro"],
  ["Major Activity", "Services"],
  ["Registered Office", "488, C/O Jaydev Associates LLP, Near SBI Bank, A/P Goregaon, Tal. Mangaon, Raigad, Maharashtra – 402103, India"],
] as const;

const certificates = [
  { title: "MCA Certificate of Incorporation", classification: "Legal / Corporate Registration", subtitle: "JAYDEV ASSOCIATES LLP", details: ["LLPIN: ACV-7448", "Date of Incorporation: 25 February 2026", "Issued by: Ministry of Corporate Affairs, Government of India"], image: mcaPreview.url, document: mcaDocument.url, redacted: true },
  { title: "Udyam Registration Certificate", classification: "MSME / Enterprise Registration", subtitle: "JAYDEV ASSOCIATES LLP", details: ["Udyam Registration No.: UDYAM-MH-27-0251675", "Enterprise Type: Micro", "Major Activity: Services"], image: udyamPreview.url, document: udyamDocument.url, redacted: true },
  { title: "ISO 9001:2015 Certification", classification: "Quality Management System Certification", subtitle: "QUALITY MANAGEMENT SYSTEM", details: ["ISO 9001:2015", "Certificate No.: 3D986500", "Certified Since: 18 March 2026", "Valid Until: 17 March 2029"], scope: "Certified scope includes Recruitment & Consultancy, Real Estate Advisory, Integrated Facility Management and IT Solutions.", image: isoPreview.url, document: isoDocument.url, redacted: false },
] as const;

function Heading({ eyebrow, title, description }: { eyebrow?: string; title: string; description?: string }) {
  return <div className="max-w-3xl">
    {eyebrow && <p className="eyebrow">{eyebrow}</p>}
    <h2 className="mt-3 font-display text-3xl font-bold text-foreground md:text-4xl">{title}</h2>
    {description && <p className="mt-5 text-base leading-8 text-muted-foreground">{description}</p>}
    <div className="gold-rule mt-6" />
  </div>;
}

function CertificateCard({ certificate }: { certificate: typeof certificates[number] }) {
  const imageDescription = certificate.redacted ? " — redacted website copy" : "";

  return <article className="group flex h-full flex-col overflow-hidden rounded-md border border-border bg-card shadow-card transition-[border-color,transform,box-shadow] duration-300 hover:-translate-y-1 hover:border-gold/50 hover:shadow-gold">
    <div className="relative flex h-72 items-center justify-center overflow-hidden border-b border-border bg-secondary p-5 md:h-80">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-gold opacity-70" />
      <img src={certificate.image} alt={`${certificate.title}${imageDescription}`} loading="lazy" className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-[1.02]" />
    </div>
    <div className="flex flex-1 flex-col p-6 md:p-7">
      <div className="flex items-start justify-between gap-4">
        <FileText className="size-6 shrink-0 text-gold" aria-hidden="true" />
        <span className="rounded-sm border border-gold/30 bg-accent px-2.5 py-1 text-right text-[10px] font-bold uppercase leading-4 text-gold-deep">{certificate.classification}</span>
      </div>
      <h3 className="mt-4 font-display text-xl font-semibold text-card-foreground">{certificate.title}</h3>
      <p className="mt-1 text-xs font-semibold uppercase text-gold-deep">{certificate.subtitle}</p>
      <ul className="mt-5 space-y-2 border-t border-border pt-5 text-sm leading-6 text-muted-foreground">{certificate.details.map(detail => <li key={detail}>{detail}</li>)}</ul>
      {"scope" in certificate && <p className="mt-4 text-sm leading-6 text-muted-foreground">{certificate.scope}</p>}
      {certificate.redacted && <p className="mt-5 text-xs text-muted-foreground">Redacted copy for website display.</p>}
      <Dialog>
        <DialogTrigger asChild><Button className="mt-auto w-full">View Certificate <ExternalLink /></Button></DialogTrigger>
        <DialogContent className="flex max-h-[90dvh] w-[95vw] max-w-5xl flex-col overflow-hidden rounded-md p-4 sm:p-6">
          <DialogHeader className="pr-8"><DialogTitle>{certificate.title}</DialogTitle><DialogDescription>{certificate.redacted ? "Redacted copy for website display." : certificate.classification}</DialogDescription></DialogHeader>
          <div className="min-h-0 overflow-auto bg-secondary p-2">
            <img src={certificate.image} alt={`${certificate.title}${imageDescription}`} className="mx-auto max-h-[70dvh] max-w-full object-contain" />
          </div>
          <a href={certificate.document} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 self-start text-sm font-medium text-gold-deep hover:underline"><Download className="size-4" /> Open {certificate.redacted ? "redacted " : ""}PDF</a>
        </DialogContent>
      </Dialog>
    </div>
  </article>;
}

function AboutPage() {
  return <PublicShell>
    <section className="surface-dark relative isolate overflow-hidden bg-background">
      <img src={aboutBackdrop} alt="" aria-hidden="true" className="absolute inset-0 size-full object-cover object-center opacity-20" />
      <div className="absolute inset-0 bg-gradient-ink opacity-90" aria-hidden="true" />
      <div className="absolute inset-y-0 right-0 hidden w-1/3 border-l border-gold/10 bg-background/25 lg:block" aria-hidden="true" />
      <div className="container-x relative py-16 md:py-24 lg:py-28">
        <div className="max-w-4xl border-l border-gold/60 pl-5 md:pl-8">
          <p className="eyebrow">About Jaydev Associates</p>
          <h1 className="mt-4 max-w-4xl font-display text-4xl font-bold leading-tight text-foreground md:text-6xl">Your Growth, Our Commitment</h1>
          <div className="mt-7 max-w-3xl space-y-5 text-base leading-8 text-muted-foreground md:text-lg">
          <p>Jaydev Associates LLP is a Maharashtra-based multi-domain professional services organization providing dependable solutions across Recruitment, Security, Facility Management, IT Solutions and Real Estate Services.</p>
          <p>Our primary focus is Recruitment Solutions, where we support organizations with their hiring and staffing requirements. Alongside recruitment, our other service areas enable us to support businesses, organizations, property owners and investors with a range of professional and operational requirements.</p>
          </div>
          <div className="gold-rule mt-9" />
        </div>
      </div>
    </section>

    <Section>
      <div className="grid items-center gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:gap-20">
        <div><Heading title="Who We Are" />
          <div className="mt-8 space-y-5 leading-8 text-muted-foreground">
            <p>Jaydev Associates LLP is a professionally managed Limited Liability Partnership established with the objective of providing reliable, professional and practical services across multiple business domains.</p>
            <p>Our approach is centered around understanding the specific needs of our clients and bringing together the right people, processes and resources to address those requirements effectively.</p>
            <p>With Recruitment as our primary business focus, we work to connect organizations with suitable talent while also providing services in Security, Facility Management, IT Solutions and Real Estate.</p>
            <p>Our goal is to be a dependable service partner for businesses and individuals by maintaining professional standards, clear communication and a commitment to delivering solutions suited to each requirement.</p>
          </div>
        </div>
        <div className="surface-dark relative flex min-h-80 flex-col justify-end overflow-hidden border border-border bg-background p-8 md:min-h-96 md:p-10">
          <span className="absolute left-8 top-8 font-display text-7xl font-bold text-gold/15 md:text-9xl" aria-hidden="true">JA</span>
          <div className="relative"><p className="eyebrow">Our focus</p><p className="mt-5 max-w-xs font-display text-2xl font-semibold leading-snug text-foreground md:text-3xl">People. Process. Purpose.</p><p className="mt-4 max-w-xs leading-7 text-muted-foreground">Professional solutions shaped around every requirement.</p><div className="gold-rule mt-7" /></div>
        </div>
      </div>
    </Section>

    <Section dark className="relative overflow-hidden border-y border-border">
      <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-[38%] border-r border-gold/10 bg-secondary/20 lg:block" aria-hidden="true" />
      <div className="relative grid items-center gap-12 md:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] md:gap-14 lg:gap-24">
        <div className="relative mx-auto w-full max-w-md md:mx-0">
          <div className="absolute -left-3 -top-3 size-20 border-l border-t border-gold/70 md:-left-5 md:-top-5 md:size-28" aria-hidden="true" />
          <div className="absolute -bottom-3 -right-3 size-20 border-b border-r border-gold/40 md:-bottom-5 md:-right-5 md:size-28" aria-hidden="true" />
          <div className="relative overflow-hidden rounded-sm border border-gold/30 bg-card shadow-gold">
            <img src={founder.url} alt="Jay Doshi, Founder of Jaydev Associates LLP" className="aspect-[4/5] w-full object-cover object-top" loading="lazy" />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background via-background/75 to-transparent px-6 pb-6 pt-20 md:px-8 md:pb-8">
              <p className="font-display text-2xl font-semibold text-foreground">Jay Doshi</p>
              <p className="mt-1 text-sm font-medium text-gold">Founder, Jaydev Associates LLP</p>
            </div>
          </div>
        </div>
        <div className="min-w-0">
          <Heading eyebrow="Leadership" title="Meet Our Founder" />
          <div className="mt-8 grid gap-5 text-base leading-8 text-muted-foreground lg:grid-cols-2 lg:gap-x-8">
            <p>Jay Doshi is the Founder of Jaydev Associates LLP and leads the organization with a focus on business development, professional service delivery and long-term client relationships.</p>
            <p>With an emphasis on understanding client requirements and providing practical solutions, he guides the development of Jaydev Associates as a multi-domain professional services organization.</p>
            <p className="lg:col-span-2">Under his leadership, the organization focuses primarily on Recruitment Solutions, while developing capabilities across Security, Facility Management, IT Solutions and Real Estate Services.</p>
          </div>
          <div className="mt-9 border-l-2 border-gold bg-secondary/40 px-5 py-5 md:px-7">
            <p className="font-display text-lg font-medium leading-7 text-gold-soft md:text-xl">Leadership with a focus on service, professionalism and long-term relationships.</p>
          </div>
        </div>
      </div>
    </Section>

    <Section><div className="grid gap-5 md:grid-cols-2">
      <article className="rounded-md border border-border bg-card p-7 md:p-10"><h2 className="font-display text-2xl font-semibold text-card-foreground">Our Vision</h2><div className="gold-rule mt-5" /><p className="mt-5 text-base leading-8 text-muted-foreground">To build a trusted multi-domain organization recognized for professional service, reliable solutions and long-term value for our clients.</p></article>
      <article className="rounded-md border border-border bg-card p-7 md:p-10"><h2 className="font-display text-2xl font-semibold text-card-foreground">Our Mission</h2><div className="gold-rule mt-5" /><p className="mt-5 text-base leading-8 text-muted-foreground">To understand our clients' requirements and deliver practical, responsive and quality-driven solutions through professional execution, responsible business practices and consistent service.</p></article>
    </div></Section>

    <Section dark><Heading title="Our Approach" description="Understanding the requirement. Building the right solution. Delivering with accountability." />
      <div className="mt-12 grid gap-8 md:grid-cols-3 md:gap-10">{[
        ["01", "Understand", "We begin by understanding the client's requirements, priorities and operational needs."],
        ["02", "Build", "We identify the appropriate people, processes and resources required to address the requirement effectively."],
        ["03", "Deliver", "We focus on professional execution, clear communication and dependable service throughout the engagement."],
      ].map(([number, title, text]) => <div key={number} className="border-t border-gold/60 pt-6"><span className="font-display text-3xl font-bold text-gold">{number}</span><h3 className="mt-6 font-display text-xl font-semibold uppercase text-foreground">{title}</h3><p className="mt-3 leading-7 text-muted-foreground">{text}</p></div>)}</div>
      <p className="mt-12 font-display text-xl font-semibold text-gold">Understand. Build. Deliver.</p>
    </Section>

    <Section><Heading title="What We Do" description="Our services are designed to support businesses, organizations and property-related requirements across multiple domains." />
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{services.map(([name, description], index) => <article key={name} className="rounded-md border border-border bg-card p-6 md:p-8"><span className="text-sm font-semibold text-gold-deep">0{index + 1}</span><h3 className="mt-5 font-display text-xl font-semibold text-card-foreground">{name}</h3><p className="mt-4 leading-7 text-muted-foreground">{description}</p></article>)}</div>
      <Button asChild className="mt-9"><Link to="/services">Explore Our Services <ArrowRight /></Link></Button>
    </Section>

    <Section dark><Heading eyebrow="Company Information" title="Our Company Credentials" description="Jaydev Associates LLP is a registered Limited Liability Partnership operating in the services sector." />
      <dl className="mt-10 grid border-t border-border md:grid-cols-2">{credentials.map(([label, value]) => <div key={label} className="min-w-0 border-b border-border py-5 md:pr-12"><dt className="text-xs font-semibold uppercase text-gold">{label}</dt><dd className="mt-2 break-words leading-7 text-foreground">{value}</dd></div>)}</dl>
    </Section>

    <Section className="relative overflow-hidden border-y border-border bg-secondary/40"><div className="absolute inset-x-0 top-0 h-px bg-gradient-gold opacity-60" aria-hidden="true" /><Heading eyebrow="Official Registrations & Certifications" title="Our Official Registrations & Certifications" description="Our official registrations and certifications reflect the legal identity, business registration and quality management framework of Jaydev Associates LLP." />
      <div className="mt-12 grid items-stretch gap-6 md:grid-cols-2 xl:grid-cols-3">{certificates.map(certificate => <CertificateCard key={certificate.title} certificate={certificate} />)}</div>
    </Section>

    <Section dark><Heading title="Why Jaydev Associates" />
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[
        ["Professional Approach", "We focus on understanding requirements clearly and providing structured, practical solutions."],
        ["Multi-Domain Capabilities", "Our services cover recruitment, security, facility management, IT solutions and real estate requirements."],
        ["Responsive Support", "We value clear communication and timely coordination throughout our engagements."],
        ["Long-Term Relationships", "We aim to build lasting professional relationships through dependable service, transparency and consistent support."],
      ].map(([title, description]) => <article key={title} className="rounded-md border border-border bg-card p-6"><div className="gold-rule" /><h3 className="mt-6 font-display text-lg font-semibold text-card-foreground">{title}</h3><p className="mt-4 text-sm leading-7 text-muted-foreground">{description}</p></article>)}</div>
    </Section>

    <Section dark className="border-t border-border"><Heading title="Our Commitment" />
      <div className="mt-8 max-w-3xl space-y-5 text-lg leading-8 text-muted-foreground"><p>At Jaydev Associates, we believe that successful service begins with understanding the requirement and continues through professional execution and dependable support.</p><p>Whether you are looking for the right talent, operational support, technology solutions, security services, facility management or real estate assistance, we are committed to understanding your requirement and working towards a suitable solution.</p></div>
    </Section>

    <Section><div className="max-w-3xl"><Heading title="Let's Work Together" description="Have a requirement? Tell us what you need and our team will get in touch to understand your requirement and discuss the appropriate solution." /><div className="mt-8 flex flex-wrap gap-3"><Button asChild size="lg"><Link to="/contact">Contact Us <ArrowRight /></Link></Button><Button asChild size="lg" variant="outline"><Link to="/services">Explore Our Services</Link></Button></div></div></Section>
  </PublicShell>;
}