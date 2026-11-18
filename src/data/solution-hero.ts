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

/** Banner photos on /solutions/farms and /solutions/business (cut from the supplied blueprint). */
export const solutionBanners = {
  farms: {
    src: "/solutions/farms-hero.webp", width: 1132, height: 465, focus: "70% 50%",
    alt: { en: "Farmer beside a solar water pump filling a well, with solar panels over green fields", te: "పచ్చని పొలాల మధ్య సోలార్ ప్యానెల్స్‌తో నడిచే నీటి పంపు పక్కన రైతు" },
  },
  business: {
    src: "/solutions/business-hero.webp", width: 1032, height: 467, focus: "60% 50%",
    alt: { en: "Shop building with solar panels on the roof", te: "పైకప్పుపై సోలార్ ప్యానెల్స్ ఉన్న దుకాణం భవనం" },
  },
} satisfies Record<string, { src: string; width: number; height: number; focus: string; alt: L10n }>;
