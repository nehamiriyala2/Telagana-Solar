"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import type { FieldDef } from "@/lib/admin/cms/types";

export const inputCls = "w-full rounded-xl border border-[#e2dccb] bg-white px-3 text-sm outline-none focus:border-gold focus:ring-4 focus:ring-gold/20 aria-[invalid=true]:border-danger";
export type Opt = [string, string];
type I18n = { en: string; te: string };
type Lines = { en: string[]; te: string[] };
type Districts = { all: boolean; ids: number[] };

function Label({ f, htmlFor, suffix }: { f: FieldDef; htmlFor?: string; suffix?: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-1 block text-sm font-semibold text-[#1a2b57]">
      {f.label}{suffix}{f.required && <span className="text-danger" aria-hidden> *</span>}
      {f.verify && <span className="ml-1.5 text-xs font-bold text-gold-ink">VERIFY</span>}
    </label>
  );
}
const Err = ({ id, msg }: { id: string; msg?: string }) => (msg ? <p id={id} className="mt-1 text-xs font-semibold text-danger">{msg}</p> : null);
const Hint = ({ text }: { text?: string }) => (text ? <p className="mt-1 text-xs text-[#4b5b75]">{text}</p> : null);

/** Uploads to /api/admin/uploads (compressed WebP) and returns the path. */
export async function uploadImage(file: File, folder: string): Promise<{ path?: string; thumb?: string; error?: string }> {
  const fd = new FormData();
  fd.set("file", file); fd.set("folder", folder);
  try {
    const res = await fetch("/api/admin/uploads", { method: "POST", body: fd });
    const d = await res.json().catch(() => ({}));
    return res.ok ? { path: d.path, thumb: d.thumb } : { error: d.message ?? "Upload failed." };
  } catch { return { error: "No connection. Try again." }; }
}

export function ImageInput({ id, value, onChange, folder, invalid }: { id: string; value: string; onChange: (v: string) => void; folder: string; invalid?: boolean }) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  async function pick(file?: File) {
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) { setErr("Images must be under 8 MB."); return; }
    setBusy(true); setErr(null);
    const r = await uploadImage(file, folder);
    setBusy(false);
    if (r.path) onChange(r.path); else setErr(r.error ?? "Upload failed.");
    if (ref.current) ref.current.value = "";
  }
  return (
    <div className="space-y-2">
      {value && (
        <div className="relative w-full max-w-md overflow-hidden rounded-xl border border-[#ece4cf]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="" className="h-44 w-full object-cover" />
          <button type="button" onClick={() => onChange("")} aria-label="Remove image" className="absolute right-2 top-2 grid size-8 place-items-center rounded-full bg-white/90 text-danger shadow"><X className="size-4" aria-hidden /></button>
        </div>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => ref.current?.click()} disabled={busy} className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#e2dccb] bg-white px-3 text-sm font-semibold text-[#1a2b57] hover:bg-[#faf7ef] disabled:opacity-60">
          {busy ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <ImagePlus className="size-4" aria-hidden />}{value ? "Replace image" : "Upload image"}
        </button>
        <input ref={ref} type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="sr-only" tabIndex={-1} aria-hidden onChange={(e) => pick(e.target.files?.[0])} />
        <input id={id} value={value} onChange={(e) => onChange(e.target.value)} placeholder="or paste /images/… path" aria-invalid={invalid || undefined} className={`${inputCls} h-10 min-w-0 flex-1`} />
      </div>
      <p className="text-xs text-[#4b5b75]">JPG, PNG or WebP up to 8 MB. Resized and compressed automatically; location data is removed.</p>
      {err && <p role="alert" className="text-xs font-semibold text-danger">{err}</p>}
    </div>
  );
}

/** One field of the form. `value`/`onChange` hold the form value for this field. */
export function Field({ f, value, onChange, error, options, districts, folder }: {
  f: FieldDef; value: unknown; onChange: (v: unknown) => void; error?: string;
  options?: Opt[]; districts?: { id: number; name: string }[]; folder: string;
}) {
  const id = `cms-${f.key}`;
  const errId = `${id}-err`;
  const inv = { "aria-invalid": error ? true : undefined, "aria-describedby": error ? errId : undefined } as const;
  const wrap = (body: React.ReactNode, labelFor: string | undefined = id) => (
    <div className={f.full ? "md:col-span-2" : ""}><Label f={f} htmlFor={labelFor} />{body}<Err id={errId} msg={error} /><Hint text={f.hint} /></div>
  );

  switch (f.kind) {
    case "text": case "slug": case "url":
      return wrap(<input id={id} value={String(value ?? "")} maxLength={f.max ? f.max + 20 : undefined} onChange={(e) => onChange(f.kind === "slug" ? e.target.value.toLowerCase() : e.target.value)} inputMode={f.kind === "url" ? "url" : undefined} className={`${inputCls} h-10`} {...inv} />);
    case "textarea":
      return wrap(<textarea id={id} rows={4} value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} className={`${inputCls} py-2`} {...inv} />);
    case "date":
      return wrap(<input id={id} type="date" value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} className={`${inputCls} h-10`} {...inv} />);
    case "number":
      return wrap(<input id={id} type="number" inputMode="decimal" min={f.min} max={f.max} step={f.step ?? 1} value={value === null || value === undefined ? "" : String(value)}
        onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))} className={`${inputCls} h-10`} {...inv} />);
    case "select": {
      const opts = f.options ?? options ?? [];
      const numeric = !f.options;
      return wrap(
        <select id={id} value={value === null || value === undefined ? "" : String(value)} onChange={(e) => onChange(numeric ? (e.target.value ? Number(e.target.value) : null) : e.target.value)} className={`${inputCls} h-10`} {...inv}>
          {numeric && <option value="">Not set</option>}
          {opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>,
      );
    }
    case "bool":
      return (
        <div className={f.full ? "md:col-span-2" : ""}>
          <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-[#1a2b57]">
            <input id={id} type="checkbox" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} className="size-4 accent-[#f5a800]" />{f.label}
          </label>
          <Hint text={f.hint} />
        </div>
      );
    case "image":
      return wrap(<ImageInput id={id} value={String(value ?? "")} onChange={onChange} folder={folder} invalid={!!error} />);
    case "i18n": case "i18nArea": {
      const v = (value ?? { en: "", te: "" }) as I18n;
      const area = f.kind === "i18nArea";
      const big = (f.max ?? 0) > 2000;
      const one = (lang: "en" | "te") => {
        const props = { id: `${id}-${lang}`, value: v[lang], onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange({ ...v, [lang]: e.target.value }), lang, ...inv };
        return area ? <textarea {...props} rows={big ? 14 : 3} className={`${inputCls} py-2 ${big ? "font-mono text-[0.85rem]" : ""}`} /> : <input {...props} className={`${inputCls} h-10`} />;
      };
      return (
        <fieldset className={`${f.full ? "md:col-span-2" : ""} min-w-0`}>
          <legend className="mb-1 text-sm font-semibold text-[#1a2b57]">{f.label}{f.required && <span className="text-danger" aria-hidden> *</span>}{f.verify && <span className="ml-1.5 text-xs font-bold text-gold-ink">VERIFY</span>}</legend>
          <div className={`grid gap-3 ${big ? "" : "lg:grid-cols-2"}`}>
            <label className="block min-w-0"><span className="mb-0.5 block text-xs font-semibold text-[#8a94a6]">English</span>{one("en")}</label>
            <label className="block min-w-0"><span className="mb-0.5 block text-xs font-semibold text-[#8a94a6]">తెలుగు (Telugu)</span>{one("te")}</label>
          </div>
          <Err id={errId} msg={error} /><Hint text={f.hint} />
        </fieldset>
      );
    }
    case "i18nLines": {
      const v = (value ?? { en: [], te: [] }) as Lines;
      const one = (lang: "en" | "te") => (
        <textarea id={`${id}-${lang}`} lang={lang} rows={5} value={v[lang].join("\n")} onChange={(e) => onChange({ ...v, [lang]: e.target.value.split("\n") })} className={`${inputCls} py-2`} {...inv} />
      );
      return (
        <fieldset className="min-w-0 md:col-span-2">
          <legend className="mb-1 text-sm font-semibold text-[#1a2b57]">{f.label}</legend>
          <div className="grid gap-3 lg:grid-cols-2">
            <label className="block min-w-0"><span className="mb-0.5 block text-xs font-semibold text-[#8a94a6]">English · one per line</span>{one("en")}</label>
            <label className="block min-w-0"><span className="mb-0.5 block text-xs font-semibold text-[#8a94a6]">తెలుగు · one per line</span>{one("te")}</label>
          </div>
          <Err id={errId} msg={error} /><Hint text={f.hint} />
        </fieldset>
      );
    }
    case "districts": {
      const v = (value ?? { all: true, ids: [] }) as Districts;
      return (
        <fieldset className="md:col-span-2">
          <legend className="mb-1 text-sm font-semibold text-[#1a2b57]">{f.label}</legend>
          <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={v.all} onChange={(e) => onChange({ ...v, all: e.target.checked })} className="size-4 accent-[#f5a800]" />All 33 districts</label>
          {!v.all && (
            <div className="mt-2 grid max-h-64 gap-1.5 overflow-y-auto rounded-xl border border-[#ece4cf] p-2 sm:grid-cols-2 lg:grid-cols-3">
              {(districts ?? []).map((d) => (
                <label key={d.id} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1 text-sm hover:bg-[#faf7ef]">
                  <input type="checkbox" checked={v.ids.includes(d.id)} onChange={(e) => onChange({ ...v, ids: e.target.checked ? [...v.ids, d.id] : v.ids.filter((x) => x !== d.id) })} className="size-4 accent-[#f5a800]" />{d.name}
                </label>
              ))}
            </div>
          )}
          <Err id={errId} msg={error} />
        </fieldset>
      );
    }
  }
}
