import { useTranslations } from "next-intl";
import { ArrowRight, Droplets, Gauge, Home, Landmark } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/motion/reveal";
import { SCHEMES } from "@/config/schemes";
import { EditMark } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/** Scheme cards rotate through the soft tint colours. */
const TINTS = ["!bg-tint-ice", "!bg-tint-cream", "!bg-tint-mist", "!bg-tint-mint"];

export const SCHEME_ICONS = { "pm-surya-ghar": Home, "pm-kusum": Droplets, "net-metering": Gauge, "state-schemes": Landmark } as const;

/**
 * "Schemes you can use": one card per scheme → /schemes/<slug>.
 * `premium` is the homepage look (sun background, premium cards); other pages keep the default.
 */
export function SchemesSection({ only, title, premium = false }: { only?: string[]; title?: string; premium?: boolean }) {
  const t = useTranslations("schemes");
  const list = SCHEMES.filter((s) => !only || only.includes(s.slug));
  return (
    <section className={premium ? "dot-grid bg-premium-sun relative isolate overflow-hidden py-16 md:py-24" : "section bg-mist/60"} aria-labelledby="schemes-title">
      {premium && <div aria-hidden className="orb -left-24 bottom-0 size-96 bg-primary-hover/15" />}
      <div className="container-page">
        <SectionHeading premium={premium} eyebrow={t("eyebrow")} title={title ?? t("title")} subtitle={t("subtitle")} />
        <ul className={cn("grid sm:grid-cols-2", premium ? "gap-5" : "gap-4", list.length > 2 && "lg:grid-cols-4")}>
          {list.map((s, i) => {
            return (
              <Reveal key={s.slug} delay={i * (premium ? 0.08 : 0.06)} className="h-full">
                <li className="h-full list-none">
                  <Link href={`/schemes/${s.slug}`} className={cn("group flex h-full flex-col p-6",
                    premium ? cn("card-premium overflow-hidden", TINTS[i % TINTS.length]) : "rounded-card border border-line bg-white shadow-soft transition-[transform,box-shadow] duration-500 ease-out-soft hover:-translate-y-1 hover:shadow-lift")}>
                    {premium && <span aria-hidden className="absolute inset-x-0 top-0 h-0.5 bg-gold" />}
                    <span className="self-start rounded-full bg-primary px-2.5 py-1 text-[0.75rem] font-semibold text-card">{t(`items.${s.slug}.tag`)}</span>
                    <h3 className={cn("mt-4 font-semibold text-ink", premium ? "text-[1.3125rem]" : "font-heading text-[1.1875rem]")}>{t(`items.${s.slug}.name`)}</h3>
                    <dl className="mt-4 flex-1 divide-y divide-line border-y border-line text-caption">
                      <div className="py-2.5"><dt className="font-semibold text-ink">{t("cardWho")}</dt><dd className="mt-0.5 text-muted">{t(`items.${s.slug}.cardWho`)}</dd></div>
                      <div className="py-2.5"><dt className="font-semibold text-ink">{t("cardBenefit")}</dt><dd className="mt-0.5 text-muted">{t(`items.${s.slug}.cardBenefit`)}</dd></div>
                    </dl>
                    <span className="mt-5 inline-flex items-center gap-1.5 text-caption font-semibold text-primary">
                      {t("learnMore")}<ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
                    </span>
                  </Link>
                </li>
              </Reveal>
            );
          })}
        </ul>
        <p className="mt-6 text-center text-caption text-muted">{t("note")}</p>
      </div>
    </section>
  );
}
