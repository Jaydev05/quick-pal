import { Phone } from "lucide-react";
import { COMPANY, whatsappLink } from "@/lib/site";

export function FloatingContact() {
  return (
    <div className="fixed right-4 bottom-4 z-40 flex flex-col gap-2 md:right-6 md:bottom-6">
      <a
        href={whatsappLink("Hello Jaydev Associates, I would like to know more.")}
        target="_blank"
        rel="noreferrer noopener"
        aria-label="Chat on WhatsApp"
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
