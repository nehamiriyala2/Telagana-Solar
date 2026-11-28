"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Pencil, Trash2 } from "lucide-react";

type Note = { id: number; body: string; author: string | null; staffId: number | null; at: string; edited: boolean };

async function call(url: string, method: string, body?: unknown) {
  try {
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
    if (res.ok) return null;
    const d = await res.json().catch(() => ({}));
    return d.message ?? d.issues?.[0]?.message ?? "Couldn’t save. Try again.";
  } catch { return "No connection. Try again."; }
}

/** Notes: anyone with edit rights can add; only the author or an admin can edit/delete. */
export function NotesPanel({ leadId, notes, canAdd, staffId, isAdmin }: { leadId: number; notes: Note[]; canAdd: boolean; staffId: number; isAdmin: boolean }) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [editing, setEditing] = useState<{ id: number; body: string } | null>(null);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setBusy(true); setErr(null);
    const m = await call(`/api/admin/leads/${leadId}/notes`, "POST", { body: text });
    setBusy(false);
    if (m) { setErr(m); return; }
    setText(""); router.refresh();
  }
  async function saveEdit() {
    if (!editing) return;
    setBusy(true); setErr(null);
    const m = await call(`/api/admin/leads/${leadId}/notes/${editing.id}`, "PATCH", { body: editing.body });
    setBusy(false);
    if (m) { setErr(m); return; }
    setEditing(null); router.refresh();
  }
  async function remove(id: number) {
    if (!window.confirm("Delete this note?")) return;
    setErr(null);
    const m = await call(`/api/admin/leads/${leadId}/notes/${id}`, "DELETE");
    if (m) setErr(m); else router.refresh();
  }

  return (
    <section className="rounded-2xl border border-[#ece4cf] bg-white p-6 shadow-[0_18px_40px_-34px_rgb(7_23_63/0.45)]" aria-labelledby="notes-title">
      <h2 id="notes-title" className="font-heading text-lg font-bold">Notes</h2>
      {canAdd && (
        <form onSubmit={add} className="mt-3">
          <label htmlFor="new-note" className="sr-only">Add a note</label>
          <textarea id="new-note" value={text} onChange={(e) => setText(e.target.value)} rows={3} maxLength={2000} placeholder="What happened on the call? Next steps?"
            className="w-full rounded-xl border border-[#e2dccb] p-3 text-sm outline-none focus:border-gold focus:ring-4 focus:ring-gold/20" />
          <div className="mt-2 flex items-center justify-end gap-3">
            <span className="text-xs text-[#8a94a6]">{text.length}/2000</span>
            <button type="submit" disabled={busy || !text.trim()} className="inline-flex h-10 items-center gap-2 rounded-full bg-gold px-5 text-sm font-bold text-navy disabled:opacity-50">
              {busy && !editing && <Loader2 className="size-4 animate-spin" aria-hidden />}Add note
            </button>
          </div>
        </form>
      )}
      {err && <p role="alert" className="mt-2 rounded-lg bg-[#fdecea] px-3 py-2 text-sm text-danger">{err}</p>}
      {notes.length ? (
        <ul className="mt-4 space-y-3">
          {notes.map((n) => {
            const mine = isAdmin || n.staffId === staffId;
            const isEditing = editing?.id === n.id;
            return (
              <li key={n.id} className="rounded-xl bg-[#faf7ef] p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-xs text-[#4b5b75]"><b className="text-navy">{n.author ?? "Former staff"}</b> · {n.at}{n.edited ? " · edited" : ""}</p>
                  {mine && canAdd && !isEditing && (
                    <span className="flex gap-1">
                      <button type="button" onClick={() => setEditing({ id: n.id, body: n.body })} aria-label="Edit note" className="grid size-8 place-items-center rounded-lg text-[#4b5b75] hover:bg-white"><Pencil className="size-4" aria-hidden /></button>
                      <button type="button" onClick={() => remove(n.id)} aria-label="Delete note" className="grid size-8 place-items-center rounded-lg text-danger hover:bg-white"><Trash2 className="size-4" aria-hidden /></button>
                    </span>
                  )}
                </div>
                {isEditing ? (
                  <div className="mt-2">
                    <label htmlFor={`edit-${n.id}`} className="sr-only">Edit note</label>
                    <textarea id={`edit-${n.id}`} value={editing.body} onChange={(e) => setEditing({ id: n.id, body: e.target.value })} rows={3} maxLength={2000} autoFocus
                      className="w-full rounded-xl border border-[#e2dccb] bg-white p-3 text-sm outline-none focus:border-gold focus:ring-4 focus:ring-gold/20" />
                    <div className="mt-2 flex justify-end gap-2">
                      <button type="button" onClick={() => setEditing(null)} className="h-9 px-3 text-sm font-semibold text-[#4b5b75]">Cancel</button>
                      <button type="button" onClick={saveEdit} disabled={busy || !editing.body.trim()} className="h-9 rounded-xl bg-navy px-4 text-sm font-semibold text-white disabled:opacity-50">Save</button>
                    </div>
                  </div>
                ) : <p className="mt-1.5 whitespace-pre-wrap text-sm">{n.body}</p>}
              </li>
            );
          })}
        </ul>
      ) : <p className="mt-3 text-sm text-[#4b5b75]">No notes yet.</p>}
    </section>
  );
}
