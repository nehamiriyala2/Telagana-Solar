import { useTranslations } from "next-intl";
import { BatteryCharging, Cable, Gauge, House, Lightbulb, PanelsTopLeft, PlugZap, Sun, TrendingDown, UtilityPole, Zap } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";
import { SolarStoryMedia } from "./solar-story-media";

const FLOW = [
  { key: "sun", Icon: Sun, tone: "icon-sun" },
  { key: "panels", Icon: PanelsTopLeft, tone: "icon-royal" },
  { key: "inverter", Icon: Cable, tone: "bg-[#EAF3FF] text-royal" },
  { key: "home", Icon: House, tone: "icon-sun" },
  { key: "meter", Icon: Gauge, tone: "bg-leaf text-white shadow-[0_10px_24px_-12px_rgb(63_165_53/0.8)]" },
  { key: "grid", Icon: UtilityPole, tone: "bg-navy text-white" },
] as const;

const TYPES = [
  { key: "ongrid", Icon: PlugZap, accent: "from-yellow to-gold" },
  { key: "offgrid", Icon: BatteryCharging, accent: "from-sky to-royal" },
  { key: "hybrid", Icon: Zap, accent: "from-leaf to-[#2B7A23]" },
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
      <div aria-hidden className="orb -right-24 bottom-10 size-96 bg-sky/20" style={{ animationDelay: "-5s" }} />
      <div className="container-page">
        <SectionHeading premium eyebrow={t("eyebrow")} title={t("title")} />

        <div className="grid items-center gap-6 lg:grid-cols-12 lg:gap-8">
          {/* Illustration */}
          <Reveal className="lg:col-span-7">
            <div className="relative rounded-[2rem] border border-white/80 bg-white/60 p-2 shadow-[0_40px_80px_-40px_rgb(7_27_73/0.45),0_0_60px_-30px_rgb(255_184_0/0.5)] backdrop-blur-md md:p-3">
              <SolarStoryMedia alt={t("scene.alt")} labels={{ panels: t("flow.panels.title"), inverter: t("flow.inverter.title"), home: t("flow.home.title"), grid: t("flow.grid.title") }} />
              <ul className="flex flex-wrap gap-x-5 gap-y-2 px-2 pb-1 pt-3 text-caption font-semibold text-navy">
                <li className="flex items-center gap-2"><span aria-hidden className="size-2.5 rounded-full bg-gold shadow-[0_0_10px_#FFC72C]" />{t("scene.toHome")}</li>
                <li className="flex items-center gap-2"><span aria-hidden className="size-2.5 rounded-full bg-sky shadow-[0_0_10px_#4DA3FF]" />{t("scene.toGrid")}</li>
              </ul>
            </div>
          </Reveal>

          {/* What / how it cuts the bill */}
          <div className="grid gap-4 lg:col-span-5">
            {([["what", Lightbulb], ["cut", TrendingDown]] as const).map(([k, Icon], i) => (
              <Reveal key={k} delay={0.1 + i * 0.08} className="card-glass-light flex gap-4 p-6 md:p-7">
                <span className={cn("float-soft grid size-12 shrink-0 place-items-center rounded-2xl", i ? "icon-royal" : "icon-sun")} style={{ animationDelay: `${i * -2}s` }}>
                  <Icon className="size-6" aria-hidden />
                </span>
                <div>
                  <h3 className="text-h4 text-navy">{t(`${k}.title`)}</h3>
                  <p className="mt-2 text-muted">{t(`${k}.desc`)}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* Energy-flow steps */}
        <Reveal className="card-glass-light relative mt-8 overflow-hidden p-6 hover:transform-none md:p-10">
          <ol className="relative grid gap-6 md:grid-cols-6 md:gap-3">
            <span aria-hidden className="s60-line absolute bottom-7 left-7 top-7 w-1 rounded-full md:bottom-auto md:left-[8%] md:right-[8%] md:top-7 md:h-1 md:w-auto" />
            {FLOW.map(({ key, Icon, tone }, i) => (
              <li key={key} className="relative flex items-center gap-4 md:flex-col md:text-center">
                <span className={cn("s60-node relative z-10 grid size-14 shrink-0 place-items-center rounded-2xl ring-4 ring-white", tone)} style={{ animationDelay: `${i * 0.35}s` }}>
                  <Icon className="size-6" strokeWidth={1.8} aria-hidden />
                </span>
                <span>
                  <span className="block font-heading font-bold text-navy">{t(`flow.${key}.title`)}</span>
                  <span className="block text-caption text-muted">{t(`flow.${key}.desc`)}</span>
                </span>
              </li>
            ))}
          </ol>
          <style>{`
            .s60-line { background-image: repeating-linear-gradient(180deg, #F5A800 0 10px, transparent 10px 20px); background-size: 100% 20px; animation: s60v 1.2s linear infinite; box-shadow: 0 0 12px rgb(255 199 44 / .45); }
            @media (min-width: 768px) { .s60-line { background-image: repeating-linear-gradient(90deg, #F5A800 0 14px, transparent 14px 26px); background-size: 26px 100%; animation-name: s60h; } }
            @keyframes s60v { to { background-position: 0 20px; } }
            @keyframes s60h { to { background-position: 26px 0; } }
            .s60-node { animation: s60pulse 2.1s ease-in-out infinite; }
            @keyframes s60pulse { 0%, 100% { box-shadow: 0 0 0 0 rgb(255 199 44 / 0); } 15% { box-shadow: 0 0 0 8px rgb(255 199 44 / .3), 0 0 26px rgb(255 199 44 / .45); } 35% { box-shadow: 0 0 0 0 rgb(255 199 44 / 0); } }
            @media (prefers-reduced-motion: reduce) { .s60-line, .s60-node { animation: none; } }
          `}</style>
        </Reveal>

        {/* On-grid vs off-grid vs hybrid */}
        <h3 className="mb-6 mt-14 text-center text-h3 text-navy md:text-[2rem]">{t("typesTitle")}</h3>
        <ul className="grid gap-4 md:grid-cols-3">
          {TYPES.map(({ key, Icon, accent }, i) => (
            <Reveal key={key} delay={i * 0.08} className="h-full">
              <li className="card-glass-light flex h-full list-none flex-col overflow-hidden p-6">
                <span aria-hidden className={cn("absolute inset-x-0 top-0 h-1 bg-gradient-to-r", accent)} />
                <span className={cn("float-soft grid size-12 place-items-center rounded-2xl bg-gradient-to-br text-white shadow-[0_10px_24px_-12px_rgb(7_23_63/0.5)]", accent, key === "ongrid" && "text-navy")} style={{ animationDelay: `${i * -1.5}s` }}>
                  <Icon className="size-6" strokeWidth={1.8} aria-hidden />
                </span>
                <h4 className="mt-4 font-heading text-h4 font-bold text-navy">{t(`${key}.name`)}</h4>
                <p className="mt-2 flex-1 text-caption text-muted">{t(`${key}.desc`)}</p>
                <p className="mt-4 rounded-xl bg-[#F1F7FF] px-3 py-2 text-caption text-navy ring-1 ring-royal/10"><span className="font-semibold text-[#9A6400]">{t("best")}: </span>{t(`${key}.best`)}</p>
              </li>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
