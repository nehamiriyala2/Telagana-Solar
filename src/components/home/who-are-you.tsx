import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/motion/reveal";
import { GuideTrigger } from "@/components/tools/triggers";
import { PERSONA_ICONS } from "@/components/tools/persona-icons";
import { PERSONAS, personaConfig } from "@/config/personas";
import { personaMedia } from "@/data/personas-media";
import { pick } from "@/lib/utils";

/**
 * "Which solar suits you?" (homepage): 7 photo cards → /for/<persona> plus the "Not sure?" card, in a 4-column grid
 * (2 rows of 4 on desktop, 2 columns on tablet, 1 on phones). Card: 16:10 rounded photo, small blue category label
 * (Home / Farm / Business), title, full description (no truncation), "See details →". The "Not sure?" card is solid deep blue.
 */
export function WhoAreYou() {
  const t = useTranslations();
  const locale = useLocale();
  return (
    <section className="bg-cloud py-16 md:py-24" aria-labelledby="who-title">
      <div className="container-page">
        <SectionHeading premium align="left" eyebrow={t("who.eyebrow")} title={t("who.title")} subtitle={t("who.subtitle")} />

        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PERSONAS.map((p, i) => {
            const Icon = PERSONA_ICONS[p];
            const m = personaMedia[p];
            return (
              <Reveal key={p} delay={(i % 4) * 0.06} className="h-full">
                <li className="h-full list-none">
                  <Link href={`/for/${p}`} className="card-premium zoom-frame group flex h-full flex-col overflow-hidden p-3">
                    <span className="relative block aspect-[16/10] overflow-hidden rounded-[0.875rem] bg-tint-ice">
                      {m ? (
                        <Image src={m.card.src} alt={pick(m.alt, locale)} width={m.card.width} height={m.card.height} sizes="(min-width: 1024px) 18rem, (min-width: 640px) 50vw, 100vw" className="zoom-img size-full object-cover" style={{ objectPosition: m.focus ?? "50% 50%", filter: m.grade }} />
                      ) : (
                        <span className="grid size-full place-items-center"><Icon className="size-12 text-primary/70" strokeWidth={1.3} aria-hidden /></span>
                      )}
                    </span>
                    <span className="flex flex-1 flex-col px-2 pb-2 pt-4">
                      <span className="text-[0.75rem] font-bold uppercase tracking-[0.12em] text-primary">{t(`types.${personaConfig[p].type}.name`)}</span>
                      <h3 className="mt-1.5 font-heading text-[1.125rem] font-bold leading-snug text-ink">{t(`personas.${p}.name`)}</h3>
                      <span className="mt-2 flex-1 text-[0.875rem] text-body">{t(`personas.${p}.solution`)}</span>
                      <span className="mt-4 inline-flex items-center gap-1.5 text-[0.875rem] font-semibold text-primary">
                        {t("who.cta")}<ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
                      </span>
                    </span>
                  </Link>
                </li>
              </Reveal>
            );
          })}
          {/* 8th tile: not sure? → Find My Solar Plan */}
          <Reveal delay={0.18} className="h-full">
            <li className="relative flex h-full min-h-[18rem] list-none flex-col justify-between overflow-hidden rounded-[1.25rem] bg-[image:var(--band-gradient)] p-6 text-white shadow-[0_20px_44px_-20px_rgb(15_47_107/0.6)]">
              <span aria-hidden className="grid size-12 place-items-center rounded-2xl bg-white/10"><Sparkles className="size-6 text-sun" /></span>
              <p className="mt-5 font-heading text-[1.375rem] font-bold leading-snug text-white">{t("who.quizCta")}</p>
              <GuideTrigger size="md" variant="white" className="mt-5 w-full">{t("common.bookVisit")}<ArrowRight aria-hidden /></GuideTrigger>
            </li>
          </Reveal>
        </ul>
      </div>
    </section>
  );
}
