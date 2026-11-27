"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import { Toggle } from "@/components/admin/leads/lead-filters";

const RANGES = [["today", "Today"], ["7d", "7 days"], ["30d", "30 days"], ["year", "This year"], ["custom", "Custom"]] as const;

/** Date range + "Include test data", synced to the URL. Used by Overview and Reports. */
export function RangeBar({ defaultRange = "30d", extra }: { defaultRange?: string; extra?: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [pending, start] = useTransition();
  const range = sp.get("range") ?? defaultRange;

  const go = (changes: Record<string, string | null>) => {
    const p = new URLSearchParams(sp.toString());
    for (const [k, v] of Object.entries(changes)) { if (v) p.set(k, v); else p.delete(k); }
    if (p.get("range") === defaultRange) p.delete("range");
    if ((p.get("range") ?? defaultRange) !== "custom") { p.delete("from"); p.delete("to"); }
    start(() => router.push(`${pathname}${p.size ? `?${p}` : ""}`));
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div role="group" aria-label="Date range" className="flex flex-wrap gap-1 rounded-2xl bg-white p-1 ring-1 ring-[#ece4cf]">
        {RANGES.map(([k, l]) => (
          <button key={k} type="button" aria-pressed={range === k} onClick={() => go({ range: k })}
            className={`rounded-xl px-3.5 py-1.5 text-sm font-semibold outline-none transition focus-visible:ring-2 focus-visible:ring-gold ${range === k ? "bg-navy text-white" : "text-[#4b5b75] hover:bg-[#faf7ef]"}`}>
            {l}
          </button>
        ))}
      </div>
      {range === "custom" && (
        <div className="flex items-center gap-2 text-sm">
          {(["from", "to"] as const).map((k) => (
            <label key={k} className="flex items-center gap-1.5 font-semibold capitalize text-[#1a2b57]">{k}
              <input type="date" value={sp.get(k) ?? ""} onChange={(e) => go({ [k]: e.target.value || null, range: "custom" })}
                className="h-9 rounded-xl border border-[#e2dccb] bg-white px-2 font-normal outline-none focus:border-gold focus:ring-4 focus:ring-gold/20" />
            </label>
          ))}
        </div>
      )}
      <span className="ml-auto flex flex-wrap items-center gap-4 text-sm">
        {extra}
        <Toggle label="Include test data" on={sp.get("test") === "1"} onChange={(v) => go({ test: v ? "1" : null })} />
        {pending && <Loader2 className="size-5 animate-spin text-gold-ink" aria-label="Loading" />}
      </span>
    </div>
  );
}
