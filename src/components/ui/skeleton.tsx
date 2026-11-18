import { cn } from "@/lib/utils";

/** Skeleton loader with a soft gold shimmer sweep. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn("relative overflow-hidden rounded-lg bg-navy/[0.06]", className)} aria-hidden>
      <div className="absolute inset-y-0 w-1/2 animate-shimmer bg-gradient-to-r from-transparent via-gold/15 to-transparent" />
    </div>
  );
}
