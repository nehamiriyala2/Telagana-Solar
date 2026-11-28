"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { DndContext, KeyboardSensor, PointerSensor, useDraggable, useDroppable, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { EyeOff, GripVertical, Loader2 } from "lucide-react";
import { LOST_LABEL, LOST_REASONS, inr, kwLabel, type LeadStatus } from "@/lib/admin/labels";
import { Toggle } from "@/components/admin/leads/lead-filters";
import { patchLead } from "@/components/admin/leads/status-control";
import { WonForm, type WonValues } from "@/components/admin/leads/won-form";
import { useStages } from "@/components/admin/stages-context";
import { toast } from "@/components/admin/toast";

export type PipeCard = {
  id: number; leadNo: string; name: string | null; status: LeadStatus; kw: number | null; district: string | null; bill: number | null;
  owner: string | null; ownerInactive: boolean; days: number; amount: number | null; subsidy: boolean | null;
};
export type PipeColumn = { key: LeadStatus; hidden: boolean; shown: number };
type Totals = Record<LeadStatus, { count: number; kw: number }>;
type Pending = { card: PipeCard; to: "won" | "lost" } | null;

export function PipelineBoard({ cards: initial, totals: initialTotals, columns, canEdit }: { cards: PipeCard[]; totals: Totals; columns: PipeColumn[]; canEdit: boolean }) {
  const router = useRouter();
  const st = useStages();
  const [cards, setCards] = useState(initial);
  const [totals, setTotals] = useState(initialTotals);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [pending, setPending] = useState<Pending>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => { setCards(initial); setTotals(initialTotals); }, [initial, initialTotals]);
  useEffect(() => { if (pending) dialog.current?.showModal(); }, [pending]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }), useSensor(KeyboardSensor));
  const columnKeys = columns.map((c) => c.key);

  async function move(card: PipeCard, to: LeadStatus, extra?: { lost_reason?: string; won?: WonValues }) {
    if (card.status === to) return;
    if (to === "lost" && !extra?.lost_reason) { setPending({ card, to }); return; }
    if (to === "won" && !extra?.won) { setPending({ card, to }); return; }
    const from = card.status;
    const kw = card.kw ?? 0;
    const newKw = to === "won" && extra?.won ? extra.won.final_kw : kw;
    // Optimistic: move the card and the column totals, undo on failure.
    setCards((cs) => cs.map((c) => (c.id === card.id ? { ...c, status: to, days: 0, kw: newKw } : c)));
    setTotals((t) => ({ ...t, [from]: { count: t[from].count - 1, kw: t[from].kw - kw }, [to]: { count: t[to].count + 1, kw: t[to].kw + newKw } }));
    setBusyId(card.id);
    const body = to === "lost" ? { status: to, lost_reason: extra?.lost_reason } : to === "won" ? { status: to, ...extra?.won } : { status: to };
    const r = await patchLead(card.id, body);
    setBusyId(null);
    if (!r.ok) {
      setCards((cs) => cs.map((c) => (c.id === card.id ? card : c)));
      setTotals((t) => ({ ...t, [from]: { count: t[from].count + 1, kw: t[from].kw + kw }, [to]: { count: t[to].count - 1, kw: t[to].kw - newKw } }));
      toast(r.message ?? "Couldn’t move the lead.", "err");
      return;
    }
    toast(`${card.name ?? card.leadNo} moved to ${st.label(to)}.`);
    router.refresh();
  }

  function onDragEnd(e: DragEndEvent) {
    const card = cards.find((c) => c.id === e.active.id);
    const to = e.over?.id as LeadStatus | undefined;
    if (!card || !to || !columnKeys.includes(to)) return;
    if (columns.find((c) => c.key === to)?.hidden) { toast(`“${st.label(to)}” is hidden in Settings, so leads can’t be moved into it.`, "err"); return; }
    void move(card, to);
  }

  const close = () => dialog.current?.close();
  return (
    <>
      <DndContext id="pipeline-board" sensors={sensors} onDragEnd={onDragEnd}
        accessibility={{ announcements: {
          onDragStart: ({ active }) => `Picked up ${cards.find((c) => c.id === active.id)?.name ?? "lead"}.`,
          onDragOver: ({ over }) => (over ? `Over ${st.label(String(over.id))}.` : "Not over a column."),
          onDragEnd: ({ over }) => (over ? `Dropped on ${st.label(String(over.id))}.` : "Not moved."),
          onDragCancel: () => "Move cancelled.",
        } }}>
        <div className="space-y-4 md:flex md:gap-4 md:space-y-0 md:overflow-x-auto md:pb-4">
          {columns.map((col) => (
            <Column key={col.key} col={col} totals={totals[col.key]}>
              {cards.filter((c) => c.status === col.key).map((c) => (
                <Card key={c.id} card={c} canEdit={canEdit} busy={busyId === c.id} onMove={(to) => move(c, to)} />
              ))}
            </Column>
          ))}
        </div>
      </DndContext>

      <dialog ref={dialog} aria-labelledby={pending?.to === "won" ? "pipe-won-title" : "lost-title"} onClose={() => setPending(null)}
        className="m-auto w-[min(26rem,calc(100vw-2rem))] rounded-3xl p-6 backdrop:bg-navy/60">
        {pending?.to === "lost" && (
          <LostForm name={pending.card.name ?? pending.card.leadNo} onCancel={close}
            onSave={(reason) => { const c = pending.card; close(); void move(c, "lost", { lost_reason: reason }); }} />
        )}
        {pending?.to === "won" && (
          <WonForm name={pending.card.name ?? pending.card.leadNo} idPrefix="pipe-won" onCancel={close}
            defaults={{ kw: pending.card.kw, amount: pending.card.amount, subsidy: pending.card.subsidy }}
            onSave={(won) => { const c = pending.card; close(); void move(c, "won", { won }); }} />
        )}
      </dialog>
    </>
  );
}

function LostForm({ name, onSave, onCancel }: { name: string; onSave: (r: string) => void; onCancel: () => void }) {
  const [reason, setReason] = useState("");
  return (
    <form onSubmit={(e) => { e.preventDefault(); if (reason) onSave(reason); }}>
      <h2 id="lost-title" className="font-heading text-lg font-bold">Why was {name} lost?</h2>
      <fieldset className="mt-4 space-y-2">
        <legend className="sr-only">Lost reason</legend>
        {LOST_REASONS.map((r) => (
          <label key={r} className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#ece4cf] px-3 py-2.5 has-[:checked]:border-gold has-[:checked]:bg-[#fff8e6]">
            <input type="radio" name="lost-reason" value={r} checked={reason === r} onChange={() => setReason(r)} className="accent-[#f5a800]" />{LOST_LABEL[r]}
          </label>
        ))}
      </fieldset>
      <div className="mt-5 flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="h-10 px-4 font-semibold text-[#4b5b75]">Cancel</button>
        <button type="submit" disabled={!reason} className="h-10 rounded-full bg-navy px-5 font-semibold text-white disabled:opacity-50">Mark lost</button>
      </div>
    </form>
  );
}


function Column({ col, totals, children }: { col: PipeColumn; totals: { count: number; kw: number }; children: React.ReactNode }) {
  const st = useStages();
  const { setNodeRef, isOver } = useDroppable({ id: col.key });
  const label = st.label(col.key);
  const more = totals.count - col.shown;
  return (
    <section ref={setNodeRef} aria-label={`${label}: ${totals.count} leads, ${kwLabel(totals.kw)}`} style={{ borderTopColor: st.bar(col.key) }}
      className={`flex min-h-[8rem] flex-col rounded-2xl border border-t-4 bg-[#f6f2e7] md:w-72 md:shrink-0 ${isOver && !col.hidden ? "border-gold bg-[#fff3d1]" : "border-[#ece4cf]"} ${col.hidden ? "opacity-80" : ""}`}>
      <header className="px-4 pb-2 pt-3">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="flex items-center gap-1.5 font-heading font-bold">
            {label}
            {col.hidden && <EyeOff className="size-3.5 text-[#8a94a6]" aria-label="Hidden stage" />}
          </h2>
          <span className="whitespace-nowrap text-xs font-semibold text-[#4b5b75]">{totals.count} · {kwLabel(Math.round(totals.kw * 10) / 10)}</span>
        </div>
        {col.key === "site_visit" && <p className="text-[0.7rem] text-[#8a94a6]">Internal stage, not shown to customers</p>}
        {col.hidden && <p className="text-[0.7rem] text-[#8a94a6]">Hidden in Settings. Move these leads on.</p>}
      </header>
      <div className="flex-1 space-y-2.5 px-2.5 pb-3 md:max-h-[calc(100dvh-18rem)] md:overflow-y-auto">
        {children}
        {totals.count === 0 && <p className="rounded-xl border border-dashed border-[#e2dccb] px-3 py-6 text-center text-xs text-[#8a94a6]">Drop a lead here</p>}
        {more > 0 && (
          <Link href={`/admin/leads?status=${col.key}`} className="block rounded-xl px-3 py-2 text-center text-xs font-semibold text-[#1a2b57] hover:bg-white">
            +{more} more · open in Leads
          </Link>
        )}
      </div>
    </section>
  );
}

function Card({ card, canEdit, busy, onMove }: { card: PipeCard; canEdit: boolean; busy: boolean; onMove: (to: LeadStatus) => void }) {
  const st = useStages();
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: card.id, disabled: !canEdit || busy });
  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined;
  return (
    <article ref={setNodeRef} style={style}
      className={`relative rounded-xl border border-[#ece4cf] bg-white p-3 shadow-sm ${isDragging ? "z-20 rotate-1 shadow-xl ring-2 ring-gold" : ""} ${card.status === "new" ? "border-l-4 border-l-gold" : ""}`}>
      <div className="flex items-start gap-2">
        {canEdit && (
          <button type="button" {...listeners} {...attributes} aria-label={`Drag ${card.name ?? card.leadNo} to another stage`}
            className="-ml-1 mt-0.5 hidden cursor-grab touch-none rounded-md p-0.5 text-[#a0a8b6] outline-none hover:bg-[#faf7ef] focus-visible:ring-2 focus-visible:ring-gold active:cursor-grabbing md:block">
            <GripVertical className="size-4" aria-hidden />
          </button>
        )}
        <div className="min-w-0 flex-1">
          <Link href={`/admin/leads/${card.id}`} className="block truncate font-semibold outline-none hover:underline focus-visible:ring-2 focus-visible:ring-gold">{card.name ?? "No name"}</Link>
          <p className="font-mono text-[0.7rem] text-gold-ink">{card.leadNo}</p>
        </div>
        {card.owner ? (
          <span title={`${card.owner}${card.ownerInactive ? " (inactive)" : ""}`} className={`grid size-7 shrink-0 place-items-center rounded-full text-xs font-bold ${card.ownerInactive ? "bg-[#e2e5ea] text-[#5b6473]" : "bg-navy text-gold"}`}>
            {card.owner.slice(0, 1).toUpperCase()}<span className="sr-only">Owner {card.owner}</span>
          </span>
        ) : <span title="Unassigned" className="grid size-7 shrink-0 place-items-center rounded-full border border-dashed border-[#c9cfd8] text-xs text-[#a0a8b6]">?<span className="sr-only">Unassigned</span></span>}
      </div>
      <dl className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-[#4b5b75]">
        {card.kw !== null && <div><dt className="sr-only">Size</dt><dd className="font-semibold text-navy">{kwLabel(card.kw)}</dd></div>}
        {card.status === "won" && card.amount !== null ? <div><dt className="sr-only">Final amount</dt><dd className="font-semibold text-success">{inr(card.amount)}</dd></div>
          : card.bill !== null && <div><dt className="sr-only">Bill</dt><dd>{inr(card.bill)}/mo</dd></div>}
        {card.district && <div><dt className="sr-only">District</dt><dd>{card.district}</dd></div>}
      </dl>
      <div className="mt-2 flex items-center justify-between gap-2">
        <span className="text-[0.7rem] text-[#8a94a6]">{card.days === 0 ? "Moved today" : `${card.days}d in stage`}</span>
        {busy ? <Loader2 className="size-4 animate-spin text-gold-ink" aria-label="Saving" /> : canEdit && (
          <label className="text-xs">
            <span className="sr-only">Move {card.name ?? card.leadNo} to</span>
            <select value="" onChange={(e) => e.target.value && onMove(e.target.value as LeadStatus)}
              className="h-7 rounded-lg border border-[#e2dccb] bg-white px-1.5 text-xs font-semibold text-[#1a2b57] outline-none focus:border-gold focus:ring-2 focus:ring-gold/30">
              <option value="">Move to…</option>
              {st.selectable.filter((s) => s.key !== card.status).map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
            </select>
          </label>
        )}
      </div>
    </article>
  );
}

/** Owner + district filters and the test-data switch, kept in the URL so views can be shared. */
export function PipelineFilters({ districts, owners, canPickOwner, staffId }: {
  districts: { slug: string; name_en: string }[]; owners: { id: number; name: string; active: number }[]; canPickOwner: boolean; staffId: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [pending, start] = useTransition();
  const go = (changes: Record<string, string | null>) => {
    const p = new URLSearchParams(sp.toString());
    p.delete("mine");
    for (const [k, v] of Object.entries(changes)) { if (v) p.set(k, v); else p.delete(k); }
    start(() => router.push(`${pathname}${p.size ? `?${p}` : ""}`));
  };
  const owner = sp.get("owner") ?? (sp.get("mine") === "1" ? "me" : "");
  const sel = "h-10 rounded-xl border border-[#e2dccb] bg-white px-3 text-sm font-semibold text-[#1a2b57] outline-none focus:border-gold focus:ring-4 focus:ring-gold/20";
  return (
    <div className="mb-5 flex flex-wrap items-center gap-3 text-sm">
      {canPickOwner ? (
        <label className="flex items-center gap-2"><span className="font-semibold text-[#4b5b75]">Owner</span>
          <select value={owner} onChange={(e) => go({ owner: e.target.value || null })} className={sel}>
            <option value="">Everyone</option>
            <option value="me">Mine</option>
            <option value="none">Unassigned</option>
            {owners.filter((o) => o.id !== staffId).map((o) => <option key={o.id} value={o.id}>{o.name}{o.active ? "" : " (inactive)"}</option>)}
          </select>
        </label>
      ) : <span className="rounded-xl bg-white px-3 py-2 font-semibold text-[#1a2b57] ring-1 ring-[#ece4cf]">Your leads</span>}
      <label className="flex items-center gap-2"><span className="font-semibold text-[#4b5b75]">District</span>
        <select value={sp.get("district") ?? ""} onChange={(e) => go({ district: e.target.value || null })} className={sel}>
          <option value="">All districts</option>
          {districts.map((d) => <option key={d.slug} value={d.slug}>{d.name_en}</option>)}
        </select>
      </label>
      <Toggle label="Include test data" on={sp.get("test") === "1"} onChange={(v) => go({ test: v ? "1" : null })} />
      {pending && <Loader2 className="size-5 animate-spin text-gold-ink" aria-label="Loading" />}
    </div>
  );
}

/** Everyone / Mine + test data, synced to the URL. */
export function BoardToggles() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [pending, start] = useTransition();
  const go = (k: string, v: boolean) => {
    const p = new URLSearchParams(sp.toString());
    if (v) p.set(k, "1"); else p.delete(k);
    start(() => router.push(`${pathname}${p.size ? `?${p}` : ""}`));
  };
  const mine = sp.get("mine") === "1";
  return (
    <div className="flex flex-wrap items-center gap-4 text-sm">
      <div role="group" aria-label="Whose leads" className="flex gap-1 rounded-2xl bg-white p-1 ring-1 ring-[#ece4cf]">
        {([[false, "Everyone"], [true, "Mine"]] as const).map(([v, l]) => (
          <button key={l} type="button" aria-pressed={mine === v} onClick={() => go("mine", v)}
            className={`rounded-xl px-4 py-1.5 font-semibold outline-none focus-visible:ring-2 focus-visible:ring-gold ${mine === v ? "bg-navy text-white" : "text-[#4b5b75] hover:bg-[#faf7ef]"}`}>{l}</button>
        ))}
      </div>
      <Toggle label="Include test data" on={sp.get("test") === "1"} onChange={(v) => go("test", v)} />
      {pending && <Loader2 className="size-5 animate-spin text-gold-ink" aria-label="Loading" />}
    </div>
  );
}
