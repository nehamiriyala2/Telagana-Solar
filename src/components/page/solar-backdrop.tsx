import { cn } from "@/lib/utils";

/** Fixed positions so server and client render the same particles (no hydration mismatch). */
const PARTICLES = [
  [8, 22, 4, 11, 0], [18, 70, 3, 14, -3], [27, 38, 5, 12, -6], [36, 82, 3, 16, -2], [44, 18, 4, 13, -8],
  [53, 60, 3, 15, -5], [61, 30, 5, 11, -1], [69, 76, 4, 14, -7], [77, 14, 3, 12, -4], [84, 52, 5, 16, -9],
  [91, 34, 3, 13, -2], [96, 72, 4, 12, -6],
] as const;

/**
 * Reusable animated hero background: slowly drifting blue gradient, soft dotted pattern, rotating solar
 * rays + golden glow around a "sun" point, and a few floating particles. `tone="dark"` = deep navy version.
 * Decorative (aria-hidden), behind content (-z-10), transform/opacity animations only; all stop for
 * prefers-reduced-motion. Styles live in globals.css (.solar-bg*).
 */
export function SolarBackdrop({ tone = "light", sun = { x: "88%", y: "18%" }, rays = true, particles = true, fade = true, className }: {
  tone?: "light" | "dark"; sun?: { x: string; y: string }; rays?: boolean; particles?: boolean; fade?: boolean; className?: string;
}) {
  return (
    <div aria-hidden className={cn("solar-bg", tone === "dark" && "solar-bg--dark", className)}>
      <span className="solar-bg__gradient" />
      <span className="solar-bg__dots" />
      {rays && <span className="solar-bg__rays" style={{ left: sun.x, top: sun.y }} />}
      <span className="solar-bg__glow" style={{ left: sun.x, top: sun.y }} />
      {particles && PARTICLES.map(([x, y, size, d, delay], i) => (
        <span key={i} className="solar-bg__p max-sm:hidden" style={{ left: `${x}%`, top: `${y}%`, width: size, height: size, ["--d" as string]: `${d}s`, ["--delay" as string]: `${delay}s` }} />
      ))}
      {fade && tone === "light" && <span className="solar-bg__fade" />}
    </div>
  );
}
