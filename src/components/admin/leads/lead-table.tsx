"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Columns3, Loader2, Plus, X } from "lucide-react";
import { LOST_LABEL, LOST_REASONS, ROOF_LABEL, USE_LABEL, inr, kwLabel } from "@/lib/admin/labels";
import { useStages } from "@/components/admin/stages-context";
import type { LeadDto } from "@/lib/admin/lead-dto";
import { LeadBadges, StatusPill, SystemChip } from "@/components/admin/lead-bits";
import { ContactActions } from "@/components/admin/leads/contact-actions";
import { LeadDrawer } from "@/components/admin/leads/lead-drawer";
import { toast } from "@/components/admin/toast";

type Col = { key: string; label: string; render: (l: LeadDto) => React.ReactNode; className?: string };

const dash = <span className="text-[#a0a8b6]">-</span>;
const txt = (v: string | number | null | undefined) => (v === null || v === undefined || v === "" ? dash : v);

/** Every website field can be shown; the default set matches the brief. */
const COLUMNS: Col[] = [
  { key: "received", label: "Received", render: (l) => <span title={l.receivedFull} className="whitespace-nowrap">{l.received}</span> },
  { key: "leadNo", label: "Lead no", render: (l) => <span className="whitespace-nowrap font-mono text-xs">{l.leadNo}</span> },
  { key: "name", label: "Name", render: () => null },
  { key: "phone", label: "Phone", render: (l) => l.phone ? <span className="whitespace-nowrap font-medium text-[#1a2b57]">{l.phone.replace(/(\d{5})(\d{5})/, "$1 $2")}</span> : dash },
  { key: "district", label: "District", render: (l) => l.district ? <span title={l.districtTe ?? undefined}>{l.district}{l.discom && <span title={l.discom} className="ml-1.5 rounded bg-[#f1f2f4] px-1 py-px text-[0.65rem] font-bold text-[#5b6473]">{l.discom.replace("TG", "").replace("PDCL", "")}</span>}</span> : dash },
  { key: "altPhone", label: "Alt. phone", render: (l) => l.altPhone ? <span className="whitespace-nowrap">{l.altPhone.replace(/(\d{5})(\d{5})/, "$1 $2")}</span> : dash },
  { key: "email", label: "Email", render: (l) => (l.email ? <a href={`mailto:${l.email}`} className="text-[#1a2b57] hover:underline">{l.email}</a> : dash) },
  { key: "area", label: "Area", render: (l) => txt(l.area) },
  { key: "place", label: "Place", render: (l) => txt(l.place) },
  { key: "use", label: "Type", render: (l) => txt(l.use ? USE_LABEL[l.use] ?? l.use : null) },
  { key: "bill", label: "Bill", render: (l) => <span className="whitespace-nowrap">{l.bill === null ? dash : inr(l.bill)}</span> },
  { key: "units", label: "Units", render: (l) => txt(l.units) },
  { key: "powerCuts", label: "Power cuts", render: (l) => (l.powerCuts === null ? dash : l.powerCuts ? "Yes" : "No") },
  { key: "roof", label: "Roof", render: (l) => txt(l.roof ? ROOF_LABEL[l.roof] ?? l.roof : null) },
  { key: "plan", label: "Plan", render: (l) => (l.kw === null && !l.system ? dash : <span className="flex items-center gap-1.5 whitespace-nowrap">{l.kw !== null && kwLabel(l.kw)}<SystemChip system={l.system} /></span>) },
  { key: "monthlySaving", label: "Saving shown", render: (l) => (l.monthlySaving === null ? dash : <span className="whitespace-nowrap">{inr(l.monthlySaving)}/mo</span>) },
  { key: "schemes", label: "Schemes", render: (l) => (l.schemes.length ? <span className="flex flex-wrap gap-1">{l.schemes.map((s) => <span key={s} className="rounded bg-[#e7f5e4] px-1.5 py-px text-[0.7rem] font-semibold text-[#2b7a23]">{s}</span>)}</span> : dash) },
  { key: "message", label: "Message", render: (l) => (l.message ? <span className="line-clamp-2 max-w-[16rem]" title={l.message}>{l.message}</span> : dash) },
  { key: "lang", label: "Lang", render: (l) => (l.lang === "te" ? "తె" : l.lang === "en" ? "EN" : dash) },
  { key: "page", label: "Page", render: (l) => (l.page ? <span className="font-mono text-xs">{l.page}</span> : dash) },
  { key: "source", label: "Source", render: (l) => <span>{l.source}</span> },
  { key: "status", label: "Status", render: (l) => <StatusPill status={l.status} /> },
  { key: "owner", label: "Owner", render: (l) => (l.owner ? <span className="whitespace-nowrap">{l.owner}{l.ownerInactive && <span className="text-[#8a94a6]"> (inactive)</span>}</span> : <span className="text-[#8a94a6]">Unassigned</span>) },
];
const DEFAULT_COLS = ["received", "name", "phone", "district", "area", "use", "bill", "plan", "source", "status", "owner"];
const colsKey = (staffId: number) => `ts-admin-lead-cols:${staffId}`;

export function LeadTable({ rows, staffId, qs, tab, page, total, pageSize, canEdit, canAssign, owners }: {
  rows: LeadDto[]; staffId: number; qs: string; tab: "all" | "nocontact"; page: number; total: number; pageSize: number; canEdit: boolean;
  canAssign: boolean; owners: { id: number; name: string; active: number }[];
}) {
  const [visible, setVisible] = useState<string[]>(DEFAULT_COLS);
  const [menu, setMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [drawer, setDrawer] = useState<number | null>(null);

  // A new page of results clears the selection.
  useEffect(() => setSelected(new Set()), [rows]);
  const toggle = (id: number) => setSelected((cur) => { const n = new Set(cur); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const allOnPage = rows.length > 0 && rows.every((r) => selected.has(r.id));
  const toggleAll = () => setSelected(allOnPage ? new Set() : new Set(rows.map((r) => r.id)));
  /** Plain click opens the quick view; Ctrl/Cmd/middle click still opens the full page. */
  const openQuick = (e: React.MouseEvent, id: number) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    setDrawer(id);
  };

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(colsKey(staffId)) ?? "null");
      if (Array.isArray(saved) && saved.every((k) => typeof k === "string")) setVisible(saved.filter((k) => COLUMNS.some((c) => c.key === k)));
    } catch { /* ignore */ }
  }, [staffId]);
  useEffect(() => {
    if (!menu) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !menuRef.current?.contains(e.target as Node)) setMenu(false);
    };
    window.addEventListener("mousedown", close); window.addEventListener("keydown", close);
    return () => { window.removeEventListener("mousedown", close); window.removeEventListener("keydown", close); };
  }, [menu]);

  const toggleCol = (k: string) => {
    const next = visible.includes(k) ? visible.filter((v) => v !== k) : COLUMNS.map((c) => c.key).filter((c) => c === k || visible.includes(c));
    if (!next.includes("name")) next.unshift("name");
    setVisible(next);
    try { localStorage.setItem(colsKey(staffId), JSON.stringify(next)); } catch { /* ignore */ }
  };
  const cols = COLUMNS.filter((c) => visible.includes(c.key));
  const href = (id: number) => `/admin/leads/${id}${qs ? `?${qs}` : ""}`;
  const pageHref = (p: number) => {
    const params = new URLSearchParams(qs);
    if (p > 1) params.set("page", String(p)); else params.delete("page");
    return `/admin/leads${params.size ? `?${params}` : ""}`;
  };
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const first = total ? (page - 1) * pageSize + 1 : 0;

  const nameCell = (l: LeadDto) => (
    <div className="min-w-[8.5rem]">
      <Link href={href(l.id)} onClick={(e) => openQuick(e, l.id)} className="font-semibold text-navy outline-none hover:underline focus-visible:ring-2 focus-visible:ring-gold">
        {l.name ?? (l.anonymized ? "Anonymized lead" : <span className="italic text-[#8a94a6]">No name</span>)}
      </Link>
      <div className="mt-1 flex flex-wrap gap-1"><LeadBadges l={l} /></div>
    </div>
  );

  if (!rows.length) {
    return (
      <div className="rounded-2xl border border-dashed border-[#e2dccb] bg-white px-6 py-16 text-center">
        <p className="font-heading text-lg font-bold">No leads match</p>
        <p className="mt-1 text-[#4b5b75]">{tab === "nocontact" ? "Calculator results and WhatsApp taps without a phone number show here." : "Try removing a filter, or turn on “Include test data”."}</p>
      </div>
    );
  }

  const check = (l: LeadDto) => canEdit && (
    <input type="checkbox" checked={selected.has(l.id)} onChange={() => toggle(l.id)} aria-label={`Select ${l.leadNo}`} className="size-4 accent-[#f5a800]" />
  );

  return (
    <div className="space-y-3">
      <LeadDrawer id={drawer} fullHref={href} onClose={() => setDrawer(null)} />
      {canEdit && selected.size > 0 && (
        <BulkBar ids={[...selected]} canAssign={canAssign} owners={owners} staffId={staffId} onDone={() => setSelected(new Set())} />
      )}
      <div className="flex items-center justify-between gap-3" ref={menuRef}>
        {canEdit ? (
          <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-[#1a2b57] md:invisible">
            <input type="checkbox" checked={allOnPage} onChange={toggleAll} className="size-4 accent-[#f5a800]" />Select all on this page
          </label>
        ) : <span />}
        <div className="relative">
          <button type="button" onClick={() => setMenu((m) => !m)} aria-expanded={menu} aria-controls="lead-cols-menu"
            className="inline-flex h-9 items-center gap-2 rounded-xl border border-[#e2dccb] bg-white px-3 text-sm font-semibold text-[#1a2b57] outline-none hover:bg-[#faf7ef] focus-visible:ring-2 focus-visible:ring-gold">
            <Columns3 className="size-4" aria-hidden />Columns
          </button>
          {menu && (
            <div id="lead-cols-menu" className="absolute right-0 z-20 mt-2 max-h-80 w-56 overflow-y-auto rounded-2xl border border-[#ece4cf] bg-white p-2 shadow-[0_24px_48px_-24px_rgb(7_23_63/0.45)]">
              {COLUMNS.map((c) => (
                <label key={c.key} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-[#faf7ef]">
                  <input type="checkbox" checked={visible.includes(c.key)} disabled={c.key === "name"} onChange={() => toggleCol(c.key)} className="size-4 accent-[#f5a800]" />
                  {c.label}
                </label>
              ))}
              <button type="button" onClick={() => { setVisible(DEFAULT_COLS); try { localStorage.removeItem(colsKey(staffId)); } catch { /* ignore */ } }}
                className="mt-1 w-full rounded-lg px-2 py-1.5 text-left text-sm font-semibold text-gold-ink hover:bg-[#faf7ef]">Reset to default</button>
            </div>
          )}
        </div>
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-x-auto rounded-2xl border border-[#ece4cf] bg-white md:block">
        <table className="w-full text-left text-[0.84rem]">
          <thead className="bg-[#faf7ef] text-xs uppercase tracking-wide text-[#4b5b75]">
            <tr>
              {canEdit && (
                <th scope="col" className="w-10 py-3 pl-4">
                  <input type="checkbox" checked={allOnPage} onChange={toggleAll} aria-label="Select all leads on this page" className="size-4 accent-[#f5a800]" />
                </th>
              )}
              {cols.map((c) => <th key={c.key} scope="col" className={`whitespace-nowrap px-2.5 py-3 font-semibold ${canEdit ? "" : "first:pl-4"}`}>{c.label}</th>)}
              {tab === "nocontact" && canEdit && <th scope="col" className="px-3 py-3"><span className="sr-only">Actions</span></th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((l) => (
              <tr key={l.id} className={`border-t border-[#f1ece0] align-top transition-colors hover:bg-[#fffbf2] ${selected.has(l.id) ? "bg-[#fff8e6]" : ""} ${l.status === "new" ? "shadow-[inset_4px_0_0_#f5a800]" : ""} ${l.deleted ? "opacity-60" : ""}`}>
                {canEdit && <td className="py-3 pl-4 pt-3.5">{check(l)}</td>}
                {cols.map((c) => (
                  <td key={c.key} className={`px-2.5 py-3 ${canEdit ? "" : "first:pl-4"}`}>
                    {c.key === "name" ? nameCell(l) : c.render(l)}
                    {c.key === "phone" && l.phone && <div className="mt-1.5"><ContactActions id={l.id} phone={l.phone} size="sm" canLog={canEdit && !l.deleted} /></div>}
                  </td>
                ))}
                {tab === "nocontact" && canEdit && <td className="px-3 py-3"><AddPhone id={l.id} /></td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <ul className="space-y-3 md:hidden">
        {rows.map((l) => (
          <li key={l.id} className={`rounded-2xl border border-[#ece4cf] bg-white p-4 ${l.status === "new" ? "border-l-4 border-l-gold" : ""} ${l.deleted ? "opacity-60" : ""}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-start gap-3">{canEdit && <span className="pt-0.5">{check(l)}</span>}{nameCell(l)}</div>
              <StatusPill status={l.status} />
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 text-sm">
              {cols.filter((c) => !["name", "status"].includes(c.key)).map((c) => (
                <div key={c.key} className="min-w-0">
                  <dt className="text-xs text-[#8a94a6]">{c.label}</dt>
                  <dd className="truncate">{c.render(l)}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-3 flex gap-2">
              <ContactActions id={l.id} phone={l.phone} size="sm" canLog={canEdit && !l.deleted} />
              {tab === "nocontact" && canEdit && <AddPhone id={l.id} />}
            </div>
          </li>
        ))}
      </ul>

      <nav aria-label="Pages" className="flex flex-wrap items-center justify-between gap-3 pt-2 text-sm">
        <span className="text-[#4b5b75]">Showing {first.toLocaleString("en-IN")}–{Math.min(page * pageSize, total).toLocaleString("en-IN")} of {total.toLocaleString("en-IN")}</span>
        <span className="flex items-center gap-2">
          {page > 1 ? <Link href={pageHref(page - 1)} className="inline-flex h-9 items-center gap-1 rounded-xl border border-[#e2dccb] bg-white px-3 font-semibold hover:bg-[#faf7ef]"><ChevronLeft className="size-4" aria-hidden />Previous</Link> : null}
          <span className="px-2 font-semibold">Page {page} of {pages}</span>
          {page < pages ? <Link href={pageHref(page + 1)} className="inline-flex h-9 items-center gap-1 rounded-xl border border-[#e2dccb] bg-white px-3 font-semibold hover:bg-[#faf7ef]">Next<ChevronRight className="size-4" aria-hidden /></Link> : null}
        </span>
      </nav>
    </div>
  );
}

/** Calculator lead with no contact: add a 10-digit phone (validated) → moves to All leads. */
function AddPhone({ id }: { id: number }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const digits = phone.replace(/\D/g, "").replace(/^(91|0)(?=\d{10}$)/, "");
    if (!/^[6-9]\d{9}$/.test(digits)) { setErr("Enter a 10-digit mobile number."); return; }
    setBusy(true); setErr(null);
    const res = await fetch(`/api/admin/leads/${id}/add-phone`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phone: digits }) }).catch(() => null);
    setBusy(false);
    if (res?.ok) { setOpen(false); router.refresh(); return; }
    const data = await res?.json().catch(() => ({}));
    setErr(data?.message ?? "Could not save. Try again.");
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-xl bg-gold px-3 text-sm font-semibold text-navy outline-none hover:brightness-105 focus-visible:ring-2 focus-visible:ring-navy">
        <Plus className="size-4" aria-hidden />Add phone number
      </button>
    );
  }
  return (
    <form onSubmit={save} className="flex flex-wrap items-start gap-2">
      <div>
        <label htmlFor={`ap-${id}`} className="sr-only">Phone number</label>
        <input id={`ap-${id}`} autoFocus inputMode="numeric" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="10-digit mobile"
          aria-invalid={err ? true : undefined} aria-describedby={err ? `ap-${id}-err` : undefined}
          className="h-9 w-40 rounded-xl border border-[#e2dccb] px-3 text-sm outline-none focus:border-gold focus:ring-4 focus:ring-gold/20" />
        {err && <p id={`ap-${id}-err`} role="alert" className="mt-1 text-xs text-danger">{err}</p>}
      </div>
      <button type="submit" disabled={busy} className="inline-flex h-9 items-center gap-1 rounded-xl bg-navy px-3 text-sm font-semibold text-white disabled:opacity-60">
        {busy && <Loader2 className="size-4 animate-spin" aria-hidden />}Save
      </button>
      <button type="button" onClick={() => { setOpen(false); setErr(null); }} className="h-9 px-2 text-sm font-semibold text-[#4b5b75]">Cancel</button>
    </form>
  );
}

/** Shown while leads are ticked: change status for all, or (admins) assign them all to one person. */
function BulkBar({ ids, canAssign, owners, staffId, onDone }: {
  ids: number[]; canAssign: boolean; owners: { id: number; name: string; active: number }[]; staffId: number; onDone: () => void;
}) {
  const router = useRouter();
  const st = useStages();
  const [mode, setMode] = useState<"status" | "assign">("status");
  const [status, setStatus] = useState("");
  const [reason, setReason] = useState("");
  const [owner, setOwner] = useState("");
  const [busy, setBusy] = useState(false);

  const ready = mode === "status" ? Boolean(status) && (status !== "lost" || Boolean(reason)) : owner !== "";
  async function apply() {
    if (!ready) return;
    const n = ids.length;
    const plural = n === 1 ? "" : "s";
    const what = mode === "status"
      ? `Change ${n} lead${plural} to “${st.label(status)}”?`
      : `Assign ${n} lead${plural} to ${owner === "none" ? "nobody (unassign)" : owners.find((o) => String(o.id) === owner)?.name}?`;
    if (!window.confirm(what)) return;
    setBusy(true);
    const body = mode === "status"
      ? { action: "status", ids, status, lost_reason: status === "lost" ? reason : null }
      : { action: "assign", ids, assigned_to: owner === "none" ? null : Number(owner) };
    try {
      const res = await fetch("/api/admin/leads/bulk", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) { toast(d.message ?? d.issues?.[0]?.message ?? "Couldn’t update the leads.", "err"); return; }
      const parts = [`${d.updated} updated`];
      if (d.unchanged) parts.push(`${d.unchanged} already set`);
      if (d.failed?.length) parts.push(`${d.failed.length} failed`);
      toast(`${parts.join(", ")}.`, d.failed?.length ? "err" : "ok");
      onDone();
      router.refresh();
    } catch {
      toast("No connection. Try again.", "err");
    } finally {
      setBusy(false);
    }
  }

  const sel = "h-10 rounded-xl border border-white/25 bg-white px-3 text-sm text-navy outline-none focus:ring-4 focus:ring-gold/40";
  return (
    <div role="region" aria-label="Bulk actions" className="fixed inset-x-3 bottom-3 z-40 flex flex-wrap items-center gap-2 rounded-2xl bg-navy p-3 text-white shadow-[0_24px_48px_-16px_rgb(7_23_63/0.6)] md:sticky md:inset-auto md:top-3">
      <span className="mr-1 font-bold">{ids.length} selected</span>
      {canAssign && (
        <select value={mode} onChange={(e) => setMode(e.target.value as "status" | "assign")} aria-label="Bulk action" className={sel}>
          <option value="status">Change status</option><option value="assign">Assign to</option>
        </select>
      )}
      {mode === "status" ? (
        <>
          <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="New status" className={sel}>
            <option value="">Pick status…</option>
            {st.selectable.filter((s) => s.key !== "won").map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
          </select>
          {status === "lost" && (
            <select value={reason} onChange={(e) => setReason(e.target.value)} aria-label="Why lost" className={sel}>
              <option value="">Why lost?</option>
              {LOST_REASONS.map((r) => <option key={r} value={r}>{LOST_LABEL[r]}</option>)}
            </select>
          )}
        </>
      ) : (
        <select value={owner} onChange={(e) => setOwner(e.target.value)} aria-label="Assign to" className={sel}>
          <option value="">Pick person…</option>
          <option value="none">Unassigned</option>
          {owners.filter((o) => o.active).map((o) => <option key={o.id} value={o.id}>{o.name}{o.id === staffId ? " (me)" : ""}</option>)}
        </select>
      )}
      <button type="button" onClick={apply} disabled={!ready || busy} className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-gold px-4 text-sm font-bold text-navy disabled:opacity-50">
        {busy && <Loader2 className="size-4 animate-spin" aria-hidden />}Apply
      </button>
      <button type="button" onClick={onDone} aria-label="Clear selection" className="ml-auto grid size-9 place-items-center rounded-full hover:bg-white/10"><X className="size-4" aria-hidden /></button>
    </div>
  );
}
