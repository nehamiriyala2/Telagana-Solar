"use client";

import { useState } from "react";
import { FU_OUTCOME_LABEL, FU_TYPE_LABEL, type FuOutcome, type FuType } from "@/lib/admin/labels";
import { AddFollowUp, FU_ICON, FollowUpActions } from "@/components/admin/follow-up-ui";

export type LeadFu = {
  id: number; type: FuType; note: string | null; status: string; due: string; dueLocal: string; overdue: boolean;
  outcome: string | null; outcomeNote: string | null; done: string | null; doneBy: string | null; createdBy: string | null;
};

/** Lead page: open follow-ups with Done / Reschedule, a button to book one, and the history. */
export function LeadFollowUps({ leadId, items, canEdit }: { leadId: number; items: LeadFu[]; canEdit: boolean }) {
  const [showAll, setShowAll] = useState(false);
  const open = items.filter((f) => f.status === "open");
  const past = items.filter((f) => f.status !== "open");
  const shownPast = showAll ? past : past.slice(0, 3);

  return (
    <section aria-labelledby="lf-fu-title" className="rounded-2xl border border-[#ece4cf] bg-white p-5 shadow-[0_18px_40px_-34px_rgb(7_23_63/0.45)]">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="lf-fu-title" className="font-heading text-lg font-bold">Follow-ups</h2>
      </div>
      {open.length ? (
        <ul className="mt-3 space-y-3">
          {open.map((f) => {
            const Icon = FU_ICON[f.type] ?? FU_ICON.call;
            return (
              <li key={f.id} className={`rounded-xl border border-l-4 border-[#ece4cf] p-3 ${f.overdue ? "border-l-[#e5484d]" : "border-l-gold"}`}>
                <p className="flex flex-wrap items-center gap-2 text-sm">
                  <Icon className="size-4 text-[#4b5b75]" aria-hidden />
                  <span className="font-semibold">{FU_TYPE_LABEL[f.type].replace(" (internal)", "")}</span>
                  <span className={f.overdue ? "font-bold text-danger" : "font-semibold text-[#1a2b57]"}>{f.due}{f.overdue ? " · overdue" : ""}</span>
                </p>
                {f.note && <p className="mt-1 text-sm text-[#36435a]">{f.note}</p>}
                {canEdit && <div className="mt-2"><FollowUpActions id={f.id} dueLocal={f.dueLocal} type={f.type} /></div>}
              </li>
            );
          })}
        </ul>
      ) : <p className="mt-2 text-sm text-[#4b5b75]">No follow-up booked.</p>}
      {canEdit && <div className="mt-3"><AddFollowUp leadId={leadId} compact={open.length > 0} /></div>}

      {past.length > 0 && (
        <div className="mt-5 border-t border-[#f1ece0] pt-4">
          <h3 className="text-sm font-bold text-[#4b5b75]">History</h3>
          <ul className="mt-2 space-y-2 text-sm">
            {shownPast.map((f) => (
              <li key={f.id}>
                <span className="font-semibold">{f.status === "cancelled" ? "Cancelled" : FU_OUTCOME_LABEL[f.outcome as FuOutcome] ?? "Done"}</span>
                <span className="text-[#4b5b75]"> · {FU_TYPE_LABEL[f.type].replace(" (internal)", "")} due {f.due}</span>
                {f.outcomeNote && <p className="text-[#36435a]">“{f.outcomeNote}”</p>}
                <p className="text-xs text-[#8a94a6]">{f.done}{f.doneBy ? ` · ${f.doneBy}` : ""}</p>
              </li>
            ))}
          </ul>
          {past.length > 3 && (
            <button type="button" onClick={() => setShowAll((v) => !v)} className="mt-2 text-sm font-semibold text-gold-ink hover:underline">
              {showAll ? "Show less" : `Show all ${past.length}`}
            </button>
          )}
        </div>
      )}
    </section>
  );
}
