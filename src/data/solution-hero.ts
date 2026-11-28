import type { L10n } from "@/lib/types";

/** Labels beside the 3D house on /solutions/homes (from the supplied blueprint). */
export const homesHeroChips: { key: "size" | "subsidy" | "install" | "net"; label: L10n }[] = [
  { key: "size", label: { en: "1 kW – 10 kW Rooftop Solar", te: "1 kW – 10 kW రూఫ్‌టాప్ సోలార్" } },
  { key: "subsidy", label: { en: "Subsidy Support", te: "సబ్సిడీ సహాయం" } },
  { key: "install", label: { en: "Design & installation", te: "డిజైన్ & ఇన్‌స్టాలేషన్" } },
  { key: "net", label: { en: "Net Metering", te: "నెట్ మీటరింగ్" } },
];

export const homesHeroImageAlt: L10n = {
  en: "Two-storey home with rooftop solar panels in the sun",
  te: "ఎండలో పైకప్పుపై సోలార్ ప్యానెల్స్ ఉన్న రెండంతస్తుల ఇల్లు",
};

/**
 * Hero / section photos cut from the supplied blueprints (one picture per page, never reused).
 * - variant "bleed": wide photo, runs to the screen edge and fades into the hero (Farms, Business).
 * - variant "card": framed glass card with depth (scheme pages, Subsidy & Loans).
 * - sun: where the sun / brightest glare sits in the picture (% of the image), for the sunlight animation.
 * Official marks in the PM Surya Ghar sign and the State Schemes picture are softened on purpose
 * (a private company site must not look like a government page).
 */
type Banner = { src: string; width: number; height: number; focus: string; sun: { x: string; y: string }; variant: "bleed" | "card"; alt: L10n };

export const solutionBanners = {
  farms: {
    src: "/solutions/farms-hero.webp", width: 1132, height: 465, focus: "70% 50%", sun: { x: "32%", y: "18%" }, variant: "bleed",
    alt: { en: "Farmer beside a solar water pump filling a well, with solar panels over green fields", te: "పచ్చని పొలాల మధ్య సోలార్ ప్యానెల్స్‌తో నడిచే నీటి పంపు పక్కన రైతు" },
  },
  business: {
    src: "/solutions/business-hero.webp", width: 1032, height: 467, focus: "60% 50%", sun: { x: "24%", y: "16%" }, variant: "bleed",
    alt: { en: "Shop building with solar panels on the roof", te: "పైకప్పుపై సోలార్ ప్యానెల్స్ ఉన్న దుకాణం భవనం" },
  },
  "pm-surya-ghar": {
    src: "/solutions/pm-surya-ghar-hero.webp", width: 872, height: 941, focus: "50% 50%", sun: { x: "57%", y: "14%" }, variant: "card",
    alt: { en: "Family in front of their home with rooftop solar panels", te: "పైకప్పుపై సోలార్ ప్యానెల్స్ ఉన్న తమ ఇంటి ముందు కుటుంబం" },
  },
  "pm-kusum": {
    src: "/solutions/pm-kusum-hero.webp", width: 960, height: 857, focus: "50% 50%", sun: { x: "33%", y: "25%" }, variant: "card",
    alt: { en: "Farmer standing beside a solar water pump that fills a tank in his green fields", te: "పచ్చని పొలాల్లో ట్యాంకును నింపుతున్న సోలార్ నీటి పంపు పక్కన నిలబడిన రైతు" },
  },
  "net-metering": {
    src: "/solutions/net-metering-hero-photo.webp", width: 1388, height: 976, focus: "50% 50%", sun: { x: "88%", y: "4%" }, variant: "card",
    alt: { en: "House with rooftop solar panels and a two-way net meter on the wall", te: "పైకప్పుపై సోలార్ ప్యానెల్స్ ఉన్న ఇల్లు, గోడపై రెండు వైపుల నెట్ మీటర్" },
  },
  "state-schemes": {
    src: "/solutions/state-schemes-hero.webp", width: 972, height: 941, focus: "50% 50%", sun: { x: "46%", y: "24%" }, variant: "card",
    alt: { en: "Building with rooftop solar panels, the Telangana flag and Charminar in the background", te: "పైకప్పుపై సోలార్ ప్యానెల్స్ ఉన్న భవనం, వెనుక తెలంగాణ జెండా, చార్మినార్" },
  },
  about: {
    src: "/solutions/about-hero.webp", width: 1672, height: 941, focus: "50% 50%", sun: { x: "25%", y: "56%" }, variant: "card",
    alt: { en: "Modern office building with ground-mounted solar panels at sunrise, Charminar and the Hyderabad skyline behind", te: "సూర్యోదయంలో సోలార్ ప్యానెల్స్‌తో ఆధునిక కార్యాలయ భవనం, వెనుక చార్మినార్, హైదరాబాద్ నగరం" },
  },
  "subsidy-loans": {
    src: "/solutions/subsidy-loans-hero.webp", width: 1141, height: 941, focus: "50% 50%", sun: { x: "13%", y: "47%" }, variant: "card",
    alt: { en: "Illustration of solar finance: subsidy assistance, bank loans and easy documentation", te: "సోలార్ ఆర్థిక సహాయం చిత్రం: సబ్సిడీ సహాయం, బ్యాంకు లోన్లు, సులభమైన పత్రాలు" },
  },
} satisfies Record<string, Banner>;

/** In-page picture on /schemes/pm-surya-ghar (house with the scheme sign), beside "What you get". */
export const pmSuryaGharSign = {
  src: "/solutions/pm-surya-ghar-sign.webp", width: 1672, height: 941, sun: { x: "8%", y: "4%" },
  alt: { en: "Home with rooftop solar panels and an inverter, next to a PM Surya Ghar sign", te: "పైకప్పు సోలార్ ప్యానెల్స్, ఇన్వర్టర్ ఉన్న ఇల్లు, పక్కన పీఎం సూర్య ఘర్ బోర్డు" },
};
