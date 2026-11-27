"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { MessageCircle, TriangleAlert } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { ChoiceChips } from "@/components/ui/choice-chips";
import { Skeleton } from "@/components/ui/skeleton";
import { CountUp } from "@/components/motion/count-up";
import { LeadForm } from "@/components/forms/lead-form";
import { calculatorConfig as C, type PropertyType } from "@/config/calculator";
import { districts } from "@/data/districts";
import { calcSettings, calculate, summarize, type InputMode } from "@/lib/calculator";
import { track } from "@/lib/analytics";
import { formatINR, formatLakh, formatNum, pick } from "@/lib/utils";

// Chart library is heavy: load it only when the calculator is on screen.
const SavingsChart = dynamic(() => import("./savings-chart").then((m) => m.SavingsChart), {
  ssr: false,
  loading: () => <Skeleton className="h-80 w-full" />,
});

export function FullCalculator() {
  const t = useTranslations();
  const locale = useLocale();
  const [type, setType] = useState<PropertyType>("home");
  const [mode, setMode] = useState<InputMode>("bill");
  const [value, setValue] = useState(C.billRange.default);
  const [roof, setRoof] = useState("");
  const [district, setDistrict] = useState("");

  // Deep links: /savings-calculator?bill=3000&type=farm
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const b = Number(q.get("bill"));
    if (b > 0) { setMode("bill"); setValue(Math.min(C.billRange.max, b)); }
    const ty = q.get("type");
    if (ty === "home" || ty === "farm" || ty === "business") setType(ty);
  }, []);

  const r = useMemo(() => calculate({ type, mode, value, roofSqft: roof ? Number(roof) : null, district }), [type, mode, value, roof, district]);

  // Track meaningful use once per settled value
  const tracked = useRef<string>("");
  useEffect(() => {
    const key = `${type}-${r.kw}`;
    const id = setTimeout(() => { if (tracked.current !== key && r.kw > 0) { tracked.current = key; track({ name: "calculator_used", propertyType: type, kw: r.kw }); } }, 1500);
    return () => clearTimeout(id);
  }, [type, r.kw]);

  const range = mode === "bill" ? C.billRange : C.unitsRange;
  const sliderMax = mode === "bill" ? Math.min(range.max, type === "business" ? 50000 : 20000) : Math.min(range.max, type === "business" ? 6000 : 2000);

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      {/* Inputs */}
      <Card className="h-fit p-6 md:p-8 lg:sticky lg:top-[calc(var(--header-h)+1rem)] lg:col-span-5">
        <p className="mb-2 text-caption font-semibold">{t("calculator.propertyType")}</p>
        <ChoiceChips label={t("calculator.propertyType")} layoutId="calc-type" value={type} onChange={setType}
          options={(["home", "farm", "business"] as const).map((v) => ({ value: v, label: t(`types.${v}.name`) }))} />

        <div className="mt-6">
          <ChoiceChips label={t("calculator.byBill")} layoutId="calc-mode" value={mode}
            onChange={(m) => { setMode(m); setValue(m === "bill" ? C.billRange.default : C.unitsRange.default); }}
            options={[{ value: "bill", label: t("calculator.byBill") }, { value: "units", label: t("calculator.byUnits") }]} />
        </div>

        <label htmlFor="calc-value" className="mt-6 block text-caption font-semibold text-muted">{mode === "bill" ? t("calculator.billInput") : t("calculator.unitsInput")}</label>
        <div className="mt-1 flex items-baseline gap-2">
          {mode === "bill" && <span className="font-heading text-h3 font-extrabold">₹</span>}
          <input id="calc-value" type="number" inputMode="numeric" min={0} max={range.max} value={value}
            onChange={(e) => setValue(Math.max(0, Math.min(range.max, Number(e.target.value) || 0)))}
            className="w-full bg-transparent font-heading text-hero font-extrabold tracking-tightish outline-none" />
        </div>
        <Slider className="mt-3" value={[Math.min(value, sliderMax)]} min={range.min} max={sliderMax} step={range.step} onValueChange={([v]) => setValue(v)} aria-label={mode === "bill" ? t("calculator.billInput") : t("calculator.unitsInput")} />
        <p className="mt-2 text-caption text-muted">
          {mode === "bill" ? t("calculator.estimatedUnits", { units: formatNum(r.monthlyUnits) }) : t("calculator.estimatedBill", { bill: formatINR(r.monthlyBill) })}
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="calc-roof" className="mb-1.5 block text-caption font-semibold">{t("calculator.roof")}</label>
            <div className="relative">
              <input id="calc-roof" className="field pr-14" type="number" inputMode="numeric" min={0} value={roof} onChange={(e) => setRoof(e.target.value)} aria-describedby="calc-roof-hint" />
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-caption text-muted">{t("calculator.roofPh")}</span>
            </div>
            <p id="calc-roof-hint" className="mt-1 text-[0.75rem] text-muted">{t("calculator.roofHint")}</p>
          </div>
          <div>
            <label htmlFor="calc-district" className="mb-1.5 block text-caption font-semibold">{t("calculator.district")}</label>
            <select id="calc-district" className="field" value={district} onChange={(e) => setDistrict(e.target.value)}>
              <option value="">{t("calculator.anyDistrict")}</option>
              {[...districts].sort((a, b) => a.name.en.localeCompare(b.name.en)).map((d) => <option key={d.slug} value={d.slug}>{pick(d.name, locale)}</option>)}
            </select>
          </div>
        </div>
      </Card>

      {/* Results */}
      <div className="space-y-6 lg:col-span-7">
        <Card className="overflow-hidden">
          <div className="relative bg-[#F5F0E6] p-6 md:p-8">
            <div aria-hidden className="absolute -right-16 -top-16 size-48 rounded-full bg-transparent" />
            <p className="text-caption font-semibold text-muted">{t("calculator.size")}</p>
            <p className="mt-1 font-heading text-[3.5rem] font-extrabold leading-none tracking-tightish md:text-[4.5rem]" aria-live="polite">
              <CountUp value={r.kw} duration={0.5} /><span className="ml-2 text-h3">kW</span>
            </p>
            <p className="mt-2 text-caption text-muted">{t("calculator.roofNeeded", { sqft: formatNum(r.roofNeededSqft) })}</p>
            {r.roofLimited && <p className="mt-2 flex items-center gap-1.5 text-caption font-semibold text-gold-ink"><TriangleAlert className="size-4" aria-hidden />{t("calculator.roofLimited")}</p>}
          </div>
          <dl className="grid grid-cols-2 gap-px bg-line sm:grid-cols-3">
            <Stat label={t("calculator.cost")} value={formatLakh(r.cost)} />
            <Stat label={t("calculator.subsidy")} value={r.subsidy ? `−${formatINR(r.subsidy)}` : "—"} note={r.subsidy ? t("common.asPerScheme") : undefined} />
            <Stat label={t("calculator.netCost")} value={formatLakh(r.netCost)} />
            <Stat label={t("calculator.monthly")} value={<CountUp value={r.monthlySaving} format={formatINR} duration={0.5} />} highlight />
            <Stat label={t("calculator.yearly")} value={<CountUp value={r.yearlySaving} format={formatINR} duration={0.5} />} highlight />
            <Stat label={t("calculator.payback")} value={r.paybackYears !== null ? t("common.years", { count: r.paybackYears }) : "—"} />
            <Stat label={t("calculator.lifetime")} value={formatLakh(r.lifetimeSaving)} highlight />
            <Stat label={t("calculator.co2")} value={t("calculator.co2Value", { value: r.co2TonnesYear })} />
            <Stat label="" value="" className="hidden sm:block" />
          </dl>
          <p className="border-t border-line px-6 py-4 text-caption text-muted md:px-8">{(locale === "te" && calcSettings().disclaimer.te) || calcSettings().disclaimer.en} {r.subsidy > 0 && t("common.subsidyNote")}</p>
        </Card>

        <Card className="p-6 md:p-8"><SavingsChart data={r.projection} /></Card>

        <Card className="border-gold/50 p-6 md:p-8">
          <div className="mb-5 flex items-start gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-whatsapp text-white"><MessageCircle className="size-5" aria-hidden /></span>
            <div>
              <h2 className="font-heading text-h4 font-bold">{t("calculator.reportTitle")}</h2>
              <p className="mt-1 text-caption text-muted">{t("calculator.reportSubtitle")}</p>
            </div>
          </div>
          <LeadForm kind="calculator_report" fields={{ location: false, propertyType: false }} calc={summarize(r)} submitLabel={t("calculator.reportCta")} wide />
        </Card>
      </div>
    </div>
  );
}

function Stat({ label, value, note, highlight, className }: { label: string; value: React.ReactNode; note?: string; highlight?: boolean; className?: string }) {
  return (
    <div className={`bg-white p-4 md:p-5 ${className ?? ""}`}>
      <dt className="text-caption text-muted">{label}</dt>
      <dd className={`mt-1 font-heading text-[1.125rem] font-extrabold md:text-h4 ${highlight ? "text-leaf-ink" : ""}`}>{value}</dd>
      {note && <p className="mt-0.5 text-[0.6875rem] text-muted">{note}</p>}
    </div>
  );
}
