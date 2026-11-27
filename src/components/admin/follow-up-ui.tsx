"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AlarmClock, CalendarPlus, Check, Loader2, MessageCircle, Phone, Trash2, Footprints } from "lucide-react";
import { FU_OUTCOME_LABEL, FU_OUTCOMES, FU_TYPE_LABEL, FU_TYPES, type FuOutcome, type FuType } from "@/lib/admin/labels";
import { addDays, istDate } from "@/lib/admin/time";
import { toast } from "@/components/admin/toast";
import { useFuRules } from "@/components/admin/stages-context";

export const FU_ICON: Record<string, typeof Phone> = { call: Phone, whatsapp: MessageCircle, visit: Footprints };

/** "YYYY-MM-DDTHH:mm" in IST, `days` from today at `time`. */
export const istAt = (days: number, time: string, now = new Date()) => `${addDays(istDate(now), days)}T${time}`;

async function send(url: string, method: string, body?: unknown): Promise<{ ok: boolean; message?: string }> {
  try {
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: body === undefined ? undefined : JSON.stringify(body) });
    if (res.ok) return { ok: true };
    const d = await res.json().catch(() => ({}));
    return { ok: false, message: d.message ?? d.issues?.[0]?.message ?? (res.status === 403 ? "You don’t have permission to do that." : "Couldn’t save. Try again.") };
  } catch { return { ok: false, message: "No connection. Try again." }; }
}

const field = "h-10 w-full rounded-xl border border-[#e2dccb] bg-white px-3 text-sm outline-none focus:border-gold focus:ring-4 focus:ring-gold/20 aria-[invalid=true]:border-danger";
const btn = "inline-flex h-9 items-center gap-1.5 rounded-xl px-3 text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-gold disabled:opacity-50";

export type FuDraft = { date: string; time: string; type: FuType; note: string };
export const draftAt = (days: number, time = "10:00", type: FuType = "call"): FuDraft => {
  const v = istAt(days, time);
  return { date: v.slice(0, 10), time: v.slice(11, 16), type, note: "" };
};

/** Date + time + type + note, with quick-pick chips. Controlled. */
export function FollowUpFields({ value, onChange, idPrefix, error }: { value: FuDraft; onChange: (v: FuDraft) => void; idPrefix: string; error?: string | null }) {
  const set = (p: Partial<FuDraft>) => onChange({ ...value, ...p });
  const chips: [string, () => Partial<FuDraft>][] = [
    ["Today 5 pm", () => ({ date: istAt(0, "17:00").slice(0, 10), time: "17:00" })],
    ["Tomorrow 10 am", () => ({ date: istAt(1, "10:00").slice(0, 10), time: "10:00" })],
    ["In 2 days", () => ({ date: istAt(2, value.time).slice(0, 10) })],
    ["Next week", () => ({ date: istAt(7, value.time).slice(0, 10) })],
  ];
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Quick dates">
        {chips.map(([l, f]) => (
          <button key={l} type="button" onClick={() => set(f())} className="rounded-full bg-[#faf7ef] px-3 py-1 text-xs font-semibold text-[#1a2b57] ring-1 ring-[#ece4cf] hover:bg-[#fff3d1]">{l}</button>
        ))}
      </div>
      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,7.5rem)] gap-2">
        <label className="block text-xs font-semibold text-[#4b5b75]">Date
          <input id={`${idPrefix}-date`} type="date" value={value.date} onChange={(e) => set({ date: e.target.value })} className={`${field} mt-1`} aria-invalid={error ? true : undefined} />
        </label>
        <label className="block text-xs font-semibold text-[#4b5b75]">Time (IST)
          <input type="time" value={value.time} onChange={(e) => set({ time: e.target.value })} className={`${field} mt-1`} aria-invalid={error ? true : undefined} />
        </label>
        <label className="col-span-2 block text-xs font-semibold text-[#4b5b75]">Type
          <select value={value.type} onChange={(e) => set({ type: e.target.value as FuType })} className={`${field} mt-1`}>
            {FU_TYPES.map((t) => <option key={t} value={t}>{FU_TYPE_LABEL[t]}</option>)}
          </select>
        </label>
      </div>
      <label className="block text-xs font-semibold text-[#4b5b75]">Note <span className="font-normal">(optional)</span>
        <input value={value.note} onChange={(e) => set({ note: e.target.value })} maxLength={500} placeholder="e.g. Ask about roof size, send quote" className={`${field} mt-1`} />
      </label>
      {error && <p role="alert" className="text-sm font-semibold text-danger">{error}</p>}
    </div>
  );
}

const checkDraft = (d: FuDraft) => (!/^\d{4}-\d{2}-\d{2}$/.test(d.date) || !/^\d{2}:\d{2}$/.test(d.time) ? "Pick a date and time." : null);
const toBody = (d: FuDraft) => ({ due: `${d.date}T${d.time}`, type: d.type, note: d.note });

/** "Add follow-up" button that opens a small form. */
export function AddFollowUp({ leadId, onSaved, compact = false, defaultType = "call" }: { leadId: number; onSaved?: () => void; compact?: boolean; defaultType?: FuType }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const rules = useFuRules();
  const [draft, setDraft] = useState<FuDraft>(() => draftAt(1, rules.defaultTime, defaultType));
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const bad = checkDraft(draft);
    if (bad) { setErr(bad); return; }
    setBusy(true); setErr(null);
    const r = await send(`/api/admin/leads/${leadId}/follow-ups`, "POST", toBody(draft));
    setBusy(false);
    if (!r.ok) { setErr(r.message ?? null); return; }
    toast(`Follow-up booked for ${draft.date.split("-").reverse().join("/")} ${draft.time}.`);
    setOpen(false); setDraft(draftAt(1, rules.defaultTime, defaultType));
    onSaved?.(); router.refresh();
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className={`${btn} ${compact ? "border border-[#e2dccb] bg-white text-[#1a2b57] hover:bg-[#faf7ef]" : "bg-gold text-navy hover:brightness-105"}`}>
        <CalendarPlus className="size-4" aria-hidden />Add follow-up
      </button>
    );
  }
  return (
    <form onSubmit={save} className="w-full space-y-3 rounded-2xl border border-[#ece4cf] bg-[#faf7ef] p-3" aria-label="New follow-up">
      <FollowUpFields value={draft} onChange={setDraft} idPrefix={`add-${leadId}`} error={err} />
      <div className="flex gap-2">
        <button type="submit" disabled={busy} className={`${btn} bg-navy text-white`}>{busy && <Loader2 className="size-4 animate-spin" aria-hidden />}Book follow-up</button>
        <button type="button" onClick={() => { setOpen(false); setErr(null); }} className={`${btn} text-[#4b5b75]`}>Cancel</button>
      </div>
    </form>
  );
}

/** Done / Reschedule / Delete for one open follow-up. */
/** `leading` (e.g. Call / WhatsApp buttons) sits at the start of the button row, so the forms below get the full width. */
export function FollowUpActions({ id, dueLocal, type, onChanged, leading }: { id: number; dueLocal: string; type: FuType; onChanged?: () => void; leading?: React.ReactNode }) {
  const router = useRouter();
  const [mode, setMode] = useState<"idle" | "done" | "menu" | "pick">("idle");
  const [outcome, setOutcome] = useState<FuOutcome | "">("");
  const [note, setNote] = useState("");
  const [bookNext, setBookNext] = useState(false);
  const rules = useFuRules();
  const [next, setNext] = useState<FuDraft>(() => draftAt(2, dueLocal.slice(11, 16) || rules.defaultTime, type));
  const [pick, setPick] = useState(dueLocal);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mode !== "menu") return;
    const close = (e: MouseEvent | KeyboardEvent) => { if (e instanceof KeyboardEvent ? e.key === "Escape" : !menuRef.current?.contains(e.target as Node)) setMode("idle"); };
    window.addEventListener("mousedown", close); window.addEventListener("keydown", close);
    return () => { window.removeEventListener("mousedown", close); window.removeEventListener("keydown", close); };
  }, [mode]);

  // Picking an outcome suggests whether (and when) to book the next follow-up.
  function chooseOutcome(o: FuOutcome) {
    setOutcome(o); setErr(null);
    const days = rules.nextDays[o];
    setBookNext(days !== null);
    if (days !== null) setNext((n) => ({ ...draftAt(days, n.time, o === "visit_done" ? "call" : type), note: n.note }));
  }

  async function run(body: unknown, msg: string, method = "PATCH") {
    setBusy(true); setErr(null);
    const r = await send(`/api/admin/follow-ups/${id}`, method, body);
    setBusy(false);
    if (!r.ok) { setErr(r.message ?? null); toast(r.message ?? "Couldn’t save.", "err"); return; }
    toast(msg); setMode("idle");
    onChanged?.(); router.refresh();
  }

  function submitDone(e: React.FormEvent) {
    e.preventDefault();
    if (!outcome) { setErr("Pick what happened."); return; }
    if (bookNext) { const bad = checkDraft(next); if (bad) { setErr(bad); return; } }
    void run({ action: "done", outcome, outcome_note: note, ...(bookNext ? { next: toBody(next) } : {}) }, bookNext ? "Done. Next follow-up booked." : "Follow-up marked done.");
  }

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center gap-2">
        {leading}
        <button type="button" onClick={() => setMode(mode === "done" ? "idle" : "done")} aria-expanded={mode === "done"} className={`${btn} border border-[#b9e0b1] bg-[#e7f5e4] text-success`}>
          <Check className="size-4" aria-hidden />Done
        </button>
        <div className="relative" ref={menuRef}>
          <button type="button" onClick={() => setMode(mode === "menu" ? "idle" : "menu")} aria-expanded={mode === "menu"} aria-haspopup="menu" className={`${btn} border border-[#e2dccb] bg-white text-[#1a2b57] hover:bg-[#faf7ef]`}>
            <AlarmClock className="size-4" aria-hidden />Reschedule
          </button>
          {mode === "menu" && (
            <div role="menu" className="absolute left-0 z-20 mt-2 w-48 rounded-2xl border border-[#ece4cf] bg-white p-1.5 shadow-[0_24px_48px_-24px_rgb(7_23_63/0.45)]">
              {([["Later today (+2 h)", null], ["Tomorrow", 1], ["In 3 days", 3], ["Next week", 7]] as [string, number | null][]).map(([l, d]) => (
                <button key={l} type="button" role="menuitem" disabled={busy}
                  onClick={() => {
                    const due = d === null ? (() => { const t = new Date(Date.now() + 2 * 3600_000); return `${istDate(t)}T${new Date(t.getTime() + 330 * 60_000).toISOString().slice(11, 16)}`; })() : istAt(d, dueLocal.slice(11, 16) || "10:00");
                    void run({ action: "reschedule", due }, `Moved to ${due.slice(8, 10)}/${due.slice(5, 7)} ${due.slice(11)}.`);
                  }}
                  className="w-full rounded-xl px-3 py-2 text-left text-sm font-semibold hover:bg-[#faf7ef]">{l}</button>
              ))}
              <button type="button" role="menuitem" onClick={() => setMode("pick")} className="w-full rounded-xl px-3 py-2 text-left text-sm font-semibold hover:bg-[#faf7ef]">Pick a date…</button>
            </div>
          )}
        </div>
        <button type="button" disabled={busy} onClick={() => { if (window.confirm("Remove this follow-up? (Use Done if it happened.)")) void run(undefined, "Follow-up removed.", "DELETE"); }}
          aria-label="Remove follow-up" title="Remove (added by mistake)" className={`${btn} px-2 text-[#8a94a6] hover:bg-[#fdecea] hover:text-danger`}>
          <Trash2 className="size-4" aria-hidden />
        </button>
        {busy && <Loader2 className="size-4 animate-spin text-gold-ink" aria-label="Saving" />}
      </div>

      {mode === "done" && (
        <form onSubmit={submitDone} className="mt-3 space-y-3 rounded-2xl border border-[#ece4cf] bg-[#faf7ef] p-3" aria-label="Mark follow-up done">
          <fieldset>
            <legend className="text-xs font-semibold text-[#4b5b75]">What happened?</legend>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {FU_OUTCOMES.filter((o) => o !== "visit_done" || type === "visit").map((o) => (
                <button key={o} type="button" aria-pressed={outcome === o} onClick={() => chooseOutcome(o)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ${outcome === o ? "bg-navy text-white ring-navy" : "bg-white text-[#1a2b57] ring-[#e2dccb] hover:bg-[#fff3d1]"}`}>{FU_OUTCOME_LABEL[o]}</button>
              ))}
            </div>
          </fieldset>
          <label className="block text-xs font-semibold text-[#4b5b75]">Note <span className="font-normal">(optional)</span>
            <input value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} placeholder="e.g. Wants quote for 3 kW, call after Diwali" className={`${field} mt-1`} />
          </label>
          <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-[#1a2b57]">
            <input type="checkbox" checked={bookNext} onChange={(e) => setBookNext(e.target.checked)} className="size-4 accent-[#f5a800]" />Book the next follow-up
          </label>
          {bookNext && <FollowUpFields value={next} onChange={setNext} idPrefix={`next-${id}`} />}
          {err && <p role="alert" className="text-sm font-semibold text-danger">{err}</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={busy} className={`${btn} bg-success text-white`}>{busy && <Loader2 className="size-4 animate-spin" aria-hidden />}Save</button>
            <button type="button" onClick={() => { setMode("idle"); setErr(null); }} className={`${btn} text-[#4b5b75]`}>Cancel</button>
          </div>
        </form>
      )}
      {mode === "pick" && (
        <form onSubmit={(e) => { e.preventDefault(); if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(pick)) { setErr("Pick a date and time."); return; } void run({ action: "reschedule", due: pick }, "Follow-up rescheduled."); }}
          className="mt-3 flex flex-wrap items-center gap-2">
          <label htmlFor={`pick-${id}`} className="text-sm font-semibold">New date and time (IST)</label>
          <input id={`pick-${id}`} type="datetime-local" value={pick} onChange={(e) => setPick(e.target.value)} autoFocus className="h-10 rounded-xl border border-[#e2dccb] px-3 text-sm outline-none focus:border-gold focus:ring-4 focus:ring-gold/20" />
          <button type="submit" disabled={busy} className={`${btn} h-10 bg-navy text-white`}>Save</button>
          <button type="button" onClick={() => setMode("idle")} className={`${btn} h-10 text-[#4b5b75]`}>Cancel</button>
        </form>
      )}
      {err && mode !== "done" && <p role="alert" className="mt-2 text-sm text-danger">{err}</p>}
    </div>
  );
}
