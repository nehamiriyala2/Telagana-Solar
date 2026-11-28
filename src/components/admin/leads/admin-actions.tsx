"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { EyeOff, GitMerge, Loader2, RotateCcw, Search, Trash2, X } from "lucide-react";
import { MERGE_FIELDS, defaultPicks, type MergeField, type Pick } from "@/lib/admin/merge";
import { useStages } from "@/components/admin/stages-context";

async function post(url: string, body?: unknown) {
  try {
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
    if (res.ok) return null;
    const d = await res.json().catch(() => ({}));
    return d.message ?? (res.status === 403 ? "Admins only." : "Something went wrong. Try again.");
  } catch { return "No connection. Try again."; }
}

/** Admin-only: merge duplicate, soft delete / restore, anonymize. */
export function AdminLeadActions({ id, leadNo, deleted, anonymized, listHref }: { id: number; leadNo: string; deleted: boolean; anonymized: boolean; listHref: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const mergeRef = useRef<HTMLDialogElement>(null);

  async function act(kind: "delete" | "restore" | "anonymize") {
    const ask = {
      delete: `Delete ${leadNo}? It can be restored later from “Show deleted”.`,
      restore: `Restore ${leadNo}?`,
      anonymize: `Anonymize ${leadNo}? This permanently removes the name, phone number and message. Deal data stays for reports. This cannot be undone.`,
    }[kind];
    if (!window.confirm(ask)) return;
    setBusy(kind); setErr(null);
    const m = await post(`/api/admin/leads/${id}/${kind}`);
    setBusy(null);
    if (m) { setErr(m); return; }
    if (kind === "delete") router.push(listHref); else router.refresh();
  }

  const btn = "flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-semibold outline-none transition hover:bg-[#faf7ef] focus-visible:ring-2 focus-visible:ring-gold disabled:opacity-50";
  return (
    <section className="rounded-2xl border border-[#ece4cf] bg-white p-5" aria-labelledby="admin-actions-title">
      <h2 id="admin-actions-title" className="font-heading text-base font-bold">Admin actions</h2>
      {err && <p role="alert" className="mt-2 rounded-lg bg-[#fdecea] px-3 py-2 text-sm text-danger">{err}</p>}
      <div className="mt-2 space-y-1">
        {!deleted && <button type="button" className={`${btn} text-[#1a2b57]`} onClick={() => mergeRef.current?.showModal()}><GitMerge className="size-4" aria-hidden />Merge duplicate…</button>}
        {deleted
          ? <button type="button" disabled={!!busy} className={`${btn} text-success`} onClick={() => act("restore")}>{busy === "restore" ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <RotateCcw className="size-4" aria-hidden />}Restore lead</button>
          : <button type="button" disabled={!!busy} className={`${btn} text-danger`} onClick={() => act("delete")}>{busy === "delete" ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Trash2 className="size-4" aria-hidden />}Delete lead</button>}
        {!anonymized && <button type="button" disabled={!!busy} className={`${btn} text-danger`} onClick={() => act("anonymize")}>{busy === "anonymize" ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <EyeOff className="size-4" aria-hidden />}Anonymize lead</button>}
      </div>
      <MergeDialog ref={mergeRef} id={id} leadNo={leadNo} onDone={() => { mergeRef.current?.close(); router.refresh(); }} />
    </section>
  );
}

type Candidate = { id: number; lead_no: string; name: string | null; phone_normalized: string | null; area: string | null; district: string | null; status: string };
type Full = Record<string, unknown> & { lead_no: string; district_en: string | null; owner_name: string | null };

function show(field: MergeField, l: Full, label: (k: string) => string): string {
  const v = l[field];
  if (v === null || v === undefined || v === "") return "-";
  if (field === "district_id") return l.district_en ?? String(v);
  if (field === "assigned_to") return l.owner_name ?? `#${v}`;
  if (field === "status") return label(String(v));
  if (field === "power_cuts" || field === "subsidy_applied" || field === "loan_needed") return v ? "Yes" : "No";
  if (field === "schemes") { try { const a = typeof v === "string" ? JSON.parse(v) : v; return Array.isArray(a) && a.length ? a.join(", ") : "-"; } catch { return String(v); } }
  if (typeof v === "string" && /^\d{4}-\d{2}-\d{2}T/.test(v)) return new Date(v).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" });
  return String(v);
}

function MergeDialog({ ref, id, leadNo, onDone }: { ref: React.Ref<HTMLDialogElement>; id: number; leadNo: string; onDone: () => void }) {
  const st = useStages();
  const [query, setQuery] = useState("");
  const [cands, setCands] = useState<Candidate[] | null>(null);
  const [pair, setPair] = useState<{ keep: Full; other: Full } | null>(null);
  const [picks, setPicks] = useState<Record<string, Pick>>({});
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function search(qs: string) {
    setErr(null);
    const res = await fetch(`/api/admin/leads/${id}/merge?q=${encodeURIComponent(qs)}`).catch(() => null);
    if (!res?.ok) { setErr("Search failed. Try again."); return; }
    setCands((await res.json()).candidates);
  }
  useEffect(() => { void search(""); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function choose(otherId: number) {
    setErr(null);
    const res = await fetch(`/api/admin/leads/${id}/merge?other=${otherId}`).catch(() => null);
    if (!res?.ok) { setErr("Couldn’t load that lead."); return; }
    const d = await res.json();
    setPair(d);
    setPicks(defaultPicks(d.keep, d.other));
  }

  async function merge() {
    if (!pair) return;
    setBusy(true); setErr(null);
    const m = await post(`/api/admin/leads/${id}/merge`, { other_id: pair.other.id, picks });
    setBusy(false);
    if (m) { setErr(m); return; }
    setPair(null); onDone();
  }

  const differing = pair ? MERGE_FIELDS.filter(([f]) => show(f, pair.keep, st.label) !== show(f, pair.other, st.label)) : [];

  return (
    <dialog ref={ref} aria-labelledby="merge-title" className="m-auto w-[min(56rem,calc(100vw-2rem))] rounded-3xl p-0 backdrop:bg-navy/60" onClose={() => { setPair(null); setErr(null); }}>
      <div className="max-h-[85dvh] overflow-y-auto p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="merge-title" className="font-heading text-xl font-bold">Merge a duplicate into {leadNo}</h2>
            <p className="mt-1 text-sm text-[#4b5b75]">The other lead’s notes and activity move here, and it is deleted (an admin can restore it).</p>
          </div>
          <form method="dialog"><button aria-label="Close" className="grid size-9 place-items-center rounded-xl hover:bg-[#faf7ef]"><X className="size-5" aria-hidden /></button></form>
        </div>
        {err && <p role="alert" className="mt-3 rounded-lg bg-[#fdecea] px-3 py-2 text-sm text-danger">{err}</p>}

        {!pair ? (
          <>
            <form onSubmit={(e) => { e.preventDefault(); void search(query); }} className="relative mt-5">
              <label htmlFor="merge-search" className="sr-only">Find by name, phone or TS number</label>
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#8a94a6]" aria-hidden />
              <input id="merge-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Name, phone or TS-0001, then Enter"
                className="h-11 w-full rounded-xl border border-[#e2dccb] pl-9 pr-3 outline-none focus:border-gold focus:ring-4 focus:ring-gold/20" />
            </form>
            <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-[#8a94a6]">{query ? "Results" : "Same phone or name"}</p>
            {cands === null ? <p className="mt-2 text-sm text-[#4b5b75]">Loading…</p> : cands.length ? (
              <ul className="mt-2 divide-y divide-[#f1ece0] rounded-2xl border border-[#ece4cf]">
                {cands.map((c) => (
                  <li key={c.id}>
                    <button type="button" onClick={() => choose(c.id)} className="flex w-full flex-wrap items-center justify-between gap-2 px-4 py-3 text-left hover:bg-[#faf7ef]">
                      <span><b>{c.name ?? "No name"}</b> <span className="font-mono text-xs text-gold-ink">{c.lead_no}</span><br />
                        <span className="text-sm text-[#4b5b75]">{c.phone_normalized ?? "no phone"} · {c.district ?? c.area ?? "-"}</span></span>
                      <span className="text-sm font-semibold text-[#1a2b57]">{st.label(c.status)} · Compare →</span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : <p className="mt-2 text-sm text-[#4b5b75]">No matches. Search by another name or number.</p>}
          </>
        ) : (
          <>
            <p className="mt-5 text-sm">Pick the value to keep for each field that differs ({differing.length}). Matching fields are kept as they are.</p>
            <div className="mt-3 overflow-x-auto rounded-2xl border border-[#ece4cf]">
              <table className="w-full text-sm">
                <thead className="bg-[#faf7ef] text-left text-xs uppercase tracking-wide text-[#4b5b75]">
                  <tr><th className="px-3 py-2">Field</th><th className="px-3 py-2">{pair.keep.lead_no} (this lead)</th><th className="px-3 py-2">{pair.other.lead_no} (duplicate)</th></tr>
                </thead>
                <tbody>
                  {differing.map(([f, label]) => (
                    <tr key={f} className="border-t border-[#f1ece0]">
                      <th scope="row" className="px-3 py-2 text-left font-semibold">{label}</th>
                      {(["keep", "other"] as const).map((side) => (
                        <td key={side} className="px-3 py-2">
                          <label className="flex cursor-pointer items-start gap-2">
                            <input type="radio" name={`pick-${f}`} checked={picks[f] === side} onChange={() => setPicks((p) => ({ ...p, [f]: side }))} className="mt-1 accent-[#f5a800]" />
                            <span className="break-words">{show(f, pair[side], st.label)}</span>
                          </label>
                        </td>
                      ))}
                    </tr>
                  ))}
                  {!differing.length && <tr><td colSpan={3} className="px-3 py-4 text-center text-[#4b5b75]">These leads have the same details.</td></tr>}
                </tbody>
              </table>
            </div>
            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <button type="button" onClick={() => setPair(null)} className="h-11 px-4 font-semibold text-[#4b5b75]">Back</button>
              <button type="button" onClick={merge} disabled={busy} className="inline-flex h-11 items-center gap-2 rounded-full bg-gold px-6 font-bold text-navy disabled:opacity-60">
                {busy && <Loader2 className="size-4 animate-spin" aria-hidden />}Merge {pair.other.lead_no} into {pair.keep.lead_no}
              </button>
            </div>
          </>
        )}
      </div>
    </dialog>
  );
}
