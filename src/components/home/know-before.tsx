import { useTranslations } from "next-intl";
import { ArrowRight, BadgeCheck, Gauge, Headset, Ruler, ShieldCheck, Sun, Zap } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/motion/reveal";
import { GuideTrigger } from "@/components/tools/triggers";
import { PhotoTile } from "@/components/ui/photo-tile";
import { UI_IMAGES } from "@/data/section-photos";

const ITEMS = [
  { key: "k1", Icon: Ruler },
  { key: "k2", Icon: Sun },
  { key: "k3", Icon: Zap },
  { key: "k4", Icon: Gauge },
  { key: "k5", Icon: BadgeCheck },
  { key: "k6", Icon: ShieldCheck },
  { key: "k7", Icon: Headset },
] as const;

/** "Your solar checklist" on tint A: 7 numbered white cards in a two-column grid (blue number circle, bold title, one line,
 *  photo) plus a deep-blue help card in the 8th slot so the grid is balanced. */
export function KnowBefore() {
  const t = useTranslations("knowBefore");
  const tc = useTranslations("common");
  return (
    <section className="bg-mist pb-12 pt-2 md:pb-[4.5rem] md:pt-4" aria-labelledby="kb-title">
      <div className="container-page">
        <SectionHeading premium align="left" eyebrow={t("eyebrow")} title={t("title")} subtitle={t("subtitle")} />
        <ol className="grid gap-5 md:grid-cols-2">
          {ITEMS.map(({ key, Icon }, i) => (
            <Reveal key={key} delay={(i % 2) * 0.06} className="h-full">
              <li className="card-premium flex h-full list-none items-center gap-4 p-3 pl-5">
                <span className="grid size-7 shrink-0 self-start place-items-center rounded-full bg-primary font-heading text-[0.8125rem] font-bold text-white tabular-nums">{i + 1}</span>
                <span className="min-w-0 flex-1">
                  <span className="block font-heading text-[1.0625rem] font-bold text-ink">{t(`${key}.title`)}</span>
                  <span className="mt-1 block text-[0.9375rem] text-body">{t(`${key}.desc`)}</span>
                </span>
                <PhotoTile src={UI_IMAGES.checklist[key]} alt="" className="h-20 w-24 shrink-0 overflow-hidden rounded-xl bg-[#EBE3D3] text-[#0B1F3A] sm:h-[6.5rem] sm:w-36" fallback={<Icon className="size-6" strokeWidth={1.75} aria-hidden />} />
              </li>
            </Reveal>
          ))}
          <Reveal delay={0.06} className="h-full">
            <li className="relative flex h-full list-none flex-col justify-between gap-4 overflow-hidden rounded-[1.25rem] bg-[image:var(--band-gradient)] p-5 text-white shadow-[0_10px_30px_rgb(11_31_58/0.18)] sm:flex-row sm:items-center">
              <p className="font-heading text-[1.0625rem] font-bold leading-snug text-white">{t("helpTitle")}</p>
              <GuideTrigger size="sm" variant="white" className="shrink-0">{tc("bookVisit")}<ArrowRight aria-hidden /></GuideTrigger>
            </li>
          </Reveal>
        </ol>
      </div>
    </section>
  );
}
