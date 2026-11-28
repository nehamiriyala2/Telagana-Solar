import { z } from "zod";

/**
 * Calculator settings edited in Admin → Calculator (stored in `settings` as calculator_config, with history).
 * Pure: used by the public calculator, the admin live preview and tests.
 * Every default below is a placeholder marked VERIFY until staff confirm it against the current tariff order
 * and scheme rules; the admin page shows which values are still unconfirmed.
 */
export type Slab = { upto: number | null; rate: number };
export type Discom = "TGSPDCL" | "TGNPDCL";

export type CalcSettings = {
  /** Domestic (LT-I) energy charges per unit, telescopic slabs. upto = null for "and above". */
  slabs: Record<Discom, Slab[]>;
  /** Fixed / customer charge per month (₹), added to the domestic bill. */
  fixedCharge: Record<Discom, number>;
  /** Flat ₹/unit for farm and business (slabs apply to homes only). */
  flatTariff: { farm: number; business: number };
  /** Installed cost per kW before subsidy (₹). */
  costPerKw: { home: number; farm: number; business: number };
  /** Home subsidy (PM Surya Ghar): ₹ per kW in bands, with a cap. */
  subsidyTiers: { uptoKw: number; perKw: number }[];
  subsidyCap: number;
  /** Average units generated per kW per day in Telangana. */
  unitsPerKwDay: number;
  /** kg CO₂ avoided per unit of solar. */
  co2KgPerUnit: number;
  /** System sizes offered to homes (kW), ascending. */
  systemSizes: number[];
  disclaimer: { en: string; te: string };
  /** Field keys staff have confirmed. Anything missing shows VERIFY. */
  verified: string[];
};

export const CALC_KEY = "calculator_config";

export const VERIFY_FIELDS: { key: string; label: string }[] = [
  { key: "slabs.TGSPDCL", label: "TGSPDCL domestic slabs" }, { key: "slabs.TGNPDCL", label: "TGNPDCL domestic slabs" },
  { key: "fixedCharge", label: "Fixed charges" }, { key: "flatTariff", label: "Farm and business tariff" },
  { key: "costPerKw", label: "Cost per kW" }, { key: "subsidy", label: "Subsidy rules" },
  { key: "unitsPerKwDay", label: "Units per kW per day" }, { key: "co2KgPerUnit", label: "CO₂ factor" },
  { key: "systemSizes", label: "System sizes" },
];

const TG_DOMESTIC: Slab[] = [
  { upto: 50, rate: 1.95 }, { upto: 100, rate: 3.1 }, { upto: 200, rate: 4.8 }, { upto: 300, rate: 7.7 },
  { upto: 400, rate: 9.0 }, { upto: 800, rate: 9.5 }, { upto: null, rate: 10.0 },
];

export const DEFAULT_CALC: CalcSettings = {
  slabs: { TGSPDCL: TG_DOMESTIC, TGNPDCL: TG_DOMESTIC },
  fixedCharge: { TGSPDCL: 30, TGNPDCL: 30 },
  flatTariff: { farm: 6.0, business: 9.5 },
  costPerKw: { home: 60000, farm: 65000, business: 50000 },
  subsidyTiers: [{ uptoKw: 2, perKw: 30000 }, { uptoKw: 3, perKw: 18000 }],
  subsidyCap: 78000,
  unitsPerKwDay: 4,
  co2KgPerUnit: 0.82,
  systemSizes: [1, 2, 3, 4, 5, 6, 8, 10],
  disclaimer: {
    en: "Estimates only. Your actual cost, subsidy and savings depend on your roof, usage, current tariff and current government rules. We confirm them for you.",
    te: "ఇవి అంచనాలు మాత్రమే. మీ అసలు ఖర్చు, సబ్సిడీ, ఆదా మీ పైకప్పు, వినియోగం, ప్రస్తుత టారిఫ్, ప్రస్తుత ప్రభుత్వ నియమాలపై ఆధారపడి ఉంటాయి. మేము మీకు నిర్ధారిస్తాం.",
  },
  verified: [],
};

/* ───────── Validation ───────── */

const money = (max: number, label: string) => z.number({ message: `Enter a number for ${label}.` }).min(0, `${label} can’t be negative.`).max(max, `${label} looks too high.`);
const SlabsSchema = z.array(z.object({ upto: z.number().int().positive().nullable(), rate: money(100, "Rate per unit") }).strict()).min(1).max(12)
  .superRefine((s, ctx) => {
    let prev = 0;
    s.forEach((b, i) => {
      const last = i === s.length - 1;
      if (last && b.upto !== null) ctx.addIssue({ code: "custom", message: "The last slab must be “and above” (no upper limit)." });
      if (!last && b.upto === null) ctx.addIssue({ code: "custom", message: "Only the last slab can be “and above”." });
      if (b.upto !== null && b.upto <= prev) ctx.addIssue({ code: "custom", message: "Slab limits must go up (e.g. 50, 100, 200)." });
      if (b.upto !== null) prev = b.upto;
    });
  });

export const CalcSchema = z.object({
  slabs: z.object({ TGSPDCL: SlabsSchema, TGNPDCL: SlabsSchema }).strict(),
  fixedCharge: z.object({ TGSPDCL: money(1000, "Fixed charge"), TGNPDCL: money(1000, "Fixed charge") }).strict(),
  flatTariff: z.object({ farm: money(100, "Farm tariff"), business: money(100, "Business tariff") }).strict(),
  costPerKw: z.object({ home: money(500000, "Cost per kW"), farm: money(500000, "Cost per kW"), business: money(500000, "Cost per kW") }).strict(),
  subsidyTiers: z.array(z.object({ uptoKw: z.number().positive().max(1000), perKw: money(200000, "Subsidy per kW") }).strict()).max(6)
    .refine((t) => t.every((x, i) => i === 0 || x.uptoKw > t[i - 1].uptoKw), "Subsidy bands must go up in kW."),
  subsidyCap: money(10_000_000, "Subsidy cap"),
  unitsPerKwDay: z.number().min(1, "Units per kW per day is usually 3.5 to 5.").max(8, "Units per kW per day is usually 3.5 to 5."),
  co2KgPerUnit: z.number().min(0).max(2),
  systemSizes: z.array(z.number().positive().max(1000)).min(1).max(20).refine((a) => a.every((x, i) => i === 0 || x > a[i - 1]), "List sizes from smallest to largest."),
  disclaimer: z.object({ en: z.string().trim().min(10).max(600), te: z.string().trim().max(900) }).strict(),
  verified: z.array(z.string().max(40)).max(20),
}).strict();

export function normalizeCalc(v: unknown): CalcSettings {
  const r = CalcSchema.safeParse(v);
  return r.success ? r.data : DEFAULT_CALC;
}

/* ───────── Maths ───────── */

/** Monthly domestic bill (₹) for `units`, telescopic slabs + fixed charge. */
export function domesticBill(units: number, slabs: Slab[], fixed = 0): number {
  let left = Math.max(0, units), prev = 0, energy = 0;
  for (const s of slabs) {
    const top = s.upto ?? Infinity;
    const inSlab = Math.max(0, Math.min(left, top - prev));
    energy += inSlab * s.rate;
    left -= inSlab;
    prev = top;
    if (left <= 0) break;
  }
  return energy + (units > 0 ? fixed : 0);
}

/** Units per month that produce this domestic bill (inverse of domesticBill). */
export function unitsFromDomesticBill(bill: number, slabs: Slab[], fixed = 0): number {
  if (bill <= fixed) return 0;
  let lo = 0, hi = 100_000;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (domesticBill(mid, slabs, fixed) < bill) lo = mid; else hi = mid;
  }
  return Math.round(hi);
}

export function homeSubsidy(kw: number, s: Pick<CalcSettings, "subsidyTiers" | "subsidyCap">, cost: number): number {
  let amount = 0, prev = 0;
  for (const t of s.subsidyTiers) {
    amount += Math.max(0, Math.min(kw, t.uptoKw) - prev) * t.perKw;
    prev = t.uptoKw;
  }
  return Math.round(Math.min(amount, s.subsidyCap, cost));
}

/** Smallest offered size that covers the need (largest offered size if none does). */
export function pickSize(neededKw: number, sizes: number[]): number {
  if (neededKw <= 0) return 0;
  return sizes.find((s) => s >= neededKw - 1e-9) ?? sizes[sizes.length - 1];
}

/** Admin preview (and a check for the public calculator): home on a domestic connection. */
export function homeQuote(s: CalcSettings, bill: number, discom: Discom) {
  const slabs = s.slabs[discom], fixed = s.fixedCharge[discom];
  const units = unitsFromDomesticBill(bill, slabs, fixed);
  const perKwMonth = s.unitsPerKwDay * 30;
  const kw = pickSize(units / perKwMonth, s.systemSizes);
  const cost = Math.round(kw * s.costPerKw.home);
  const subsidy = homeSubsidy(kw, s, cost);
  const generation = Math.round(kw * perKwMonth);
  // Saving = bill now − bill on the units still bought from the grid (no credit for export).
  const after = domesticBill(Math.max(0, units - generation), slabs, fixed);
  const monthlySaving = Math.max(0, Math.round(bill - after));
  const netCost = cost - subsidy;
  return { units, kw, generation, cost, subsidy, netCost, monthlySaving, paybackYears: monthlySaving ? Math.round((netCost / (monthlySaving * 12)) * 10) / 10 : null };
}
