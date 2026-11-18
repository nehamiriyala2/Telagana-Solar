import { useTranslations } from "next-intl";
import { ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { SectionHeading } from "@/components/ui/section-heading";
import { TiltCard } from "@/components/motion/tilt-card";
import { Reveal } from "@/components/motion/reveal";
import { PERSONA_ICONS } from "@/components/illustrations/persona-icons";
import type { Persona } from "@/lib/types";

const ORDER: Persona[] = ["apartment", "urban", "rural", "farmer", "business"];

export function CategoryCards() {
  const t = useTranslations();
  return (
    <section className="section" aria-labelledby="cat-title">
      <div className="container-page">
        <SectionHeading eyebrow={t("categories.eyebrow")} title={t("categories.title")} subtitle={t("categories.subtitle")} />
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {ORDER.map((p, i) => {
            const Icon = PERSONA_ICONS[p];
            return (
              <Reveal key={p} delay={i * 0.06} className="h-full">
                <li className="h-full list-none">
                  <TiltCard className="h-full rounded-card">
                    <Link href={{ pathname: "/finder", query: { persona: p } }}
                      className="flex h-full flex-col rounded-card border border-line bg-surface p-6 shadow-soft transition-shadow duration-500 hover:shadow-lift">
                      <span className="mb-10 grid size-12 place-items-center rounded-2xl bg-navy text-gold dark:bg-navy-700">
                        <Icon className="size-6" strokeWidth={1.6} aria-hidden />
                      </span>
                      <h3 className="text-h4">{t(`personas.${p}.name`)}</h3>
                      <p className="mt-2 flex-1 text-caption text-muted">{t(`personas.${p}.desc`)}</p>
                      <span className="mt-6 inline-flex items-center gap-1 text-caption font-medium">
                        {t("categories.cta")}
                        <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
                      </span>
                    </Link>
                  </TiltCard>
                </li>
              </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
