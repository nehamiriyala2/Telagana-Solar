import type { PropertyType } from "./calculator";

/**
 * ─────────────────────────────────────────────────────────────
 *  PROJECTS, TESTIMONIALS, TEAM, CERTIFICATIONS
 *  Replace placeholders with REAL items only. Leave a field null
 *  and the site shows an [EDIT] marker instead of inventing data.
 *  Photos go in /public/projects/ (WebP, ~1200px wide, < 150KB).
 * ─────────────────────────────────────────────────────────────
 */
export interface Project {
  id: string;
  type: PropertyType;
  district: string;        // slug from src/data/districts.ts
  locality: string | null; // [EDIT] e.g. "Kondapur"
  kw: number | null;       // [EDIT]
  monthlySaving: number | null; // [EDIT] ₹ per month
  photo: string | null;    // [EDIT] e.g. "/projects/kondapur-5kw.webp"
  featured: boolean;
  /** Set for projects published in Admin → Projects: missing optional facts are hidden instead of showing [EDIT]. */
  fromAdmin?: boolean;
  /** Title and all photos (admin projects). */
  title?: string;
  photos?: { src: string; alt: string }[];
  /** Case study (shown in the project pop-up). Real facts only; null shows [EDIT]. */
  caseStudy?: {
    scheme: string | null;              // [EDIT] e.g. "pm-surya-ghar" (slug from src/config/schemes.ts)
    completed: string | null;           // [EDIT] e.g. "March 2026"
    challenge: { en: string; te: string } | null; // [EDIT] what the customer needed
    solution: { en: string; te: string } | null;  // [EDIT] what we installed and why
    result: { en: string; te: string } | null;    // [EDIT] bill before/after, in the customer’s words
  };
}

/** Placeholder slots: one per type in the main service areas. Replace with real projects. */
export const projects: Project[] = [
  { id: "p1", type: "home", district: "hyderabad", locality: null, kw: null, monthlySaving: null, photo: null, featured: true },
  { id: "p2", type: "farm", district: "warangal", locality: null, kw: null, monthlySaving: null, photo: null, featured: true },
  { id: "p3", type: "business", district: "ranga-reddy", locality: null, kw: null, monthlySaving: null, photo: null, featured: true },
  { id: "p4", type: "home", district: "karimnagar", locality: null, kw: null, monthlySaving: null, photo: null, featured: true },
  { id: "p5", type: "farm", district: "nizamabad", locality: null, kw: null, monthlySaving: null, photo: null, featured: false },
  { id: "p6", type: "business", district: "khammam", locality: null, kw: null, monthlySaving: null, photo: null, featured: false },
];

export interface Testimonial {
  id: string;
  name: string | null;       // [EDIT]
  place: string | null;      // [EDIT]
  type: PropertyType;
  quote: { en: string; te: string } | null; // [EDIT] real customer words only
  billBefore: number | null; // [EDIT] ₹
  billAfter: number | null;  // [EDIT] ₹
  videoUrl: string | null;   // [EDIT] YouTube embed URL, e.g. https://www.youtube-nocookie.com/embed/ID
  photo: string | null;
}

export const testimonials: Testimonial[] = [
  { id: "t1", name: null, place: null, type: "home", quote: null, billBefore: null, billAfter: null, videoUrl: null, photo: null },
  { id: "t2", name: null, place: null, type: "farm", quote: null, billBefore: null, billAfter: null, videoUrl: null, photo: null },
  { id: "t3", name: null, place: null, type: "business", quote: null, billBefore: null, billAfter: null, videoUrl: null, photo: null },
];

export interface TeamMember { name: string | null; role: { en: string; te: string } | null; photo: string | null }
export const team: TeamMember[] = [
  {
    name: "Shanmukh R",
    role: { en: "Founder & CEO", te: "ఫౌండర్ & సీఈఓ" },
    photo: "/team/shanmukh-r.webp",
  },
  {
    name: "Premsai Kilaru",
    role: { en: "Founder & CMO", te: "ఫౌండర్ & సీఎంఓ" },
    photo: "/team/premsai-kilaru.webp",
  },
  {
    name: "Vishnu Saai Gudise",
    role: { en: "Founder & CTO", te: "ఫౌండర్ & సీటీఓ" },
    photo: "/team/vishnu-saai-gudise.webp",
  },
];

/** Certifications / registrations, e.g. MNRE empanelment, DISCOM vendor registration. Real ones only. */
export const certifications: { name: string; detail: string | null }[] = [
  { name: "[EDIT] Certification / registration 1", detail: null },
  { name: "[EDIT] Certification / registration 2", detail: null },
  { name: "[EDIT] Certification / registration 3", detail: null },
];
