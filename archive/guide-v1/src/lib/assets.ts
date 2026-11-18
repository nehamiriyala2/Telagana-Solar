import type { L10n } from "./types";

/**
 * Image / frame manifest. Drop generated files at these paths, then flip
 * `ready: true`. Until then the site renders coded SVG illustrations.
 * Budgets: hero < 300KB, others < 150KB. Provide @2x files as `name@2x.webp`.
 */
export interface Asset { src: string; src2x?: string; width: number; height: number; ready: boolean; alt: L10n }

const img = (name: string, width: number, height: number, alt: L10n, ready = false): Asset => ({
  src: `/images/${name}.webp`, src2x: `/images/${name}@2x.webp`, width, height, ready, alt,
});

export const ASSETS = {
  hero: img("hero-skyline", 1920, 1080, {
    en: "Hyderabad skyline at sunrise with solar panels on rooftops",
    te: "సూర్యోదయ సమయంలో పైకప్పులపై సోలార్ ప్యానెళ్లతో హైదరాబాద్ నగరం",
  }),
  panelExploded: img("panel-exploded", 1200, 900, { en: "Exploded view of a solar panel showing its layers", te: "సోలార్ ప్యానెల్ పొరలను చూపించే విడదీసిన చిత్రం" }),
  rooftopDiagram: img("rooftop-system", 1600, 900, { en: "Rooftop solar system: panels, inverter, meter, home and grid", te: "రూఫ్‌టాప్ సోలార్: ప్యానెళ్లు, ఇన్వర్టర్, మీటర్, ఇల్లు, గ్రిడ్" }),
  rural: img("rural-home", 1200, 900, { en: "Village home with solar panels on the roof", te: "పైకప్పుపై సోలార్ ప్యానెళ్లతో గ్రామీణ ఇల్లు" }),
  farm: img("farm-pumpset", 1200, 900, { en: "Farm with a solar water pump irrigating fields", te: "పొలానికి నీరు పెడుతున్న సోలార్ పంప్" }),
  apartment: img("apartment-rooftop", 1200, 900, { en: "Apartment building with solar panels on the common roof", te: "ఉమ్మడి పైకప్పుపై సోలార్ ప్యానెళ్లతో అపార్ట్‌మెంట్" }),
  schemes: img("schemes-illustration", 1200, 900, { en: "Illustration of government solar schemes", te: "ప్రభుత్వ సోలార్ పథకాల చిత్రం" }),
  installers: img("installer-illustration", 1200, 900, { en: "Solar installer fitting panels on a roof", te: "పైకప్పుపై ప్యానెళ్లు బిగిస్తున్న సోలార్ ఇన్‌స్టాలర్" }),
  howStatic: img("how-solar-works-static", 1600, 900, { en: "How solar works: sun, panels, inverter, meter, home, grid", te: "సోలార్ ఎలా పనిచేస్తుంది: సూర్యుడు, ప్యానెళ్లు, ఇన్వర్టర్, మీటర్, ఇల్లు, గ్రిడ్" }),
};

/** Scroll-driven image sequence for "How solar works". */
export const FRAMES = {
  ready: false,
  desktop: { count: 200, path: (i: number) => `/frames/f_${String(i).padStart(4, "0")}.webp` },
  mobile: { count: 80, path: (i: number) => `/frames/mobile/f_${String(i).padStart(4, "0")}.webp` },
};
