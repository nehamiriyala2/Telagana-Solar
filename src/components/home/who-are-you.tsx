import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/motion/reveal";
import { TiltCard } from "@/components/motion/tilt-card";
import { GuideTrigger } from "@/components/tools/triggers";
import { PERSONA_ICONS } from "@/components/tools/persona-icons";
import { PERSONAS } from "@/config/personas";
import { personaMedia } from "@/data/personas-media";
import { pick } from "@/lib/utils";

/**
 * "Which solar suits you?" (homepage): heading + 7 image cards → /for/<persona> plus Find My Solar Plan.
 * Cards: picture header with slow zoom on hover, 3D tilt, lift. Visitors without a picture keep the icon header.
 */
export function WhoAreYou() {
  const t = useTranslations();
  const locale = useLocale();
  return (
    <section className="dot-grid bg-premium-sky relative isolate overflow-hidden py-16 md:py-24" aria-labelledby="who-title">
      <div aria-hidden className="orb -right-24 top-10 size-96 bg-yellow/25" />
      <div className="container-page">
        <SectionHeading premium eyebrow={t("who.eyebrow")} title={t("who.title")} subtitle={t("who.subtitle")} className="mb-8 md:mb-12" />

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
                          <Image src={m.card.src} alt={pick(m.alt, locale)} width={m.card.width} height={m.card.height} sizes="(min-width: 1024px) 18rem, (min-width: 640px) 50vw, 100vw" className="zoom-img size-full object-cover" style={{ objectPosition: m.focus ?? "50% 50%" }} />
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
    </section>
  );
}
