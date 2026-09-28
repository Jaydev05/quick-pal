import { Link } from "@tanstack/react-router";
import { Instagram, Linkedin, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { COMPANY, SERVICES, whatsappLink } from "@/lib/site";

export function Footer() {
  return (
    <footer className="surface-dark border-t border-border bg-background text-foreground">
      <div className="container-x grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Logo height={44} />
          <p className="mt-4 font-display text-sm font-semibold text-foreground">JAYDEV ASSOCIATES LLP</p>
          <p className="mt-4 max-w-sm text-sm text-muted-foreground">{COMPANY.tagline}</p>
          <div className="gold-rule mt-5" />
          <div className="mt-5 space-y-2 text-sm text-muted-foreground">
            <p className="flex items-start gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0 text-gold" />
              <span>488, C/O Jaydev Associates LLP, Near SBI Bank, A/P Goregaon, Tal. Mangaon, Raigad, Maharashtra – 402103, India</span>
            </p>
            <p className="flex items-center gap-2">
              <Phone className="size-4 shrink-0 text-gold" />
              <span className="flex items-center gap-3">
                <a href={COMPANY.phoneHref} className="hover:text-foreground">
                  {COMPANY.phone}
                </a>
                <span className="text-border" aria-hidden="true">|</span>
                <a href="tel:+919322021991" className="hover:text-foreground">+91 9322021991</a>
              </span>
            </p>
            <p className="flex items-center gap-2">
              <Mail className="size-4 shrink-0 text-gold" />
              <a href="mailto:info@jaydevassociates.com" className="hover:text-foreground">
                info@jaydevassociates.com
              </a>
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href={COMPANY.instagram}
                target="_blank"
                rel="noreferrer noopener"
                aria-label="Jaydev Associates on Instagram"
                className="flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-gold hover:text-gold"
              >
                <Instagram className="size-4" />
              </a>
              <a
                href={COMPANY.linkedin}
                target="_blank"
                rel="noreferrer noopener"
                aria-label="Jaydev Associates on LinkedIn"
                className="flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-gold hover:text-gold"
              >
                <Linkedin className="size-4" />
              </a>
              <a
                href={whatsappLink("Hello Jaydev Associates, I would like to know more.")}
                target="_blank"
                rel="noreferrer noopener"
                aria-label="Chat with Jaydev Associates on WhatsApp"
                className="flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-gold hover:text-gold"
              >
                <MessageCircle className="size-4" />
              </a>
            </div>
          </div>
        </div>

        <nav aria-label="Site">
          <h3 className="font-display text-sm font-semibold tracking-wide text-foreground">
            Navigate
          </h3>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/" className="hover:text-gold">
                Home
              </Link>
            </li>
            <li>
              <Link to="/jobs" className="hover:text-gold">
                Jobs
              </Link>
            </li>
            <li>
              <Link to="/services" className="hover:text-gold">
                Services
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-gold">
                About
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-gold">
                Contact
              </Link>
            </li>
          </ul>
        </nav>

        <nav aria-label="Services">
          <h3 className="font-display text-sm font-semibold tracking-wide text-foreground">
            Services
          </h3>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            {SERVICES.map((s) => (
              <li key={s.slug}>
                <Link to="/services" hash={s.slug} className="hover:text-gold">
                  {s.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Portal">
          <h3 className="font-display text-sm font-semibold tracking-wide text-foreground">
            Portal
          </h3>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/login" className="hover:text-gold">
                Candidate Login
              </Link>
            </li>
            <li>
              <Link to="/login" className="hover:text-gold">
                Create Account
              </Link>
            </li>


            <li>
              <Link to="/dashboard/applications" className="hover:text-gold">
                My Applications
              </Link>
            </li>
            <li>
              <Link to="/dashboard/saved" className="hover:text-gold">
                Saved Jobs
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      <div className="border-t border-border">
        <div className="container-x flex flex-col gap-2 py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {COMPANY.name}. All rights reserved.
          </p>
          <p>{COMPANY.tagline}</p>
        </div>
      </div>
    </footer>
  );
}
