import { useTranslations } from "next-intl";
import { BatteryPlus, Gauge, House, Lightbulb, RefreshCw, SolarPanel, Sun, TrendingDown, UtilityPole, Zap } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";
import { PhotoTile } from "@/components/ui/photo-tile";
import { TYPE_PHOTOS } from "@/data/section-photos";
import { SolarStoryMedia } from "./solar-story-media";

const FLOW = [
  { key: "sun", Icon: Sun, tone: "bg-[#FFF4D9] text-[#F0BE4A] ring-[#FFF4D9]" },
  { key: "panels", Icon: SolarPanel, tone: "bg-[#EAF1F8] text-[#235A93] ring-[#DCE6F0]" },
  { key: "inverter", Icon: Zap, tone: "bg-[#EAF1F8] text-[#235A93] ring-[#DCE6F0]" },
  { key: "home", Icon: House, tone: "bg-[#FFF4D9] text-[#8A6514] ring-[#DCE6F0]" },
  { key: "meter", Icon: Gauge, tone: "bg-[#EAF1F8] text-[#235A93] ring-[#DCE6F0]" },
  { key: "grid", Icon: UtilityPole, tone: "bg-[#EAF1F8] text-[#235A93] ring-[#DCE6F0]" },
] as const;

const TYPES = [
  { key: "ongrid", Icon: UtilityPole, accent: "from-yellow to-gold", color: "text-ink" },
  { key: "offgrid", Icon: BatteryPlus, accent: "from-primary-hover to-primary-hover", color: "text-[#235A93]" },
  { key: "hybrid", Icon: RefreshCw, accent: "from-leaf to-[#235A93]", color: "text-[#235A93]" },
] as const;

/**
 * "Solar in 60 seconds" (homepage, bright white → light-blue): what solar is, how it cuts the bill,
 * a realistic solar-house visual (video-ready; see <SolarStoryMedia>), the step-by-step
 * energy flow and on-grid vs off-grid vs hybrid. Pure CSS/SVG animation, respects reduced motion.
 */
export function Solar60() {
  const t = useTranslations("solar60");
  return (
    <section className="dot-grid bg-premium-light relative isolate overflow-hidden py-16 md:py-24" aria-labelledby="s60-title">
      <div aria-hidden className="orb -left-24 top-20 size-80 bg-yellow/25" />
      <div aria-hidden className="orb -right-24 bottom-10 size-96 bg-primary-hover/20" style={{ animationDelay: "-5s" }} />
      <div className="container-page">
        <SectionHeading premium eyebrow={t("eyebrow")} title={t("title")} />

        <div className="grid items-center gap-6 lg:grid-cols-12 lg:gap-8">
          {/* Illustration */}
          <Reveal className="lg:col-span-7">
            <div className="relative rounded-[1.5rem] border border-line bg-card p-2 backdrop-blur-md md:p-3">
              <SolarStoryMedia alt={t("scene.alt")} labels={{ panels: t("flow.panels.title"), inverter: t("flow.inverter.title"), home: t("flow.home.title"), grid: t("flow.grid.title") }} />
              <ul className="flex flex-wrap gap-x-5 gap-y-2 px-2 pb-1 pt-3 text-caption font-semibold text-ink">
                <li className="flex items-center gap-2"><span aria-hidden className="size-2.5 rounded-full bg-gold" />{t("scene.toHome")}</li>
                <li className="flex items-center gap-2"><span aria-hidden className="size-2.5 rounded-full bg-primary-hover shadow-[0_0_10px_#235A93]" />{t("scene.toGrid")}</li>
              </ul>
            </div>
          </Reveal>

          {/* What / how it cuts the bill */}
          <div className="grid gap-4 lg:col-span-5">
            {([["what", Lightbulb], ["cut", TrendingDown]] as const).map(([k, Icon], i) => (
              <Reveal key={k} delay={0.1 + i * 0.08} className="card-glass-light flex gap-4 p-6 md:p-7">
                <span className={cn("float-soft grid size-12 shrink-0 place-items-center rounded-2xl", i ? "icon-primary-hover" : "icon-sun")} style={{ animationDelay: `${i * -2}s` }}>
                  <Icon className="size-6" aria-hidden />
                </span>
                <div>
                  <h3 className="text-h4 text-ink">{t(`${k}.title`)}</h3>
                  <p className="mt-2 text-muted">{t(`${k}.desc`)}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* Energy-flow steps: connected line with gold numbered dots */}
        <Reveal className="card-premium relative mt-8 p-6 hover:transform-none md:p-10">
          <ol className="relative grid gap-6 md:grid-cols-6 md:gap-3">
            <span aria-hidden className="absolute bottom-6 left-[1.1875rem] top-6 w-0.5 bg-primary/70 md:bottom-auto md:left-[8%] md:right-[8%] md:top-[1.1875rem] md:h-0.5 md:w-auto" />
            {FLOW.map(({ key, Icon }, i) => (
              <li key={key} className="relative flex items-start gap-4 md:flex-col md:items-center md:text-center">
                <span className="relative z-10 grid size-10 shrink-0 place-items-center rounded-full border border-gold bg-[linear-gradient(135deg,#F0BE4A,#F7D274)] font-heading text-[1rem] font-semibold text-on-gold shadow-[0_0_0_6px_#FCFDFF]">{i + 1}</span>
                <span className="md:mt-1">
                  <span className="flex items-center gap-2 font-heading text-[1.0625rem] font-semibold text-ink md:justify-center"><Icon className="size-4 text-primary" aria-hidden />{t(`flow.${key}.title`)}</span>
                  <span className="mt-1 block text-caption text-muted">{t(`flow.${key}.desc`)}</span>
                </span>
              </li>
            ))}
          </ol>
        </Reveal>

        {/* On-grid vs off-grid vs hybrid */}
        <h3 className="mb-6 mt-14 text-center text-h3 text-ink md:text-[2rem]">{t("typesTitle")}</h3>
        <ul className="grid gap-4 md:grid-cols-3">
          {TYPES.map(({ key, Icon, accent, color }, i) => (
            <Reveal key={key} delay={i * 0.08} className="h-full">
              <li className="card-glass-light flex h-full list-none flex-col overflow-hidden p-6">
                <span aria-hidden className={cn("absolute inset-x-0 top-0 h-1 bg-gradient-to-r", accent)} />
                <div className="flex items-center gap-4">
                  <PhotoTile src={TYPE_PHOTOS[key]} alt={t(`${key}.name`)}
                    className={cn("size-[4.5rem] shrink-0 rounded-xl bg-[#EAF1F8] shadow-[0_10px_22px_-12px_rgb(27_69_112/0.5)] ring-1 ring-primary-hover/10", color)}
                    fallback={<span className="relative grid place-items-center"><Icon className="size-9" strokeWidth={1.6} aria-hidden />{key === "hybrid" && <Zap className="absolute size-3.5 fill-[#F0BE4A] text-[#F0BE4A]" strokeWidth={1.5} aria-hidden />}</span>} />
                  <h4 className="font-heading text-h4 font-bold text-ink">{t(`${key}.name`)}</h4>
                </div>
                <p className="mt-3 flex-1 text-caption text-muted">{t(`${key}.desc`)}</p>
                <p className="mt-4 inline-flex self-start rounded-full bg-leaf-tint px-3 py-1.5 text-caption text-primary ring-1 ring-primary/20"><span className="font-semibold">{t("best")}:&nbsp;</span>{t(`${key}.best`)}</p>
              </li>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
