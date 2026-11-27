"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { AlertTriangle, Eye, EyeOff, Loader2, Pencil, Plus, Search } from "lucide-react";
import { toast } from "@/components/admin/toast";

export type ListItem = { id: number; title: string; subtitle: string | null; published: boolean; updated: string | null; flags: string[]; meta: string | null; thumb: string | null };

/** List page body for any collection: search, Published/Draft filter, warnings, one-click publish. */
export function EntityList({ collection, label, plural, basePath, items, canEdit, total }: {
  collection: string; label: string; plural: string; basePath: string; items: ListItem[]; canEdit: boolean; total: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [pending, start] = useTransition();
  const [q, setQ] = useState(sp.get("q") ?? "");
  const [busy, setBusy] = useState<number | null>(null);
  const state = sp.get("state") ?? "all";
  const go = (k: string, val: string | null) => {
    const p = new URLSearchParams(sp.toString());
    if (val) p.set(k, val); else p.delete(k);
    start(() => router.push(`${pathname}${p.size ? `?${p}` : ""}`));
  };

  async function toggle(it: ListItem) {
    setBusy(it.id);
    const res = await fetch(`/api/admin/cms/${collection}/${it.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ publish: !it.published }) }).catch(() => null);
    setBusy(null);
    const d = await res?.json().catch(() => ({}));
    if (!res?.ok) { toast(d?.message ?? "Couldn’t change it. Open it to check the details.", "err"); return; }
    toast(it.published ? `“${it.title}” unpublished.` : `“${it.title}” is live on the website.`);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <form role="search" onSubmit={(e) => { e.preventDefault(); go("q", q.trim() || null); }} className="relative min-w-[14rem] flex-1">
          <label htmlFor={`${collection}-q`} className="sr-only">Search {plural.toLowerCase()}</label>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#8a94a6]" aria-hidden />
          <input id={`${collection}-q`} value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${plural.toLowerCase()}`}
            className="h-11 w-full rounded-xl border border-[#e2dccb] bg-white pl-9 pr-3 outline-none focus:border-gold focus:ring-4 focus:ring-gold/20" />
        </form>
        <div role="group" aria-label="Show" className="flex gap-1 rounded-xl bg-white p-1 ring-1 ring-[#ece4cf]">
          {([["all", "All"], ["published", "Published"], ["draft", "Drafts"]] as const).map(([k, l]) => (
            <button key={k} type="button" aria-pressed={state === k} onClick={() => go("state", k === "all" ? null : k)}
              className={`rounded-lg px-3 py-1.5 text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-gold ${state === k ? "bg-navy text-white" : "text-[#4b5b75] hover:bg-[#faf7ef]"}`}>{l}</button>
          ))}
        </div>
        {canEdit && (
          <Link href={`${basePath}/new`} className="inline-flex h-11 items-center gap-2 rounded-xl bg-gold px-4 text-sm font-bold text-navy hover:brightness-105">
            <Plus className="size-4" aria-hidden />New {label.toLowerCase()}
          </Link>
        )}
        {pending && <Loader2 className="size-5 animate-spin text-gold-ink" aria-label="Loading" />}
      </div>

      {!items.length ? (
        <div className="rounded-2xl border border-dashed border-[#e2dccb] bg-white px-6 py-14 text-center">
          <p className="font-heading text-lg font-bold">{total ? `No ${plural.toLowerCase()} match` : `No ${plural.toLowerCase()} yet`}</p>
          <p className="mt-1 text-[#4b5b75]">{total ? "Try another search or filter." : canEdit ? `Add the first one with “New ${label.toLowerCase()}”.` : "Nothing has been added yet."}</p>
        </div>
      ) : (
        <ul className="divide-y divide-[#f1ece0] overflow-hidden rounded-2xl border border-[#ece4cf] bg-white">
          {items.map((it) => (
            <li key={it.id} className="flex flex-wrap items-center gap-3 px-4 py-3 hover:bg-[#fffbf2]">
              {it.thumb !== null && (
                it.thumb
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={it.thumb} alt="" className="size-12 shrink-0 rounded-lg object-cover" />
                  : <span className="size-12 shrink-0 rounded-lg bg-[#f4efe2]" aria-hidden />
              )}
              <div className="min-w-0 flex-1">
                <Link href={`${basePath}/${it.id}`} className="font-semibold text-navy outline-none hover:underline focus-visible:ring-2 focus-visible:ring-gold">{it.title}</Link>
                {it.subtitle && <span lang="te" className="ml-2 text-sm text-[#4b5b75]">{it.subtitle}</span>}
                <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#8a94a6]">
                  {it.meta && <span>{it.meta}</span>}
                  {it.updated && <span>Updated {it.updated}</span>}
                  {it.flags.map((f) => <span key={f} className="inline-flex items-center gap-1 rounded-md bg-[#fff3d1] px-1.5 py-px font-bold text-[#8a5a00]"><AlertTriangle className="size-3" aria-hidden />{f}</span>)}
                </p>
              </div>
              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${it.published ? "bg-[#e7f5e4] text-success" : "bg-[#f1f2f4] text-[#5b6473]"}`}>
                {it.published ? <Eye className="size-3.5" aria-hidden /> : <EyeOff className="size-3.5" aria-hidden />}{it.published ? "Published" : "Draft"}
              </span>
              {canEdit && (
                <>
                  <button type="button" onClick={() => toggle(it)} disabled={busy === it.id} className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-[#e2dccb] px-3 text-sm font-semibold text-[#1a2b57] hover:bg-[#faf7ef] disabled:opacity-60">
                    {busy === it.id && <Loader2 className="size-4 animate-spin" aria-hidden />}{it.published ? "Unpublish" : "Publish"}<span className="sr-only"> {it.title}</span>
                  </button>
                  <Link href={`${basePath}/${it.id}`} className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-[#e2dccb] px-3 text-sm font-semibold text-[#1a2b57] hover:bg-[#faf7ef]"><Pencil className="size-4" aria-hidden />Edit<span className="sr-only"> {it.title}</span></Link>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
