"use client";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { ChoiceChips } from "@/components/ui/choice-chips";
import { Progress } from "@/components/ui/progress";
import { CountUp } from "@/components/motion/count-up";
import { calculatorConfig as C, loanConfig as L } from "@/config/calculator";
import { calculate } from "@/lib/calculator";
import { formatINR } from "@/lib/utils";

/** Standard EMI = P·r·(1+r)^n / ((1+r)^n − 1), compared with the calculator's monthly saving. */
export function emi(principal: number, annualRatePct: number, months: number) {
  if (principal <= 0) return 0;
  const r = annualRatePct / 12 / 100;
  if (r === 0) return principal / months;
  const f = Math.pow(1 + r, months);
  return (principal * r * f) / (f - 1);
}

export function EmiCalculator() {
  const t = useTranslations("subsidyPage");
  const tc = useTranslations("common");
  const tm = useTranslations("mini");
  const [bill, setBill] = useState(C.billRange.default);
  const [years, setYears] = useState(String(L.defaultTenure));
  const r = useMemo(() => calculate({ type: "home", mode: "bill", value: bill }), [bill]);
  const down = Math.round((r.netCost * L.downPaymentPercent) / 100);
  const loan = r.netCost - down;
  const monthly = Math.round(emi(loan, L.interestRate, Number(years) * 12));
  const covered = monthly ? Math.min(100, Math.round((r.monthlySaving / monthly) * 100)) : 0;

  return (
    <Card className="grid gap-6 border-0 p-4 shadow-none sm:p-6 lg:grid-cols-12 lg:gap-8 lg:p-8">
      {/* Inputs */}
      <div className="lg:col-span-7">
        <label htmlFor="emi-bill" className="text-base font-semibold text-ink md:text-[1.0625rem]">{tm("billLabel")}</label>
        <p className="mt-2 font-heading text-[2.75rem] font-extrabold leading-none tracking-[-0.03em] text-ink tabular-nums md:text-[3.5rem]">{formatINR(bill)}</p>
        <Slider id="emi-bill" className="mt-5 py-4 [&>span:first-child]:h-3.5 [&_[role=slider]]:size-9 [&_[role=slider]]:border-[5px]" value={[bill]} min={C.billRange.min} max={20000} step={100} onValueChange={([v]) => setBill(v)} aria-label={tm("billLabel")} />
        <div className="flex justify-between text-caption font-semibold text-muted"><span>{formatINR(C.billRange.min)}</span><span>{formatINR(20000)}</span></div>

        <p className="mb-3 mt-8 text-base font-semibold text-ink md:text-[1.0625rem]">{t("tenure")}</p>
        <ChoiceChips label={t("tenure")} layoutId="emi-tenure" value={years} onChange={setYears}
          className="grid w-full grid-cols-2 gap-1.5 rounded-xl border-[#1E40AF]/15 bg-[#EEF3FA] p-1.5 sm:grid-cols-4 [&_button]:min-h-12 [&_button]:px-4 [&_button]:text-base [&_button]:font-semibold md:[&_button]:min-h-14 md:[&_button]:text-[1.0625rem]"
          options={L.tenuresYears.map((y) => ({ value: String(y), label: tc("years", { count: y }) }))} />

        <dl className="mt-8 overflow-hidden rounded-xl border border-line bg-white">
          <Row k={t("systemCost")} v={formatINR(r.netCost)} />
          <Row k={`${t("downPayment")} (${L.downPaymentPercent}%)`} v={formatINR(down)} />
          <Row k={t("loanAmount")} v={formatINR(loan)} strong />
          <Row k={t("rate")} v={t("rateValue", { rate: L.interestRate })} />
        </dl>
      </div>

      {/* Result */}
      <div className="relative flex flex-col justify-center overflow-hidden rounded-[1.25rem] bg-[#F5F8FC] p-6 ring-1 ring-[#1D4ED8]/30 sm:p-8 lg:col-span-5 lg:p-10">
        <span aria-hidden className="absolute inset-x-0 top-0 h-1.5 bg-gold" />
        <p className="text-base font-semibold text-ink md:text-[1.0625rem]">{t("emi")}</p>
        <p className="mt-2 font-heading text-[3rem] font-extrabold leading-none tracking-[-0.03em] text-ink tabular-nums md:text-[4rem]">
          <CountUp value={monthly} format={formatINR} duration={0.4} /><span className="ml-1 text-base font-bold text-[#475569] md:text-lg">{tc("perMonth")}</span>
        </p>

        <div className="mt-8 rounded-2xl bg-white/80 p-5 shadow-[0_10px_30px_-20px_rgb(15_47_107/0.35)]">
          <p className="text-base font-semibold text-ink">{t("saving")}</p>
          <p className="mt-1 font-heading text-[2rem] font-extrabold leading-tight text-leaf-ink tabular-nums md:text-[2.5rem]"><CountUp value={r.monthlySaving} format={formatINR} duration={0.4} /></p>
          <Progress value={covered / 100} className="mt-4 h-4" label={t("emiCovered", { percent: covered })} />
          <p className="mt-3 text-base font-bold text-ink">{t("emiCovered", { percent: covered })}</p>
        </div>

        <p className="mt-6 text-caption leading-relaxed text-[#475569]">{t("emiNote")} {tc("estimatesNote")}</p>
      </div>
    </Card>
  );
}

function Row({ k, v, strong }: { k: string; v: string; strong?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-line px-5 py-4 last:border-0 odd:bg-[#EEF3FA]">
      <dt className="text-base text-[#475569]">{k}</dt>
      <dd className={strong ? "text-lg font-extrabold text-ink tabular-nums md:text-xl" : "text-base font-bold text-ink tabular-nums md:text-lg"}>{v}</dd>
    </div>
  );
}
