"use client";
import { useRef, type CSSProperties, type ReactNode } from "react";
import { useInViewOnce } from "./kit";
import { DEVELOP as D, EASE_CSS } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Entrance for ordinary grids (replaces a plain fade). CSS keyframes (see .dv in src/app/motion.css), triggered once
 * by an IntersectionObserver; only opacity, transform and clip-path animate.
 * - kind="card": fades up; any element inside with class "dv-photo" develops bottom → top (Pattern 3 look)
 * - kind="row": slides in from the right (Pattern 5 look)
 * `as="li"` renders the list item itself (inside a plain <ul>/<ol>). `index` = position in the row (0, 1, 2…) so cards enter left → right. Reduced motion: shown as-is.
 */
export function Develop({ index = 0, delay = 0, kind = "card", as: Tag = "div", className, style: extra, children }: {
  index?: number; delay?: number; kind?: "card" | "row"; as?: "div" | "li"; className?: string; style?: CSSProperties; children: ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  const seen = useInViewOnce(ref, D.amount);
  const style = {
    "--dv-d": `${delay + index * D.stagger}s`, "--dv-card": `${D.card}s`, "--dv-rise": `${D.cardRise}px`,
    "--dv-photo-at": `${D.photoAt}s`, "--dv-photo": `${D.photo}s`, "--dv-row": `${D.row}s`, "--dv-shift": `${D.rowShift}px`, "--dv-ease": EASE_CSS,
    ...extra,
  } as CSSProperties;
  const cls = cn(kind === "row" ? "dv-row" : "dv", seen && "dv-in", className);
  return Tag === "li"
    ? <li ref={ref as React.RefObject<HTMLLIElement>} style={style} className={cls}>{children}</li>
    : <div ref={ref as React.RefObject<HTMLDivElement>} style={style} className={cls}>{children}</div>;
}
