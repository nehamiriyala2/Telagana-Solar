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

/**
 * Homepage hero background.
 * - image: shown always (poster + fallback), animated in code (push-in, sun flare, panel glint, glow, mist).
 * - video: when you have the AI-generated loop, put the files in /public/hero/ and set the paths below. [EDIT]
 *   Export MP4 (H.264) + WebM, 16:9, 8–10 s, ideally under 5 MB. The video replaces the code animation
 *   (it is skipped for "reduce motion" and data-saver visitors, who see the still image).
 */
export const heroMedia = {
  image: "/hero/house-sunrise.webp",
  poster: "/hero/house-sunrise.jpg",
  /** Pixel size of the image, used to keep the animated overlays aligned */
  width: 1672,
  height: 941,
  videoMp4: null as string | null, // e.g. "/hero/house-sunrise.mp4"
  videoWebm: null as string | null, // e.g. "/hero/house-sunrise.webm"
};

/**
 * "How solar cuts your bill" visual on the homepage.
 * - poster/image: realistic still shown always (and while the video loads).
 * - video: when you have the rendered/AI-generated loop, put it in /public/solutions/ and set the paths. [EDIT]
 *   Export MP4 (H.264) + WebM (VP9), 16:10 or 6:5, 1280–1600 px wide, 8–12 s seamless loop, no audio, ideally under 4 MB.
 *   The video replaces the still + light overlays (skipped for "reduce motion" and data-saver visitors).
 */
export const solarStoryMedia = {
  image: "/solutions/how-solar-house.webp",
  poster: "/solutions/how-solar-house.jpg",
  width: 1100,
  height: 941,
  videoMp4: null as string | null, // e.g. "/solutions/how-solar-loop.mp4"
  videoWebm: null as string | null, // e.g. "/solutions/how-solar-loop.webm"
};
