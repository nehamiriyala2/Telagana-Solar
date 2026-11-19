"use client";
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform, type HTMLMotionProps, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Motion building blocks for the inner pages (Framer Motion only; transform/opacity,
 * plus a light blur on scroll reveals). All respect prefers-reduced-motion.
 */
export const EASE = [0.22, 1, 0.36, 1] as const;

/** Scroll reveal: fade + 24px rise + soft blur, once. */
export function BlurReveal({ delay = 0, children, className, ...props }: HTMLMotionProps<"div"> & { delay?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24, filter: "blur(8px)" }}
      whileInView={reduce ? { opacity: 1 } : { opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, ease: EASE, delay }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

const staggerParent: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const staggerChild: Variants = {
  hidden: { opacity: 0, y: 24, filter: "blur(8px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.65, ease: EASE } },
};
const staggerChildReduced: Variants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.3 } } };

/** Staggered list: wrap items in <StaggerItem>. Renders a <ul> by default. */
export function Stagger({ children, className, as = "ul" }: { children: React.ReactNode; className?: string; as?: "ul" | "ol" | "div" }) {
  const Tag = as === "ol" ? motion.ol : as === "div" ? motion.div : motion.ul;
  return (
    <Tag variants={staggerParent} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }} className={className}>
      {children}
    </Tag>
  );
}
export function StaggerItem({ children, className, as = "li", style }: { children: React.ReactNode; className?: string; as?: "li" | "div"; style?: React.CSSProperties }) {
  const reduce = useReducedMotion();
  const Tag = as === "div" ? motion.div : motion.li;
  return <Tag variants={reduce ? staggerChildReduced : staggerChild} className={className} style={style}>{children}</Tag>;
}

/** A line that draws itself (scaleY / scaleX from 0) when scrolled into view. */
export function DrawLine({ className, axis = "y" }: { className?: string; axis?: "x" | "y" }) {
  return (
    <motion.span
      aria-hidden
      initial={axis === "y" ? { scaleY: 0 } : { scaleX: 0 }}
      whileInView={axis === "y" ? { scaleY: 1 } : { scaleX: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 1.4, ease: EASE }}
      style={{ transformOrigin: axis === "y" ? "top" : "left" }}
      className={className}
    />
  );
}

/**
 * Infinite marquee (CSS animation, pauses on hover/focus so items can be clicked). The duplicate copy that
 * makes the loop seamless is inert (hidden from screen readers and not focusable). Reduced motion: a static,
 * wrapping row.
 */
export function Marquee({ items, className, speed = 40, gap = "pr-3" }: { items: React.ReactNode[]; className?: string; speed?: number; gap?: string }) {
  const reduce = useReducedMotion();
  if (reduce) return <ul className={cn("flex flex-wrap justify-center gap-y-3", className)}>{items.map((it, i) => <li key={i} className={gap}>{it}</li>)}</ul>;
  return (
    <div className={cn("marquee relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_6%,black_94%,transparent)]", className)}>
      <ul className="marquee__track flex w-max py-3" style={{ animationDuration: `${speed}s` }}>
        {[...items, ...items].map((it, i) => <li key={i} aria-hidden={i >= items.length || undefined} inert={i >= items.length || undefined} className={cn("shrink-0", gap)}>{it}</li>)}
      </ul>
    </div>
  );
}

/** Moves its child slower than the page while scrolling (hero art). */
export function Parallax({ children, className, offset = 60 }: { children: React.ReactNode; className?: string; offset?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : offset]);
  return <motion.div ref={ref} style={{ y }} className={className}>{children}</motion.div>;
}

/**
 * Section heading with a word-by-word mask reveal on scroll. Words listed in `emphasis`
 * are painted in the amber gradient. (Page titles use the CSS version in <DisplayTitle>.)
 */
export function MaskHeading({ text, emphasis, as: Tag = "h2", className }: { text: string; emphasis?: string; as?: "h2" | "h3"; className?: string }) {
  const reduce = useReducedMotion();
  const em = new Set((emphasis ?? "").toLowerCase().split(/\s+/).filter(Boolean));
  const words = text.split(" ");
  const M = Tag === "h3" ? motion.h3 : motion.h2;
  return (
    <M className={className} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }} transition={{ staggerChildren: 0.06 }} aria-label={text}>
      {words.map((w, i) => (
        <span key={i} aria-hidden className="inline-block overflow-hidden pb-[0.3em] align-top -mb-[0.3em]">
          <motion.span className={cn("inline-block", em.has(w.toLowerCase().replace(/[.,!?:]/g, "")) && "text-gold-shine")}
            variants={reduce ? { hidden: { opacity: 0 }, show: { opacity: 1 } } : { hidden: { y: "110%" }, show: { y: "0%", transition: { duration: 0.8, ease: EASE } } }}>
            {w}
          </motion.span>
          {i < words.length - 1 && " "}
        </span>
      ))}
    </M>
  );
}
