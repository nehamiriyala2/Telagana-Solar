import type { Appliance } from "@/lib/types";

/** Default wattages. Editable from the admin panel (stage 3) and by the user on the page. */
export const appliances: Appliance[] = [
  { id: "led", icon: "bulb", name: { en: "LED bulb", te: "LED బల్బు" }, watts: 9, defaultHours: 6, defaultQty: 6 },
  { id: "tube", icon: "tube", name: { en: "Tube light", te: "ట్యూబ్ లైట్" }, watts: 20, defaultHours: 6, defaultQty: 2 },
  {
    id: "fan", icon: "fan", name: { en: "Ceiling fan", te: "సీలింగ్ ఫ్యాన్" }, watts: 75, defaultHours: 10, defaultQty: 3,
    variant: { name: { en: "BLDC fan", te: "BLDC ఫ్యాన్" }, watts: 30 },
  },
  { id: "tv", icon: "tv", name: { en: "TV", te: "టీవీ" }, watts: 100, defaultHours: 4, defaultQty: 1 },
  { id: "fridge", icon: "fridge", name: { en: "Refrigerator", te: "ఫ్రిజ్" }, watts: 150, defaultHours: 10, defaultQty: 1 },
  { id: "wifi", icon: "wifi", name: { en: "WiFi router", te: "వైఫై రౌటర్" }, watts: 10, defaultHours: 24, defaultQty: 1 },
  {
    id: "laptop", icon: "laptop", name: { en: "Laptop", te: "ల్యాప్‌టాప్" }, watts: 60, defaultHours: 6, defaultQty: 1,
    variant: { name: { en: "Desktop PC", te: "డెస్క్‌టాప్ PC" }, watts: 200 },
  },
  { id: "mixer", icon: "mixer", name: { en: "Mixer grinder", te: "మిక్సీ" }, watts: 500, defaultHours: 0.5, defaultQty: 1 },
  { id: "iron", icon: "iron", name: { en: "Iron box", te: "ఇస్త్రీ పెట్టె" }, watts: 1000, defaultHours: 0.5, defaultQty: 0 },
  { id: "geyser", icon: "geyser", name: { en: "Geyser", te: "గీజర్" }, watts: 2000, defaultHours: 1, defaultQty: 0 },
  { id: "ac", icon: "ac", name: { en: "AC (1.5 ton)", te: "AC (1.5 టన్)" }, watts: 1500, defaultHours: 6, defaultQty: 0 },
  { id: "motor", icon: "motor", name: { en: "Water motor", te: "నీటి మోటార్" }, watts: 750, defaultHours: 1, defaultQty: 1 },
];
