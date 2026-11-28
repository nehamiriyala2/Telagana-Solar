"use client";
import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useStill } from "./use-still";
import { cn } from "@/lib/utils";

/** 3D tilt on hover with a moving gold glare. */
export function TiltCard({ children, className, max = 8 }: { children: React.ReactNode; className?: string; max?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useStill();
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const rx = useSpring(useTransform(py, [0, 1], [max, -max]), { stiffness: 200, damping: 20 });
  const ry = useSpring(useTransform(px, [0, 1], [-max, max]), { stiffness: 200, damping: 20 });
  const glareX = useTransform(px, (v) => `${v * 100}%`);
  const glareY = useTransform(py, (v) => `${v * 100}%`);
  const glare = useTransform([glareX, glareY], ([gx, gy]) => `radial-gradient(400px circle at ${gx} ${gy}, rgb(11 31 58 / 0.16), transparent 45%)`);

  const onMove = (e: React.PointerEvent) => {
    if (reduce || e.pointerType !== "mouse" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width);
    py.set((e.clientY - r.top) / r.height);
  };
  const reset = () => { px.set(0.5); py.set(0.5); };

  return (
    <motion.div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={reset}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 900 }}
      className={cn("group relative", className)}
    >
      {children}
      <motion.div aria-hidden style={{ background: glare }} className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    </motion.div>
  );
}
