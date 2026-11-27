import { useTranslations } from "next-intl";
import { BatteryPlus, Check, Gauge, House, Lightbulb, RefreshCw, Route, SolarPanel, Sun, TrendingDown, UtilityPole, Zap } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";
import { SolarStoryMedia } from "./solar-story-media";

const FLOW = [
  { key: "sun", Icon: Sun },
  { key: "panels", Icon: SolarPanel },
  { key: "inverter", Icon: Zap },
  { key: "home", Icon: House },
  { key: "meter", Icon: Gauge },
  { key: "grid", Icon: UtilityPole },
] as const;

const TYPES = [
  { key: "ongrid", Icon: UtilityPole, accent: "bg-primary", head: "bg-tint-ice", tile: "bg-white text-primary" },
  { key: "offgrid", Icon: BatteryPlus, accent: "bg-[#64748B]", head: "bg-[#E7ECF3]", tile: "bg-white text-body" },
  { key: "hybrid", Icon: RefreshCw, accent: "bg-green", head: "bg-tint-mint", tile: "bg-white text-green-text" },
] as const;

/**
 * "How solar cuts your bill" (homepage).
 * Two balanced columns: the house illustration with numbered pins (left) and three equal explainer cards that fill
 * the full height of the picture (right): What is solar? / How does it cut your bill? / what you get (end-to-end
 * service, existing copy). Below: the 6-step energy flow as a connected stepper (horizontal on desktop, vertical on
 * phones) and the on-grid / off-grid / hybrid cards with coloured top accents and green "Best for" chips.
 */
export function Solar60() {
  const t = useTranslations("solar60");
  const tw = useTranslations("why");
  const cards = [
    { title: t("what.title"), desc: t("what.desc"), Icon: Lightbulb, tile: "bg-tint-ice text-primary" },
    { title: t("cut.title"), desc: t("cut.desc"), Icon: TrendingDown, tile: "bg-tint-mint text-green-text" },
    { title: tw("endToEnd.title"), desc: tw("endToEnd.desc"), Icon: Route, tile: "bg-tint-mist text-primary" },
  ];

  return (
    <section className="relative isolate overflow-hidden bg-mist pb-16 pt-20 md:pb-24" aria-labelledby="s60-title">
      <span aria-hidden className="deco-blob deco-blob--green -right-40 top-0 size-[26rem]" />
      <div className="container-page">
        <SectionHeading premium align="left" eyebrow={t("eyebrow")} title={t("title")} />

        <div className="grid gap-6 lg:grid-cols-12 lg:items-stretch">
          <Reveal className="lg:col-span-7">
            <div className="h-full rounded-[1.25rem] border border-card-line bg-white p-3 shadow-[0_8px_30px_rgb(15_47_107/0.06)]">
              <SolarStoryMedia alt={t("scene.alt")} labels={{ panels: t("flow.panels.title"), inverter: t("flow.inverter.title"), home: t("flow.home.title"), grid: t("flow.grid.title") }} />
              <ul className="flex flex-wrap gap-x-5 gap-y-2 px-2 pb-1 pt-3 text-caption font-medium text-ink">
                <li className="flex items-center gap-2"><span aria-hidden className="size-2.5 rounded-full bg-green" />{t("scene.toHome")}</li>
                <li className="flex items-center gap-2"><span aria-hidden className="size-2.5 rounded-full bg-primary" />{t("scene.toGrid")}</li>
              </ul>
            </div>
          </Reveal>
          <div className="grid gap-4 lg:col-span-5 lg:grid-rows-3">
            {cards.map(({ title, desc, Icon, tile }, i) => (
              <Reveal key={title} delay={0.08 + i * 0.08} className="h-full">
                <div className="card-premium flex h-full gap-4 p-6">
                  <span aria-hidden className={cn("grid size-12 shrink-0 place-items-center rounded-2xl", tile)}><Icon className="size-6" /></span>
                  <div>
                    <h3 className="font-heading text-h4 font-bold text-ink">{title}</h3>
                    <p className="mt-1.5 text-[0.9375rem] text-body">{desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* 6-step energy flow */}
        <Reveal className="mt-6 rounded-[1.25rem] border border-card-line bg-white p-6 shadow-[0_8px_30px_rgb(15_47_107/0.06)] md:p-8">
          <ol className="relative grid gap-5 md:grid-cols-6 md:gap-3">
            <span aria-hidden className="absolute bottom-6 left-6 top-6 w-0.5 bg-tint-mist md:bottom-auto md:left-[8.33%] md:right-[8.33%] md:top-6 md:h-0.5 md:w-auto" />
            {FLOW.map(({ key, Icon }, i) => (
              <li key={key} className="relative flex items-center gap-4 md:flex-col md:items-center md:gap-3 md:text-center">
                <span className="relative z-10 grid size-12 shrink-0 place-items-center rounded-full bg-primary text-white shadow-[0_0_0_6px_#FFFFFF]">
                  {key === "sun" ? <Icon className="size-5 text-sun" aria-hidden /> : <Icon className="size-5" aria-hidden />}
                  <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-white text-[0.6875rem] font-bold text-primary ring-1 ring-tint-mist">{i + 1}</span>
                </span>
                <span>
                  <span className="block font-heading text-[1rem] font-bold text-ink">{t(`flow.${key}.title`)}</span>
                  <span className="block text-caption text-muted">{t(`flow.${key}.desc`)}</span>
                </span>
              </li>
            ))}
          </ol>
        </Reveal>

        {/* On-grid / off-grid / hybrid */}
        <h3 className="mb-6 mt-16 font-heading text-h3 font-bold text-ink md:text-[1.75rem]">{t("typesTitle")}</h3>
        <ul className="grid gap-5 md:grid-cols-3">
          {TYPES.map(({ key, Icon, accent, head, tile }, i) => (
            <Reveal key={key} delay={i * 0.08} className="h-full">
              <li className="card-premium relative flex h-full list-none flex-col overflow-hidden">
                <span aria-hidden className={cn("absolute inset-x-0 top-0 h-1", accent)} />
                <div className={cn("flex items-center gap-3 px-6 pb-5 pt-6", head)}>
                  <span aria-hidden className={cn("grid size-12 place-items-center rounded-full shadow-sm", tile)}><Icon className="size-6" /></span>
                  <h4 className="font-heading text-h4 font-bold text-ink">{t(`${key}.name`)}</h4>
                </div>
                <p className="flex-1 px-6 pt-5 text-[0.9375rem] text-body">{t(`${key}.desc`)}</p>
                <p className="mx-6 mb-6 mt-5 inline-flex items-start gap-1.5 self-start rounded-full bg-tint-mint px-3 py-1.5 text-caption text-green-ink">
                  <Check className="mt-0.5 size-3.5 shrink-0" strokeWidth={3} aria-hidden />
                  <span><span className="font-semibold">{t("best")}:</span> {t(`${key}.best`)}</span>
                </p>
              </li>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
