import { useTranslations } from "next-intl";
import { ArrowRight, Calculator } from "lucide-react";
import { Magnetic } from "@/components/motion/magnetic";
import { GuideTrigger, SubsidyTrigger } from "@/components/tools/triggers";
import { HeroMedia } from "./hero-media";

/**
 * Home hero: full-bleed cinematic background (solar house at sunrise, animated in code or by an optional
 * looping video) with the headline and buttons over a soft navy fade. Text paints instantly (CSS entrance).
 */
export function Hero() {
  const t = useTranslations("hero");
  const d = (i: number) => ({ style: { animationDelay: `${0.05 + i * 0.08}s` } });
  return (
    <section className="relative isolate flex min-h-[calc(100svh-var(--header-h))] items-center overflow-hidden md:min-h-[640px] lg:min-h-[720px]" aria-labelledby="hero-title">
      <HeroMedia alt={t("imageAlt")} />

      <div className="container-page relative w-full pb-28 pt-12 md:pb-36 md:pt-16">
        <div className="max-w-[40rem]">
          <p {...d(0)} className="eyebrow-pill eyebrow-pill--dark animate-rise backdrop-blur">{t("eyebrow")}</p>
          <h1 {...d(1)} id="hero-title" className="mt-5 animate-rise text-[2.625rem] font-extrabold leading-[1.05] text-white [text-shadow:0_4px_30px_rgb(7_23_63/0.45)] sm:text-[3.25rem] lg:text-[4.25rem]">
            {t("titleA")}<span className="text-gold-gradient drop-shadow-[0_2px_16px_rgb(255_199_44/0.45)]">{t("titleGold")}</span>{t("titleB")}
          </h1>
          <p {...d(2)} lang={t("altLang")} className="mt-4 animate-rise border-l-4 border-yellow pl-3 font-heading text-[1.125rem] font-bold text-[#A9D2FF] [text-shadow:0_2px_14px_rgb(7_23_63/0.8)] md:text-h4">{t("altLine")}</p>
          <p {...d(3)} className="mt-4 max-w-xl animate-rise text-silver [text-shadow:0_2px_14px_rgb(7_23_63/0.85)] md:text-body-lg">{t("subtitle")}</p>
          <div {...d(4)} className="mt-8 flex animate-rise flex-col gap-3 sm:flex-row">
            <Magnetic className="inline-block">
              <GuideTrigger size="lg" className="btn-shine w-full shadow-[0_14px_34px_-12px_rgb(245_168_0/0.85)] sm:w-auto">{t("primary")}<ArrowRight aria-hidden /></GuideTrigger>
            </Magnetic>
            <SubsidyTrigger variant="outline" size="lg" className="border-white/35 bg-white/10 text-white backdrop-blur-md hover:border-yellow hover:bg-white/15">
              <Calculator aria-hidden />{t("secondary")}
            </SubsidyTrigger>
          </div>
          <p {...d(5)} className="mt-4 animate-rise text-caption text-silver [text-shadow:0_2px_12px_rgb(7_23_63/0.9)]">{t("note")}</p>
        </div>
      </div>

      {/* Curved edge into the navy section */}
      <svg aria-hidden viewBox="0 0 1440 90" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-14 w-full md:h-20">
        <path d="M0 90 V40 C 240 90 480 0 720 30 C 960 60 1200 10 1440 40 V90 Z" fill="#07173F" />
      </svg>
    </section>
  );
}
