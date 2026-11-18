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
    <Card className="grid gap-6 p-6 md:grid-cols-2 md:p-8">
      <div>
        <label htmlFor="emi-bill" className="text-caption font-semibold text-muted">{tm("billLabel")}</label>
        <p className="mt-1 font-heading text-h2 font-extrabold">{formatINR(bill)}</p>
        <Slider id="emi-bill" className="mt-3" value={[bill]} min={C.billRange.min} max={20000} step={100} onValueChange={([v]) => setBill(v)} aria-label={tm("billLabel")} />
        <p className="mb-2 mt-6 text-caption font-semibold">{t("tenure")}</p>
        <ChoiceChips label={t("tenure")} layoutId="emi-tenure" value={years} onChange={setYears}
          options={L.tenuresYears.map((y) => ({ value: String(y), label: tc("years", { count: y }) }))} />
        <dl className="mt-6 space-y-2 text-caption">
          <Row k={t("systemCost")} v={formatINR(r.netCost)} />
          <Row k={`${t("downPayment")} (${L.downPaymentPercent}%)`} v={formatINR(down)} />
          <Row k={t("loanAmount")} v={formatINR(loan)} />
          <Row k={t("rate")} v={t("rateValue", { rate: L.interestRate })} />
        </dl>
      </div>
      <div className="flex flex-col justify-center rounded-2xl bg-cream p-6">
        <p className="text-caption text-muted">{t("emi")}</p>
        <p className="font-heading text-hero font-extrabold"><CountUp value={monthly} format={formatINR} duration={0.4} /><span className="text-caption font-semibold text-muted">{tc("perMonth")}</span></p>
        <p className="mt-4 text-caption text-muted">{t("saving")}</p>
        <p className="font-heading text-h3 font-extrabold text-leaf-ink"><CountUp value={r.monthlySaving} format={formatINR} duration={0.4} /></p>
        <Progress value={covered / 100} className="mt-5 h-3" label={t("emiCovered", { percent: covered })} />
        <p className="mt-2 text-caption font-semibold">{t("emiCovered", { percent: covered })}</p>
        <p className="mt-4 text-[0.75rem] text-muted">{t("emiNote")} {tc("estimatesNote")}</p>
      </div>
    </Card>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return <div className="flex justify-between gap-3 border-b border-line pb-2"><dt className="text-muted">{k}</dt><dd className="font-semibold tabular-nums">{v}</dd></div>;
}
