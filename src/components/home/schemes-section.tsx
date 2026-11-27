import { useTranslations } from "next-intl";
import { ArrowRight, Droplets, Gauge, Home, Info, Landmark } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/motion/reveal";
import { SCHEMES } from "@/config/schemes";
import { cn } from "@/lib/utils";

export const SCHEME_ICONS = { "pm-surya-ghar": Home, "pm-kusum": Droplets, "net-metering": Gauge, "state-schemes": Landmark } as const;

/** Per-scheme icon tile + audience chip colours (blue, green, sun, slate). */
const STYLE: Record<string, { tile: string; chip: string }> = {
  "pm-surya-ghar": { tile: "bg-primary text-white", chip: "bg-tint-ice text-primary" },
  "pm-kusum": { tile: "bg-green text-white", chip: "bg-tint-mint text-green-ink" },
  "net-metering": { tile: "bg-tint-cream text-[#0E1B33]", chip: "bg-tint-cream text-ink" },
  "state-schemes": { tile: "bg-[#475569] text-white", chip: "bg-mist text-body" },
};

/**
 * "Schemes you can use": one clean white card per scheme → /schemes/<slug>: coloured icon tile, small audience chip,
 * title, two clearly separated rows ("Who can apply" / "Benefit") with small labels, "Learn more →".
 * Green-wash section fading to tint A; the disclaimer sits in a blue-tint info bar with a blue left border.
 */
export function SchemesSection({ only, title, premium = false }: { only?: string[]; title?: string; premium?: boolean }) {
  const t = useTranslations("schemes");
  const list = SCHEMES.filter((s) => !only || only.includes(s.slug));
  return (
    <section className={cn("relative isolate overflow-hidden bg-[linear-gradient(180deg,#E6F4EC_0%,#E6F4EC_55%,#DFE9F7_100%)]", premium ? "py-16 md:py-24" : "section")} aria-labelledby="schemes-title">
      <span aria-hidden className="deco-blob deco-blob--blue -left-40 top-10 size-[24rem]" />
      <div className="container-page">
        <SectionHeading premium={premium} align="left" eyebrow={t("eyebrow")} title={title ?? t("title")} subtitle={t("subtitle")} />
        <ul className={cn("grid gap-5 sm:grid-cols-2", list.length > 2 && "lg:grid-cols-4")}>
          {list.map((s, i) => {
            const Icon = SCHEME_ICONS[s.slug as keyof typeof SCHEME_ICONS] ?? Landmark;
            const st = STYLE[s.slug] ?? STYLE["state-schemes"];
            return (
              <Reveal key={s.slug} delay={i * 0.07} className="h-full">
                <li className="h-full list-none">
                  <Link href={`/schemes/${s.slug}`} className="card-premium group flex h-full flex-col p-6">
                    <div className="flex items-start justify-between gap-3">
                      <span aria-hidden className={cn("grid size-12 place-items-center rounded-2xl", st.tile)}>
                        {s.slug === "net-metering" ? <Icon className="size-6 text-[#0E1B33]" /> : <Icon className="size-6" />}
                      </span>
                      <span className={cn("rounded-full px-2.5 py-1 text-[0.75rem] font-semibold", st.chip)}>{t(`items.${s.slug}.tag`)}</span>
                    </div>
                    <h3 className="mt-5 font-heading text-[1.1875rem] font-bold leading-snug text-ink">{t(`items.${s.slug}.name`)}</h3>
                    <dl className="mt-4 flex-1 space-y-3 text-[0.875rem]">
                      <div className="rounded-xl bg-cloud px-3.5 py-3">
                        <dt className="text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-muted">{t("cardWho")}</dt>
                        <dd className="mt-1 text-ink">{t(`items.${s.slug}.cardWho`)}</dd>
                      </div>
                      <div className="rounded-xl bg-cloud px-3.5 py-3">
                        <dt className="text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-muted">{t("cardBenefit")}</dt>
                        <dd className="mt-1 text-ink">{t(`items.${s.slug}.cardBenefit`)}</dd>
                      </div>
                    </dl>
                    <span className="mt-5 inline-flex items-center gap-1.5 text-[0.875rem] font-semibold text-primary">
                      {t("learnMore")}<ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
                    </span>
                  </Link>
                </li>
              </Reveal>
            );
          })}
        </ul>
        <p className="mt-6 flex items-start gap-2.5 rounded-r-xl rounded-l-[4px] border-l-4 border-primary bg-tint-mist px-4 py-3 text-[0.875rem] text-ink">
          <Info className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />{t("note")}
        </p>
      </div>
    </section>
  );
}
