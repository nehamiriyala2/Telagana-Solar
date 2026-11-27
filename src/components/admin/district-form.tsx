"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { DISTRICT_BLOCKS, districtCompleteness } from "@/lib/admin/district-content";
import { ImageInput } from "@/components/admin/cms/fields";
import { toast } from "@/components/admin/toast";

type Texts = Record<`${(typeof DISTRICT_BLOCKS)[number]["key"]}_${"en" | "te"}`, string>;
export type DistrictValues = { name_en: string; name_te: string; discom: "TGSPDCL" | "TGNPDCL"; region: string; hero_image: string; published: boolean; scheme_ids: number[] } & Texts;
type D = DistrictValues;

export function DistrictForm({ slug, initial, schemes }: { slug: string; initial: D; schemes: { id: number; name_en: string; status: string }[] }) {
  const router = useRouter();
  const [d, setD] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const set = <K extends keyof D>(k: K, v: D[K]) => setD((x) => ({ ...x, [k]: v }));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setMsg(null); setErrors({});
    const res = await fetch(`/api/admin/districts/${slug}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(d) }).catch(() => null);
    setBusy(false);
    const data = await res?.json().catch(() => ({}));
    if (!res?.ok) {
      const errs: Record<string, string> = {};
      for (const i of data?.issues ?? []) errs[i.path] = i.message;
      setErrors(errs);
      setMsg({ ok: false, text: Object.keys(errs).length ? "Please fix the highlighted fields." : data?.message ?? "Couldn’t save. Try again." });
      toast(Object.keys(errs).length ? "Please fix the highlighted fields." : data?.message ?? "Couldn’t save.", "err");
      return;
    }
    setMsg({ ok: true, text: data.changed?.length ? "Saved." : "No changes to save." });
    toast(data.changed?.length ? "District saved. The public page updates now." : "No changes to save.");
    router.refresh();
  }

  const input = "mt-1.5 w-full rounded-xl border border-[#e2dccb] bg-white px-3 text-sm outline-none focus:border-gold focus:ring-4 focus:ring-gold/20";
  const field = (k: keyof D, label: string, opts: { area?: boolean; hint?: string; rows?: number } = {}) => (
    <div>
      <label htmlFor={`d-${k}`} className="text-sm font-semibold text-[#1a2b57]">{label}</label>
      {opts.area
        ? <textarea id={`d-${k}`} rows={opts.rows ?? 4} value={String(d[k])} onChange={(e) => set(k, e.target.value as never)} aria-invalid={errors[k] ? true : undefined} className={`${input} py-2`} />
        : <input id={`d-${k}`} value={String(d[k])} onChange={(e) => set(k, e.target.value as never)} aria-invalid={errors[k] ? true : undefined} className={`${input} h-10`} />}
      {errors[k] ? <p role="alert" className="mt-1 text-xs font-semibold text-danger">{errors[k]}</p> : opts.hint && <p className="mt-1 text-xs text-[#4b5b75]">{opts.hint}</p>}
    </div>
  );

  return (
    <form onSubmit={save} className="space-y-6" noValidate>
      <section className="grid gap-5 rounded-2xl border border-[#ece4cf] bg-white p-6 md:grid-cols-2">
        {field("name_en", "Name (English)")}
        {field("name_te", "Name (Telugu)")}
        <div>
          <label htmlFor="d-discom" className="text-sm font-semibold text-[#1a2b57]">DISCOM <span className="text-xs font-bold text-gold-ink">VERIFY</span></label>
          <select id="d-discom" value={d.discom} onChange={(e) => set("discom", e.target.value as D["discom"])} className={`${input} h-10`}>
            <option value="TGSPDCL">TGSPDCL (Southern)</option><option value="TGNPDCL">TGNPDCL (Northern)</option>
          </select>
        </div>
        {field("region", "Region", { hint: "e.g. Hyderabad metro, North, South" })}
        <div className="md:col-span-2">
          <span className="text-sm font-semibold text-[#1a2b57]">Hero image</span>
          <div className="mt-1.5"><ImageInput id="d-hero_image" value={d.hero_image} onChange={(v) => set("hero_image", v)} folder="districts" invalid={!!errors.hero_image} /></div>
          {errors.hero_image && <p role="alert" className="mt-1 text-xs font-semibold text-danger">{errors.hero_image}</p>}
        </div>
      </section>

      <section className="rounded-2xl border border-[#ece4cf] bg-white p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-heading text-lg font-bold">Page content</h2>
          <Completeness d={d} />
        </div>
        <div className="space-y-6">
          {DISTRICT_BLOCKS.map((b) => (
            <fieldset key={b.key} className="min-w-0">
              <legend className="mb-1 text-sm font-semibold text-[#1a2b57]">{b.label}</legend>
              <div className="grid gap-3 lg:grid-cols-2">
                {(["en", "te"] as const).map((lang) => {
                  const k = `${b.key}_${lang}` as keyof Texts;
                  const props = { id: `d-${k}`, lang, value: d[k], onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => set(k, e.target.value), "aria-invalid": errors[k] ? true : undefined };
                  return (
                    <label key={lang} className="block min-w-0">
                      <span className="mb-0.5 block text-xs font-semibold text-[#8a94a6]">{lang === "en" ? "English" : "తెలుగు (Telugu)"}</span>
                      {b.area ? <textarea {...props} rows={b.key === "about" ? 7 : 3} className={`${input} py-2`} /> : <input {...props} className={`${input} h-10`} />}
                      {errors[k] && <p role="alert" className="mt-1 text-xs font-semibold text-danger">{errors[k]}</p>}
                    </label>
                  );
                })}
              </div>
              <p className="mt-1 text-xs text-[#4b5b75]">{b.hint}</p>
            </fieldset>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-[#ece4cf] bg-white p-6">
        <fieldset>
          <legend className="font-heading font-bold">Schemes available in this district</legend>
          {schemes.length ? (
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {schemes.map((s) => (
                <label key={s.id} className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#ece4cf] px-3 py-2.5 has-[:checked]:border-gold has-[:checked]:bg-[#fff8e6]">
                  <input type="checkbox" checked={d.scheme_ids.includes(s.id)} className="size-4 accent-[#f5a800]"
                    onChange={(e) => set("scheme_ids", e.target.checked ? [...d.scheme_ids, s.id] : d.scheme_ids.filter((x) => x !== s.id))} />
                  <span>{s.name_en}{s.status !== "published" && <span className="ml-1.5 text-xs text-[#8a94a6]">({s.status.replace("_", " ")})</span>}</span>
                </label>
              ))}
            </div>
          ) : <p className="mt-2 text-sm text-[#4b5b75]">No schemes yet. Run <code>npm run db:seed:content</code>.</p>}
        </fieldset>
        <label className="mt-5 inline-flex cursor-pointer items-center gap-2 font-semibold">
          <input type="checkbox" role="switch" checked={d.published} onChange={(e) => set("published", e.target.checked)} className="size-4 accent-[#f5a800]" />Published on the website
        </label>
      </section>

      <div className="flex items-center justify-end gap-3">
        {msg && <span role={msg.ok ? "status" : "alert"} className={`flex items-center gap-1 text-sm font-semibold ${msg.ok ? "text-success" : "text-danger"}`}>{msg.ok && <Check className="size-4" aria-hidden />}{msg.text}</span>}
        <button type="submit" disabled={busy} className="inline-flex h-11 items-center gap-2 rounded-full bg-gold px-6 font-bold text-navy disabled:opacity-60">{busy && <Loader2 className="size-4 animate-spin" aria-hidden />}Save district</button>
      </div>
    </form>
  );
}

function Completeness({ d }: { d: D }) {
  const c = districtCompleteness(d);
  const full = c.done === c.total;
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-bold ${full ? "bg-[#e7f5e4] text-success" : "bg-[#fff3d1] text-[#8a5a00]"}`}>
      {c.done}/{c.total} filled in{c.teMissing ? ` · Telugu missing in ${c.teMissing}` : ""}
    </span>
  );
}
