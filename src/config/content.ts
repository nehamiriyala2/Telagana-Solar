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
  { name: null, role: null, photo: null }, // [EDIT]
  { name: null, role: null, photo: null },
  { name: null, role: null, photo: null },
];

/** Certifications / registrations, e.g. MNRE empanelment, DISCOM vendor registration. Real ones only. */
export const certifications: { name: string; detail: string | null }[] = [
  { name: "[EDIT] Certification / registration 1", detail: null },
  { name: "[EDIT] Certification / registration 2", detail: null },
  { name: "[EDIT] Certification / registration 3", detail: null },
];
