import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Award,
  BookOpenCheck,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  Clock3,
  Factory,
  Flame,
  GraduationCap,
  HardHat,
  Mail,
  MessageCircle,
  Phone,
  ShieldCheck,
  Sparkles,
  UserRoundCheck,
  UsersRound,
  Wrench,
} from "lucide-react";
import heroImage from "@/assets/courses-safety-hero.jpg";
import partnerLogo from "@/assets/training-association-logo.png.asset.json";
import { PublicShell } from "@/components/layout/PublicShell";
import { Section, SectionHeading } from "@/components/home/Section";
import { Button } from "@/components/ui/button";
import { COMPANY, whatsappLink } from "@/lib/site";

export const Route = createFileRoute("/courses")({
  head: () => ({
    meta: [
      { title: "Fire & Industrial Safety Courses | Jaydev Associates" },
      {
        name: "description",
        content:
          "Explore selected MSBTE and certification courses in Fire Safety, Industrial Safety and Safety Management through Jaydev Associates. Check eligibility, duration and enquire today.",
      },
      { property: "og:title", content: "Fire & Industrial Safety Courses | Jaydev Associates" },
      {
        property: "og:description",
        content:
          "Explore six selected MSBTE and certification courses with clear eligibility, duration and course enquiry support.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CoursesPage,
});

type Course = {
  name: string;
  category: "MSBTE" | "Certification";
  eligibility: string;
  duration: string;
  description: string;
};

const COURSES: Course[] = [
  {
    name: "Diploma in Fire Service Engineering",
    category: "MSBTE",
    eligibility: "12th / ITI",
    duration: "2 Years",
    description:
      "Develop foundational knowledge and practical understanding of fire service operations, fire prevention and safety practices.",
  },
  {
    name: "Advanced Diploma in Fire Safety Engineering",
    category: "MSBTE",
    eligibility: "Any Graduation",
    duration: "1 Year",
    description:
      "Build advanced knowledge in fire safety engineering, fire prevention, emergency preparedness and safety management.",
  },
  {
    name: "Advanced Diploma in Industrial Safety & Security Management",
    category: "MSBTE",
    eligibility: "Any Graduation",
    duration: "1 Year",
    description:
      "Develop professional knowledge in industrial safety, workplace risk management and security management practices.",
  },
  {
    name: "Advance Diploma in Industrial Safety",
    category: "MSBTE",
    eligibility: "B.E. / B.Tech. / 3 Years Diploma / B.Sc. / FR / FS / FF",
    duration: "1 Year",
    description:
      "Develop specialized knowledge in industrial safety practices, workplace hazards, risk prevention and safety management.",
  },
  {
    name: "Certificate in Fireman",
    category: "Certification",
    eligibility: "10th",
    duration: "6 Months",
    description:
      "Develop foundational knowledge and practical skills related to firefighting, fire prevention and emergency response.",
  },
  {
    name: "IOSH",
    category: "Certification",
    eligibility: "12th",
    duration: "3 Days",
    description:
      "A short-duration safety-focused certification program designed to develop awareness and understanding of workplace health and safety practices.",
  },
];

const COURSE_FEATURES = [
  { title: "Career-Oriented Safety Education", icon: GraduationCap },
  { title: "Industry-Relevant Knowledge", icon: Factory },
  { title: "Multiple Course Levels", icon: BookOpenCheck },
  { title: "Short & Long-Term Options", icon: Clock3 },
  { title: "Students & Professionals", icon: UsersRound },
  { title: "Safety Specializations", icon: ShieldCheck },
];

const AUDIENCES = [
  { title: "Students", text: "For students interested in starting a career in fire and safety.", icon: GraduationCap },
  { title: "Graduates", text: "For graduates looking to develop specialized safety qualifications.", icon: Award },
  {
    title: "Engineering & Diploma Holders",
    text: "For technical candidates interested in industrial safety careers.",
    icon: Wrench,
  },
  {
    title: "Working Professionals",
    text: "For professionals looking to upgrade their knowledge and qualifications.",
    icon: BriefcaseBusiness,
  },
  {
    title: "Safety Aspirants",
    text: "For individuals planning to build a career in fire safety, industrial safety or related fields.",
    icon: HardHat,
  },
];

const CAREER_AREAS = [
  "Fire Safety",
  "Industrial Safety",
  "Construction Safety",
  "Manufacturing",
  "Infrastructure Projects",
  "Oil & Gas",
  "Power & Utilities",
  "Facilities & Maintenance",
  "Warehousing & Logistics",
  "Safety Compliance",
];

const GUIDANCE_POINTS = [
  "Career-focused guidance",
  "Course information and eligibility assistance",
  "Application support",
  "Course selection guidance",
  "Direct enquiry assistance",
  "Professional communication and support",
];

const FAQS = [
  {
    question: "What types of courses are available?",
    answer:
      "We offer selected MSBTE and certification courses in Fire Safety, Industrial Safety and related areas.",
  },
  {
    question: "Who can apply for these courses?",
    answer:
      "Eligibility varies by course. Please check the eligibility mentioned on each course or contact Jaydev Associates for guidance.",
  },
  {
    question: "How long are the courses?",
    answer: "Course duration ranges from 3 days to 2 years depending on the program.",
  },
  {
    question: "Are these university courses?",
    answer: "The Courses page currently showcases selected MSBTE and certification programs.",
  },
  {
    question: "How can I enquire about a course?",
    answer: "You can contact Jaydev Associates on 7744975512 or email info@jaydevassociates.com.",
  },
  {
    question: "Can Jaydev Associates help with course selection?",
    answer:
      "Yes. Our team can assist you with understanding the available course options, eligibility and application process.",
  },
];

function CourseCard({ course }: { course: Course }) {
  const message = `Hello Jaydev Associates, I would like to enquire about ${course.name}.`;

  return (
    <article className="group flex h-full min-w-0 flex-col overflow-hidden rounded-lg border border-border bg-card shadow-card transition duration-300 hover:-translate-y-1 hover:border-gold/60">
      <div className="h-1 bg-gradient-gold" />
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-md bg-accent text-gold-deep">
            {course.category === "MSBTE" ? <ShieldCheck className="size-5" /> : <Award className="size-5" />}
          </span>
          <span className="rounded-full border border-gold/35 bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
            {course.category}
          </span>
        </div>
        <h3 className="mt-5 min-w-0 font-display text-xl font-bold leading-snug text-card-foreground">
          {course.name}
        </h3>
        <div className="mt-5 grid grid-cols-2 gap-3 border-y border-border py-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase text-muted-foreground">Eligibility</p>
            <p className="mt-1 break-words text-sm font-semibold text-card-foreground">{course.eligibility}</p>
          </div>
          <div className="border-l border-border pl-3">
            <p className="text-xs font-semibold uppercase text-muted-foreground">Duration</p>
            <p className="mt-1 text-lg font-bold text-gold-deep">{course.duration}</p>
          </div>
        </div>
        <p className="mt-5 flex-1 text-sm leading-6 text-muted-foreground">{course.description}</p>
        <Button asChild variant="ink" className="mt-6 w-full">
          <a href={whatsappLink(message)} target="_blank" rel="noreferrer noopener">
            Enquire Now <ArrowRight />
          </a>
        </Button>
      </div>
    </article>
  );
}

function CoursesPage() {
  const msbteCourses = COURSES.filter((course) => course.category === "MSBTE");
  const certificateCourses = COURSES.filter((course) => course.category === "Certification");

  return (
    <PublicShell>
      <section className="surface-dark relative min-h-[650px] overflow-hidden bg-background sm:min-h-[680px] lg:min-h-[720px]">
        <img
          src={heroImage}
          alt="Safety professional in an industrial fire-safety training facility"
          width={1920}
          height={1080}
          className="absolute inset-0 h-full w-full object-cover object-[68%_center] sm:object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/25" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        <div className="container-x relative flex min-h-[650px] items-center py-20 sm:min-h-[680px] lg:min-h-[720px]">
          <div className="max-w-3xl animate-rise">
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-gold/40 bg-background/75 px-4 py-2 text-xs font-semibold text-gold backdrop-blur">
                6 SELECTED COURSES
              </span>
              <span className="rounded-full border border-border bg-background/75 px-4 py-2 text-xs font-semibold text-foreground backdrop-blur">
                MSBTE & CERTIFICATION
              </span>
            </div>
            <p className="eyebrow">Professional Safety Education</p>
            <h1 className="mt-4 max-w-3xl font-display text-4xl font-bold leading-tight text-foreground sm:text-5xl lg:text-6xl">
              Build Your Career in <span className="text-gradient-gold">Fire & Industrial Safety</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg font-medium text-foreground">
              Professional Fire Safety, Industrial Safety & Certification Courses for Career Growth
            </p>
            <p className="mt-4 max-w-2xl leading-7 text-muted-foreground">
              Explore industry-focused courses designed for students, graduates and professionals looking to build a career in Fire Safety, Industrial Safety and Safety Management.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <a href="#msbte-courses">Explore Courses <ArrowRight /></a>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/contact">Enquire Now</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Section>
        <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:gap-16">
          <div>
            <p className="eyebrow">Course Access & Guidance</p>
            <h2 className="mt-3 font-display text-3xl font-bold text-foreground md:text-4xl">
              Advance Your Career with Professional Safety Courses
            </h2>
            <div className="gold-rule mt-6" />
          </div>
          <div className="space-y-5 text-base leading-8 text-muted-foreground">
            <p>
              Jaydev Associates provides access to selected professional courses in Fire Safety, Industrial Safety and Safety Management through its training association. These programs are designed to help students, graduates and working professionals develop practical knowledge and industry-relevant skills for career opportunities in safety and fire protection.
            </p>
            <p>
              Whether you are starting your career, upgrading your qualifications or looking to specialize in industrial and fire safety, these programs provide structured learning opportunities across different levels and durations.
            </p>
          </div>
        </div>
      </Section>

      <Section className="bg-muted/50">
        <SectionHeading
          eyebrow="Course Advantages"
          title="Why Choose These Courses?"
          description="Flexible learning options across fire safety, industrial safety and professional certification."
        />
        <div className="mt-10 grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {COURSE_FEATURES.map(({ title, icon: Icon }) => (
            <div key={title} className="flex items-center gap-4 bg-card p-5 sm:p-6">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-accent text-gold-deep">
                <Icon className="size-5" />
              </span>
              <h3 className="font-display text-base font-semibold text-card-foreground">{title}</h3>
            </div>
          ))}
        </div>
      </Section>

      <Section id="msbte-courses">
        <SectionHeading
          eyebrow="Four Programs"
          title="MSBTE Courses"
          description="Build professional knowledge and qualifications in Fire Safety and Industrial Safety."
        />
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {msbteCourses.map((course) => <CourseCard key={course.name} course={course} />)}
        </div>
      </Section>

      <Section dark id="certification-courses">
        <SectionHeading
          eyebrow="Focused Learning"
          title="Certification Courses"
          description="Short-duration programs for focused professional learning and certification."
        />
        <div className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-2">
          {certificateCourses.map((course) => <CourseCard key={course.name} course={course} />)}
        </div>
      </Section>

      <Section>
        <SectionHeading
          eyebrow="At A Glance"
          title="Compare All Six Courses"
          description="Review category, eligibility and duration before selecting a course for enquiry."
        />
        <div className="mt-10 hidden overflow-hidden rounded-lg border border-border shadow-card md:block">
          <table className="w-full border-collapse text-left">
            <thead className="surface-dark bg-background text-foreground">
              <tr>
                {['Course', 'Category', 'Eligibility', 'Duration'].map((heading) => (
                  <th key={heading} className="px-5 py-4 text-sm font-semibold">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card">
              {COURSES.map((course) => (
                <tr key={course.name} className="transition-colors hover:bg-muted/60">
                  <td className="px-5 py-4 font-semibold text-card-foreground">{course.name}</td>
                  <td className="px-5 py-4 text-sm text-muted-foreground">{course.category}</td>
                  <td className="px-5 py-4 text-sm text-muted-foreground">{course.eligibility}</td>
                  <td className="whitespace-nowrap px-5 py-4 font-semibold text-gold-deep">{course.duration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-8 grid gap-3 md:hidden">
          {COURSES.map((course) => (
            <article key={course.name} className="rounded-lg border border-border bg-card p-5 shadow-card">
              <div className="flex items-start justify-between gap-3">
                <h3 className="min-w-0 font-display text-base font-bold text-card-foreground">{course.name}</h3>
                <span className="shrink-0 text-sm font-bold text-gold-deep">{course.duration}</span>
              </div>
              <p className="mt-3 text-xs font-semibold uppercase text-muted-foreground">{course.category}</p>
              <p className="mt-1 break-words text-sm text-card-foreground">Eligibility: {course.eligibility}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section className="bg-muted/50">
        <SectionHeading
          eyebrow="Candidate Profiles"
          title="Who Can Explore These Courses?"
          description="Each course has its own eligibility requirements, which should always be checked before applying."
        />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {AUDIENCES.map(({ title, text, icon: Icon }) => (
            <article key={title} className="rounded-lg border border-border bg-card p-5 shadow-card">
              <Icon className="size-6 text-gold-deep" />
              <h3 className="mt-4 font-display text-lg font-bold text-card-foreground">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section dark>
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <p className="eyebrow">Career Relevance</p>
            <h2 className="mt-3 font-display text-3xl font-bold text-foreground md:text-4xl">Career Areas</h2>
            <div className="gold-rule mt-6" />
            <p className="mt-6 leading-7 text-muted-foreground">
              These qualifications may support career opportunities in areas such as fire protection, workplace safety and operational compliance. Employment or placement is not guaranteed.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {CAREER_AREAS.map((area, index) => (
              <div key={area} className="flex min-h-24 flex-col justify-between rounded-lg border border-border bg-card p-4">
                {index % 2 === 0 ? <Flame className="size-5 text-gold" /> : <Building2 className="size-5 text-gold" />}
                <p className="mt-4 text-sm font-semibold text-card-foreground">{area}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section>
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="eyebrow">Guidance From Our Team</p>
            <h2 className="mt-3 font-display text-3xl font-bold text-foreground md:text-4xl">
              Why Explore Courses Through Jaydev Associates?
            </h2>
            <div className="gold-rule mt-6" />
            <p className="mt-6 max-w-xl leading-7 text-muted-foreground">
              Speak with our team to understand the course options, eligibility and admission process.
            </p>
            <Button asChild size="lg" className="mt-7">
              <a href={whatsappLink("Hello Jaydev Associates, I would like guidance about the safety courses.")} target="_blank" rel="noreferrer noopener">
                Talk to Jaydev Associates <MessageCircle />
              </a>
            </Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {GUIDANCE_POINTS.map((point) => (
              <div key={point} className="flex items-start gap-3 rounded-lg border border-border bg-card p-4 shadow-card">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-gold-deep" />
                <p className="text-sm font-semibold text-card-foreground">{point}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section className="bg-muted/50">
        <div className="mx-auto grid max-w-4xl gap-8 rounded-lg border border-border bg-card p-6 shadow-card sm:p-8 md:grid-cols-[1fr_auto] md:items-center lg:p-10">
          <div>
            <p className="eyebrow">Partner Information</p>
            <h2 className="mt-3 font-display text-2xl font-bold text-card-foreground md:text-3xl">Training Association</h2>
            <p className="mt-4 max-w-2xl leading-7 text-muted-foreground">
              Jaydev Associates has an association with a professional training institute to facilitate selected Fire Safety, Industrial Safety and certification programs.
            </p>
            <p className="mt-5 text-sm font-semibold text-card-foreground">
              Government of India (MSME) Reg. No. MH27D0008655
            </p>
          </div>
          <div className="flex items-center justify-center border-t border-border pt-6 md:border-l md:border-t-0 md:pl-8 md:pt-0">
            <img
              src={partnerLogo.url}
              alt="Training association logo"
              width={180}
              height={180}
              loading="lazy"
              className="size-32 object-contain sm:size-36"
            />
          </div>
        </div>
      </Section>

      <Section dark>
        <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="eyebrow">Course Enquiry</p>
            <h2 className="mt-3 max-w-2xl font-display text-3xl font-bold text-foreground md:text-4xl">
              Ready to Start Your Safety Career?
            </h2>
            <p className="mt-5 max-w-2xl leading-7 text-muted-foreground">
              Contact Jaydev Associates to learn more about course eligibility, duration, admission process and available options.
            </p>
            <div className="mt-6 flex flex-col gap-3 text-sm text-foreground sm:flex-row sm:flex-wrap sm:gap-6">
              <a href="tel:+917744975512" className="flex items-center gap-2 hover:text-gold"><Phone className="size-4 text-gold" /> +91 7744975512</a>
              <a href="mailto:info@jaydevassociates.com" className="flex items-center gap-2 break-all hover:text-gold"><Mail className="size-4 shrink-0 text-gold" /> info@jaydevassociates.com</a>
              <a href="https://www.jaydevassociates.com" className="flex items-center gap-2 hover:text-gold"><Sparkles className="size-4 text-gold" /> www.jaydevassociates.com</a>
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
            <Button asChild size="lg"><a href="tel:+917744975512">Call Now <Phone /></a></Button>
            <Button asChild variant="outline" size="lg"><Link to="/contact">Send Enquiry <ArrowRight /></Link></Button>
            <Button asChild variant="ghost" size="lg"><a href="#msbte-courses">Explore Courses</a></Button>
          </div>
        </div>
      </Section>

      <Section>
        <SectionHeading eyebrow="Helpful Information" title="Frequently Asked Questions" />
        <div className="mx-auto mt-10 max-w-3xl divide-y divide-border rounded-lg border border-border bg-card px-5 shadow-card sm:px-7">
          {FAQS.map((item, index) => (
            <details key={item.question} className="group py-5" open={index === 0}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display font-semibold text-card-foreground">
                {item.question}
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-border text-gold-deep transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 pr-8 text-sm leading-6 text-muted-foreground">{item.answer}</p>
            </details>
          ))}
        </div>
      </Section>
    </PublicShell>
  );
}