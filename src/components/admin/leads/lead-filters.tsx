"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Download, Filter, Loader2, Search, X } from "lucide-react";
import { useStages } from "@/components/admin/stages-context";
import {
  BILL_RANGES, ROOF_LABEL, ROOFS, SOURCE_LABEL, SOURCES, SYSTEM_LABEL, SYSTEMS, USE_LABEL, USES,
} from "@/lib/admin/labels";

export type FilterOptions = {
  districts: { slug: string; name_en: string; name_te: string }[];
  staff: { id: number; name: string; active: number }[];
  places: string[];
  schemes: { slug: string; name: string }[];
};

const RANGES = [["today", "Today"], ["7d", "Last 7 days"], ["30d", "Last 30 days"], ["custom", "Custom dates"]] as const;

export function LeadFilters({ options, isAdmin, canExport, total }: { options: FilterOptions; isAdmin: boolean; canExport: boolean; total: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const st = useStages();
  const [pending, start] = useTransition();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState(sp.get("q") ?? "");
  useEffect(() => setQ(sp.get("q") ?? ""), [sp]);

  const get = (k: string) => sp.get(k) ?? "";
  const go = (changes: Record<string, string | null>) => {
    const p = new URLSearchParams(sp.toString());
    for (const [k, v] of Object.entries(changes)) { if (v) p.set(k, v); else p.delete(k); }
    if (!("page" in changes)) p.delete("page");
    if (p.get("range") !== "custom") { p.delete("from"); p.delete("to"); }
    start(() => router.push(`${pathname}${p.size ? `?${p}` : ""}`));
  };

  const ownerLabel = (v: string) => (v === "me" ? "Mine" : v === "none" ? "Unassigned" : options.staff.find((s) => String(s.id) === v)?.name ?? v);
  const chips: { key: string; label: string; clear?: string[] }[] = [];
  const add = (k: string, label: (v: string) => string, clear?: string[]) => { const v = get(k); if (v) chips.push({ key: k, label: label(v), clear }); };
  add("q", (v) => `Search: “${v}”`);
  add("source", (v) => `Source: ${SOURCE_LABEL[v] ?? v}`);
  add("district", (v) => `District: ${options.districts.find((d) => d.slug === v)?.name_en ?? v}`);
  add("discom", (v) => `DISCOM: ${v}`);
  add("use", (v) => `Use: ${USE_LABEL[v] ?? v}`);
  add("place", (v) => `Place: ${v}`);
  add("lang", (v) => `Language: ${v === "te" ? "Telugu" : "English"}`);
  add("system", (v) => `System: ${SYSTEM_LABEL[v] ?? v}`);
  add("cuts", (v) => (v === "yes" ? "Has power cuts" : "No power cuts"));
  add("roof", (v) => `Roof: ${ROOF_LABEL[v] ?? v}`);
  add("bill", (v) => `Bill: ${BILL_RANGES.find((b) => b.key === v)?.label ?? v}`);
  add("scheme", (v) => `Scheme: ${options.schemes.find((s) => s.slug === v)?.name ?? v}`);
  add("owner", (v) => `Owner: ${ownerLabel(v)}`);
  add("range", (v) => (v === "custom" ? `Dates: ${get("from") || "…"} → ${get("to") || "…"}` : RANGES.find(([k]) => k === v)?.[1] ?? v), ["from", "to"]);

  const select = (k: string, label: string, opts: [string, string][]) => (
    <label className="block text-sm">
      <span className="mb-1 block font-semibold text-[#1a2b57]">{label}</span>
      <select value={get(k)} onChange={(e) => go({ [k]: e.target.value || null })}
        className="h-10 w-full rounded-xl border border-[#e2dccb] bg-white px-3 outline-none focus:border-gold focus:ring-4 focus:ring-gold/20">
        <option value="">Any</option>
        {opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </label>
  );

  const tab = get("tab") === "nocontact" ? "nocontact" : "all";
  const exportHref = `/api/admin/leads/export${sp.size ? `?${sp}` : ""}`;

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div role="tablist" aria-label="Lead lists" className="flex gap-1 rounded-2xl bg-white p-1 shadow-[0_10px_30px_-26px_rgb(7_23_63/0.5)] ring-1 ring-[#ece4cf] sm:inline-flex">
        {([["all", "All leads"], ["nocontact", "No phone yet"]] as const).map(([k, l]) => (
          <button key={k} role="tab" aria-selected={tab === k} type="button" onClick={() => go({ tab: k === "all" ? null : k })}
            className={`flex-1 rounded-xl px-4 py-2 text-sm font-semibold outline-none transition focus-visible:ring-2 focus-visible:ring-gold sm:flex-none ${tab === k ? "bg-navy text-white" : "text-[#4b5b75] hover:bg-[#faf7ef]"}`}>
            {l}
          </button>
        ))}
      </div>

      {/* Search + actions */}
      <div className="flex flex-wrap items-center gap-2">
        <form role="search" onSubmit={(e) => { e.preventDefault(); go({ q: q.trim() || null }); }} className="relative min-w-[14rem] flex-1">
          <label htmlFor="lead-search" className="sr-only">Search leads</label>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#8a94a6]" aria-hidden />
          <input id="lead-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name, phone, email, area or TS-0001"
            className="h-11 w-full rounded-xl border border-[#e2dccb] bg-white pl-9 pr-3 outline-none focus:border-gold focus:ring-4 focus:ring-gold/20" />
        </form>
        <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls="lead-filter-panel"
          className={`inline-flex h-11 items-center gap-2 rounded-xl border px-4 text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-gold ${open ? "border-navy bg-navy text-white" : "border-[#e2dccb] bg-white text-[#1a2b57] hover:bg-[#faf7ef]"}`}>
          <Filter className="size-4" aria-hidden />Filters{chips.length ? ` (${chips.length})` : ""}
        </button>
        {canExport && (
          <a href={exportHref} className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#e2dccb] bg-white px-4 text-sm font-semibold text-[#1a2b57] outline-none hover:bg-[#faf7ef] focus-visible:ring-2 focus-visible:ring-gold">
            <Download className="size-4" aria-hidden />Export CSV
          </a>
        )}
        {pending && <Loader2 className="size-5 animate-spin text-gold-ink" aria-label="Loading" />}
      </div>

      {/* Status chips */}
      <div className="flex flex-wrap gap-2" role="group" aria-label="Status">
        {[["", "All"], ...st.stages.map((s) => [s.key, s.label])].map(([v, l]) => {
          const on = get("status") === v;
          return (
            <button key={v || "all"} type="button" aria-pressed={on} onClick={() => go({ status: v || null })}
              className={`rounded-full px-3.5 py-1.5 text-sm font-semibold outline-none ring-1 transition focus-visible:ring-2 focus-visible:ring-gold ${on ? "bg-gold text-navy ring-gold" : "bg-white text-[#4b5b75] ring-[#e2dccb] hover:bg-[#faf7ef]"}`}>
              {l}
            </button>
          );
        })}
      </div>

      {open && (
        <div id="lead-filter-panel" className="grid gap-4 rounded-2xl border border-[#ece4cf] bg-white p-4 sm:grid-cols-2 lg:grid-cols-4">
          {select("source", "Source", SOURCES.map((s) => [s, SOURCE_LABEL[s]]))}
          {select("district", "District", options.districts.map((d) => [d.slug, `${d.name_en} · ${d.name_te}`]))}
          {select("discom", "DISCOM", [["TGSPDCL", "TGSPDCL (South)"], ["TGNPDCL", "TGNPDCL (North)"]])}
          {select("use", "Use", USES.map((u) => [u, USE_LABEL[u]]))}
          {select("place", "Place", options.places.map((p) => [p, p]))}
          {select("lang", "Language", [["en", "English"], ["te", "Telugu"]])}
          {select("system", "System type", SYSTEMS.map((s) => [s, SYSTEM_LABEL[s]]))}
          {select("cuts", "Power cuts", [["yes", "Yes (needs backup)"], ["no", "No"]])}
          {select("roof", "Roof", ROOFS.map((r) => [r, ROOF_LABEL[r]]))}
          {select("bill", "Bill range", BILL_RANGES.map((b) => [b.key, b.label]))}
          {select("scheme", "Scheme", options.schemes.map((s) => [s.slug, s.name]))}
          {select("owner", "Owner", [["me", "Mine"], ["none", "Unassigned"], ...options.staff.map((s) => [String(s.id), `${s.name}${s.active ? "" : " (inactive)"}`] as [string, string])])}
          {select("range", "Received", RANGES.map(([k, l]) => [k, l]))}
          {get("range") === "custom" && (
            <div className="grid grid-cols-2 gap-2 sm:col-span-2 lg:col-span-1">
              {(["from", "to"] as const).map((k) => (
                <label key={k} className="block text-sm">
                  <span className="mb-1 block font-semibold capitalize text-[#1a2b57]">{k}</span>
                  <input type="date" value={get(k)} onChange={(e) => go({ [k]: e.target.value || null, range: "custom" })}
                    className="h-10 w-full rounded-xl border border-[#e2dccb] bg-white px-2 outline-none focus:border-gold focus:ring-4 focus:ring-gold/20" />
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Active filters + toggles */}
      <div className="flex flex-wrap items-center gap-2">
        {chips.map((c) => (
          <span key={c.key} className="inline-flex items-center gap-1 rounded-full bg-[#fff3d1] py-1 pl-3 pr-1 text-sm font-semibold text-[#8a5a00]">
            {c.label}
            <button type="button" aria-label={`Remove ${c.label}`} onClick={() => go(Object.fromEntries([c.key, ...(c.clear ?? [])].map((k) => [k, null])))}
              className="grid size-6 place-items-center rounded-full outline-none hover:bg-[#f5d27a] focus-visible:ring-2 focus-visible:ring-gold">
              <X className="size-3.5" aria-hidden />
            </button>
          </span>
        ))}
        {chips.length > 1 && (
          <button type="button" onClick={() => go(Object.fromEntries(chips.flatMap((c) => [c.key, ...(c.clear ?? [])]).map((k) => [k, null])))}
            className="text-sm font-semibold text-[#1a2b57] underline-offset-4 hover:underline">Clear all</button>
        )}
        <span className="ml-auto flex flex-wrap items-center gap-4 text-sm">
          <Toggle label="Include test data" on={get("test") === "1"} onChange={(v) => go({ test: v ? "1" : null })} />
          {isAdmin && <Toggle label="Show deleted" on={get("deleted") === "1"} onChange={(v) => go({ deleted: v ? "1" : null })} />}
          <span className="font-semibold text-[#4b5b75]" aria-live="polite">{total.toLocaleString("en-IN")} {total === 1 ? "lead" : "leads"}</span>
        </span>
      </div>
    </div>
  );
}

export function Toggle({ label, on, onChange }: { label: string; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2 font-semibold text-[#1a2b57]">
      <span className="relative inline-flex">
        <input type="checkbox" role="switch" checked={on} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
        <span className="h-6 w-10 rounded-full bg-[#d6dbe4] transition peer-checked:bg-gold peer-focus-visible:ring-2 peer-focus-visible:ring-navy" />
        <span className="absolute left-0.5 top-0.5 size-5 rounded-full bg-white shadow transition peer-checked:translate-x-4" />
      </span>
      {label}
    </label>
  );
}
