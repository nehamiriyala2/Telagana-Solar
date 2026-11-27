import type { ReactNode } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Solid gold tick for lists on dark (navy) sections: 28px circle (26px on phones), #F2C14E fill with a soft glow,
 * dark navy Lucide check (16px, stroke 3). Decorative: the list text carries the meaning.
 * Styles live in site-theme.css (.check-tick) so every dark-section tick on the site matches.
 */
export function CheckTick({ className }: { className?: string }) {
  return (
    <span aria-hidden="true" className={cn("check-tick", className)}>
      <Check className="size-4" strokeWidth={3} />
    </span>
  );
}

/** Tick-list pill for dark sections: translucent white surface, hairline border, white 17px text, gold tick. */
export function CheckPill({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <li className={cn("check-pill", className)}>
      <CheckTick />
      <span className="check-pill__text">{children}</span>
    </li>
  );
}
