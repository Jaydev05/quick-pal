import type { JobWithCategory } from "./api";
import { OPEN_JOB_STATUSES } from "./status";

export const PUBLIC_SITE_URL = "https://jaydevassociates.com";
export function publicJobUrl(slug: string) { return `${PUBLIC_SITE_URL}/jobs/${encodeURIComponent(slug)}`; }
export function jobAcceptsSearchApplications(job: Pick<JobWithCategory, "status" | "is_public" | "accepting_applications" | "deadline">, now = Date.now()) {
  return job.is_public && OPEN_JOB_STATUSES.includes(job.status) && job.accepting_applications && (!job.deadline || new Date(job.deadline).getTime() >= now - 86400000);
}
function plain(value: string) { return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim(); }
const escape = (value: string) => value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] ?? c);
export function jobSearchMetadata(job: JobWithCategory) {
  const location = [job.city, job.state].filter(Boolean).join(", ");
  const title = `${job.title}${location ? ` in ${location}` : ""} | Jaydev Associates`;
  const details = [plain(job.description), job.skills.length ? `Skills: ${job.skills.join(", ")}.` : ""].filter(Boolean).join(" ");
  const description = plain(`${job.title}${location ? ` in ${location}` : ""}. ${details}`).slice(0, 180);
  return { title, description, url: publicJobUrl(job.slug) };
}
export function jobPostingSchema(job: JobWithCategory, now = Date.now()) {
  // Do not advertise expired roles, infer salary periods, or invent employers or locations.
  if (!jobAcceptsSearchApplications(job, now) || !job.title.trim() || !job.description.trim() || !job.country?.trim() || !job.city?.trim() || !job.client_name?.trim() || Number.isNaN(Date.parse(job.created_at))) return null;
  const sections = [
    ["Job description", job.description], ["Responsibilities", job.responsibilities],
    ["Qualifications", job.qualifications], ["Benefits", job.benefits], ["Additional information", job.additional_info],
  ].filter((section) => section[1]).map(([heading, body]) => `<h2>${escape(heading ?? "")}</h2><p>${escape(body ?? "").replace(/\n/g, "<br>")}</p>`).join("");
  const employment = { full_time: "FULL_TIME", part_time: "PART_TIME", contract: "CONTRACTOR", temporary: "TEMPORARY", internship: "INTERN" };
  return {
    "@context": "https://schema.org", "@type": "JobPosting", title: job.title,
    description: sections, datePosted: job.created_at,
    ...(job.deadline ? { validThrough: `${job.deadline}T23:59:59+05:30` } : {}),
    employmentType: employment[job.employment_type],
    identifier: { "@type": "PropertyValue", name: "Jaydev Associates", value: job.job_code },
    hiringOrganization: { "@type": "Organization", name: job.client_name },
    jobLocation: { "@type": "Place", address: { "@type": "PostalAddress", addressLocality: job.city, ...(job.state ? { addressRegion: job.state } : {}), addressCountry: job.country } },
    url: publicJobUrl(job.slug),
    ...(job.skills.length ? { skills: job.skills.join(", ") } : {}),
    ...(job.education ? { educationRequirements: job.education } : {}),
    ...(job.qualifications ? { qualifications: job.qualifications } : {}),
    ...(job.responsibilities ? { responsibilities: job.responsibilities } : {}),
  };
}
export function jobBreadcrumbSchema(job: JobWithCategory) {
  return { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
    { "@type": "ListItem", position: 1, name: "Jaydev Associates", item: PUBLIC_SITE_URL },
    { "@type": "ListItem", position: 2, name: "Jobs", item: `${PUBLIC_SITE_URL}/jobs` },
    { "@type": "ListItem", position: 3, name: job.title, item: publicJobUrl(job.slug) },
  ] };
}
export function safeJsonLd(value: unknown) { return JSON.stringify(value).replace(/</g, "\\u003c"); }