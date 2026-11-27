"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUp, ImagePlus, Loader2, Star, Trash2 } from "lucide-react";
import { toast } from "@/components/admin/toast";
import { inputCls } from "@/components/admin/cms/fields";

type Photo = { id: number; path: string; thumb_path: string; alt: string; is_cover: number };

/** Project photos: upload (with alt text), reorder, pick the cover, edit alt text, delete. */
export function ProjectPhotos({ projectId }: { projectId: number }) {
  const url = `/api/admin/projects/${projectId}/photos`;
  const [photos, setPhotos] = useState<Photo[] | null>(null);
  const [alt, setAlt] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    const res = await fetch(url, { cache: "no-store" }).catch(() => null);
    if (!res?.ok) { setErr("Photos couldn’t load."); setPhotos([]); return; }
    setPhotos((await res.json()).photos);
  }, [url]);
  useEffect(() => { void load(); }, [load]);

  async function send(method: string, body?: unknown, query = "") {
    setBusy(true);
    const res = await fetch(`${url}${query}`, { method, headers: body ? { "Content-Type": "application/json" } : undefined, body: body ? JSON.stringify(body) : undefined }).catch(() => null);
    setBusy(false);
    const d = await res?.json().catch(() => ({}));
    if (!res?.ok) { toast(d?.message ?? d?.issues?.[0]?.message ?? "Couldn’t save.", "err"); return false; }
    await load();
    return true;
  }

  async function upload(file?: File) {
    if (!file) return;
    if (alt.trim().length < 3) { setErr("First describe the photo (alt text), e.g. “3 kW panels on a terrace in Hanamkonda”."); return; }
    if (file.size > 8 * 1024 * 1024) { setErr("Photos must be under 8 MB."); return; }
    setErr(null); setBusy(true);
    const fd = new FormData(); fd.set("file", file); fd.set("alt", alt.trim());
    const res = await fetch(url, { method: "POST", body: fd }).catch(() => null);
    setBusy(false);
    if (fileRef.current) fileRef.current.value = "";
    const d = await res?.json().catch(() => ({}));
    if (!res?.ok) { setErr(d?.message ?? "Upload failed."); return; }
    setAlt(""); toast("Photo added."); await load();
  }

  const move = (i: number, d: -1 | 1) => {
    if (!photos) return;
    const n = [...photos]; const j = i + d;
    if (j < 0 || j >= n.length) return;
    [n[i], n[j]] = [n[j], n[i]];
    setPhotos(n);
    void send("PATCH", { order: n.map((p) => p.id) });
  };

  return (
    <section aria-labelledby="pp-title" className="rounded-2xl border border-[#ece4cf] bg-white p-5 shadow-[0_18px_40px_-34px_rgb(7_23_63/0.45)] sm:p-6">
      <h2 id="pp-title" className="font-heading text-lg font-bold">Photos</h2>
      <p className="mt-1 text-sm text-[#4b5b75]">Up to 12 photos. The ★ cover shows in the gallery. Photos are compressed and their location data is removed. Avoid faces and house numbers.</p>

      <div className="mt-4 flex flex-wrap items-end gap-2 rounded-xl bg-[#faf7ef] p-3">
        <label className="min-w-[14rem] flex-1 text-sm font-semibold text-[#1a2b57]">Describe the photo (alt text)
          <input value={alt} onChange={(e) => { setAlt(e.target.value); setErr(null); }} maxLength={200} placeholder="e.g. 3 kW panels on a terrace in Hanamkonda" className={`${inputCls} mt-1 h-10`} />
        </label>
        <button type="button" onClick={() => (alt.trim().length < 3 ? setErr("First describe the photo (alt text).") : fileRef.current?.click())} disabled={busy}
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-navy px-4 text-sm font-semibold text-white disabled:opacity-60">
          {busy ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <ImagePlus className="size-4" aria-hidden />}Upload photo
        </button>
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="sr-only" tabIndex={-1} aria-hidden onChange={(e) => upload(e.target.files?.[0])} />
      </div>
      {err && <p role="alert" className="mt-2 text-sm font-semibold text-danger">{err}</p>}

      {photos === null ? <div role="status" aria-label="Loading photos" className="mt-4 h-32 animate-pulse rounded-xl bg-[#f4efe2]" />
        : !photos.length ? <p className="mt-4 rounded-xl border border-dashed border-[#e2dccb] p-6 text-center text-sm text-[#4b5b75]">No photos yet. Add before and after shots of the installation.</p>
        : (
          <ol className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {photos.map((p, i) => (
              <li key={p.id} className={`overflow-hidden rounded-xl border ${p.is_cover ? "border-gold ring-2 ring-gold/40" : "border-[#ece4cf]"}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.thumb_path} alt={p.alt} className="h-40 w-full object-cover" />
                <div className="space-y-2 p-2.5">
                  <label className="sr-only" htmlFor={`alt-${p.id}`}>Alt text for photo {i + 1}</label>
                  <input id={`alt-${p.id}`} defaultValue={p.alt} maxLength={200} className={`${inputCls} h-9`}
                    onBlur={(e) => { const t = e.target.value.trim(); if (t !== p.alt) void send("PATCH", { alt: { id: p.id, text: t } }).then((ok) => ok && toast("Alt text saved.")); }} />
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={() => move(i, -1)} disabled={i === 0 || busy} aria-label={`Move photo ${i + 1} earlier`} className="grid size-8 place-items-center rounded-lg hover:bg-[#faf7ef] disabled:opacity-30"><ArrowUp className="size-4" aria-hidden /></button>
                    <button type="button" onClick={() => move(i, 1)} disabled={i === photos.length - 1 || busy} aria-label={`Move photo ${i + 1} later`} className="grid size-8 place-items-center rounded-lg hover:bg-[#faf7ef] disabled:opacity-30"><ArrowDown className="size-4" aria-hidden /></button>
                    <button type="button" onClick={() => send("PATCH", { cover: p.id }).then((ok) => ok && toast("Cover photo set."))} disabled={!!p.is_cover || busy} aria-pressed={!!p.is_cover}
                      className={`inline-flex h-8 items-center gap-1 rounded-lg px-2 text-xs font-semibold ${p.is_cover ? "text-gold-ink" : "text-[#1a2b57] hover:bg-[#faf7ef]"}`}><Star className={`size-4 ${p.is_cover ? "fill-gold text-gold" : ""}`} aria-hidden />{p.is_cover ? "Cover" : "Make cover"}</button>
                    <button type="button" onClick={() => window.confirm("Delete this photo?") && send("DELETE", undefined, `?photo=${p.id}`).then((ok) => ok && toast("Photo deleted."))} disabled={busy} aria-label={`Delete photo ${i + 1}`}
                      className="ml-auto grid size-8 place-items-center rounded-lg text-danger hover:bg-[#fdecea]"><Trash2 className="size-4" aria-hidden /></button>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        )}
    </section>
  );
}
