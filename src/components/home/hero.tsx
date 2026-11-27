import { useTranslations } from "next-intl";
import { ArrowRight, Check, Gauge, IndianRupee, PiggyBank, Timer } from "lucide-react";
import { GuideTrigger, SubsidyTrigger } from "@/components/tools/triggers";
import { calculate } from "@/lib/calculator";
import { formatINR, formatLakh } from "@/lib/utils";
import Image from "next/image";
import { UI_IMAGES } from "@/data/section-photos";
import { HeroMedia } from "./hero-media";

const EXAMPLE_BILL = 3000;

/**
 * Home hero, split layout on the hero gradient (blue → light → green) with a faint dotted grid, two soft brand blobs
 * and a gentle sun glow behind the photo.
 * Left: eyebrow, H1 (second sentence in blue), second-language line, one-line description, solid blue
 * "Find My Solar Plan" + outline "Check My Subsidy", three green trust ticks.
 * Right: the sunny photo in a large rounded 4:3 frame with a floating white plan card over its bottom-left corner
 * (four mini stats with tinted icon circles, savings in green), computed by the Savings Calculator for a ₹3,000 bill.
 * Text paints instantly (CSS entrance), so it never delays LCP.
 */
export function Hero() {
  const t = useTranslations();
  const r = calculate({ type: "home", mode: "bill", value: EXAMPLE_BILL });
  const d = (i: number) => ({ style: { animationDelay: `${0.05 + i * 0.08}s` } });
  const stats = [
    { Icon: Gauge, label: t("hero.cardSize"), value: `${r.kw} kW`, tile: "bg-tint-ice text-primary", val: "text-ink" },
    { Icon: IndianRupee, label: t("calculator.subsidy"), value: formatLakh(r.subsidy), tile: "bg-tint-mist text-primary", val: "text-ink" },
    { Icon: PiggyBank, label: t("calculator.monthly"), value: formatINR(r.monthlySaving), tile: "bg-tint-mint text-green-text", val: "text-green-text", img: UI_IMAGES.plan.savings },
    { Icon: Timer, label: t("calculator.payback"), value: r.paybackYears !== null ? t("common.years", { count: r.paybackYears }) : "—", tile: "bg-mist text-body", val: "text-ink", img: UI_IMAGES.plan.payback },
  ];

  return (
    <section className="site-dots relative isolate overflow-hidden bg-[image:var(--hero-gradient)]" aria-labelledby="hero-title">
      <span aria-hidden className="deco-blob deco-blob--blue -left-40 top-10 size-[28rem]" />
      <span aria-hidden className="deco-blob deco-blob--green -right-32 bottom-0 size-[26rem]" />
      <div className="container-page grid items-center gap-14 pb-20 pt-12 md:pt-16 lg:grid-cols-12 lg:gap-12 lg:pb-28 lg:pt-20">
        <div className="lg:col-span-6">
          <p {...d(0)} className="eyebrow-pill hero-pill animate-rise">{t("hero.eyebrow")}</p>
          <h1 {...d(1)} id="hero-title" className="mt-5 animate-rise font-heading text-[clamp(2.75rem,5vw,4rem)] font-extrabold leading-[1.06] tracking-[-0.02em] text-ink">
            {t("hero.headA")} <span className="text-primary">{t("hero.headGold")}</span>
          </h1>
          <p {...d(2)} lang={t("hero.altLang")} className="mt-5 animate-rise text-[1.125rem] font-semibold text-primary md:text-h4">{t("hero.altLine")}</p>
          <p {...d(3)} className="mt-4 max-w-xl animate-rise text-body md:text-body-lg">{t("hero.subtitle")}</p>
          <div {...d(4)} className="mt-8 flex animate-rise flex-col gap-3 sm:flex-row">
            <GuideTrigger size="lg" className="w-full sm:w-auto">{t("hero.primary")}<ArrowRight aria-hidden /></GuideTrigger>
            <SubsidyTrigger variant="outline" size="lg">{t("hero.secondary")}</SubsidyTrigger>
          </div>
          <ul {...d(5)} className="mt-7 grid animate-rise gap-x-6 gap-y-3 text-[0.9375rem] font-medium text-ink sm:grid-cols-2">
            {(["trust1", "trust2", "trust3"] as const).map((k) => (
              <li key={k} className="flex min-w-0 items-start gap-2">
                <span aria-hidden className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-green text-white"><Check className="size-3" strokeWidth={3} /></span>
                {t(`hero.${k}`)}
              </li>
            ))}
          </ul>
        </div>

        <div {...d(3)} className="relative animate-rise lg:col-span-6">
          <span aria-hidden className="deco-sun -right-16 -top-20 size-[34rem]" />
          <HeroMedia alt={t("hero.imageAlt")} />
          {/* Floating plan card over the photo's bottom-left corner */}
          <aside aria-labelledby="hero-card-title"
            className="relative mx-4 -mt-16 rounded-[1.25rem] border border-card-line bg-white p-5 shadow-[0_20px_50px_-20px_rgb(15_47_107/0.35)] sm:mx-auto sm:max-w-md lg:absolute lg:-bottom-16 lg:-left-14 lg:mx-0 lg:mt-0 lg:w-[24rem]">
            <h2 id="hero-card-title" className="font-heading text-[1.0625rem] font-bold text-ink">{t("hero.cardTitle")}</h2>
            <p className="mt-0.5 text-[0.75rem] font-medium text-muted">{t("hero.cardExample", { bill: formatINR(EXAMPLE_BILL) })}</p>
            <dl className="mt-4 grid grid-cols-2 gap-3">
              {stats.map(({ Icon, label, value, tile, val, ...rest }) => (
                <div key={label} className="flex items-center gap-2.5">
                  {"img" in rest && rest.img
                    ? <span aria-hidden className="relative size-10 shrink-0 overflow-hidden rounded-xl bg-white ring-1 ring-card-line"><Image src={rest.img} alt="" fill sizes="40px" className="object-cover" /></span>
                    : <span aria-hidden className={`grid size-10 shrink-0 place-items-center rounded-xl ${tile}`}><Icon className="size-5" /></span>}
                  <span className="min-w-0">
                    <dt className="text-[0.75rem] leading-tight text-muted">{label}</dt>
                    <dd className={`font-heading text-[1.0625rem] font-bold leading-tight tabular-nums ${val}`}>{value}</dd>
                  </span>
                </div>
              ))}
            </dl>
            <GuideTrigger size="sm" className="mt-4 w-full">{t("hero.cardCta")}<ArrowRight aria-hidden /></GuideTrigger>
            <p className="mt-2 text-center text-[0.6875rem] text-muted">{t("hero.cardNote")}</p>
          </aside>
        </div>
      </div>
    </section>
  );
}
