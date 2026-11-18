"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useMotionValueEvent, useReducedMotion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLocale, useTranslations } from "next-intl";
import { Progress } from "@/components/ui/progress";
import { EnergyDiagram, STAGES, stageAt } from "@/components/illustrations/energy-diagram";
import { ASSETS, FRAMES } from "@/lib/assets";
import { cn, pick } from "@/lib/utils";

type Mode = "frames" | "diagram" | "static";

/** Detects reduced motion and slow / data-saver connections. */
function useMode(reduce: boolean | null): Mode | null {
  const [mode, setMode] = useState<Mode | null>(null);
  useEffect(() => {
    const c = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    const slow = !!c && (c.saveData || ["slow-2g", "2g"].includes(c.effectiveType ?? ""));
    if (reduce) setMode("static");
    else if (FRAMES.ready && !slow) setMode("frames");
    else setMode("diagram");
  }, [reduce]);
  return mode;
}

export function HowSolarWorks() {
  const t = useTranslations("how");
  const reduce = useReducedMotion();
  const mode = useMode(reduce);

  if (mode === "static") return <StaticHow />;

  return (
    <section id="how-it-works" aria-labelledby="how-title" className="relative">
      <PinnedSequence mode={mode ?? "diagram"} title={t("title")} eyebrow={t("eyebrow")} subtitle={t("subtitle")} />
    </section>
  );
}

function PinnedSequence({ mode, title, eyebrow, subtitle }: { mode: Mode; title: string; eyebrow: string; subtitle: string }) {
  const t = useTranslations("how.steps");
  const track = useRef<HTMLDivElement>(null);
  const progress = useMotionValue(0);
  const [stage, setStage] = useState(0);
  const [p, setP] = useState(0);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const st = ScrollTrigger.create({
      trigger: track.current,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      onUpdate: (self) => progress.set(self.progress),
    });
    return () => st.kill();
  }, [progress]);

  useMotionValueEvent(progress, "change", (v) => {
    const s = stageAt(v);
    setStage((prev) => (prev === s ? prev : s));
    setP(Math.round(v * 50) / 50); // throttle re-renders for the progress bar
  });

  return (
    <div ref={track} className="relative h-[420vh] md:h-[520vh]">
      <div className="sticky top-0 flex h-[100svh] flex-col overflow-hidden bg-navy text-cream">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_10%,rgb(255_184_0/0.18),transparent_55%)]" />
        <div className="container-page relative flex flex-1 flex-col pt-[calc(var(--header-h)+1rem)] md:pt-[calc(var(--header-h)+2rem)]">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow !text-navy-200">{eyebrow}</p>
              <h2 id="how-title" className="mt-2 text-h3 md:text-h2-lg">{title}</h2>
            </div>
            <p className="text-caption text-navy-200">{subtitle}</p>
          </div>

          <div className="relative mt-4 grid flex-1 items-center gap-6 md:grid-cols-12">
            <div className="relative md:col-span-8">
              {mode === "frames" ? <FrameCanvas progress={progress} /> : <EnergyDiagram progress={progress} className="mx-auto h-auto max-h-[52svh] w-full [--color-surface:#102549] [--color-fg:#f5f3ee]" />}
            </div>

            {/* Captions */}
            <div className="relative min-h-40 md:col-span-4" aria-live="polite">
              <ol className="mb-5 flex gap-1.5" aria-hidden>
                {STAGES.map((s, i) => (
                  <li key={s} className={cn("h-1 flex-1 rounded-full transition-colors duration-500", i <= stage ? "bg-gold" : "bg-white/15")} />
                ))}
              </ol>
              <AnimatePresence mode="wait">
                <motion.div key={stage} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
                  <p className="font-heading text-caption font-bold text-gold">0{stage + 1}</p>
                  <h3 className="mt-1 text-h3">{t(`${STAGES[stage]}.title`)}</h3>
                  <p className="mt-3 text-navy-200">{t(`${STAGES[stage]}.desc`)}</p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
          <Progress value={p} className="mb-6 bg-white/10" label={title} />
        </div>
      </div>
    </div>
  );
}

/** Canvas image sequence: progress → frame index. Frames are preloaded progressively. */
function FrameCanvas({ progress }: { progress: ReturnType<typeof useMotionValue<number>> }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const images = useRef<HTMLImageElement[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const narrow = window.matchMedia("(max-width: 767px)").matches;
    const set = narrow ? FRAMES.mobile : FRAMES.desktop;
    images.current = Array.from({ length: set.count }, (_, i) => {
      const img = new Image();
      img.decoding = "async";
      img.src = set.path(i + 1);
      if (i === 0) img.onload = () => { setReady(true); draw(0); };
      return img;
    });
    const draw = (v: number) => {
      const c = canvas.current;
      const ctx = c?.getContext("2d");
      if (!c || !ctx) return;
      const idx = Math.min(set.count - 1, Math.floor(v * set.count));
      // nearest loaded frame at or before idx
      let img = images.current[idx];
      for (let j = idx; j >= 0 && !(img?.complete && img.naturalWidth); j--) img = images.current[j];
      if (!img?.naturalWidth) return;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = c.clientWidth * dpr, h = c.clientHeight * dpr;
      if (c.width !== w || c.height !== h) { c.width = w; c.height = h; }
      const s = Math.max(w / img.naturalWidth, h / img.naturalHeight);
      const dw = img.naturalWidth * s, dh = img.naturalHeight * s;
      ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
    };
    const unsub = progress.on("change", (v) => requestAnimationFrame(() => draw(v)));
    return () => unsub();
  }, [progress]);

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-3xl">
      {!ready && <div className="absolute inset-0 animate-pulse bg-white/5" />}
      <canvas ref={canvas} className="size-full" aria-hidden />
    </div>
  );
}

/** Reduced-motion / slow-network fallback: static image or diagram + all steps listed. */
function StaticHow() {
  const t = useTranslations("how");
  const locale = useLocale();
  const full = useMotionValue(1);
  return (
    <section id="how-it-works" aria-labelledby="how-title" className="section bg-navy text-cream">
      <div className="container-page">
        <p className="eyebrow !text-navy-200">{t("eyebrow")}</p>
        <h2 id="how-title" className="mt-2 text-h2 md:text-h2-lg">{t("title")}</h2>
        <div className="mt-10">
          {ASSETS.howStatic.ready ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={ASSETS.howStatic.src} alt={pick(ASSETS.howStatic.alt, locale)} loading="lazy" width={ASSETS.howStatic.width} height={ASSETS.howStatic.height} className="w-full rounded-3xl" />
          ) : (
            <EnergyDiagram progress={full} className="mx-auto w-full max-w-4xl [--color-surface:#102549] [--color-fg:#f5f3ee]" />
          )}
        </div>
        <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {STAGES.map((s, i) => (
            <li key={s}>
              <p className="font-heading text-caption font-bold text-gold">0{i + 1}</p>
              <h3 className="text-h4">{t(`steps.${s}.title`)}</h3>
              <p className="mt-2 text-navy-200">{t(`steps.${s}.desc`)}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
