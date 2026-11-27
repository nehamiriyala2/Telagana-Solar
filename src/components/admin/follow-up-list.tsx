"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import { FU_OUTCOME_LABEL, FU_TYPE_LABEL, type FuOutcome, type FuType } from "@/lib/admin/labels";
import { StatusPill } from "@/components/admin/lead-bits";
import { Toggle } from "@/components/admin/leads/lead-filters";
import { ContactActions } from "@/components/admin/leads/contact-actions";
import { AddFollowUp, FU_ICON, FollowUpActions } from "@/components/admin/follow-up-ui";

export type FuItem = {
  id: number; leadId: number; leadNo: string; name: string | null; phone: string | null; place: string | null;
  ownerId: number | null; owner: string | null; ownerInactive: boolean; leadStatus: string;
  type: FuType; note: string | null; status: string; due: string; dueFull: string; dueLocal: string;
  outcome: string | null; outcomeNote: string | null; doneAt: string | null; doneBy: string | null; waHref: string | null;
};
type Tab = "overdue" | "today" | "upcoming" | "done" | "none";
type Counts = Record<Tab, number>;

const TABS: { key: Tab; label: string }[] = [
  { key: "overdue", label: "Overdue" }, { key: "today", label: "Today" }, { key: "upcoming", label: "Upcoming" },
  { key: "done", label: "Done (30 days)" }, { key: "none", label: "No follow-up" },
];
const EMPTY: Record<Tab, string> = {
  overdue: "Nothing overdue. Nice work.", today: "Nothing left for today.", upcoming: "Nothing planned after today.",
  done: "No follow-ups done in the last 30 days.", none: "Every open lead has a follow-up booked.",
};

/** URL-synced helper shared by the tabs and filters. */
function useGo() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [pending, start] = useTransition();
  const href = (changes: Record<string, string | null>) => {
    const p = new URLSearchParams(sp.toString());
    p.delete("mine");
    for (const [k, v] of Object.entries(changes)) { if (v) p.set(k, v); else p.delete(k); }
    return `${pathname}${p.size ? `?${p}` : ""}`;
  };
  return { sp, pending, href, go: (c: Record<string, string | null>) => start(() => router.push(href(c))) };
}

export function FollowUpFilters({ owners, canPickOwner, staffId }: { owners: { id: number; name: string; active: number }[]; canPickOwner: boolean; staffId: number }) {
  const { sp, go, pending } = useGo();
  const owner = sp.get("owner") ?? (sp.get("mine") === "1" ? "me" : "");
  return (
    <div className="mb-4 flex flex-wrap items-center gap-3 text-sm">
      {canPickOwner ? (
        <label className="flex items-center gap-2"><span className="font-semibold text-[#4b5b75]">Staff</span>
          <select value={owner} onChange={(e) => go({ owner: e.target.value || null })}
            className="h-10 rounded-xl border border-[#e2dccb] bg-white px-3 text-sm font-semibold text-[#1a2b57] outline-none focus:border-gold focus:ring-4 focus:ring-gold/20">
            <option value="">Everyone (grouped by person)</option>
            <option value="me">Mine</option>
            <option value="none">Unassigned leads</option>
            {owners.filter((o) => o.id !== staffId).map((o) => <option key={o.id} value={o.id}>{o.name}{o.active ? "" : " (inactive)"}</option>)}
          </select>
        </label>
      ) : <span className="rounded-xl bg-white px-3 py-2 font-semibold text-[#1a2b57] ring-1 ring-[#ece4cf]">Your follow-ups</span>}
      <Toggle label="Include test data" on={sp.get("test") === "1"} onChange={(v) => go({ test: v ? "1" : null })} />
      {pending && <Loader2 className="size-5 animate-spin text-gold-ink" aria-label="Loading" />}
    </div>
  );
}

export function FollowUpTabs({ active, counts }: { active: Tab; counts: Counts }) {
  const { href } = useGo();
  return (
    <nav aria-label="Follow-up lists" className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1">
      {TABS.map((t) => {
        const on = active === t.key;
        const red = t.key === "overdue" && counts.overdue > 0;
        return (
          <Link key={t.key} href={href({ tab: t.key === "today" ? null : t.key })} aria-current={on ? "page" : undefined}
            className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold outline-none ring-1 focus-visible:ring-2 focus-visible:ring-gold ${on ? (red ? "bg-[#e5484d] text-white ring-[#e5484d]" : "bg-navy text-white ring-navy") : "bg-white text-[#4b5b75] ring-[#ece4cf] hover:bg-[#faf7ef]"}`}>
            {t.label}
            <span className={`rounded-full px-2 py-px text-xs font-bold ${on ? "bg-white/20" : red ? "bg-[#e5484d] text-white" : "bg-[#f1f2f4] text-[#5b6473]"}`}>{counts[t.key]}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function FollowUpBoard({ tab, items, grouped, canEdit }: { tab: Tab; items: FuItem[]; grouped: boolean; canEdit: boolean }) {
  if (!items.length) return <p className="mt-5 rounded-2xl border border-dashed border-[#e2dccb] bg-white px-6 py-12 text-center text-[#4b5b75]">{EMPTY[tab]}</p>;
  if (!grouped) return <ul className="mt-5 space-y-2.5">{items.map((r) => <Row key={`${r.id}-${r.leadId}`} r={r} tab={tab} canEdit={canEdit} />)}</ul>;

  // Daily list per staff member: one block per owner, unassigned last.
  const groups = new Map<string, { name: string; inactive: boolean; rows: FuItem[] }>();
  for (const r of items) {
    const k = r.ownerId ? String(r.ownerId) : "none";
    if (!groups.has(k)) groups.set(k, { name: r.owner ?? "Unassigned", inactive: r.ownerInactive, rows: [] });
    groups.get(k)!.rows.push(r);
  }
  const ordered = [...groups.entries()].sort(([a, x], [b, y]) => (a === "none" ? 1 : b === "none" ? -1 : x.name.localeCompare(y.name)));
  return (
    <div className="mt-5 space-y-7">
      {ordered.map(([k, g]) => (
        <section key={k} aria-labelledby={`fu-owner-${k}`}>
          <h2 id={`fu-owner-${k}`} className="mb-2.5 flex items-center gap-2 font-heading text-base font-bold">
            <span className={`grid size-7 place-items-center rounded-full text-xs ${k === "none" ? "border border-dashed border-[#c9cfd8] text-[#8a94a6]" : "bg-navy text-gold"}`}>{k === "none" ? "?" : g.name.slice(0, 1).toUpperCase()}</span>
            {g.name}{g.inactive && <span className="text-sm font-normal text-[#8a94a6]">(inactive)</span>}
            <span className="text-sm font-semibold text-[#8a94a6]">({g.rows.length})</span>
          </h2>
          <ul className="space-y-2.5">{g.rows.map((r) => <Row key={`${r.id}-${r.leadId}`} r={r} tab={tab} canEdit={canEdit} />)}</ul>
        </section>
      ))}
    </div>
  );
}

function Row({ r, tab, canEdit }: { r: FuItem; tab: Tab; canEdit: boolean }) {
  const Icon = FU_ICON[r.type] ?? FU_ICON.call;
  const edge = { overdue: "border-l-[#e5484d]", today: "border-l-gold", upcoming: "border-l-navy", done: "border-l-[#2b7a23]", none: "border-l-[#c9cfd8]" }[tab];
  return (
    <li className={`rounded-2xl border border-l-4 border-[#ece4cf] bg-white p-4 ${edge}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <Link href={`/admin/leads/${r.leadId}`} className="font-semibold outline-none hover:underline focus-visible:ring-2 focus-visible:ring-gold">{r.name ?? "No name"}</Link>
          <span className="ml-2 font-mono text-xs text-gold-ink">{r.leadNo}</span>
          <p className="mt-0.5 text-sm text-[#4b5b75]">
            {r.phone ? r.phone.replace(/(\d{5})(\d{5})/, "$1 $2") : "No phone"}{r.place ? ` · ${r.place}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatusPill status={r.leadStatus} />
          {tab !== "none" && (
            <span className="inline-flex items-center gap-1 rounded-lg bg-[#f1f2f4] px-2 py-0.5 text-xs font-bold text-[#36435a]" title={FU_TYPE_LABEL[r.type]}>
              <Icon className="size-3.5" aria-hidden />{FU_TYPE_LABEL[r.type].replace(" (internal)", "")}
            </span>
          )}
          {tab === "done"
            ? <span className="text-sm font-semibold text-success" title={r.doneAt ?? undefined}>{FU_OUTCOME_LABEL[r.outcome as FuOutcome] ?? "Done"}</span>
            : <span title={r.dueFull} className={`text-sm font-bold ${tab === "overdue" ? "text-danger" : "text-[#1a2b57]"}`}>{tab === "none" ? r.due : `${r.due} · ${r.dueLocal.slice(11)}`}</span>}
        </div>
      </div>
      {r.note && <p className="mt-2 rounded-lg bg-[#faf7ef] px-3 py-1.5 text-sm text-[#36435a]">{r.note}</p>}
      {tab === "done" && (
        <p className="mt-2 text-sm text-[#4b5b75]">
          {r.outcomeNote ? <span className="text-[#1a2b57]">“{r.outcomeNote}” · </span> : null}Done {r.doneAt}{r.doneBy ? ` by ${r.doneBy}` : ""}
        </p>
      )}
      {tab !== "done" && (
        <div className="mt-3">
          {canEdit && tab !== "none"
            ? <FollowUpActions id={r.id} dueLocal={r.dueLocal} type={r.type} leading={<ContactActions id={r.leadId} phone={r.phone} waUrl={r.waHref} size="sm" canLog />} />
            : (
              <div className="flex flex-wrap items-start gap-2">
                <ContactActions id={r.leadId} phone={r.phone} waUrl={r.waHref} size="sm" canLog={canEdit} />
                {canEdit && <AddFollowUp leadId={r.leadId} compact />}
              </div>
            )}
        </div>
      )}
    </li>
  );
}
