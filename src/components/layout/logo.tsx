import { cn } from "@/lib/utils";

/**
 * Brand lockup rebuilt as SVG + live text (sharp on every screen, no background box):
 * icon mark (Charminar, sun, gold ring, solar panel, leaf) + "TELANGANA" + "SOLAR" + tagline.
 * - header (default): "TELANGANA" sky blue, "SOLAR" sun gold on the cloud header. Below 1280px the name stacks on two
 *   lines; the tagline shows from 1440px only, so the header row never overlaps.
 * - footer: light version for the deep blue footer ("TELANGANA" in cloud, "SOLAR" in gold)
 * Colours: sky #2B6CB0, deep blue #1B4570 (Charminar), gold #D9A02E, leaf #3A8F5C, cloud #F7FAFD, muted #5B6C7E.
 * The same mark is used for the favicon (public/brand/ts-mark.svg).
 */
export function Logo({ variant = "header", className }: { variant?: "header" | "footer"; className?: string; priority?: boolean }) {
  const light = variant === "footer";
  return (
    <span className={cn("inline-flex shrink-0 items-center gap-2.5", className)}>
      <LogoMark light={light} className={light ? "size-16" : "size-10 xl:size-12"} />
      <span className="flex flex-col leading-none">
        <span className={cn("font-heading font-semibold tracking-[0.08em]", light ? "text-[1.375rem]" : "text-[0.9375rem] xl:text-[1.125rem]")}>
          <span className={light ? "text-cloud max-sm:block" : "block text-primary xl:inline"}>TELANGANA</span>
          <span className={cn("text-[#D9A02E]", light ? "max-sm:block sm:ml-[0.3em]" : "block xl:ml-[0.3em] xl:inline")}>SOLAR</span>
        </span>
        <span className={cn("mt-1.5 text-[0.5625rem] font-medium uppercase tracking-[0.16em]", light ? "text-cloud/70 max-sm:hidden" : "hidden text-muted min-[1440px]:block")}>
          Clean energy for a brighter Telangana
        </span>
      </span>
    </span>
  );
}

/** Icon mark only (decorative; the lockup text carries the name). */
export function LogoMark({ light = false, className }: { light?: boolean; className?: string }) {
  const ink = light ? "#F7FAFD" : "#1B4570";
  const panel = light ? "#F7FAFD" : "#2B6CB0";
  const grid = light ? "#1B4570" : "#F7FAFD";
  const gold = "#D9A02E";
  return (
    <svg viewBox="0 0 64 64" aria-hidden className={className}>
      {/* gold ring */}
      <path d="M49 10.5A27 27 0 1 1 12.5 51" fill="none" stroke={gold} strokeWidth="2" strokeLinecap="round" />
      {/* sun + rays */}
      <circle cx="40" cy="26" r="7" fill={gold} />
      <g stroke={gold} strokeWidth="1.6" strokeLinecap="round">
        <path d="M40 14.5v3M31.6 18l2 2.2M48.4 18l-2 2.2M28 26h3M49 26h3" />
      </g>
      {/* Charminar */}
      <g fill={ink}>
        <rect x="12" y="16.5" width="2.6" height="24.5" />
        <rect x="25.4" y="16.5" width="2.6" height="24.5" />
        <rect x="11.2" y="23" width="4.2" height="1.2" rx="0.4" />
        <rect x="24.6" y="23" width="4.2" height="1.2" rx="0.4" />
        <rect x="11.2" y="31" width="4.2" height="1.2" rx="0.4" />
        <rect x="24.6" y="31" width="4.2" height="1.2" rx="0.4" />
        <path d="M11.5 16.8Q13.3 10.8 15.1 16.8zM24.9 16.8Q26.7 10.8 28.5 16.8z" />
        <path d="M14.6 41V27.8h10.8V41h-2.7v-5.2Q20 30.8 17.3 35.8V41z" />
        <rect x="14.6" y="24.8" width="10.8" height="1.6" />
      </g>
      {/* solar panel */}
      <path d="M16 46l28-8 8 9-28 8z" fill={panel} />
      <g stroke={grid} strokeWidth="0.9">
        <path d="M23 44l8 9M30 42l8 9M37 40l8 9M20 50.5l28-8" />
      </g>
      {/* leaf */}
      <path d="M47.5 46.5C49 37.5 55 32.5 62 30.5c-.8 8.6-6 15-14.5 16z" fill="#3A8F5C" />
      <path d="M48.5 45.5c3.5-4.5 7-8 11.5-12.5" fill="none" stroke={light ? "#1B4570" : "#F7FAFD"} strokeWidth="0.9" strokeLinecap="round" />
    </svg>
  );
}
