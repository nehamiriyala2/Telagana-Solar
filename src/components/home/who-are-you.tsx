import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/motion/reveal";
import { Parallax } from "@/components/motion/primitives";
import { TiltCard } from "@/components/motion/tilt-card";
import { GuideTrigger } from "@/components/tools/triggers";
import { PERSONA_ICONS } from "@/components/tools/persona-icons";
import { PERSONAS } from "@/config/personas";
import { personaMedia } from "@/data/personas-media";
import { pick } from "@/lib/utils";

/**
 * "Which solar suits you?" (homepage): heading + a slowly rotating orbit of the visitor pictures around a
 * glowing sun (lg+, decorative, pauses on hover), then 7 image cards → /for/<persona> plus Find My Solar Plan.
 * Cards: picture header with slow zoom on hover, 3D tilt, lift. Visitors without a picture keep the icon header.
 */
export function WhoAreYou() {
  const t = useTranslations();
  const locale = useLocale();
  const orbit = PERSONAS.filter((p) => personaMedia[p]);
  return (
    <section className="dot-grid bg-premium-sky relative isolate overflow-hidden py-16 md:py-24" aria-labelledby="who-title">
      <div aria-hidden className="orb -right-24 top-10 size-96 bg-yellow/25" />
      <div className="container-page">
        <div className="grid items-center gap-8 lg:mb-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <SectionHeading premium align="left" eyebrow={t("who.eyebrow")} title={t("who.title")} subtitle={t("who.subtitle")} />
          </div>

          {/* Orbit of visitor pictures (decorative) */}
          <div aria-hidden className="relative hidden lg:col-span-5 lg:block">
            <Parallax offset={50}>
              <div className="who-orbit relative mx-auto aspect-square w-full max-w-[26rem]">
                <span className="absolute inset-[14%] rounded-full border border-dashed border-royal/20" />
                <span className="absolute inset-[30%] rounded-full border border-royal/10" />
                {/* Sun at the centre */}
                <span className="absolute left-1/2 top-1/2 grid size-24 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-[radial-gradient(circle_at_35%_35%,#FFE58A,#FFB800_55%,#E88A00)] shadow-[0_0_60px_12px_rgb(255_184_0/0.45)]">
                  <Sparkles className="size-9 text-navy/80" />
                </span>
                <span className="absolute left-1/2 top-1/2 size-48 -translate-x-1/2 -translate-y-1/2 animate-glow rounded-full bg-[radial-gradient(circle,rgb(255_210_110/0.45),transparent_68%)]" />
                {/* Rotating ring; each picture counter-rotates so it stays upright */}
                <div className="who-orbit__ring absolute inset-[14%]">
                  {orbit.map((p, i) => {
                    const m = personaMedia[p]!;
                    const angle = (i / orbit.length) * 360;
                    return (
                      <span key={p} className="absolute inset-0" style={{ transform: `rotate(${angle}deg)` }}>
                        <span className="absolute left-1/2 top-0 size-0">
                          <span className="block size-0" style={{ transform: `rotate(${-angle}deg)` }}>
                            <span className="who-orbit__spin block size-0">
                              <span className="who-orbit__item block size-[5.5rem] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[1.4rem] border-4 border-white shadow-[0_20px_40px_-18px_rgb(7_27_73/0.55)]">
                                <Image src={m.card.src} alt="" width={176} height={176} sizes="88px" className="size-full object-cover" />
                              </span>
                            </span>
                          </span>
                        </span>
                      </span>
                    );
                  })}
                </div>
              </div>
            </Parallax>
          </div>
        </div>

        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PERSONAS.map((p, i) => {
            const Icon = PERSONA_ICONS[p];
            const m = personaMedia[p];
            return (
              <Reveal key={p} delay={(i % 4) * 0.07} className="h-full">
                <li className="h-full list-none">
                  <TiltCard max={5} className="h-full rounded-[1.5rem]">
                    <Link href={`/for/${p}`} className="card-premium zoom-frame group flex h-full flex-col overflow-hidden">
                      <span className="relative block aspect-[16/10] overflow-hidden">
                        {m ? (
                          <Image src={m.card.src} alt={pick(m.alt, locale)} width={m.card.width} height={m.card.height} sizes="(min-width: 1024px) 18rem, (min-width: 640px) 50vw, 100vw" className="zoom-img size-full object-cover" />
                        ) : (
                          <span className="grid size-full place-items-center bg-[radial-gradient(circle_at_70%_20%,rgb(255_215_106/0.5),transparent_60%),linear-gradient(135deg,#E8F3FF,#CFE3FF)]">
                            <Icon className="size-14 text-royal/70" strokeWidth={1.3} aria-hidden />
                          </span>
                        )}
                        <span aria-hidden className="absolute inset-x-0 bottom-0 h-1/2 bg-[linear-gradient(0deg,rgb(7_27_73/0.35),transparent)]" />
                      </span>
                      <span className="relative flex flex-1 flex-col p-6 pt-0">
                        <span className="icon-royal -mt-6 grid size-12 place-items-center rounded-2xl ring-4 ring-white transition-all duration-500 group-hover:rotate-[-6deg] group-hover:scale-110 group-hover:[background:linear-gradient(135deg,#FFC72C,#F5A800)] group-hover:text-navy">
                          <Icon className="size-6" strokeWidth={1.7} aria-hidden />
                        </span>
                        <h3 className="mt-4 text-[1.1875rem] font-bold text-navy">{t(`personas.${p}.name`)}</h3>
                        <span className="mt-2 flex-1 text-caption text-muted">{t(`personas.${p}.solution`)}</span>
                        <span className="mt-5 inline-flex items-center gap-1.5 text-caption font-bold text-royal">
                          {t("who.cta")}
                          <span className="grid size-6 place-items-center rounded-full bg-royal/10 transition-all duration-300 group-hover:translate-x-1 group-hover:bg-gold group-hover:text-navy">
                            <ArrowRight className="size-3.5" aria-hidden />
                          </span>
                        </span>
                      </span>
                    </Link>
                  </TiltCard>
                </li>
              </Reveal>
            );
          })}
          {/* 8th tile: Find My Solar Plan */}
          <Reveal delay={0.21} className="h-full">
            <li className="bg-premium-navy relative flex h-full list-none flex-col justify-between overflow-hidden rounded-[1.5rem] p-6 text-white shadow-[0_24px_50px_-24px_rgb(7_23_63/0.7)]">
              <div aria-hidden className="absolute -right-16 -top-16 size-48 rounded-full border-2 border-yellow/40 shadow-[0_0_40px_-6px_rgb(255_199_44/0.6)]" />
              <span className="icon-sun grid size-12 animate-ring place-items-center rounded-2xl"><Sparkles className="size-6" aria-hidden /></span>
              <p className="relative mt-5 text-[1.1875rem] font-bold">{t("who.quizCta")}</p>
              <GuideTrigger size="md" className="btn-shine relative mt-5 w-full">{t("common.bookVisit")}<ArrowRight aria-hidden /></GuideTrigger>
            </li>
          </Reveal>
        </ul>
      </div>
      <style>{`
        .who-orbit__ring { animation: tsRays 60s linear infinite; }
        .who-orbit__spin { animation: tsRays 60s linear infinite reverse; }
        .who-orbit:hover .who-orbit__ring, .who-orbit:hover .who-orbit__spin { animation-play-state: paused; }
        .who-orbit__item { transition: scale .5s var(--ease-out-soft), box-shadow .5s; }
        .who-orbit__item:hover { scale: 1.12; box-shadow: 0 24px 50px -16px rgb(255 184 0 / 0.6); }
        @media (prefers-reduced-motion: reduce) { .who-orbit__ring, .who-orbit__spin { animation: none !important; } }
      `}</style>
    </section>
  );
}
