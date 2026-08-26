export function formatDate(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export function formatDateTime(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function relativeDate(value?: string | null) {
  if (!value) return "—";
  const then = new Date(value).getTime();
  if (Number.isNaN(then)) return "—";
  const days = Math.floor((Date.now() - then) / 86400000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} days ago`;
  return formatDate(value);
}

const inr = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

export function formatSalary(min?: number | null, max?: number | null, visible = true) {
  if (!visible) return "Not disclosed";
  if (min == null && max == null) return "Not disclosed";
  if (min != null && max != null) return `₹${inr.format(min)} – ₹${inr.format(max)}`;
  return `₹${inr.format((min ?? max) as number)}`;
}

export function formatMoney(value?: number | null) {
  if (value == null) return "—";
  return `₹${inr.format(value)}`;
}

export function formatExperience(min?: number | null, max?: number | null) {
  const lo = min ?? 0;
  if (max == null) return lo === 0 ? "Fresher welcome" : `${lo}+ years`;
  if (lo === 0 && max === 0) return "Fresher";
  return `${lo} – ${max} years`;
}

export function jobLocation(job: { city?: string | null; state?: string | null }) {
  return [job.city, job.state].filter(Boolean).join(", ") || "Location on request";
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

export function initials(name?: string | null) {
  if (!name) return "JA";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function toCsv(rows: Record<string, unknown>[]) {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]!);
  const escape = (v: unknown) => {
    const s = v == null ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [headers.join(","), ...rows.map((r) => headers.map((h) => escape(r[h])).join(","))].join(
    "\n",
  );
}

export function downloadCsv(filename: string, rows: Record<string, unknown>[]) {
  const blob = new Blob([toCsv(rows)], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
