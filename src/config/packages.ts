import type { PropertyType } from "./calculator";

/**
 * ─────────────────────────────────────────────────────────────
 *  PACKAGES: edit sizes and starting prices.
 *  priceFrom: null → shows "Starting from ₹[EDIT]".
 *  Bill range and generation are calculated from calculator.ts.
 * ─────────────────────────────────────────────────────────────
 */
export interface SolarPackage {
  id: string;
  kw: number;
  type: PropertyType;
  priceFrom: number | null; // [EDIT]
  popular?: boolean;
}

/** Shown on the home page */
export const featuredPackages: SolarPackage[] = [
  { id: "home-3", kw: 3, type: "home", priceFrom: null },
  { id: "home-5", kw: 5, type: "home", priceFrom: null, popular: true },
  { id: "home-10", kw: 10, type: "home", priceFrom: null },
];

/** "Solar for Homes" page: 1 kW to 10 kW */
export const homePackages: SolarPackage[] = [1, 2, 3, 4, 5, 7, 10].map((kw) => ({
  id: `home-${kw}`, kw, type: "home" as const, priceFrom: null, popular: kw === 3,
}));

/** "Solar for Farms": pump sizes in HP */
export const pumpSizesHp = [3, 5, 7.5, 10]; // [EDIT]

/** "Solar for Business": typical system sizes */
export const businessPackages: SolarPackage[] = [10, 25, 50, 100].map((kw) => ({
  id: `biz-${kw}`, kw, type: "business" as const, priceFrom: null, popular: kw === 25,
}));
