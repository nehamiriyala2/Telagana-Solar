"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { FU_OUTCOME_LABEL, FU_OUTCOMES } from "@/lib/admin/labels";
import { DEFAULT_FU_RULES, type FuRules } from "@/lib/admin/followup-rules";
import { inputCls } from "@/components/admin/cms/fields";
import { toast } from "@/components/admin/toast";

/** Settings → Follow-up timing: when to suggest the next follow-up after each outcome. */
export function FollowUpRulesSettings({ initial }: { initial: FuRules }) {
  const router = useRouter();
  const [r, setR] = useState(initial);
  const [busy, setBusy] = useState(false);
  async function save() {
    setBusy(true);
    const res = await fetch("/api/admin/settings/followup-rules", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(r) }).catch(() => null);
    setBusy(false);
    const d = await res?.json().catch(() => ({}));
    if (!res?.ok) { toast(d?.issues?.[0]?.message ?? "Couldn’t save.", "err"); return; }
    toast(d.changed ? "Follow-up timing saved." : "No changes to save.");
    router.refresh();
  }
  return (
    <section id="followup-timing" aria-labelledby="fu-rules-title" className="scroll-mt-24 rounded-2xl border border-[#ece4cf] bg-white p-5 shadow-[0_18px_40px_-34px_rgb(7_23_63/0.45)] sm:p-6">
      <h2 id="fu-rules-title" className="font-heading text-xl font-bold">Follow-up timing</h2>
      <p className="mt-1 max-w-2xl text-sm text-[#4b5b75]">When staff mark a follow-up done, the next one is suggested this many days later. Leave a box empty to suggest none. Staff can always change the date.</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {FU_OUTCOMES.map((o) => (
          <label key={o} className="block text-sm font-semibold text-[#1a2b57]">{FU_OUTCOME_LABEL[o]}
            <span className="mt-1 flex items-center gap-2">
              <input type="number" min={0} max={60} value={r.nextDays[o] ?? ""} onChange={(e) => setR({ ...r, nextDays: { ...r.nextDays, [o]: e.target.value === "" ? null : Math.round(Number(e.target.value)) } })} className={`${inputCls} h-10 w-20`} />
              <span className="text-xs font-normal text-[#4b5b75]">{r.nextDays[o] === null ? "no follow-up" : "days later"}</span>
            </span>
          </label>
        ))}
        <label className="block text-sm font-semibold text-[#1a2b57]">Default time (IST)
          <input type="time" value={r.defaultTime} onChange={(e) => setR({ ...r, defaultTime: e.target.value })} className={`${inputCls} mt-1 h-10 w-32`} />
        </label>
      </div>
      <div className="mt-4 flex gap-2">
        <button type="button" onClick={save} disabled={busy} className="inline-flex h-11 items-center gap-2 rounded-xl bg-navy px-5 font-semibold text-white disabled:opacity-60">{busy && <Loader2 className="size-4 animate-spin" aria-hidden />}Save timing</button>
        <button type="button" onClick={() => setR(DEFAULT_FU_RULES)} className="h-11 rounded-xl px-4 text-sm font-semibold text-[#4b5b75] hover:bg-[#faf7ef]">Reset to defaults</button>
      </div>
    </section>
  );
}
