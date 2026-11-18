"use client";
import { useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { CountUp } from "@/components/motion/count-up";
import { Reveal } from "@/components/motion/reveal";
import { calculatorConfig as C } from "@/config/calculator";
import { calculate } from "@/lib/calculator";
import { formatINR } from "@/lib/utils";

/** Home-page widget: bill slider + result card + "Get full report" (carries the bill to the full calculator). */
export function MiniCalculator() {
  const t = useTranslations();
  const [bill, setBill] = useState(C.billRange.default);
  const r = useMemo(() => calculate({ type: "home", mode: "bill", value: bill }), [bill]);

  return (
    <section className="dot-grid relative isolate overflow-hidden bg-[radial-gradient(ellipse_55%_60%_at_0%_0%,rgb(255_199_44/0.20),transparent_62%),linear-gradient(135deg,#FFFBF2_0%,#FFFFFF_45%,#F1F7FF_100%)] py-16 md:py-24" aria-labelledby="mini-title">
      <div aria-hidden className="orb -left-20 -top-20 size-96 bg-yellow/25" />
      <div aria-hidden className="pointer-events-none absolute -bottom-40 -right-40 -z-10 size-[34rem] rounded-full border-2 border-yellow/40 shadow-[0_0_80px_-20px_rgb(255_199_44/0.5)]" />
      <div className="container-page grid items-center gap-10 lg:grid-cols-12">
        <Reveal className="lg:col-span-5">
          <p className="eyebrow-pill">{t("mini.eyebrow")}</p>
          <h2 id="mini-title" className="mt-4 text-h2 text-navy md:text-[3.25rem] md:leading-[3.75rem]">{t("mini.title")}</h2>
          <p className="mt-4 text-muted md:text-body-lg">{t("mini.subtitle")}</p>
        </Reveal>

        <Reveal delay={0.1} className="lg:col-span-7">
          <div className="relative grid gap-4 overflow-hidden rounded-[1.75rem] bg-white p-6 shadow-[0_30px_70px_-34px_rgb(7_23_63/0.35),0_0_60px_-28px_rgb(255_199_44/0.45)] ring-1 ring-navy/[0.06] transition-shadow duration-500 hover:shadow-[0_36px_80px_-34px_rgb(7_23_63/0.42),0_0_70px_-26px_rgb(255_199_44/0.55)] md:grid-cols-2 md:p-8">
            <span aria-hidden className="absolute inset-x-0 top-0 h-1.5 bg-[linear-gradient(90deg,#FFC72C,#F5A800,#4DA3FF)]" />
            <div>
              <label htmlFor="mini-bill" className="text-caption font-semibold text-muted">{t("mini.billLabel")}</label>
              <p className="mt-1 font-heading text-hero font-extrabold tracking-tightish"><span aria-live="polite">{formatINR(bill)}</span></p>
              <Slider id="mini-bill" className="mt-4" value={[bill]} min={C.billRange.min} max={20000} step={C.billRange.step} onValueChange={([v]) => setBill(v)} aria-label={t("mini.billLabel")} />
              <div className="mt-1 flex justify-between text-[0.75rem] text-muted"><span>{formatINR(C.billRange.min)}</span><span>{formatINR(20000)}</span></div>
            </div>
            <div className="rounded-2xl bg-[linear-gradient(160deg,#FFF8E6,#FFFBF2)] p-5 ring-1 ring-gold/20">
              <p className="text-caption font-semibold text-sky-ink">{t("mini.resultTitle")}</p>
              <dl className="mt-3 space-y-3">
                <Row label={t("mini.size")} value={<><CountUp value={r.kw} duration={0.4} /> kW</>} />
                <Row label={t("mini.subsidy")} value={r.subsidy ? formatINR(r.subsidy) : "—"} green={r.subsidy > 0} />
                <Row label={t("mini.saving")} value={<><CountUp value={r.monthlySaving} format={formatINR} duration={0.4} /><span className="text-caption font-semibold text-muted">{t("common.perMonth")}</span></>} green />
                <Row label={t("mini.payback")} value={r.paybackYears !== null ? t("common.years", { count: r.paybackYears }) : "—"} />
              </dl>
              <Button asChild className="btn-shine mt-5 w-full"><Link href={{ pathname: "/savings-calculator", query: { bill } }}>{t("mini.fullReport")}<ArrowRight aria-hidden /></Link></Button>
            </div>
            <p className="text-[0.75rem] text-muted md:col-span-2">{t("common.estimatesNote")} {t("common.subsidyNote")}</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Row({ label, value, green }: { label: string; value: React.ReactNode; green?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-line pb-3 last:border-0 last:pb-0">
      <dt className="text-caption text-muted">{label}</dt>
      <dd className={`font-heading text-h4 font-extrabold ${green ? "text-leaf-ink" : ""}`}>{value}</dd>
    </div>
  );
}
