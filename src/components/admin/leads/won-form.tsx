"use client";

import { useState } from "react";
import { Trophy } from "lucide-react";

export type WonValues = { final_kw: number; final_amount: number; subsidy_applied: boolean };
export type WonDefaults = { kw: number | null; amount: number | null; subsidy: boolean | null };

/** Asked before a lead moves to Won: system size, final amount and whether subsidy was applied. */
export function WonForm({ name, defaults, onSave, onCancel, idPrefix = "won" }: {
  name: string; defaults: WonDefaults; onSave: (v: WonValues) => void; onCancel: () => void; idPrefix?: string;
}) {
  const [kw, setKw] = useState(defaults.kw ? String(defaults.kw) : "");
  const [amount, setAmount] = useState(defaults.amount !== null ? String(defaults.amount) : "");
  const [subsidy, setSubsidy] = useState<"" | "yes" | "no">(defaults.subsidy === null ? "" : defaults.subsidy ? "yes" : "no");
  const [errors, setErrors] = useState<Record<string, string>>({});

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const err: Record<string, string> = {};
    const k = Number(kw);
    if (!/^\d+(\.\d{1,2})?$/.test(kw.trim()) || !(k > 0) || k > 10_000) err.kw = "Enter the system size, e.g. 3 or 3.5.";
    const a = amount.replace(/[,\s₹]/g, "");
    if (!/^\d+$/.test(a) || Number(a) > 1_000_000_000) err.amount = "Enter the final amount in whole rupees.";
    if (!subsidy) err.subsidy = "Pick yes or no.";
    setErrors(err);
    if (Object.keys(err).length) return;
    onSave({ final_kw: k, final_amount: Number(a), subsidy_applied: subsidy === "yes" });
  }

  const field = "mt-1 h-11 w-full rounded-xl border border-[#e2dccb] bg-white px-3 outline-none focus:border-gold focus:ring-4 focus:ring-gold/20 aria-[invalid=true]:border-danger";
  const msg = (k: string) => errors[k] && <p id={`${idPrefix}-${k}-err`} className="mt-1 text-xs font-semibold text-danger">{errors[k]}</p>;
  return (
    <form onSubmit={submit} noValidate>
      <h2 id={`${idPrefix}-title`} className="flex items-center gap-2 font-heading text-lg font-bold"><Trophy className="size-5 text-success" aria-hidden />Mark {name} as won</h2>
      <p className="mt-1 text-sm text-[#4b5b75]">These go into reports (won kW and revenue).</p>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <label className="block text-sm font-semibold text-[#1a2b57]">System size (kW)
          <input autoFocus inputMode="decimal" value={kw} onChange={(e) => setKw(e.target.value)} className={field}
            aria-invalid={errors.kw ? true : undefined} aria-describedby={errors.kw ? `${idPrefix}-kw-err` : undefined} />
          {msg("kw")}
        </label>
        <label className="block text-sm font-semibold text-[#1a2b57]">Final amount (₹)
          <input inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value)} className={field}
            aria-invalid={errors.amount ? true : undefined} aria-describedby={errors.amount ? `${idPrefix}-amount-err` : undefined} />
          {msg("amount")}
        </label>
      </div>
      <fieldset className="mt-4" aria-describedby={errors.subsidy ? `${idPrefix}-subsidy-err` : undefined}>
        <legend className="text-sm font-semibold text-[#1a2b57]">Subsidy applied?</legend>
        <div className="mt-1 flex gap-2">
          {(["yes", "no"] as const).map((v) => (
            <label key={v} className="flex flex-1 cursor-pointer items-center gap-2 rounded-xl border border-[#ece4cf] px-3 py-2.5 has-[:checked]:border-gold has-[:checked]:bg-[#fff8e6]">
              <input type="radio" name={`${idPrefix}-subsidy`} value={v} checked={subsidy === v} onChange={() => setSubsidy(v)} className="accent-[#f5a800]" />{v === "yes" ? "Yes" : "No"}
            </label>
          ))}
        </div>
        {msg("subsidy")}
      </fieldset>
      <div className="mt-5 flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="h-10 px-4 font-semibold text-[#4b5b75]">Cancel</button>
        <button type="submit" className="h-10 rounded-full bg-success px-5 font-semibold text-white">Mark won</button>
      </div>
    </form>
  );
}
