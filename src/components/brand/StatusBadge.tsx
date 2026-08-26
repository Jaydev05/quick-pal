import { cn } from "@/lib/utils";
import {
  APPLICATION_STATUS,
  ENQUIRY_STATUS,
  JOB_STATUS,
  PAYMENT_STATUS,
  toneClass,
  type ApplicationStatus,
  type EnquiryStatus,
  type JobStatus,
  type PaymentStatus,
} from "@/lib/status";

function Pill({ label, tone, className }: { label: string; tone: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap",
        tone,
        className,
      )}
    >
      {label}
    </span>
  );
}

export function JobStatusBadge({
  status,
  publicLabel = true,
  className,
}: {
  status: JobStatus;
  publicLabel?: boolean;
  className?: string;
}) {
  const meta = JOB_STATUS[status];
  return (
    <Pill
      label={publicLabel ? meta.public : meta.label}
      tone={toneClass[meta.tone]}
      className={className}
    />
  );
}

export function ApplicationStatusBadge({
  status,
  className,
}: {
  status: ApplicationStatus;
  className?: string;
}) {
  const meta = APPLICATION_STATUS[status];
  return <Pill label={meta.label} tone={toneClass[meta.tone]} className={className} />;
}

export function PaymentStatusBadge({
  status,
  className,
}: {
  status: PaymentStatus;
  className?: string;
}) {
  const meta = PAYMENT_STATUS[status];
  return <Pill label={meta.label} tone={toneClass[meta.tone]} className={className} />;
}

export function EnquiryStatusBadge({
  status,
  className,
}: {
  status: EnquiryStatus;
  className?: string;
}) {
  const meta = ENQUIRY_STATUS[status];
  return <Pill label={meta.label} tone={toneClass[meta.tone]} className={className} />;
}
