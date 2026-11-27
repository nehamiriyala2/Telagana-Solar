"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowDown, ArrowUp, Eye, EyeOff, History, Loader2, Lock, RotateCcw } from "lucide-react";
import { DEFAULT_STAGES, REQUIRED_STAGES, StagesSchema, TONES, type Stage, type Tone } from "@/lib/admin/stages";
import { STATUS_LABEL } from "@/lib/admin/labels";
import { toast } from "@/components/admin/toast";

const MEANING: Record<string, string> = {
  new: "Just arrived, nobody has spoken to them yet.",
  contacted: "We’ve spoken to the customer.",
  qualified: "Right roof, right budget, genuinely interested.",
  site_visit: "Internal only: our team checked the roof. Never offered to customers as free.",
  quote_sent: "Proposal / quote shared with the customer.",
  won: "Deal closed. Asks for kW, final amount and subsidy.",
  lost: "Not going ahead. Asks for a reason.",
};

/** Settings → Pipeline stages: rename, recolour, reorder and hide stages, with version history. */
export function StageSettings({ initial }: { initial: Stage[] }) {
  const router = useRouter();
  const [stages, setStages] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<{ id: number; at: string; by: string | null }[] | null>(null);
  const dirty = JSON.stringify(stages) !== JSON.stringify(saved);

  const update = (i: number, patch: Partial<Stage>) => { setStages((s) => s.map((x, j) => (j === i ? { ...x, ...patch } : x))); setError(null); };
  const moveRow = (i: number, d: -1 | 1) => setStages((s) => {
    const j = i + d;
    if (j < 0 || j >= s.length) return s;
    const n = [...s]; [n[i], n[j]] = [n[j], n[i]]; return n;
  });

  async function save(list = stages) {
    const check = StagesSchema.safeParse(list);
    if (!check.success) { setError(check.error.issues[0]?.message ?? "Check the stages."); return; }
    setBusy(true); setError(null);
    try {
      const res = await fetch("/api/admin/settings/stages", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ stages: list }) });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) { setError(d.message ?? "Couldn’t save."); return; }
      setSaved(check.data); setStages(check.data);
      toast(d.changed ? "Pipeline stages saved." : "No changes to save.");
      setHistory(null);
      router.refresh();
    } catch { setError("No connection. Try again."); } finally { setBusy(false); }
  }

  async function loadHistory() {
    const res = await fetch("/api/admin/settings/stages").catch(() => null);
    if (!res?.ok) { toast("Couldn’t load the history.", "err"); return; }
    setHistory((await res.json()).history);
  }
  async function restore(id: number) {
    if (!window.confirm("Put the stages back to this version?")) return;
    setBusy(true);
    const res = await fetch("/api/admin/settings/stages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ history_id: id }) }).catch(() => null);
    setBusy(false);
    if (!res?.ok) { toast("Couldn’t restore that version.", "err"); return; }
    toast("Stages restored.");
    window.location.reload();
  }

  const input = "h-10 w-full rounded-xl border border-[#e2dccb] bg-white px-3 text-sm outline-none focus:border-gold focus:ring-4 focus:ring-gold/20";
  return (
    <section id="pipeline-stages" aria-labelledby="stages-title" className="scroll-mt-24 rounded-2xl border border-[#ece4cf] bg-white p-5 shadow-[0_18px_40px_-34px_rgb(7_23_63/0.45)] sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="stages-title" className="font-heading text-xl font-bold">Pipeline stages</h2>
          <p className="mt-1 max-w-2xl text-sm text-[#4b5b75]">Rename, recolour, reorder or hide stages. They change everywhere: Leads, Pipeline, the lead page and exports. The stages themselves are fixed because reports and automations depend on what each one means.</p>
        </div>
        <button type="button" onClick={loadHistory} className="inline-flex h-9 items-center gap-1.5 rounded-xl px-3 text-sm font-semibold text-[#1a2b57] hover:bg-[#faf7ef]"><History className="size-4" aria-hidden />History</button>
      </div>

      <ol className="mt-5 space-y-2.5">
        {stages.map((s, i) => {
          const locked = REQUIRED_STAGES.includes(s.key);
          return (
            <li key={s.key} className={`grid gap-3 rounded-2xl border border-[#ece4cf] p-3 sm:grid-cols-[14rem_minmax(0,1fr)_9rem_8.5rem] sm:items-center ${s.visible ? "" : "bg-[#f8f8f9]"}`}>
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => moveRow(i, -1)} disabled={i === 0} aria-label={`Move ${s.label} up`} className="grid size-8 place-items-center rounded-lg hover:bg-[#faf7ef] disabled:opacity-30"><ArrowUp className="size-4" aria-hidden /></button>
                <button type="button" onClick={() => moveRow(i, 1)} disabled={i === stages.length - 1} aria-label={`Move ${s.label} down`} className="grid size-8 place-items-center rounded-lg hover:bg-[#faf7ef] disabled:opacity-30"><ArrowDown className="size-4" aria-hidden /></button>
                <span className={`ml-1 inline-flex max-w-[9rem] truncate justify-center rounded-full px-2.5 py-0.5 text-xs font-bold ring-1 ring-inset ${TONES[s.tone].pill}`}>{s.label || "…"}</span>
              </div>
              <div className="min-w-0">
                <label className="sr-only" htmlFor={`stage-${s.key}`}>Name for {STATUS_LABEL[s.key]}</label>
                <input id={`stage-${s.key}`} value={s.label} maxLength={30} onChange={(e) => update(i, { label: e.target.value })} className={input} />
                <p className="mt-1 text-xs text-[#8a94a6]">{MEANING[s.key]}</p>
              </div>
              <label className="block">
                <span className="sr-only">Colour for {s.label}</span>
                <select value={s.tone} onChange={(e) => update(i, { tone: e.target.value as Tone })} className={input}>
                  {Object.entries(TONES).map(([k, t]) => <option key={k} value={k}>{t.label}</option>)}
                </select>
              </label>
              <button type="button" disabled={locked} onClick={() => update(i, { visible: !s.visible })} aria-pressed={!s.visible}
                title={locked ? "New, Won and Lost are always shown" : s.visible ? "Hide this stage" : "Show this stage"}
                className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-[#e2dccb] px-3 text-sm font-semibold text-[#1a2b57] hover:bg-[#faf7ef] disabled:cursor-not-allowed disabled:opacity-60">
                {locked ? <><Lock className="size-4" aria-hidden />Always on</> : s.visible ? <><Eye className="size-4" aria-hidden />Shown</> : <><EyeOff className="size-4" aria-hidden />Hidden</>}
              </button>
            </li>
          );
        })}
      </ol>

      {error && <p role="alert" className="mt-4 rounded-xl bg-[#fdecea] px-4 py-3 text-sm font-semibold text-danger">{error}</p>}
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => save()} disabled={busy || !dirty} className="inline-flex h-11 items-center gap-2 rounded-xl bg-navy px-5 font-semibold text-white disabled:opacity-50">
          {busy && <Loader2 className="size-4 animate-spin" aria-hidden />}Save stages
        </button>
        {dirty && <button type="button" onClick={() => { setStages(saved); setError(null); }} className="h-11 rounded-xl px-4 font-semibold text-[#4b5b75] hover:bg-[#faf7ef]">Undo changes</button>}
        <button type="button" onClick={() => { setStages(DEFAULT_STAGES); setError(null); }} className="ml-auto inline-flex h-11 items-center gap-1.5 rounded-xl px-3 text-sm font-semibold text-[#4b5b75] hover:bg-[#faf7ef]">
          <RotateCcw className="size-4" aria-hidden />Reset to defaults
        </button>
      </div>
      <p className="mt-2 text-xs text-[#8a94a6]">A hidden stage can’t be picked any more, but leads already in it stay visible on the Pipeline until you move them.</p>

      {history && (
        <div className="mt-5 rounded-2xl border border-[#ece4cf] bg-[#faf7ef] p-4">
          <h3 className="font-heading font-bold">Change history</h3>
          {history.length ? (
            <ul className="mt-2 divide-y divide-[#ece4cf] text-sm">
              {history.map((h) => (
                <li key={h.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                  <span>{h.at} · {h.by ?? "Unknown"}</span>
                  <button type="button" disabled={busy} onClick={() => restore(h.id)} className="font-semibold text-gold-ink hover:underline">Restore this version</button>
                </li>
              ))}
            </ul>
          ) : <p className="mt-2 text-sm text-[#4b5b75]">No changes yet. The defaults are in use.</p>}
        </div>
      )}
    </section>
  );
}
