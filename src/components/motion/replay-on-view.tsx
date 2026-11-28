"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * For CSS entrance animations that start on first paint (so above-the-fold content never waits for JavaScript).
 * If the element turns out to be below the fold, it is hidden ("tb-wait") and the animation is replayed ("tb-play")
 * when it scrolls into view, so it still plays once, on first view. Above the fold nothing changes.
 */
export function ReplayOnView({ className, children }: { className?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"" | "tb-wait" | "tb-play">("");
  useEffect(() => {
    const el = ref.current;
    if (!el || el.getBoundingClientRect().top < window.innerHeight) return;   // already seen: CSS played it
    setState("tb-wait");
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setState("tb-play"); io.disconnect(); } }, { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <div ref={ref} className={[className, state].filter(Boolean).join(" ")}>{children}</div>;
}
