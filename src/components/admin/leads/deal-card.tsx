"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Check, CircleAlert, Loader2 } from "lucide-react";
import { patchLead } from "./status-control";

type Deal = {
  assigned_to: number | null; site_visit_at: string; final_kw: string; quote_amount: string; final_amount: string;
  subsidy_applied: boolean | null; loan_needed: boolean | null; install_date: string;
};

/**
 * Deal fields with autosave: dropdowns, dates and yes/no save on change; numbers save on blur (or Enter).
 * The server logs every change old → new.
 */
export function DealCard({ id, initial, staff, canEdit, wonAt }: { id: number; initial: Deal; staff: { id: number; name: string; active: number }[]; canEdit: boolean; wonAt: string | null }) {
  const router = useRouter();
  const [deal, setDeal] = useState(initial);
  const saved = useRef(initial);
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [err, setErr] = useState<string | null>(null);

  async function commit<K extends keyof Deal>(key: K, value: Deal[K]) {
    if (JSON.stringify(saved.current[key]) === JSON.stringify(value)) return;
    let body: unknown = value;
    if (key === "final_kw" || key === "quote_amount" || key === "final_amount") {
      const s = String(value).trim();
      if (s !== "" && (!/^\d+(\.\d+)?$/.test(s) || (key !== "final_kw" && !/^\d+$/.test(s)))) {
        setState("error"); setErr(key === "final_kw" ? "kW must be a number." : "Amounts must be whole rupees."); return;
      }
      body = s === "" ? null : Number(s);
    }
    if (key === "site_visit_at" || key === "install_date") body = value === "" ? null : value;
    setState("saving"); setErr(null);
    const r = await patchLead(id, { [key]: body });
    if (!r.ok) { setState("error"); setErr(r.message ?? null); return; }
    saved.current = { ...saved.current, [key]: value };
    setState("saved");
    router.refresh();
  }

  const set = <K extends keyof Deal>(key: K, value: Deal[K], now = false) => {
    setDeal((d) => ({ ...d, [key]: value }));
    if (now) void commit(key, value);
  };

  const input = "mt-1 h-10 w-full rounded-xl border border-[#e2dccb] bg-white px-3 text-sm outline-none focus:border-gold focus:ring-4 focus:ring-gold/20 disabled:bg-[#f6f4ee] disabled:text-[#5b6473]";
  const yn = (v: boolean | null) => (v === null ? "" : v ? "yes" : "no");
  const fromYn = (v: string) => (v === "" ? null : v === "yes");

  return (
    <section className="rounded-2xl border border-[#ece4cf] bg-white p-5 shadow-[0_18px_40px_-34px_rgb(7_23_63/0.45)]" aria-labelledby="deal-title">
      <div className="flex items-center justify-between gap-2">
        <h2 id="deal-title" className="font-heading text-lg font-bold">Deal</h2>
        <span className="flex items-center gap-1.5 text-xs font-semibold" aria-live="polite">
          {state === "saving" && <><Loader2 className="size-3.5 animate-spin text-gold-ink" aria-hidden /><span className="text-[#4b5b75]">Saving…</span></>}
          {state === "saved" && <><Check className="size-3.5 text-success" aria-hidden /><span className="text-success">Saved</span></>}
          {state === "error" && <><CircleAlert className="size-3.5 text-danger" aria-hidden /><span className="text-danger">Not saved</span></>}
        </span>
      </div>
      {err && <p role="alert" className="mt-2 rounded-lg bg-[#fdecea] px-3 py-2 text-sm text-danger">{err}</p>}
      {wonAt && <p className="mt-2 rounded-lg bg-[#e7f5e4] px-3 py-2 text-sm font-semibold text-success">Won on {wonAt}</p>}
      <fieldset disabled={!canEdit} className="mt-3 space-y-3">
        <legend className="sr-only">Deal details</legend>
        <label className="block text-sm font-semibold text-[#1a2b57]">Owner
          <select className={input} value={deal.assigned_to ?? ""} onChange={(e) => set("assigned_to", e.target.value ? Number(e.target.value) : null, true)}>
            <option value="">Unassigned</option>
            {staff.map((s) => <option key={s.id} value={s.id} disabled={!s.active}>{s.name}{s.active ? "" : " (inactive)"}</option>)}
          </select>
        </label>
        <label className="block text-sm font-semibold text-[#1a2b57]">Site visit <span className="font-normal text-[#8a94a6]">· internal</span>
          <input type="datetime-local" className={input} value={deal.site_visit_at} onChange={(e) => set("site_visit_at", e.target.value)} onBlur={(e) => commit("site_visit_at", e.target.value)} />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm font-semibold text-[#1a2b57]">Final kW
            <input inputMode="decimal" className={input} value={deal.final_kw} onChange={(e) => set("final_kw", e.target.value)} onBlur={(e) => commit("final_kw", e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && commit("final_kw", (e.target as HTMLInputElement).value)} />
          </label>
          <label className="block text-sm font-semibold text-[#1a2b57]">Quote (₹)
            <input inputMode="numeric" className={input} value={deal.quote_amount} onChange={(e) => set("quote_amount", e.target.value)} onBlur={(e) => commit("quote_amount", e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && commit("quote_amount", (e.target as HTMLInputElement).value)} />
          </label>
        </div>
        <label className="block text-sm font-semibold text-[#1a2b57]">Final amount (₹) <span className="font-normal text-[#8a94a6]">· when won</span>
          <input inputMode="numeric" className={input} value={deal.final_amount} onChange={(e) => set("final_amount", e.target.value)} onBlur={(e) => commit("final_amount", e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && commit("final_amount", (e.target as HTMLInputElement).value)} />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm font-semibold text-[#1a2b57]">Subsidy applied
            <select className={input} value={yn(deal.subsidy_applied)} onChange={(e) => set("subsidy_applied", fromYn(e.target.value), true)}>
              <option value="">Not yet known</option><option value="yes">Yes</option><option value="no">No</option>
            </select>
          </label>
          <label className="block text-sm font-semibold text-[#1a2b57]">Loan needed
            <select className={input} value={yn(deal.loan_needed)} onChange={(e) => set("loan_needed", fromYn(e.target.value), true)}>
              <option value="">Not yet known</option><option value="yes">Yes</option><option value="no">No</option>
            </select>
          </label>
        </div>
        <label className="block text-sm font-semibold text-[#1a2b57]">Install date
          <input type="date" className={input} value={deal.install_date} onChange={(e) => set("install_date", e.target.value, true)} />
        </label>
      </fieldset>
      <p className="mt-3 text-xs text-[#8a94a6]">Times are India time (IST). Changes save automatically.</p>
    </section>
  );
}
