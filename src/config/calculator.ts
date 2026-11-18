/**
 * ─────────────────────────────────────────────────────────────
 *  SAVINGS CALCULATOR SETTINGS: edit values here, not in the UI.
 *  Every number marked [EDIT] is a placeholder: replace with your
 *  own current figures before going live.
 * ─────────────────────────────────────────────────────────────
 */
export type PropertyType = "home" | "farm" | "business";

/**
 * Estimated scheme benefits (used by the calculator, Find My Solar Plan and Check My Subsidy).
 * As per current government scheme. [EDIT] Confirm on the official websites before going live.
 */
export const schemeRules = {
  /** PM Surya Ghar, individual homes */
  "pm-surya-ghar": { kind: "per-kw-tiers", tiers: [{ uptoKw: 2, perKw: 30000 }, { uptoKw: 3, perKw: 18000 }], cap: 78000 },
  /** PM Surya Ghar, apartments / RWA common areas */
  "pm-surya-ghar-rwa": { kind: "per-kw-tiers", tiers: [{ uptoKw: 500, perKw: 18000 }], cap: null },
  /** PM-KUSUM: % of pump cost covered (0 until confirmed for Telangana) */
  "pm-kusum": { kind: "percent", percent: 0, cap: null },
  "net-metering": { kind: "none" },
  "state-schemes": { kind: "none" },
} satisfies Record<string, SubsidyRule>;

export const calculatorConfig = {
  /** Average tariff per unit (₹/kWh) used to convert bill ↔ units */
  tariffPerUnit: { home: 7.5, farm: 6.0, business: 9.5 } as Record<PropertyType, number>, // [EDIT]

  /** Units (kWh) generated per kW of panels per month in Telangana */
  generationPerKwMonth: 120, // [EDIT]

  /** Installed cost per kW (₹), before subsidy */
  costPerKw: { home: 60000, farm: 65000, business: 50000 } as Record<PropertyType, number>, // [EDIT]

  /** Roof area needed per kW (sq ft) */
  sqftPerKw: 100,

  /** Smallest and largest system the calculator will suggest (kW) */
  minKw: 1,
  maxKw: { home: 10, farm: 25, business: 200 } as Record<PropertyType, number>,

  /** Round suggested size up to this step (kW) */
  kwStep: 1,

  /**
   * Subsidy rules per property type, as per current government scheme. [EDIT]
   * - "per-kw-tiers": ₹ per kW within each band, with an optional overall cap
   * - "percent": % of system cost, with an optional cap
   * - "none"
   * The site always shows: "Subsidy amounts depend on current government rules. We confirm them for you."
   */
  subsidy: {
    home: schemeRules["pm-surya-ghar"],
    farm: schemeRules["pm-kusum"],
    business: schemeRules["net-metering"],
  } as Record<PropertyType, SubsidyRule>,

  /** Cost range shown as ± this fraction around the estimate */
  costRangeSpread: 0.1,

  /** kg CO₂ avoided per unit of solar */
  co2KgPerUnit: 0.82, // [EDIT]

  /** Yearly electricity price rise for the 25-year chart */
  tariffEscalation: 0.03,
  /** Yearly panel output loss */
  degradation: 0.005,
  lifetimeYears: 25,

  /** Slider ranges */
  billRange: { min: 500, max: 50000, step: 100, default: 3000 },
  unitsRange: { min: 50, max: 6000, step: 10, default: 400 },

  /** Lead temperature by monthly bill (₹): bill >= hot → "Hot", else "Warm" */
  leadTemperature: { hotBill: 3000 } as { hotBill: number }, // [EDIT]
};

export type SubsidyRule =
  | { kind: "per-kw-tiers"; tiers: { uptoKw: number; perKw: number }[]; cap: number | null }
  | { kind: "percent"; percent: number; cap: number | null }
  | { kind: "none" };

/** EMI guidance on the Subsidy & Loans page */
export const loanConfig = {
  interestRate: 7, // [EDIT] % per year, typical solar loan rate
  tenuresYears: [3, 5, 7, 10],
  defaultTenure: 5,
  downPaymentPercent: 10, // [EDIT]
};
