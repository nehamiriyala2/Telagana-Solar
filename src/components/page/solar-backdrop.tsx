import { cn } from "@/lib/utils";

/** Fixed positions so server and client render the same particles (no hydration mismatch). */
const PARTICLES = [
  [8, 22, 4, 11, 0], [18, 70, 3, 14, -3], [27, 38, 5, 12, -6], [36, 82, 3, 16, -2], [44, 18, 4, 13, -8],
  [53, 60, 3, 15, -5], [61, 30, 5, 11, -1], [69, 76, 4, 14, -7], [77, 14, 3, 12, -4], [84, 52, 5, 16, -9],
  [91, 34, 3, 13, -2], [96, 72, 4, 12, -6],
] as const;

export type Motif = "rays" | "waves" | "grid" | "orbits";

/**
 * Reusable animated hero background: slowly drifting gradient, dotted texture, golden glow around a "sun"
 * point, floating particles, plus one page-specific motif so heroes don't all look alike:
 * - rays: slowly turning sun rays  - waves: layered energy waves drifting sideways
 * - grid: a solar-cell grid in perspective  - orbits: energy rings with orbiting points
 * `tone="dark"` = deep navy version. Decorative (aria-hidden), transform/opacity animations, reduced-motion safe.
 */
export function SolarBackdrop({ tone = "light", sun = { x: "88%", y: "18%" }, motif = "rays", rays, particles = true, fade = true, className }: {
  tone?: "light" | "dark"; sun?: { x: string; y: string }; motif?: Motif; rays?: boolean; particles?: boolean; fade?: boolean; className?: string;
}) {
  const m: Motif | null = rays === false ? null : motif;
  const dark = tone === "dark";
  return (
    <div aria-hidden className={cn("solar-bg", dark && "solar-bg--dark", className)}>
      <span className="solar-bg__gradient" />
      <span className="solar-bg__dots" />
      {m === "rays" && <span className="solar-bg__rays" style={{ left: sun.x, top: sun.y }} />}
      {m === "orbits" && (
        <span className="motif-orbits" style={{ left: sun.x, top: sun.y }}>
          {[1, 2, 3].map((r) => <span key={r} className={`motif-orbits__ring motif-orbits__ring--${r}`}><span className="motif-orbits__dot" /></span>)}
        </span>
      )}
      {m === "waves" && (
        <span className="motif-waves">
          {[0, 1, 2].map((i) => (
            <svg key={i} viewBox="0 0 2880 200" preserveAspectRatio="none" className={`motif-waves__line motif-waves__line--${i}`}>
              <path d="M0 120 C 360 40 720 200 1080 120 C 1440 40 1800 200 2160 120 C 2520 40 2880 200 2880 120" fill="none" strokeWidth="2" />
            </svg>
          ))}
        </span>
      )}
      {m === "grid" && <span className="motif-grid"><span className="motif-grid__plane" /></span>}
      <span className="solar-bg__glow" style={{ left: sun.x, top: sun.y }} />
      {particles && PARTICLES.map(([x, y, size, d, delay], i) => (
        <span key={i} className="solar-bg__p max-sm:hidden" style={{ left: `${x}%`, top: `${y}%`, width: size, height: size, ["--d" as string]: `${d}s`, ["--delay" as string]: `${delay}s` }} />
      ))}
      {fade && !dark && <span className="solar-bg__fade" />}
    </div>
  );
}
