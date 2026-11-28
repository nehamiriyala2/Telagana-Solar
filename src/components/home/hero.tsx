import { useTranslations } from "next-intl";
import { ArrowRight, Check, Gauge, IndianRupee, PiggyBank, Timer } from "lucide-react";
import { GuideTrigger, SubsidyTrigger } from "@/components/tools/triggers";
import { calculate } from "@/lib/calculator";
import { formatINR, formatLakh } from "@/lib/utils";
import { HeroMedia } from "./hero-media";
import { CountUpText } from "@/components/motion/count-up";
import { COMMON } from "@/lib/motion";

const EXAMPLE_BILL = 3000;

/**
 * Home hero: full-bleed house-sunrise photo under a deep navy overlay.
 * Left: serif headline in ivory with "Pay Less For It." in gold, the Telugu/English line in soft ivory,
 * "Find My Solar Plan" (gold fill, navy text) + "Check My Subsidy" (ivory outline), three trust ticks.
 * Right: a floating glass card (navy ~70%, backdrop blur, gold hairline border) with a quick plan preview,
 * computed by the Savings Calculator for a ₹3,000 home bill. Icons unchanged.
 */
export function Hero() {
  const t = useTranslations();
  const r = calculate({ type: "home", mode: "bill", value: EXAMPLE_BILL });
  const d = (i: number) => ({ style: { animationDelay: `${0.05 + i * 0.08}s` } });
  const stats = [
    { Icon: Gauge, label: t("hero.cardSize"), value: `${r.kw} kW` },
    { Icon: IndianRupee, label: t("calculator.subsidy"), value: formatLakh(r.subsidy) },
    { Icon: PiggyBank, label: t("calculator.monthly"), value: formatINR(r.monthlySaving) },
    { Icon: Timer, label: t("calculator.payback"), value: r.paybackYears !== null ? t("common.years", { count: r.paybackYears }) : "—" },
  ];

  return (
    <section className="relative isolate overflow-hidden bg-[#0B1F3A]" aria-labelledby="hero-title">
      <HeroMedia alt={t("hero.imageAlt")} />
      <div className="container-page grid items-center gap-10 pb-24 pt-14 md:pt-20 lg:min-h-[42rem] lg:grid-cols-12 lg:gap-12 lg:pb-28 lg:pt-20">
        <div className="lg:col-span-7">
          <p {...d(0)} className="eyebrow-pill eyebrow-pill--dark animate-rise">{t("hero.eyebrow")}</p>
          <h1 {...d(1)} id="hero-title" className="mt-5 animate-rise font-heading text-[clamp(2.4rem,5vw,4rem)] font-semibold leading-[1.1] text-[#F5F0E6]">
            {t("hero.headA")} <span className="text-[#B8913F]">{t("hero.headGold")}</span>
          </h1>
          <p {...d(2)} lang={t("hero.altLang")} className="mt-4 animate-rise border-l-2 border-[#B8913F] pl-4 font-heading text-[1.125rem] italic leading-[1.7] text-[#F5F0E6]/85">{t("hero.altLine")}</p>
          <p {...d(3)} className="mt-4 max-w-xl animate-rise text-[1.0625rem] text-[#F5F0E6]/80">{t("hero.subtitle")}</p>
          <div {...d(4)} className="mt-8 flex animate-rise flex-col gap-3 sm:flex-row">
            <GuideTrigger size="lg" variant="accent" className="w-full sm:w-auto">{t("hero.primary")}<ArrowRight aria-hidden /></GuideTrigger>
            <SubsidyTrigger variant="outline" size="lg" className="border-[#F5F0E6]/70 text-[#F5F0E6] hover:border-[#F5F0E6] hover:bg-[#F5F0E6]/10">{t("hero.secondary")}</SubsidyTrigger>
          </div>
          <ul {...d(5)} className="mt-6 flex animate-rise flex-wrap gap-x-6 gap-y-3 text-[0.9375rem] text-[#F5F0E6]/85">
            {(["trust1", "trust2", "trust3"] as const).map((k) => (
              <li key={k} className="flex items-center gap-2">
                <span aria-hidden className="grid size-5 shrink-0 place-items-center rounded-full border border-[#B8913F] text-[#B8913F]"><Check className="size-3" strokeWidth={3} /></span>
                {t(`hero.${k}`)}
              </li>
            ))}
          </ul>
        </div>

        {/* Floating glass plan card */}
        <aside {...d(6)} aria-labelledby="hero-card-title" className="animate-rise lg:col-span-5 lg:justify-self-end">
          <div className="w-full max-w-md rounded-3xl border border-[#B8913F]/50 bg-[#0B1F3A]/70 p-6 shadow-[0_40px_80px_-40px_rgb(0_0_0/0.6)] backdrop-blur-md md:p-7">
            <p className="eyebrow-pill eyebrow-pill--dark">{t("hero.cardExample", { bill: formatINR(EXAMPLE_BILL) })}</p>
            <h2 id="hero-card-title" className="mt-3 font-heading text-[1.5rem] font-semibold text-[#F5F0E6]">{t("hero.cardTitle")}</h2>
            <dl className="mt-5 grid grid-cols-2 gap-3">
              {stats.map(({ Icon, label, value }) => (
                <div key={label} className="rounded-2xl border border-[#F5F0E6]/10 bg-[#F5F0E6]/[0.04] p-4">
                  <dt className="flex items-center gap-1.5 text-[0.75rem] text-[#F5F0E6]/75"><Icon className="size-3.5 text-[#B8913F]" aria-hidden />{label}</dt>
                  <dd className="mt-1.5 font-heading text-[1.375rem] font-semibold text-[#F5F0E6]"><CountUpText text={value} duration={COMMON.countUp} /></dd>
                </div>
              ))}
            </dl>
            <GuideTrigger size="md" variant="accent" className="mt-5 w-full">{t("hero.cardCta")}<ArrowRight aria-hidden /></GuideTrigger>
            <p className="mt-3 text-center text-[0.75rem] text-[#F5F0E6]/65">{t("hero.cardNote")}</p>
          </div>
        </aside>
      </div>
    </section>
  );
}
