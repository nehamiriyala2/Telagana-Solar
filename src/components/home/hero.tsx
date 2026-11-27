import { useTranslations } from "next-intl";
import { ArrowRight, Check, Gauge, IndianRupee, PiggyBank, Timer } from "lucide-react";
import { GuideTrigger, SubsidyTrigger } from "@/components/tools/triggers";
import { calculate } from "@/lib/calculator";
import { formatINR, formatLakh } from "@/lib/utils";
import { HeroMedia } from "./hero-media";

const EXAMPLE_BILL = 3000;

/**
 * Home hero: bright full-width sunrise photo, a soft cream fade behind the copy (no dark overlay).
 * Left: serif headline in the heading colour with "Pay Less For It." in sky blue, the second-language line in
 * sky blue, "Find My Solar Plan" (gold gradient) + "Check My Subsidy" (cloud pill, sky-blue outline), three trust ticks.
 * Right: a light frosted plan card (cloud ~85%, blur, 24px radius, soft blue shadow) with four tinted stat tiles,
 * computed by the same calculator as the Savings Calculator for an example ₹3,000 home bill.
 * Text paints instantly (CSS entrance), so it never delays LCP.
 */
export function Hero() {
  const t = useTranslations();
  const r = calculate({ type: "home", mode: "bill", value: EXAMPLE_BILL });
  const d = (i: number) => ({ style: { animationDelay: `${0.05 + i * 0.08}s` } });
  const rows = [
    { Icon: Gauge, label: t("calculator.size"), value: `${r.kw} kW`, tint: "bg-tint-ice" },
    { Icon: IndianRupee, label: t("calculator.subsidy"), value: formatLakh(r.subsidy), tint: "bg-tint-cream" },
    { Icon: PiggyBank, label: t("calculator.monthly"), value: formatINR(r.monthlySaving), tint: "bg-tint-mist" },
    { Icon: Timer, label: t("calculator.payback"), value: r.paybackYears !== null ? t("common.years", { count: r.paybackYears }) : "—", tint: "bg-tint-mint" },
  ];

  return (
    <section className="relative isolate overflow-hidden bg-cloud" aria-labelledby="hero-title">
      <HeroMedia alt={t("hero.imageAlt")} />

      <div className="container-page grid items-center gap-12 py-14 md:py-20 lg:min-h-[44rem] lg:grid-cols-12 lg:gap-10 lg:py-24">
        <div className="lg:col-span-7">
          <p {...d(0)} className="eyebrow-pill hero-pill animate-rise">{t("hero.eyebrow")}</p>
          <h1 {...d(1)} id="hero-title" className="mt-6 animate-rise font-heading text-[2.5rem] font-semibold leading-[1.08] text-ink sm:text-[3.25rem] lg:text-[4rem]">
            {t("hero.headA")} <span className="text-primary">{t("hero.headGold")}</span>
          </h1>
          <p {...d(2)} lang={t("hero.altLang")} className="mt-5 animate-rise border-l-2 border-gold pl-4 font-heading text-[1.125rem] italic text-primary md:text-h4">{t("hero.altLine")}</p>
          <p {...d(3)} className="mt-5 max-w-xl animate-rise text-body md:text-body-lg">{t("hero.subtitle")}</p>
          <div {...d(4)} className="mt-9 flex animate-rise flex-col gap-3 sm:flex-row">
            <GuideTrigger size="lg" className="w-full sm:w-auto">{t("hero.primary")}<ArrowRight aria-hidden /></GuideTrigger>
            <SubsidyTrigger variant="outline" size="lg">{t("hero.secondary")}</SubsidyTrigger>
          </div>
          <ul {...d(5)} className="mt-7 flex animate-rise flex-wrap gap-x-6 gap-y-2.5 text-caption font-medium text-ink">
            {(["trust1", "trust2", "trust3"] as const).map((k) => (
              <li key={k} className="flex items-center gap-2">
                <span aria-hidden className="grid size-5 place-items-center rounded-full bg-primary text-card"><Check className="size-3" strokeWidth={3} /></span>
                {t(`hero.${k}`)}
              </li>
            ))}
          </ul>
        </div>

        {/* Frosted plan preview */}
        <aside {...d(6)} aria-labelledby="hero-card-title" className="animate-rise lg:col-span-5 lg:justify-self-end">
          <div className="w-full max-w-md rounded-3xl border border-card-line bg-card/85 p-6 shadow-[0_30px_70px_-30px_rgb(27_69_112/0.28)] backdrop-blur-md md:p-7">
            <p className="eyebrow-pill">{t("hero.cardExample", { bill: formatINR(EXAMPLE_BILL) })}</p>
            <h2 id="hero-card-title" className="mt-3 font-heading text-[1.5rem] font-semibold text-ink">{t("hero.cardTitle")}</h2>
            <dl className="mt-5 grid grid-cols-2 gap-3">
              {rows.map(({ Icon, label, value, tint }) => (
                <div key={label} className={`rounded-2xl p-4 ${tint}`}>
                  <dt className="flex items-center gap-1.5 text-[0.75rem] text-body"><Icon className="size-3.5 text-primary" aria-hidden />{label}</dt>
                  <dd className="mt-1.5 font-heading text-[1.375rem] font-semibold text-primary">{value}</dd>
                </div>
              ))}
            </dl>
            <GuideTrigger size="md" className="mt-5 w-full">{t("hero.cardCta")}<ArrowRight aria-hidden /></GuideTrigger>
            <p className="mt-3 text-center text-[0.75rem] text-muted">{t("hero.cardNote")}</p>
          </div>
        </aside>
      </div>
    </section>
  );
}
