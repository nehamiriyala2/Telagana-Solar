"use client";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { IndianRupee, Moon, Sun, Zap } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn, formatINR } from "@/lib/utils";

/** Static render of the 3D scene: shown first, and permanently on low-end / reduced-motion devices. */
export const FALLBACK_SRC = "/hero/scene-fallback.webp";

const HeroScene = dynamic(() => import("./scene"), { ssr: false });

type Mode = "static" | "loading" | "3d";

/** Decide whether this device should get the live 3D scene. */
function canRun3D(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  const nav = navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string }; deviceMemory?: number };
  if (nav.connection?.saveData || ["slow-2g", "2g"].includes(nav.connection?.effectiveType ?? "")) return false;
  if ((nav.deviceMemory ?? 8) <= 2 || (navigator.hardwareConcurrency ?? 8) <= 2) return false;
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch { return false; }
}

export function HeroVisual({ capture = false }: { capture?: boolean }) {
  const t = useTranslations("scene");
  const wrap = useRef<HTMLDivElement>(null);
  const dragRef = useRef(0);
  const [mode, setMode] = useState<Mode>("static");
  const [ready, setReady] = useState(false);
  const [night, setNight] = useState(false);
  const [visible, setVisible] = useState(true);
  const [coarse, setCoarse] = useState(false);

  // Lazy start: after idle, only if capable
  useEffect(() => {
    setCoarse(window.matchMedia("(pointer: coarse)").matches);
    if (!capture && !canRun3D()) return;
    const start = () => setMode("loading");
    if (capture) { start(); return; }
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
    const id = w.requestIdleCallback ? w.requestIdleCallback(start, { timeout: 2500 }) : window.setTimeout(start, 1200);
    return () => { if (!w.requestIdleCallback) clearTimeout(id); };
  }, [capture]);

  // Pause rendering when off-screen
  useEffect(() => {
    if (!wrap.current) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: "100px" });
    io.observe(wrap.current);
    return () => io.disconnect();
  }, []);

  // Drag to rotate (desktop); springs back slowly
  useEffect(() => {
    const el = wrap.current;
    if (!el || mode === "static") return;
    let down = false, lastX = 0, raf = 0;
    const onDown = (e: PointerEvent) => { if (e.pointerType !== "mouse") return; down = true; lastX = e.clientX; el.style.cursor = "grabbing"; };
    const onMove = (e: PointerEvent) => { if (!down) return; dragRef.current = Math.max(-0.7, Math.min(0.7, dragRef.current + (e.clientX - lastX) * 0.006)); lastX = e.clientX; };
    const onUp = () => { down = false; el.style.cursor = "grab"; };
    const relax = () => { if (!down) dragRef.current *= 0.985; raf = requestAnimationFrame(relax); };
    el.style.cursor = "grab";
    el.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    raf = requestAnimationFrame(relax);
    return () => { el.removeEventListener("pointerdown", onDown); window.removeEventListener("pointermove", onMove); window.removeEventListener("pointerup", onUp); cancelAnimationFrame(raf); };
  }, [mode]);

  const live = mode !== "static";

  return (
    <div className="mx-auto w-full max-w-[640px]">
    <div ref={wrap} className="relative aspect-[1/1] w-full select-none sm:aspect-[6/5]" data-scene-ready={ready ? "true" : "false"}>
      {/* Bright backdrop circle: light sky blue → soft yellow (slightly cooler at night, never dark) */}
      <div aria-hidden className={cn("absolute inset-[5%] rounded-full transition-[background] duration-1000", capture && "hidden",
        night ? "bg-[radial-gradient(circle_at_50%_40%,#F4F8FF_0%,#DCEBFF_55%,#FFF3D1_100%)]" : "bg-[radial-gradient(circle_at_50%_40%,#FFFFFF_0%,#EAF4FF_45%,#FFF3D1_100%)]")} />

      {/* Static fallback (also the LCP image). Fades out once the live scene has rendered. */}
      <Image src={FALLBACK_SRC} alt={t("alt")} fill priority sizes="(min-width:1024px) 640px, 100vw"
        className={cn("object-contain transition-opacity duration-700", live && ready ? "opacity-0" : "opacity-100")} />

      {live && (
        <div className={cn("absolute inset-0 transition-opacity duration-700", ready ? "opacity-100" : "opacity-0")} aria-hidden>
          <HeroScene night={night} dragRef={dragRef} coarsePointer={coarse} visible={visible} onReady={() => setReady(true)} />
        </div>
      )}

      {!capture && (
        <>
          {/* Floating glass info cards in the four corners, clear of the house and panels (desktop/tablet) */}
          <GlassCard className="absolute left-0 top-[3%] hidden animate-float-y sm:flex" delay="0s">
            <Sun className="size-4 text-gold" aria-hidden /><span>{t("kw")}</span>
          </GlassCard>
          <GlassCard className="absolute right-0 top-[24%] hidden animate-float-y sm:flex" delay="-2s">
            <Zap className="size-4 text-royal" aria-hidden /><span>{t("units")}</span>
          </GlassCard>
          <GlassCard className="absolute bottom-[3%] left-0 hidden animate-float-y sm:flex" delay="-4s">
            <IndianRupee className="size-4 text-leaf-ink" aria-hidden /><span className="font-bold text-leaf-ink">{t("saving")}</span>
          </GlassCard>
          <BillCard night={night} className="absolute bottom-[1%] right-0 hidden w-48 animate-float-y sm:block" />

          {/* Day / night toggle */}
          <button type="button" onClick={() => setNight((v) => !v)} aria-pressed={night} aria-label={t("toggle")}
            className="absolute right-2 top-2 z-10 flex items-center gap-1 rounded-full border border-white/70 bg-white/80 p-1 text-caption font-semibold shadow-soft backdrop-blur">
            <span className={cn("flex items-center gap-1 rounded-full px-2.5 py-1 transition-colors", !night ? "bg-sun text-navy" : "text-muted")}><Sun className="size-3.5" aria-hidden />{t("day")}</span>
            <span className={cn("flex items-center gap-1 rounded-full px-2.5 py-1 transition-colors", night ? "bg-navy text-yellow" : "text-muted")}><Moon className="size-3.5" aria-hidden />{t("night")}</span>
          </button>
        </>
      )}
    </div>
      {!capture && (
        <>
          {/* Phones: the same cards in a tidy grid under the scene, so nothing overlaps */}
          <div className="mt-2 grid grid-cols-2 gap-2 sm:hidden">
            <GlassCard><Sun className="size-4 text-gold" aria-hidden /><span>{t("kw")}</span></GlassCard>
            <GlassCard><Zap className="size-4 text-royal" aria-hidden /><span>{t("units")}</span></GlassCard>
            <GlassCard><IndianRupee className="size-4 shrink-0 text-leaf-ink" aria-hidden /><span className="font-bold text-leaf-ink">{t("saving")}</span></GlassCard>
            <BillCard night={night} className="row-span-1" />
          </div>
          <p className="mt-1 text-right text-[0.6875rem] text-muted">{t("example")}</p>
        </>
      )}
    </div>
  );
}

function GlassCard({ children, className, delay }: { children: React.ReactNode; className?: string; delay?: string }) {
  return (
    <div style={delay ? { animationDelay: delay } : undefined}
      className={cn("z-10 flex items-center gap-1.5 rounded-2xl border border-white/70 bg-white/70 px-3 py-2 text-caption font-semibold text-navy shadow-[0_10px_30px_-12px_rgb(7_23_63/0.35)] backdrop-blur-md sm:px-4 sm:py-2.5", className)}>
      {children}
    </div>
  );
}

/** Meter / bill card: counts the bill down from ₹3,200 to ₹400 and repeats; at night shows "Powered by solar". */
function BillCard({ night, className }: { night: boolean; className?: string }) {
  const t = useTranslations("scene");
  const FROM = 3200, TO = 400;
  const [v, setV] = useState(FROM);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setV(TO); return; }
    let raf = 0, start = performance.now();
    const loop = (now: number) => {
      const e = (now - start) / 1000;
      if (e < 2.4) { const p = 1 - Math.pow(1 - e / 2.4, 3); setV(Math.round(FROM - (FROM - TO) * p)); }
      else if (e < 5.5) setV(TO);
      else start = now;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <div className={cn("z-10 rounded-2xl border border-white/70 bg-white/80 p-3 shadow-[0_10px_30px_-12px_rgb(7_23_63/0.35)] backdrop-blur-md", className)} style={{ animationDelay: "-1s" }}>
      <AnimatePresence mode="wait" initial={false}>
        {night ? (
          <motion.div key="night" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
            <p className="text-[0.6875rem] font-semibold uppercase tracking-wide text-muted">{t("bill")}</p>
            <p className="mt-1 flex items-center gap-1.5 font-heading text-[1.0625rem] font-extrabold text-leaf-ink"><Zap className="size-4" aria-hidden />{t("poweredBySolar")}</p>
          </motion.div>
        ) : (
          <motion.div key="day" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
            <p className="text-[0.6875rem] font-semibold uppercase tracking-wide text-muted">{t("bill")}</p>
            <p className="mt-1 flex items-baseline gap-2 font-heading font-extrabold">
              <span className="text-caption text-muted line-through">{formatINR(FROM)}</span>
              <span aria-live="off" className={cn("text-h4 tabular-nums", v <= TO ? "text-leaf-ink" : "text-navy")}>{formatINR(v)}</span>
            </p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-navy/10">
              <div className="h-full rounded-full bg-leaf transition-[width] duration-100" style={{ width: `${(v / FROM) * 100}%` }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
