import type { L10n } from "@/lib/types";

/** Extra copy for /about. Story, mission, values, team and certifications live in messages + src/config/content.ts. */
export const aboutPage = {
  storyEyebrow: { en: "Who we are", te: "మేము ఎవరం" },
  valuesEmphasis: { en: "stand for", te: "నిలబడేది" },
  reachTitle: { en: "districts of Telangana we serve", te: "మేము సేవలందించే తెలంగాణ జిల్లాలు" },
  reachNote: { en: "From Hyderabad rooftops to farm borewells across the state.", te: "హైదరాబాద్ పైకప్పుల నుండి రాష్ట్రమంతటా పొలాల బోర్‌వెల్‌ల వరకు." },
  promiseTitle: { en: "What working with us looks like", te: "మాతో పని ఎలా ఉంటుంది" },
  promiseEmphasis: { en: "working with us", te: "మాతో" },
  promise: [
    { title: { en: "Plan", te: "ప్లాన్" }, desc: { en: "We study your bill, roof or land and suggest only what you need.", te: "మీ బిల్లు, పైకప్పు లేదా భూమిని చూసి, మీకు కావలసింది మాత్రమే సూచిస్తాం." } },
    { title: { en: "Paperwork", te: "కాగితపు పని" }, desc: { en: "Scheme applications, DISCOM approvals and net metering, handled.", te: "పథకం దరఖాస్తులు, డిస్కమ్ అనుమతులు, నెట్ మీటరింగ్ మేమే చూసుకుంటాం." } },
    { title: { en: "Install", te: "ఇన్‌స్టాల్" }, desc: { en: "Neat, safe installation by our own team, then testing.", te: "మా సొంత బృందంతో శుభ్రంగా, సురక్షితంగా ఇన్‌స్టాలేషన్, తర్వాత పరీక్ష." } },
    { title: { en: "Support", te: "సపోర్ట్" }, desc: { en: "We stay reachable for service and questions after installation.", te: "ఇన్‌స్టాలేషన్ తర్వాత సర్వీస్, సందేహాల కోసం అందుబాటులో ఉంటాం." } },
  ] as { title: L10n; desc: L10n }[],
};
