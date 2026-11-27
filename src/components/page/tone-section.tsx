import { cn } from "@/lib/utils";

export type Tone = "navy" | "blue" | "sky" | "cream" | "mint" | "white";
export const isDarkTone = (t: Tone) => t === "navy" || t === "blue";

/**
 * Section with a colour theme from the brand palette (see .tone-* in globals.css).
 * Optional wave edges: pass the colour of the neighbouring section (e.g. waveTop="#FCFDFF") and the
 * boundary becomes a soft wave instead of a hard line. Dark tones get a slow drifting light beam.
 */
export function ToneSection({ tone, children, className, waveTop, waveBottom, id, label, beam = true }: {
  tone: Tone; children: React.ReactNode; className?: string; waveTop?: string; waveBottom?: string; id?: string; label?: string; beam?: boolean;
}) {
  return (
    <section id={id} aria-label={label} className={cn("tone", `tone-${tone}`, "py-16 md:py-24", waveTop && "pt-24 md:pt-32", waveBottom && "pb-24 md:pb-32", className)}>
      {isDarkTone(tone) && beam && <span aria-hidden className="tone-beam" />}
      {waveTop && <Wave color={waveTop} position="top" />}
      <div className="relative">{children}</div>
      {waveBottom && <Wave color={waveBottom} position="bottom" />}
    </section>
  );
}

/** Soft wave edge in the colour of the neighbouring section (place as the first/last child of a .tone section). */
export function Wave({ color, position }: { color: string; position: "top" | "bottom" }) {
  return (
    <svg aria-hidden viewBox="0 0 1440 80" preserveAspectRatio="none" className={cn("tone-wave", position === "top" ? "tone-wave--top" : "tone-wave--bottom")}>
      <path d="M0 0 H1440 V34 C 1200 74 960 10 720 36 C 480 62 240 8 0 40 Z" fill={color} />
    </svg>
  );
}
