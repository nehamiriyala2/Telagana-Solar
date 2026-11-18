import { cn } from "@/lib/utils";

/** Brand mark: a rising sun over a panel. Placeholder until the final logo. */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex shrink-0 items-center gap-2.5 whitespace-nowrap font-heading text-[1.125rem] font-extrabold tracking-tightish", className)}>
      <svg viewBox="0 0 32 32" className="size-8" aria-hidden>
        <defs>
          <linearGradient id="logo-sun" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#FFB800" />
            <stop offset="1" stopColor="#FF8A00" />
          </linearGradient>
        </defs>
        <rect width="32" height="32" rx="9" className="fill-navy dark:fill-navy-700" />
        <circle cx="16" cy="15" r="6" fill="url(#logo-sun)" />
        <path d="M6 24h20l-3-5H9z" fill="#FAF8F3" opacity=".92" />
        <path d="M12.5 19l-1 5M19.5 19l1 5M7.5 21.5h17" stroke="#0B1B3A" strokeWidth=".9" />
      </svg>
      <span>
        Telangana<span className="text-gradient-sun"> Solar</span>
      </span>
    </span>
  );
}
