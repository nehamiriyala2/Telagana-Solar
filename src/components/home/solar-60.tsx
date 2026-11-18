import { useTranslations } from "next-intl";
import { BatteryCharging, Cable, Gauge, House, Lightbulb, PanelsTopLeft, PlugZap, Sun, TrendingDown, UtilityPole, Zap } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

const FLOW = [
  { key: "sun", Icon: Sun, tone: "icon-sun" },
  { key: "panels", Icon: PanelsTopLeft, tone: "icon-royal" },
  { key: "inverter", Icon: Cable, tone: "bg-white text-royal" },
  { key: "home", Icon: House, tone: "icon-sun" },
  { key: "meter", Icon: Gauge, tone: "bg-leaf text-white" },
  { key: "grid", Icon: UtilityPole, tone: "bg-white text-navy" },
] as const;

const TYPES = [
  { key: "ongrid", Icon: PlugZap, accent: "from-yellow to-gold" },
  { key: "offgrid", Icon: BatteryCharging, accent: "from-sky to-royal" },
  { key: "hybrid", Icon: Zap, accent: "from-leaf to-[#2B7A23]" },
] as const;

/**
 * "Solar in 60 seconds" (homepage, deep navy): what solar is, how it cuts the bill, an animated
 * energy-flow diagram and on-grid vs off-grid vs hybrid. Pure CSS animation, respects reduced motion.
 */
export function Solar60() {
  const t = useTranslations("solar60");
  return (
    <section className="dot-grid bg-premium-navy relative isolate overflow-hidden py-16 md:py-24" aria-labelledby="s60-title">
      <div aria-hidden className="orb -left-24 top-20 size-80 bg-gold/20" />
      <div aria-hidden className="orb -right-24 bottom-10 size-96 bg-sky/20" style={{ animationDelay: "-5s" }} />
      <div className="container-page">
        <SectionHeading premium tone="dark" eyebrow={t("eyebrow")} title={t("title")} />

        <div className="grid gap-4 md:grid-cols-2">
          {([["what", Lightbulb], ["cut", TrendingDown]] as const).map(([k, Icon], i) => (
            <Reveal key={k} delay={i * 0.08} className="card-glass-dark flex gap-4 p-6 md:p-8">
              <span className={cn("grid size-12 shrink-0 place-items-center rounded-2xl", i ? "icon-royal" : "icon-sun")}><Icon className="size-6" aria-hidden /></span>
              <div>
                <h3 className="text-h4 text-white">{t(`${k}.title`)}</h3>
                <p className="mt-2 text-silver/85">{t(`${k}.desc`)}</p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Energy-flow diagram */}
        <Reveal className="relative mt-8 overflow-hidden rounded-[1.75rem] border border-white/10 bg-[linear-gradient(135deg,rgb(255_255_255/0.07),rgb(77_163_255/0.08))] p-6 md:p-10">
          <ol className="relative grid gap-6 md:grid-cols-6 md:gap-3">
            <span aria-hidden className="s60-line absolute bottom-7 left-7 top-7 w-1 rounded-full md:bottom-auto md:left-[8%] md:right-[8%] md:top-7 md:h-1 md:w-auto" />
            {FLOW.map(({ key, Icon, tone }, i) => (
              <li key={key} className="relative flex items-center gap-4 md:flex-col md:text-center">
                <span className={cn("s60-node relative z-10 grid size-14 shrink-0 place-items-center rounded-2xl ring-4 ring-navy", tone)} style={{ animationDelay: `${i * 0.35}s` }}>
                  <Icon className="size-6" strokeWidth={1.8} aria-hidden />
                </span>
                <span>
                  <span className="block font-heading font-bold text-white">{t(`flow.${key}.title`)}</span>
                  <span className="block text-caption text-silver/75">{t(`flow.${key}.desc`)}</span>
                </span>
              </li>
            ))}
          </ol>
          <style>{`
            .s60-line { background-image: repeating-linear-gradient(180deg, #FFC72C 0 10px, transparent 10px 20px); background-size: 100% 20px; animation: s60v 1.2s linear infinite; box-shadow: 0 0 14px rgb(255 199 44 / .6); }
            @media (min-width: 768px) { .s60-line { background-image: repeating-linear-gradient(90deg, #FFC72C 0 14px, transparent 14px 26px); background-size: 26px 100%; animation-name: s60h; } }
            @keyframes s60v { to { background-position: 0 20px; } }
            @keyframes s60h { to { background-position: 26px 0; } }
            .s60-node { animation: s60pulse 2.1s ease-in-out infinite; }
            @keyframes s60pulse { 0%, 100% { box-shadow: 0 0 0 0 rgb(255 199 44 / 0); } 15% { box-shadow: 0 0 0 8px rgb(255 199 44 / .35), 0 0 30px rgb(255 199 44 / .5); } 35% { box-shadow: 0 0 0 0 rgb(255 199 44 / 0); } }
            @media (prefers-reduced-motion: reduce) { .s60-line, .s60-node { animation: none; } }
          `}</style>
        </Reveal>

        {/* On-grid vs off-grid vs hybrid */}
        <h3 className="mb-6 mt-14 text-center text-h3 text-white md:text-[2rem]">{t("typesTitle")}</h3>
        <ul className="grid gap-4 md:grid-cols-3">
          {TYPES.map(({ key, Icon, accent }, i) => (
            <Reveal key={key} delay={i * 0.08} className="h-full">
              <li className="card-glass-dark flex h-full list-none flex-col overflow-hidden p-6">
                <span aria-hidden className={cn("absolute inset-x-0 top-0 h-1 bg-gradient-to-r", accent)} />
                <span className={cn("grid size-12 place-items-center rounded-2xl bg-gradient-to-br text-navy", accent)}><Icon className="size-6" strokeWidth={1.8} aria-hidden /></span>
                <h4 className="mt-4 font-heading text-h4 font-bold text-white">{t(`${key}.name`)}</h4>
                <p className="mt-2 flex-1 text-caption text-silver/80">{t(`${key}.desc`)}</p>
                <p className="mt-4 rounded-xl bg-white/[0.06] px-3 py-2 text-caption text-silver"><span className="font-semibold text-yellow">{t("best")}: </span>{t(`${key}.best`)}</p>
              </li>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
