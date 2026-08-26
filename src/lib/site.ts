export const COMPANY = {
  name: "Jaydev Associates",
  tagline: "Your Growth, Our Commitment",
  phone: "+91 7744975512",
  phoneHref: "tel:+917744975512",
  whatsappNumber: "917744975512",
  email: "jaydevassociates25@gmail.com",
  emailHref: "mailto:jaydevassociates25@gmail.com",
  addressLines: [
    "489, Near SBI Bank,",
    "Old Bazar Peth, Goregaon,",
    "Mangaon, Raigad,",
    "Maharashtra – 402103",
  ],
  hours: [
    { days: "Monday – Friday", time: "9:00 AM – 7:00 PM" },
    { days: "Saturday", time: "9:00 AM – 6:00 PM" },
    { days: "Sunday", time: "Closed" },
  ],
  instagram: "https://www.instagram.com/jaydev.associates/",
} as const;

export function whatsappLink(message: string) {
  return `https://wa.me/${COMPANY.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export const SERVICES = [
  {
    slug: "recruitment",
    name: "Recruitment Solutions",
    short: "Our primary business — end-to-end hiring and staffing support.",
    cta: "Explore Job Opportunities",
    points: [
      "Recruitment",
      "Staffing",
      "Skilled manpower",
      "Workforce requirements",
      "IT recruitment",
      "Healthcare recruitment",
      "Manufacturing recruitment",
      "Professional-sector recruitment",
    ],
  },
  {
    slug: "security",
    name: "Security Services",
    short: "Trained security personnel for premises of every scale.",
    cta: "Request Security Services",
    points: [
      "Security personnel",
      "Security support",
      "Hospital security",
      "Residential security",
      "Commercial security",
      "Retail security",
      "Business premises security",
    ],
  },
  {
    slug: "facility-management",
    name: "Facility Management",
    short: "Day-to-day upkeep and hospitality support for your premises.",
    cta: "Request Facility Services",
    points: [
      "Housekeeping",
      "Hospitality services",
      "Canteen management",
      "Gardening",
      "General facility support",
    ],
  },
  {
    slug: "it-solutions",
    name: "IT Solutions",
    short: "Technology that secures and monitors your operations.",
    cta: "Discuss IT Solutions",
    points: [
      "CCTV systems",
      "Access control",
      "Attendance management",
      "Tracking solutions",
      "Security monitoring technology",
    ],
  },
  {
    slug: "real-estate",
    name: "Real Estate Services",
    short: "Property support for owners, occupiers and investors.",
    cta: "Discuss Property Requirements",
    points: [
      "Property management",
      "Property leasing",
      "Property selling",
      "Investment consulting",
      "Real estate assistance",
    ],
  },
] as const;

export const ENQUIRY_SERVICES = [
  "Recruitment",
  "Security",
  "Facility Management",
  "IT Solutions",
  "Real Estate",
  "General Enquiry",
] as const;

export const WHY_US = [
  {
    title: "Multi-Domain Services",
    body: "Multiple business requirements through one service partner.",
  },
  {
    title: "Experienced Team",
    body: "Professional expertise and experienced personnel.",
  },
  {
    title: "24/7 Availability",
    body: "Round-the-clock availability where operational requirements demand it.",
  },
  {
    title: "Comprehensive Solutions",
    body: "End-to-end professional solutions.",
  },
  {
    title: "Client-Focused Approach",
    body: "Solutions designed around individual requirements.",
  },
  {
    title: "Operational Excellence",
    body: "Focus on efficiency, security, manpower, facilities, technology, and property requirements.",
  },
] as const;

export const INDUSTRIES = [
  "IT Companies",
  "Healthcare",
  "Manufacturing",
  "Commercial Businesses",
  "Retail",
  "Residential Properties",
  "Offices",
  "Business Premises",
  "Facility Management Requirements",
  "Security Requirements",
  "Recruitment Requirements",
  "Property Owners",
  "Property Investors",
] as const;
