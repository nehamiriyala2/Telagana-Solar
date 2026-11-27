"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { LOST_LABEL, LOST_REASONS } from "@/lib/admin/labels";
import { useStages } from "@/components/admin/stages-context";
import { toast } from "@/components/admin/toast";
import { WonForm, type WonDefaults, type WonValues } from "./won-form";

export async function patchLead(id: number, body: Record<string, unknown>): Promise<{ ok: boolean; message?: string }> {
  try {
    const res = await fetch(`/api/admin/leads/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (res.ok) return { ok: true };
    const d = await res.json().catch(() => ({}));
    return { ok: false, message: d.message ?? (res.status === 403 ? "You don’t have permission to do that." : "Couldn’t save. Try again.") };
  } catch {
    return { ok: false, message: "No connection. Try again." };
  }
}

/** Status dropdown. "Lost" asks for a reason; "Won" asks for kW, final amount and subsidy. */
export function StatusControl({ id, status, lostReason, onSaved, idPrefix = "lead", name = "this lead", won = { kw: null, amount: null, subsidy: null } }: {
  id: number; status: string; lostReason: string | null; onSaved?: () => void; idPrefix?: string; name?: string; won?: WonDefaults;
}) {
  const router = useRouter();
  const st = useStages();
  const [value, setValue] = useState(status);
  const [askLost, setAskLost] = useState(false);
  const [reason, setReason] = useState(lostReason ?? "");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [askWon, setAskWon] = useState(false);
  const wonRef = useRef<HTMLDialogElement>(null);
  const wonSubmitted = useRef(false);
  useEffect(() => { if (askWon) wonRef.current?.showModal(); }, [askWon]);

  async function save(next: string, lost?: string, wonValues?: WonValues) {
    setBusy(true); setErr(null);
    const r = await patchLead(id, next === "lost" ? { status: next, lost_reason: lost } : next === "won" ? { status: next, ...wonValues } : { status: next });
    setBusy(false);
    if (!r.ok) { setErr(r.message ?? null); setValue(status); toast(r.message ?? "Couldn’t save.", "err"); return; }
    setAskLost(false);
    toast(`Status changed to ${st.label(next)}.`);
    onSaved?.();
    router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex items-center gap-2">
        <label htmlFor={`${idPrefix}-status`} className="text-sm font-semibold text-[#4b5b75]">Status</label>
        <select id={`${idPrefix}-status`} value={value} disabled={busy}
          onChange={(e) => { const v = e.target.value; setValue(v); if (v === "lost") setAskLost(true); else if (v === "won") setAskWon(true); else void save(v); }}
          className="h-11 rounded-full border border-[#e2dccb] bg-white px-4 font-semibold outline-none focus:border-gold focus:ring-4 focus:ring-gold/20">
          {st.stages.filter((s) => s.visible || s.key === status).map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
        </select>
        {busy && <Loader2 className="size-5 animate-spin text-gold-ink" aria-label="Saving" />}
      </div>
      {askLost && (
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-[#ece4cf] bg-[#faf7ef] p-3" role="group" aria-label="Why was this lead lost?">
          <label htmlFor={`${idPrefix}-lost-reason`} className="text-sm font-semibold">Why lost?</label>
          <select id={`${idPrefix}-lost-reason`} value={reason} onChange={(e) => setReason(e.target.value)} autoFocus
            className="h-9 rounded-xl border border-[#e2dccb] bg-white px-3 text-sm outline-none focus:border-gold focus:ring-4 focus:ring-gold/20">
            <option value="">Pick a reason</option>
            {LOST_REASONS.map((r) => <option key={r} value={r}>{LOST_LABEL[r]}</option>)}
          </select>
          <button type="button" disabled={!reason || busy} onClick={() => save("lost", reason)}
            className="h-9 rounded-xl bg-navy px-3 text-sm font-semibold text-white disabled:opacity-50">Mark lost</button>
          <button type="button" onClick={() => { setAskLost(false); setValue(status); }} className="h-9 px-2 text-sm font-semibold text-[#4b5b75]">Cancel</button>
        </div>
      )}
      {err && <p role="alert" className="text-sm text-danger">{err}</p>}
      <dialog ref={wonRef} aria-labelledby={`${idPrefix}-won-title`} onClose={() => { if (!wonSubmitted.current) setValue(status); wonSubmitted.current = false; setAskWon(false); }}
        className="m-auto w-[min(26rem,calc(100vw-2rem))] rounded-3xl p-6 text-left backdrop:bg-navy/60">
        {askWon && (
          <WonForm name={name} defaults={won} idPrefix={`${idPrefix}-won`}
            onCancel={() => wonRef.current?.close()}
            onSave={(v) => { wonSubmitted.current = true; wonRef.current?.close(); void save("won", undefined, v); }} />
        )}
      </dialog>
    </div>
  );
}
