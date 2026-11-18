import { useTranslations } from "next-intl";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/motion/reveal";
import { GuideTrigger } from "@/components/tools/triggers";
import { PERSONA_ICONS } from "@/components/tools/persona-icons";
import { PERSONAS } from "@/config/personas";

/** "Which solar suits you?" (homepage, light-blue gradient): 7 visitor cards → /for/<persona>, plus Find My Solar Plan. */
export function WhoAreYou() {
  const t = useTranslations();
  return (
    <section className="dot-grid bg-premium-sky relative isolate overflow-hidden py-16 md:py-24" aria-labelledby="who-title">
      <div aria-hidden className="orb -right-24 top-10 size-96 bg-yellow/25" />
      <div className="container-page">
        <SectionHeading premium eyebrow={t("who.eyebrow")} title={t("who.title")} subtitle={t("who.subtitle")} />
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PERSONAS.map((p, i) => {
            const Icon = PERSONA_ICONS[p];
            return (
              <Reveal key={p} delay={(i % 4) * 0.07} className="h-full">
                <li className="h-full list-none">
                  <Link href={`/for/${p}`} className="card-premium group flex h-full flex-col p-6">
                    <span className="icon-royal grid size-12 place-items-center rounded-2xl transition-all duration-500 group-hover:rotate-[-6deg] group-hover:scale-110 group-hover:[background:linear-gradient(135deg,#FFC72C,#F5A800)] group-hover:text-navy">
                      <Icon className="size-6" strokeWidth={1.7} aria-hidden />
                    </span>
                    <h3 className="mt-5 text-[1.1875rem] font-bold text-navy">{t(`personas.${p}.name`)}</h3>
                    <p className="mt-2 flex-1 text-caption text-muted">{t(`personas.${p}.solution`)}</p>
                    <span className="mt-6 inline-flex items-center gap-1.5 text-caption font-bold text-royal">
                      {t("who.cta")}
                      <span className="grid size-6 place-items-center rounded-full bg-royal/10 transition-all duration-300 group-hover:translate-x-1 group-hover:bg-gold group-hover:text-navy">
                        <ArrowRight className="size-3.5" aria-hidden />
                      </span>
                    </span>
                  </Link>
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
