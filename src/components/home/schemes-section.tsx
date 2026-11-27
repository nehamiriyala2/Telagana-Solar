import { useTranslations } from "next-intl";
import { ArrowRight, Droplets, Gauge, Home, Info, Landmark, Sprout, UsersRound, Zap, Coins, FileText } from "lucide-react";
import { PhotoTile } from "@/components/ui/photo-tile";
import { UI_IMAGES } from "@/data/section-photos";
import { Link } from "@/i18n/navigation";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/motion/reveal";
import { SCHEMES } from "@/config/schemes";
import { cn } from "@/lib/utils";

export const SCHEME_ICONS = { "pm-surya-ghar": Home, "pm-kusum": Droplets, "net-metering": Gauge, "state-schemes": Landmark } as const;

/** Per-scheme audience chip colour and benefit icon. */
const STYLE: Record<string, { chip: string; Benefit: typeof Coins; benefitTone: string }> = {
  "pm-surya-ghar": { chip: "text-primary", Benefit: Coins, benefitTone: "text-[#F5B82E]" },
  "pm-kusum": { chip: "text-green-ink", Benefit: Sprout, benefitTone: "text-green" },
  "net-metering": { chip: "text-ink", Benefit: Zap, benefitTone: "text-[#F5B82E]" },
  "state-schemes": { chip: "text-body", Benefit: FileText, benefitTone: "text-body" },
};

/**
 * "Schemes you can use": one white card per scheme → /schemes/<slug>: photo with the audience chip over it, title,
 * two icon rows ("Who can apply" / "Benefit") with small labels, "Learn more →".
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
                  <Link href={`/schemes/${s.slug}`} className="card-premium zoom-frame group flex h-full flex-col p-3">
                    <span className="relative block overflow-hidden rounded-2xl">
                      <PhotoTile src={UI_IMAGES.schemes[s.slug as keyof typeof UI_IMAGES.schemes]} alt="" className="zoom-img aspect-[16/10] w-full bg-tint-ice text-primary"
                        fallback={<Icon className="size-10" aria-hidden />} />
                      <span className={cn("absolute right-2.5 top-2.5 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-[0.8125rem] font-semibold shadow-sm", st.chip)}>
                        <Icon className="size-4" aria-hidden />{t(`items.${s.slug}.tag`)}
                      </span>
                    </span>
                    <h3 className="mt-4 px-2 font-heading text-[1.1875rem] font-bold leading-snug text-ink">{t(`items.${s.slug}.name`)}</h3>
                    <dl className="mt-4 flex-1 space-y-2.5 px-1 text-[0.875rem]">
                      <div className="flex gap-3 rounded-xl bg-[#F1F5FB] px-3.5 py-3">
                        <UsersRound className="mt-0.5 size-5 shrink-0 text-ink" aria-hidden />
                        <span>
                          <dt className="text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-muted">{t("cardWho")}</dt>
                          <dd className="mt-1 text-ink">{t(`items.${s.slug}.cardWho`)}</dd>
                        </span>
                      </div>
                      <div className="flex gap-3 rounded-xl bg-[#F1F5FB] px-3.5 py-3">
                        <st.Benefit className={cn("mt-0.5 size-5 shrink-0", st.benefitTone)} aria-hidden />
                        <span>
                          <dt className="text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-muted">{t("cardBenefit")}</dt>
                          <dd className="mt-1 text-ink">{t(`items.${s.slug}.cardBenefit`)}</dd>
                        </span>
                      </div>
                    </dl>
                    <span className="mt-4 inline-flex items-center gap-1.5 px-2 pb-2 text-[0.9375rem] font-semibold text-primary">
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
