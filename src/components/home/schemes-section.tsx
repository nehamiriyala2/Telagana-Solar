import { useTranslations } from "next-intl";
import { ArrowRight, Droplets, Gauge, Home, Landmark } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/motion/reveal";
import { SCHEMES } from "@/config/schemes";
import { EditMark } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const SCHEME_ICONS = { "pm-surya-ghar": Home, "pm-kusum": Droplets, "net-metering": Gauge, "state-schemes": Landmark } as const;

/**
 * "Schemes you can use": one card per scheme → /schemes/<slug>.
 * `premium` is the homepage look (sun background, premium cards); other pages keep the default.
 */
export function SchemesSection({ only, title, premium = false }: { only?: string[]; title?: string; premium?: boolean }) {
  const t = useTranslations("schemes");
  const list = SCHEMES.filter((s) => !only || only.includes(s.slug));
  return (
    <section className={premium ? "dot-grid bg-premium-sun relative isolate overflow-hidden py-16 md:py-24" : "section bg-sky-tint/60"} aria-labelledby="schemes-title">
      {premium && <div aria-hidden className="orb -left-24 bottom-0 size-96 bg-sky/15" />}
      <div className="container-page">
        <SectionHeading premium={premium} eyebrow={t("eyebrow")} title={title ?? t("title")} subtitle={t("subtitle")} />
        <ul className={cn("grid sm:grid-cols-2", premium ? "gap-5" : "gap-4", list.length > 2 && "lg:grid-cols-4")}>
          {list.map((s, i) => {
            const Icon = SCHEME_ICONS[s.slug];
            return (
              <Reveal key={s.slug} delay={i * (premium ? 0.08 : 0.06)} className="h-full">
                <li className="h-full list-none">
                  <Link href={`/schemes/${s.slug}`} className={cn("group flex h-full flex-col p-6",
                    premium ? "card-premium overflow-hidden" : "rounded-card border border-line bg-white shadow-soft transition-[transform,box-shadow] duration-500 ease-out-soft hover:-translate-y-1 hover:shadow-lift")}>
                    {premium && <span aria-hidden className="absolute inset-x-0 top-0 h-1.5 bg-[linear-gradient(90deg,#FFC72C,#F5A800,#4DA3FF)]" />}
                    <div className="flex items-start justify-between gap-3">
                      <span className={cn("grid size-12 place-items-center rounded-2xl", premium ? "icon-sun transition-transform duration-500 group-hover:scale-110" : "bg-gold-soft text-gold-ink")}><Icon className="size-6" strokeWidth={1.7} aria-hidden /></span>
                      <span className="rounded-full bg-leaf-tint px-2.5 py-1 text-[0.75rem] font-semibold text-leaf-ink">{t(`items.${s.slug}.tag`)}</span>
                    </div>
                    <h3 className={cn("mt-5 font-bold", premium ? "text-[1.1875rem] text-navy" : "font-heading text-[1.125rem]")}>{t(`items.${s.slug}.name`)}{s.slug === "state-schemes" && <EditMark className="ml-2 align-middle" label="[EDIT after checking]" />}</h3>
                    <dl className="mt-3 flex-1 space-y-2 text-caption">
                      <div><dt className="font-semibold text-navy">{t("cardWho")}</dt><dd className="text-muted">{t(`items.${s.slug}.cardWho`)}</dd></div>
                      <div><dt className="font-semibold text-navy">{t("cardBenefit")}</dt><dd className="text-muted">{t(`items.${s.slug}.cardBenefit`)}</dd></div>
                    </dl>
                    <span className="mt-5 inline-flex items-center gap-1.5 text-caption font-bold text-royal">
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
