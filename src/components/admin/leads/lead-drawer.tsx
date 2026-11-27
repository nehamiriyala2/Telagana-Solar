"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { BellRing, ExternalLink, Loader2, MessageSquare, Phone, RefreshCw, TriangleAlert, X, Zap } from "lucide-react";
import { useStages } from "@/components/admin/stages-context";
import { StatusPill } from "@/components/admin/lead-bits";
import { StatusControl } from "@/components/admin/leads/status-control";
import { ContactActions } from "@/components/admin/leads/contact-actions";
import { toast } from "@/components/admin/toast";
import { AddFollowUp } from "@/components/admin/follow-up-ui";

type Kind = "status" | "call" | "note" | "followup" | "other";
type Data = {
  lead: {
    id: number; leadNo: string; name: string | null; status: string; lostReason: string | null; phone: string | null; altPhone: string | null;
    email: string | null; wa: string | null; district: string | null; districtTe: string | null; area: string | null; address: string | null;
    use: string | null; bill: string | null; roofArea: number | null; kw: string | null; schemes: string[]; source: string | null;
    owner: string | null; received: string; nextFollowUp: string | null; isTest: boolean; deleted: boolean;
    won: { kw: number | null; amount: number | null; subsidy: boolean | null };
  };
  duplicates: { id: number; leadNo: string; name: string | null; status: string; received: string }[];
  timeline: { key: string; when: string; who: string; kind: Kind; text: string; body: string | null }[];
  canEdit: boolean;
};

const ICON: Record<Kind, { Icon: typeof Zap; tone: string }> = {
  status: { Icon: Zap, tone: "bg-[#fff3d1] text-[#8a5a00]" },
  call: { Icon: Phone, tone: "bg-[#e8f0fe] text-[#1a4fa0]" },
  note: { Icon: MessageSquare, tone: "bg-[#f1f2f4] text-[#4b5b75]" },
  followup: { Icon: BellRing, tone: "bg-[#e7f5e4] text-[#2b7a23]" },
  other: { Icon: RefreshCw, tone: "bg-[#f1f2f4] text-[#5b6473]" },
};

/** Slide-over quick view: key details, Call/WhatsApp, status, quick note and the full timeline. */
export function LeadDrawer({ id, fullHref, onClose }: { id: number | null; fullHref: (id: number) => string; onClose: () => void }) {
  const st = useStages();
  const ref = useRef<HTMLDialogElement>(null);
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async (leadId: number, quiet = false) => {
    if (!quiet) { setLoading(true); setError(null); }
    try {
      const res = await fetch(`/api/admin/leads/${leadId}/timeline`, { cache: "no-store" });
      if (!res.ok) throw new Error(res.status === 404 ? "This lead was not found, or it isn’t assigned to you." : "Couldn’t load this lead. Try again.");
      setData(await res.json());
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (id) { setData(null); setNote(""); void load(id); if (!d.open) d.showModal(); }
    else if (d.open) d.close();
  }, [id, load]);

  async function addNote(e: React.FormEvent) {
    e.preventDefault();
    if (!id || !note.trim()) return;
    setSaving(true);
    const res = await fetch(`/api/admin/leads/${id}/notes`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ body: note.trim() }) }).catch(() => null);
    setSaving(false);
    if (res?.ok) { setNote(""); toast("Note added."); void load(id, true); return; }
    const d = await res?.json().catch(() => ({}));
    toast(d?.message ?? d?.issues?.[0]?.message ?? "Couldn’t add the note.", "err");
  }

  const l = data?.lead;
  return (
    <dialog ref={ref} onClose={onClose} aria-labelledby="ld-title" onClick={(e) => { if (e.target === ref.current) ref.current?.close(); }}
      className="fixed inset-y-0 left-auto right-0 m-0 h-full max-h-none w-full max-w-xl bg-white p-0 shadow-[0_0_60px_-10px_rgb(7_23_63/0.5)] backdrop:bg-[#07173f]/40">
      <div className="flex h-full flex-col">
        <header className="flex items-start justify-between gap-3 border-b border-[#f1ece0] px-5 py-4">
          <div className="min-w-0">
            <p className="font-mono text-sm font-semibold text-gold-ink">{l?.leadNo ?? (id ? `TS-${String(id).padStart(4, "0")}` : "")}</p>
            <h2 id="ld-title" className="truncate font-heading text-xl font-bold">{l ? l.name ?? "No name given" : "Lead"}</h2>
            {l && (
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <StatusPill status={l.status} />
                {l.lostReason && <span className="text-xs text-[#4b5b75]">Reason: {l.lostReason}</span>}
                {l.isTest && <span className="rounded-md bg-[#f1f2f4] px-1.5 py-0.5 text-[0.7rem] font-bold text-[#5b6473]">Test</span>}
              </div>
            )}
          </div>
          <div className="flex items-center gap-1">
            {id && <Link href={fullHref(id)} className="inline-flex h-9 items-center gap-1.5 rounded-xl px-3 text-sm font-semibold text-[#1a2b57] hover:bg-[#faf7ef]"><ExternalLink className="size-4" aria-hidden />Full page</Link>}
            <button type="button" onClick={() => ref.current?.close()} aria-label="Close" className="grid size-9 place-items-center rounded-full hover:bg-[#faf7ef]"><X className="size-5" aria-hidden /></button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          {loading && !data && (
            <div role="status" aria-label="Loading lead" className="animate-pulse space-y-3">
              <div className="h-11 w-48 rounded-full bg-[#f4efe2]" /><div className="h-32 rounded-2xl bg-[#f4efe2]" /><div className="h-48 rounded-2xl bg-[#f4efe2]" />
            </div>
          )}
          {error && (
            <div role="alert" className="rounded-2xl border border-[#f3c9c5] bg-[#fdecea] p-4 text-sm text-danger">
              {error}
              {id && <button type="button" onClick={() => load(id)} className="ml-2 font-semibold underline">Retry</button>}
            </div>
          )}

          {l && data && (
            <div className="space-y-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <ContactActions id={l.id} phone={l.phone} waUrl={l.wa} canLog={data.canEdit} onLogged={() => load(l.id, true)} />
                {data.canEdit && <StatusControl key={`${l.id}-${l.status}`} id={l.id} status={l.status} lostReason={null} idPrefix="drawer" name={l.name ?? l.leadNo} won={l.won} onSaved={() => load(l.id, true)} />}
              </div>

              {data.duplicates.length > 0 && (
                <div className="rounded-2xl border border-[#f5d27a] bg-[#fff8e6] p-3 text-sm">
                  <p className="flex items-center gap-2 font-bold text-[#8a5a00]"><TriangleAlert className="size-4" aria-hidden />Same phone number as:</p>
                  <ul className="mt-1.5 space-y-0.5">
                    {data.duplicates.map((d) => <li key={d.id}><Link href={fullHref(d.id)} className="font-semibold text-navy hover:underline">{d.leadNo}</Link> · {d.name ?? "No name"} · {st.label(d.status)} · {d.received}</li>)}
                  </ul>
                </div>
              )}

              <dl className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-2xl border border-[#ece4cf] p-4 text-sm">
                {([
                  ["Phone", l.phone?.replace(/(\d{5})(\d{5})/, "$1 $2")], ["Alternate", l.altPhone?.replace(/(\d{5})(\d{5})/, "$1 $2")],
                  ["Email", l.email], ["District", l.district ? `${l.district} · ${l.districtTe}` : null],
                  ["Area", l.area], ["Address", l.address], ["Property", l.use], ["Monthly bill", l.bill],
                  ["Roof area", l.roofArea ? `${l.roofArea} sq ft` : null], ["Plan shown", l.kw],
                  ["Schemes", l.schemes.join(", ") || null], ["Source", l.source], ["Owner", l.owner ?? "Unassigned"],
                  ["Received", l.received], ["Next follow-up", l.nextFollowUp],
                ] as [string, string | null | undefined][]).map(([k, v]) => (
                  <div key={k} className="min-w-0">
                    <dt className="text-xs text-[#8a94a6]">{k}</dt>
                    <dd className="break-words font-medium">{v || <span className="text-[#a0a8b6]">-</span>}</dd>
                  </div>
                ))}
              </dl>

              {data.canEdit && (
                <div>
                  <p className="mb-2 text-sm font-semibold text-[#1a2b57]">Next follow-up: <span className="font-normal">{l.nextFollowUp ?? "none booked"}</span></p>
                  <AddFollowUp leadId={l.id} compact onSaved={() => load(l.id, true)} />
                </div>
              )}

              {data.canEdit && (
                <form onSubmit={addNote} className="space-y-2">
                  <label htmlFor="ld-note" className="block text-sm font-semibold text-[#1a2b57]">Add a note</label>
                  <textarea id="ld-note" value={note} onChange={(e) => setNote(e.target.value)} rows={2} maxLength={2000} placeholder="What did the customer say?"
                    className="w-full rounded-xl border border-[#e2dccb] px-3 py-2 outline-none focus:border-gold focus:ring-4 focus:ring-gold/20" />
                  <button type="submit" disabled={saving || !note.trim()} className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-navy px-3 text-sm font-semibold text-white disabled:opacity-50">
                    {saving && <Loader2 className="size-4 animate-spin" aria-hidden />}Save note
                  </button>
                </form>
              )}

              <section aria-labelledby="ld-timeline">
                <h3 id="ld-timeline" className="font-heading text-base font-bold">Timeline</h3>
                {data.timeline.length ? (
                  <ol className="mt-3 space-y-3">
                    {data.timeline.map((t) => {
                      const { Icon, tone } = ICON[t.kind];
                      return (
                        <li key={t.key} className="flex gap-3">
                          <span className={`mt-0.5 grid size-7 shrink-0 place-items-center rounded-full ${tone}`}><Icon className="size-3.5" aria-hidden /></span>
                          <div className="min-w-0">
                            <p className="text-[0.92rem] font-medium">{t.text}</p>
                            {t.body && <p className="mt-0.5 whitespace-pre-wrap break-words text-sm text-[#36435a]">{t.body}</p>}
                            <p className="text-xs text-[#8a94a6]">{t.when} · {t.who}</p>
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                ) : <p className="mt-2 text-sm text-[#4b5b75]">Nothing yet.</p>}
              </section>
            </div>
          )}
        </div>
      </div>
    </dialog>
  );
}
