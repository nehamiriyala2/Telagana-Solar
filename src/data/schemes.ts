import type { L10n } from "@/lib/types";

/**
 * Extra content for /schemes and /schemes/[slug].
 * Scheme names, benefits, documents and steps live in messages/*.json (schemes.items.*).
 * Never put a subsidy amount here unless it is confirmed; use "[EDIT after checking]".
 */
export const schemesPage = {
  marqueeLabel: { en: "Working across all 33 districts of Telangana", te: "తెలంగాణలోని 33 జిల్లాల్లో సేవలు" },
  compareTitle: { en: "Compare the schemes at a glance", te: "పథకాలను ఒక్క చూపులో పోల్చండి" },
  compareEmphasis: { en: "at a glance", te: "ఒక్క చూపులో" },
  compareCols: {
    scheme: { en: "Scheme", te: "పథకం" },
    for: { en: "For", te: "ఎవరికి" },
    who: { en: "Who can apply", te: "ఎవరు దరఖాస్తు చేయవచ్చు" },
    benefit: { en: "What you get", te: "మీకు లభించేది" },
    via: { en: "Apply through", te: "దరఖాస్తు ఎక్కడ" },
  },
  processTitle: { en: "We handle the paperwork, start to finish", te: "కాగితపు పని మొదటి నుండి చివరి వరకు మేమే చూసుకుంటాం" },
  processEmphasis: { en: "paperwork", te: "కాగితపు" },
  process: [
    { title: { en: "Check what you qualify for", te: "మీకు ఏది వర్తిస్తుందో చూడటం" }, desc: { en: "Share your bill, roof or land details. We tell you which schemes fit and why.", te: "మీ బిల్లు, పైకప్పు లేదా భూమి వివరాలు ఇవ్వండి. ఏ పథకాలు వర్తిస్తాయో, ఎందుకో చెబుతాం." } },
    { title: { en: "Get documents ready", te: "పత్రాలు సిద్ధం చేయడం" }, desc: { en: "One simple checklist. We review everything before anything is submitted.", te: "ఒకే సులభమైన జాబితా. సమర్పించే ముందు అన్నీ మేమే సరిచూస్తాం." } },
    { title: { en: "Apply and follow up", te: "దరఖాస్తు, ఫాలో-అప్" }, desc: { en: "We register on the right portal and follow up with the DISCOM or agency.", te: "సరైన పోర్టల్‌లో నమోదు చేసి, డిస్కమ్ లేదా ఏజెన్సీతో ఫాలో-అప్ చేస్తాం." } },
    { title: { en: "Install, inspect, claim", te: "ఇన్‌స్టాల్, తనిఖీ, క్లెయిమ్" }, desc: { en: "After installation and inspection, we help until the benefit reaches you.", te: "ఇన్‌స్టాలేషన్, తనిఖీ తర్వాత ప్రయోజనం మీకు అందే వరకు సహాయం చేస్తాం." } },
  ] as { title: L10n; desc: L10n }[],
  glance: { en: "At a glance", te: "ఒక్క చూపులో" },
  otherTitle: { en: "Other schemes you may use", te: "మీరు వాడుకోగల ఇతర పథకాలు" },
  timeline: { en: "Time to receive the benefit", te: "ప్రయోజనం అందే సమయం" },
  timelineValue: { en: "[EDIT after checking]", te: "[EDIT after checking]" },
};
