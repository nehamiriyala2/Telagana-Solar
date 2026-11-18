import type { Assumptions, Tariff } from "@/lib/types";

/**
 * PLACEHOLDER VALUES, NOT VERIFIED.
 * Shape follows Telangana's telescopic LT-I domestic tariff (slab group chosen
 * by total monthly units). Replace every rate with the current TGERC tariff
 * order and set `verified: true` + `lastVerified` in the admin panel.
 */
export const tariffs: Tariff[] = [
  {
    id: "domestic",
    discom: "TGSPDCL / TGNPDCL",
    label: { en: "Domestic (LT-I)", te: "గృహ వినియోగం (LT-I)" },
    groups: [
      { maxUnits: 100, slabs: [{ upTo: 50, rate: 1.95 }, { upTo: 100, rate: 3.1 }] },
      { maxUnits: 200, slabs: [{ upTo: 100, rate: 3.4 }, { upTo: 200, rate: 4.8 }] },
      {
        maxUnits: null,
        slabs: [
          { upTo: 200, rate: 5.1 },
          { upTo: 300, rate: 7.7 },
          { upTo: 400, rate: 9.0 },
          { upTo: 800, rate: 9.5 },
          { upTo: null, rate: 10.0 },
        ],
      },
    ],
    fixedPerMonth: 50,
    dutyPerUnit: 0.06,
    verified: false,
    lastVerified: null,
    sourceUrl: "https://tgerc.telangana.gov.in",
  },
  {
    id: "commercial",
    discom: "TGSPDCL / TGNPDCL",
    label: { en: "Commercial (LT-II)", te: "వాణిజ్య (LT-II)" },
    groups: [{ maxUnits: null, slabs: [{ upTo: 50, rate: 7.0 }, { upTo: 100, rate: 8.5 }, { upTo: 300, rate: 9.9 }, { upTo: null, rate: 10.4 }] }],
    fixedPerMonth: 120,
    dutyPerUnit: 0.06,
    verified: false,
    lastVerified: null,
    sourceUrl: "https://tgerc.telangana.gov.in",
  },
];

/** PLACEHOLDER market assumptions. Edit in admin; shown to users as estimates. */
export const assumptions: Assumptions = {
  sunHours: 4.5,
  performanceRatio: 0.8,
  sqftPerKw: 100,
  costPerKw: {
    "on-grid": { min: 55000, max: 65000 },
    hybrid: { min: 80000, max: 100000 },
    "off-grid": { min: 85000, max: 110000 },
    commercial: { min: 45000, max: 55000 },
  },
  batteryPerKwh: { min: 12000, max: 18000 },
  pumpPerHp: { min: 60000, max: 80000 },
  tariffEscalation: 0.03,
  degradation: 0.005,
  co2PerKwh: 0.82,
  lifetimeYears: 25,
  verified: false,
  lastVerified: null,
};
