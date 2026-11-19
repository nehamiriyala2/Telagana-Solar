import type { L10n } from "@/lib/types";
import type { Persona } from "@/config/personas";

type Img = { src: string; width: number; height: number };

/**
 * Pictures for the "Which solar suits you?" visitor types: `card` on the homepage card,
 * `page` as the hero picture on /for/<persona> (a different picture where two were supplied).
 * `focus` = object-position for crops (cards and orbit thumbnails).
 */
export const personaMedia: Partial<Record<Persona, { card: Img; page: Img & { sun: { x: string; y: string } }; alt: L10n; focus?: string }>> = {
  urban: {
    card: { src: "/personas/urban-card.webp", width: 960, height: 540 },
    page: { src: "/personas/urban.webp", width: 1280, height: 720, sun: { x: "62%", y: "6%" } },
    alt: { en: "Modern home with rooftop solar panels and a terrace garden", te: "పైకప్పు సోలార్ ప్యానెల్స్, టెర్రస్ గార్డెన్‌తో ఆధునిక ఇల్లు" },
  },
  // [EDIT] Third-party image (propertywala.com watermark, kept intact). Confirm usage rights or replace before going live.
  apartment: {
    card: { src: "/personas/apartment.webp", width: 1024, height: 575 },
    page: { src: "/personas/apartment.webp", width: 1024, height: 575, sun: { x: "50%", y: "0%" } },
    alt: { en: "Apartment tower at dusk with solar panels and a pool on the rooftop", te: "సాయంత్రం పైకప్పుపై సోలార్ ప్యానెల్స్, ఈత కొలను ఉన్న అపార్ట్‌మెంట్ భవనం" },
    focus: "100% 50%",
  },
  farmer: {
    card: { src: "/personas/farmer-card.webp", width: 960, height: 540 },
    page: { src: "/personas/farmer-page.webp", width: 1024, height: 1024, sun: { x: "50%", y: "8%" } },
    alt: { en: "Farmer beside a solar-powered water pump in green paddy fields", te: "పచ్చని వరి పొలాల్లో సోలార్ నీటి పంపు పక్కన రైతు" },
  },
  shop: {
    card: { src: "/personas/shop-card.webp", width: 960, height: 540 },
    page: { src: "/personas/shop.webp", width: 1600, height: 900, sun: { x: "96%", y: "42%" } },
    alt: { en: "Commercial building with solar panels over the parking area", te: "పార్కింగ్‌పై సోలార్ ప్యానెల్స్ ఉన్న వాణిజ్య భవనం" },
  },
  factory: {
    card: { src: "/personas/factory-card.webp", width: 960, height: 640 },
    page: { src: "/personas/factory-page.webp", width: 1280, height: 720, sun: { x: "12%", y: "6%" } },
    alt: { en: "Factory with rooftop solar panels and an industrial yard", te: "పైకప్పు సోలార్ ప్యానెల్స్ ఉన్న ఫ్యాక్టరీ, పారిశ్రామిక ప్రాంగణం" },
  },
  institution: {
    card: { src: "/personas/institution-card.webp", width: 960, height: 505 },
    page: { src: "/personas/institution.webp", width: 1200, height: 631, sun: { x: "88%", y: "4%" } },
    alt: { en: "School campus with solar panels on the building roofs", te: "భవనాల పైకప్పులపై సోలార్ ప్యానెల్స్ ఉన్న పాఠశాల ప్రాంగణం" },
  },
  landlord: {
    card: { src: "/personas/landlord-card.webp", width: 960, height: 960 },
    page: { src: "/personas/landlord.webp", width: 1024, height: 1024, sun: { x: "16%", y: "8%" } },
    alt: { en: "Villa with a solar roof, garden and pool at sunset", te: "సూర్యాస్తమయంలో సోలార్ పైకప్పు, తోట, ఈత కొలను ఉన్న విల్లా" },
  },
};
