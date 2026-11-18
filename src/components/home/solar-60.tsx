import { useTranslations } from "next-intl";
import { BatteryCharging, Cable, Gauge, House, Lightbulb, PanelsTopLeft, PlugZap, Sun, TrendingDown, UtilityPole, Zap } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

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
 * an animated house illustration (sunlight → panels → home → extra to the grid), the step-by-step
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
            <div className="card-glass-light zoom-frame p-3 md:p-4">
              <SolarScene label={t("scene.alt")} chips={{
                sun: t("flow.sun.title"), sunDesc: t("flow.sun.desc"),
                panels: t("flow.panels.title"), panelsDesc: t("flow.panels.desc"),
                home: t("flow.home.title"), homeDesc: t("flow.home.desc"),
                grid: t("flow.grid.title"), gridDesc: t("flow.grid.desc"),
              }} />
              <ul className="flex flex-wrap gap-x-5 gap-y-2 px-2 pb-1 pt-3 text-caption font-semibold text-navy">
                <li className="flex items-center gap-2"><span aria-hidden className="size-2.5 rounded-full bg-gold shadow-[0_0_10px_#FFC72C]" />{t("scene.toHome")}</li>
                <li className="flex items-center gap-2"><span aria-hidden className="size-2.5 rounded-full bg-leaf shadow-[0_0_10px_#3FA535]" />{t("scene.toGrid")}</li>
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

type Chips = Record<"sun" | "sunDesc" | "panels" | "panelsDesc" | "home" | "homeDesc" | "grid" | "gridDesc", string>;

/** Panel modules on the flat roof: tilted faces, seen from the front (viewBox units). */
const MODULES = [205, 283, 361].map((x) => ({
  face: `${x},200 ${x + 64},200 ${x + 78},168 ${x + 14},168`,
  cells: [0.25, 0.5, 0.75].map((f) => `M${x + 64 * f} 200 L${x + 14 + 64 * f} 168`).join(" ") + ` M${x + 7} 184 L${x + 71} 184`,
  leg: x + 72,
}));

/**
 * Animated illustration: sun rays reach the rooftop panels (light glint sweeping across them),
 * solar power flows (gold dots) through the inverter into the home, and extra power (green dots)
 * flows through the net meter to the grid. Labels are HTML chips so they translate and stay crisp.
 */
function SolarScene({ label, chips }: { label: string; chips: Chips }) {
  return (
    <div className="relative overflow-hidden rounded-[1.25rem] bg-[linear-gradient(180deg,#DDEBFF_0%,#F1F7FF_55%,#FFFFFF_100%)]">
      <svg viewBox="0 0 640 440" role="img" aria-label={label} className="zoom-img block h-auto w-full">
        <defs>
          <radialGradient id="s60-sun" cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#FFF6CF" />
            <stop offset=".55" stopColor="#FFC72C" />
            <stop offset="1" stopColor="#F5A800" />
          </radialGradient>
          <linearGradient id="s60-panel" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#3E7BE8" />
            <stop offset=".55" stopColor="#1E4FB8" />
            <stop offset="1" stopColor="#0B2A6B" />
          </linearGradient>
          <linearGradient id="s60-glint" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#fff" stopOpacity="0" />
            <stop offset=".5" stopColor="#FFF4C8" stopOpacity=".95" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="s60-wall" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FFFFFF" />
            <stop offset="1" stopColor="#EEF3FA" />
          </linearGradient>
          <clipPath id="s60-panels">{MODULES.map((m) => <polygon key={m.face} points={m.face} />)}</clipPath>
        </defs>

        {/* Clouds */}
        <g className="s60-cloud" fill="#fff" opacity=".9">
          <ellipse cx="420" cy="70" rx="44" ry="14" /><ellipse cx="448" cy="60" rx="26" ry="14" />
        </g>
        <g className="s60-cloud s60-cloud--b" fill="#fff" opacity=".75">
          <ellipse cx="250" cy="44" rx="34" ry="11" /><ellipse cx="270" cy="36" rx="20" ry="11" />
        </g>

        {/* Sun */}
        <circle className="s60-halo" cx="100" cy="92" r="70" fill="#FFC72C" opacity=".22" />
        <g className="s60-rays" stroke="#F5A800" strokeWidth="4" strokeLinecap="round" opacity=".7">
          {Array.from({ length: 12 }, (_, i) => {
            const a = (i * Math.PI) / 6;
            return <line key={i} x1={100 + Math.cos(a) * 46} y1={92 + Math.sin(a) * 46} x2={100 + Math.cos(a) * 58} y2={92 + Math.sin(a) * 58} />;
          })}
        </g>
        <circle cx="100" cy="92" r="34" fill="url(#s60-sun)" />

        {/* Sunlight beams to the panels */}
        <g stroke="#F5A800" strokeWidth="3" strokeLinecap="round" strokeDasharray="4 12" opacity=".85">
          <path className="s60-beam" d="M132 112 L236 176" />
          <path className="s60-beam" d="M134 104 L314 174" style={{ animationDelay: "-.4s" }} />
          <path className="s60-beam" d="M135 96 L392 172" style={{ animationDelay: "-.8s" }} />
        </g>

        {/* Ground + greenery */}
        <rect x="30" y="348" width="580" height="18" rx="9" fill="#DDF0D8" />
        <circle cx="150" cy="330" r="22" fill="#5DB851" /><circle cx="128" cy="338" r="15" fill="#3FA535" />
        <rect x="146" y="336" width="6" height="16" rx="2" fill="#7A5A3A" />
        <circle cx="500" cy="338" r="14" fill="#5DB851" />

        {/* House */}
        <rect x="190" y="210" width="260" height="140" rx="6" fill="url(#s60-wall)" stroke="#D5E1F2" strokeWidth="2" />
        <rect x="178" y="200" width="284" height="14" rx="4" fill="#07173F" />
        {/* Windows with warm interior glow */}
        <rect x="214" y="236" width="84" height="56" rx="6" fill="#FFE7A8" className="s60-window" />
        <rect x="318" y="236" width="64" height="56" rx="6" fill="#FFE7A8" className="s60-window" style={{ animationDelay: "-1.6s" }} />
        <path d="M256 236 V292 M214 264 H298 M350 236 V292" stroke="#fff" strokeWidth="3" />
        <rect x="396" y="290" width="32" height="60" rx="4" fill="#1E5BD8" />
        <circle cx="421" cy="322" r="2.5" fill="#FFC72C" />
        {/* Inverter */}
        <rect x="402" y="232" width="26" height="36" rx="4" fill="#fff" stroke="#1E5BD8" strokeWidth="2" />
        <rect x="407" y="238" width="16" height="8" rx="2" fill="#DCEBFF" />
        <circle className="s60-led" cx="415" cy="257" r="3" fill="#3FA535" />
        {/* Net meter on the outside wall */}
        <rect x="452" y="284" width="20" height="28" rx="4" fill="#fff" stroke="#3FA535" strokeWidth="2" />
        <rect x="456" y="289" width="12" height="7" rx="1.5" fill="#DDF0D8" />

        {/* Panels on the roof */}
        {MODULES.map((m) => (
          <g key={m.face}>
            <line x1={m.leg} y1="172" x2={m.leg} y2="200" stroke="#07173F" strokeWidth="3" />
            <polygon points={m.face} fill="url(#s60-panel)" stroke="#BFD8FF" strokeWidth="1.5" strokeLinejoin="round" />
            <path d={m.cells} stroke="#9CC3FF" strokeWidth="1" opacity=".7" />
          </g>
        ))}
        <g clipPath="url(#s60-panels)">
          <rect className="s60-glint" x="150" y="150" width="46" height="70" fill="url(#s60-glint)" transform="skewX(-24)" />
        </g>

        {/* Utility pole (grid) */}
        <line x1="560" y1="118" x2="560" y2="352" stroke="#64748B" strokeWidth="6" strokeLinecap="round" />
        <line x1="534" y1="140" x2="586" y2="140" stroke="#64748B" strokeWidth="5" strokeLinecap="round" />
        <circle cx="542" cy="134" r="4" fill="#94A3B8" /><circle cx="578" cy="134" r="4" fill="#94A3B8" />
        <path d="M586 140 Q 612 152 640 146" stroke="#94A3B8" strokeWidth="2" fill="none" />

        {/* Wires */}
        <path id="s60-home-path" d="M440 186 C 462 204 452 232 428 246 L 300 262" stroke="#F5A800" strokeWidth="2.5" fill="none" opacity=".35" />
        <path id="s60-grid-path" d="M472 298 C 512 298 522 196 542 138" stroke="#3FA535" strokeWidth="2.5" fill="none" opacity=".4" />

        {/* Moving energy (gold = solar to the home, green = extra to the grid) */}
        {[0, 0.8, 1.6].map((b) => (
          <circle key={`h${b}`} className="s60-dot" r="5" fill="#FFC72C" stroke="#fff" strokeWidth="1.5">
            <animateMotion dur="2.4s" begin={`${b}s`} repeatCount="indefinite"><mpath href="#s60-home-path" /></animateMotion>
          </circle>
        ))}
        {[0.4, 1.4].map((b) => (
          <circle key={`g${b}`} className="s60-dot" r="5" fill="#3FA535" stroke="#fff" strokeWidth="1.5">
            <animateMotion dur="2s" begin={`${b}s`} repeatCount="indefinite"><mpath href="#s60-grid-path" /></animateMotion>
          </circle>
        ))}
      </svg>

      {/* Labels */}
      <div aria-hidden>
        <SceneChip className="left-[3%] top-[47%]" icon={<Sun className="size-3.5" />} tone="icon-sun" title={chips.sun} desc={chips.sunDesc} />
        <SceneChip className="left-[50%] top-[19%] -translate-x-1/2" icon={<PanelsTopLeft className="size-3.5" />} tone="icon-royal" title={chips.panels} desc={chips.panelsDesc} delay="-1s" />
        <SceneChip className="bottom-[3%] left-[30%] -translate-x-1/2" icon={<House className="size-3.5" />} tone="icon-sun" title={chips.home} desc={chips.homeDesc} delay="-2s" />
        <SceneChip className="right-[2%] top-[5%]" icon={<UtilityPole className="size-3.5" />} tone="bg-leaf text-white" title={chips.grid} desc={chips.gridDesc} delay="-3s" />
      </div>

      <style>{`
        .s60-rays { transform-box: view-box; transform-origin: 100px 92px; animation: s60spin 40s linear infinite; }
        .s60-halo { transform-box: view-box; transform-origin: 100px 92px; animation: s60halo 4s ease-in-out infinite; }
        @keyframes s60spin { to { transform: rotate(360deg); } }
        @keyframes s60halo { 0%, 100% { transform: scale(1); opacity: .2; } 50% { transform: scale(1.12); opacity: .34; } }
        .s60-beam { animation: s60beam 1.2s linear infinite; }
        @keyframes s60beam { to { stroke-dashoffset: -32; } }
        .s60-glint { animation: s60glint 5s cubic-bezier(.45,.05,.3,1) infinite 1s; }
        @keyframes s60glint { 0% { transform: skewX(-24deg) translateX(0); opacity: 0; } 10% { opacity: 1; } 60% { transform: skewX(-24deg) translateX(420px); opacity: 1; } 61%, 100% { transform: skewX(-24deg) translateX(420px); opacity: 0; } }
        .s60-window { animation: s60win 4s ease-in-out infinite; }
        @keyframes s60win { 0%, 100% { fill: #FFE7A8; } 50% { fill: #FFD36B; } }
        .s60-led { animation: s60led 1.4s steps(2) infinite; }
        @keyframes s60led { 50% { opacity: .25; } }
        .s60-cloud { animation: s60cloud 30s ease-in-out infinite alternate; }
        .s60-cloud--b { animation-duration: 42s; animation-direction: alternate-reverse; }
        @keyframes s60cloud { from { transform: translateX(-24px); } to { transform: translateX(40px); } }
        @media (prefers-reduced-motion: reduce) {
          .s60-rays, .s60-halo, .s60-beam, .s60-glint, .s60-window, .s60-led, .s60-cloud { animation: none !important; }
          .s60-dot { display: none; }
        }
      `}</style>
    </div>
  );
}

function SceneChip({ className, icon, tone, title, desc, delay }: { className: string; icon: React.ReactNode; tone: string; title: string; desc: string; delay?: string }) {
  return (
    <div className={cn("absolute", className)}>
      <div className="float-soft flex items-center gap-2 rounded-full border border-white bg-white/90 py-1 pl-1 pr-3 shadow-[0_10px_24px_-14px_rgb(7_23_63/0.45)] backdrop-blur sm:rounded-2xl sm:py-1.5 sm:pl-1.5" style={{ animationDelay: delay }}>
        <span className={cn("grid size-6 shrink-0 place-items-center rounded-full sm:size-7 sm:rounded-xl", tone)}>{icon}</span>
        <span className="leading-tight">
          <span className="block text-[0.6875rem] font-bold text-navy sm:text-caption">{title}</span>
          <span className="hidden text-[0.6875rem] text-muted md:block">{desc}</span>
        </span>
      </div>
    </div>
  );
}
