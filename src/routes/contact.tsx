import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { Instagram, Mail, MapPin, Phone, Clock, Send } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { PublicShell } from "@/components/layout/PublicShell";
import { Section, SectionHeading } from "@/components/home/Section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { COMPANY, ENQUIRY_SERVICES, whatsappLink } from "@/lib/site";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Jaydev Associates | Mangaon, Raigad" },
      {
        name: "description",
        content:
          "Call +91 7744975512, email jaydevassociates25@gmail.com or send an enquiry to Jaydev Associates, Old Bazar Peth, Goregaon, Mangaon, Raigad.",
      },
      { property: "og:title", content: "Contact Jaydev Associates" },
      {
        property: "og:description",
        content: "Reach our team for recruitment, security, facility, IT or property enquiries.",
      },
    ],
  }),
  component: ContactPage,
});

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(100),
  email: z.string().trim().email("Enter a valid email").max(255),
  phone: z.string().trim().min(8, "Enter a valid phone number").max(20),
  company: z.string().trim().max(120).optional(),
  service: z.string().min(1, "Select a service"),
  message: z.string().trim().min(10, "Please add a few details").max(1500),
});

function ContactPage() {
  const [service, setService] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof schema>) => {
      const { error } = await supabase.from("service_enquiries").insert({
        name: values.name,
        email: values.email,
        phone: values.phone,
        company: values.company || null,
        service: values.service,
        message: values.message,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Enquiry sent. Our team will contact you shortly.");
      setService("");
      setErrors({});
    },
    onError: (e: Error) => toast.error(e.message || "Could not send your enquiry"),
  });

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fd = new FormData(form);
    const parsed = schema.safeParse({
      name: fd.get("name"),
      email: fd.get("email"),
      phone: fd.get("phone"),
      company: fd.get("company") || undefined,
      service,
      message: fd.get("message"),
    });
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) next[String(issue.path[0])] = issue.message;
      setErrors(next);
      return;
    }
    setErrors({});
    mutation.mutate(parsed.data, { onSuccess: () => form.reset() });
  }

  return (
    <PublicShell>
      <Section dark className="py-16 md:py-20">
        <SectionHeading
          align="left"
          eyebrow="Contact"
          title="Let's discuss your requirement"
          description="Send an enquiry and our team will respond during business hours."
        />
      </Section>

      <Section>
        <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr]">
          <form
            onSubmit={onSubmit}
            className="rounded-xl border border-border bg-card p-6 shadow-card md:p-8"
            noValidate
          >
            <h2 className="font-display text-xl font-semibold text-card-foreground">
              Enquiry form
            </h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <Field label="Full name" name="name" error={errors["name"]} required />
              <Field
                label="Email"
                name="email"
                type="email"
                error={errors["email"]}
                required
              />
              <Field label="Phone" name="phone" error={errors["phone"]} required />
              <Field label="Company (optional)" name="company" error={errors["company"]} />
              <div className="sm:col-span-2">
                <Label htmlFor="service">Service required *</Label>
                <Select value={service} onValueChange={setService}>
                  <SelectTrigger id="service" className="mt-2">
                    <SelectValue placeholder="Select a service" />
                  </SelectTrigger>
                  <SelectContent>
                    {ENQUIRY_SERVICES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors["service"] && (
                  <p className="mt-1.5 text-xs text-destructive">{errors["service"]}</p>
                )}
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  name="message"
                  rows={5}
                  className="mt-2"
                  maxLength={1500}
                  placeholder="Tell us about your requirement"
                />
                {errors["message"] && (
                  <p className="mt-1.5 text-xs text-destructive">{errors["message"]}</p>
                )}
              </div>
            </div>
            <Button type="submit" className="mt-6" disabled={mutation.isPending}>
              <Send /> {mutation.isPending ? "Sending…" : "Send Enquiry"}
            </Button>
          </form>

          <div className="space-y-4">
            <InfoCard icon={<MapPin className="size-5 text-gold" />} title="Office address">
              {COMPANY.addressLines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </InfoCard>
            <InfoCard icon={<Phone className="size-5 text-gold" />} title="Phone">
              <a href={COMPANY.phoneHref} className="hover:text-gold">
                {COMPANY.phone}
              </a>
              <a
                href={whatsappLink("Hello Jaydev Associates, I have an enquiry.")}
                target="_blank"
                rel="noreferrer noopener"
                className="mt-1 block hover:text-gold"
              >
                Chat on WhatsApp
              </a>
            </InfoCard>
            <InfoCard icon={<Mail className="size-5 text-gold" />} title="Email">
              <a href={COMPANY.emailHref} className="break-all hover:text-gold">
                {COMPANY.email}
              </a>
            </InfoCard>
            <InfoCard icon={<Clock className="size-5 text-gold" />} title="Business hours">
              {COMPANY.hours.map((h) => (
                <span key={h.days} className="block">
                  {h.days}: {h.time}
                </span>
              ))}
            </InfoCard>
            <InfoCard icon={<Instagram className="size-5 text-gold" />} title="Instagram">
              <a
                href={COMPANY.instagram}
                target="_blank"
                rel="noreferrer noopener"
                className="hover:text-gold"
              >
                @jaydev.associates
              </a>
            </InfoCard>
            <div className="overflow-hidden rounded-xl border border-border">
              <iframe
                title="Jaydev Associates location"
                src="https://www.google.com/maps?q=Old%20Bazar%20Peth%20Goregaon%20Mangaon%20Raigad%20Maharashtra%20402103&output=embed"
                className="h-64 w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </Section>
    </PublicShell>
  );
}

function Field({
  label,
  name,
  type = "text",
  error,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  error?: string;
  required?: boolean;
}) {
  return (
    <div>
      <Label htmlFor={name}>
        {label} {required && "*"}
      </Label>
      <Input id={name} name={name} type={type} className="mt-2" maxLength={255} />
      {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
    </div>
  );
}

function InfoCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center gap-2">
        {icon}
        <h3 className="font-display text-sm font-semibold text-card-foreground">{title}</h3>
      </div>
      <div className="mt-2 text-sm text-muted-foreground">{children}</div>
    </div>
  );
}
