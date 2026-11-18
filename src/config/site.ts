/**
 * ─────────────────────────────────────────────────────────────
 *  BUSINESS DETAILS: edit this file to change contact info,
 *  stats, brands and service areas across the whole site.
 *  Anything set to `null` shows an [EDIT] marker on the site.
 * ─────────────────────────────────────────────────────────────
 */
/** Treat empty values and unedited placeholders (XXXX, example.com) as missing. */
const env = (v: string | undefined): string | null => (v && !/X{4}|example.com/i.test(v) ? v.trim() : null);

export const site = {
  name: "Telangana Solar",
  tagline: { en: "Make your own power. Pay less for it.", te: "మీ కరెంటు మీరే తయారు చేసుకోండి. తక్కువ చెల్లించండి." },
  url: env(process.env.NEXT_PUBLIC_SITE_URL) ?? "http://localhost:3000",

  /** Phone shown on the site and used for "Call" buttons. Format: +91XXXXXXXXXX */
  phone: env(process.env.NEXT_PUBLIC_PHONE), // [EDIT]
  /** WhatsApp number in international format without "+", e.g. 919XXXXXXXXX */
  whatsapp: env(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER), // [EDIT]
  email: env(process.env.NEXT_PUBLIC_CONTACT_EMAIL), // [EDIT]

  address: {
    street: null as string | null, // [EDIT]
    city: "Hyderabad",
    region: "Telangana",
    postalCode: null as string | null, // [EDIT]
    country: "IN",
  },
  /** Used for LocalBusiness schema and the map pin */
  geo: { lat: 17.385, lng: 78.4867 }, // [EDIT] exact office location
  /** Google Maps embed URL (Share → Embed a map → copy the src). null = map by city name. */
  mapEmbedUrl: null as string | null, // [EDIT]
  hours: "Mo-Sa 09:00-19:00", // [EDIT] opening hours (schema.org format)

  /** Promise in the auto-reply: "Our team will call you within X hours" */
  callbackHours: 2, // [EDIT]

  social: {
    facebook: null as string | null, // [EDIT]
    instagram: null as string | null, // [EDIT]
    youtube: null as string | null, // [EDIT]
    linkedin: null as string | null, // [EDIT]
  },

  /** Trust-strip counters. null = shows [EDIT]. Use real numbers only. */
  stats: {
    projects: null as number | null, // [EDIT] projects installed
    kw: null as number | null, // [EDIT] total kW installed
    districts: 33 as number | null, // districts served (all of Telangana)
    customers: null as number | null, // [EDIT] happy customers
  },

  /** Panel & inverter brands you install. Add logo files to /public/brands/ */
  brands: [
    { name: "[EDIT] Panel brand 1", logo: null as string | null },
    { name: "[EDIT] Panel brand 2", logo: null as string | null },
    { name: "[EDIT] Inverter brand 1", logo: null as string | null },
    { name: "[EDIT] Inverter brand 2", logo: null as string | null },
  ],

  /** Featured in footer + city pages. Slugs must exist in src/data/districts.ts */
  serviceAreas: ["hyderabad", "warangal", "karimnagar", "nizamabad", "khammam"],
} as const;

export const hasValue = <T,>(v: T | null | undefined): v is T => v !== null && v !== undefined && v !== "";
