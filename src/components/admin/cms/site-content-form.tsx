"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { BadgeIndianRupee, Loader2, MapPinned, Megaphone, SunMedium, UsersRound } from "lucide-react";
import type { Banner, TrustItem } from "@/lib/admin/site-content";
import { inputCls } from "@/components/admin/cms/fields";
import { toast } from "@/components/admin/toast";

const ICONS = [BadgeIndianRupee, SunMedium, UsersRound, MapPinned];

/** Home page trust bar (4 slots) and the announcement banner, each saved on its own. */
export function SiteContentForm({ trust: t0, banner: b0, canEdit }: { trust: TrustItem[]; banner: Banner; canEdit: boolean }) {
  const router = useRouter();
  const [trust, setTrust] = useState(t0);
  const [banner, setBanner] = useState(b0);
  const [busy, setBusy] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function save(part: "trust" | "banner") {
    setBusy(part); setErrors({});
    const res = await fetch("/api/admin/content/site", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(part === "trust" ? { trust } : { banner }) }).catch(() => null);
    setBusy(null);
    const d = await res?.json().catch(() => ({}));
    if (!res?.ok) {
      const errs: Record<string, string> = {};
      for (const i of d?.issues ?? []) errs[i.path] = i.message;
      setErrors(errs);
      toast(Object.keys(errs).length ? "Please fix the highlighted fields." : d?.message ?? "Couldn’t save.", "err");
      return;
    }
    toast(d.changed?.length ? (part === "trust" ? "Trust bar saved. The home page updates now." : "Banner saved.") : "No changes to save.");
    router.refresh();
  }

  const setItem = (i: number, k: keyof TrustItem, v: string) => setTrust((cur) => cur.map((x, j) => (j === i ? { ...x, [k]: v } : x)));
  const err = (k: string) => errors[k] && <p className="mt-1 text-xs font-semibold text-danger">{errors[k]}</p>;
  const card = "rounded-2xl border border-[#ece4cf] bg-white p-5 shadow-[0_18px_40px_-34px_rgb(7_23_63/0.45)] sm:p-6";

  return (
    <div className="space-y-6">
      <section aria-labelledby="trust-title" className={card}>
        <h2 id="trust-title" className="font-heading text-lg font-bold">Home page trust bar</h2>
        <p className="mt-1 text-sm text-[#4b5b75]">The four numbers under the home page hero. Only claims you can back up. The ₹ amount must match the current scheme. <span className="font-bold text-gold-ink">VERIFY</span></p>
        <fieldset disabled={!canEdit} className="mt-4 grid gap-4 lg:grid-cols-2">
          {trust.map((it, i) => {
            const Icon = ICONS[i];
            return (
              <div key={i} className="rounded-xl border border-[#ece4cf] p-4">
                <p className="mb-3 flex items-center gap-2 text-sm font-bold text-[#1a2b57]"><Icon className="size-5 text-gold-ink" aria-hidden />Slot {i + 1}</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {([["value_en", "Value (English)"], ["value_te", "Value (Telugu)"], ["caption_en", "Caption (English)"], ["caption_te", "Caption (Telugu)"]] as [keyof TrustItem, string][]).map(([k, l]) => (
                    <label key={k} className="block text-xs font-semibold text-[#4b5b75]">{l}
                      <input value={it[k]} onChange={(e) => setItem(i, k, e.target.value)} lang={k.endsWith("te") ? "te" : "en"} className={`${inputCls} mt-1 h-10`} aria-invalid={errors[`${i}.${k}`] ? true : undefined} />
                      {err(`${i}.${k}`)}
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
        </fieldset>
        {canEdit && <button type="button" onClick={() => save("trust")} disabled={!!busy} className="mt-4 inline-flex h-11 items-center gap-2 rounded-xl bg-navy px-5 font-semibold text-white disabled:opacity-60">{busy === "trust" && <Loader2 className="size-4 animate-spin" aria-hidden />}Save trust bar</button>}
      </section>

      <section aria-labelledby="banner-title" className={card}>
        <h2 id="banner-title" className="flex items-center gap-2 font-heading text-lg font-bold"><Megaphone className="size-5 text-gold-ink" aria-hidden />Announcement banner</h2>
        <p className="mt-1 text-sm text-[#4b5b75]">A thin strip at the top of every public page, e.g. a scheme deadline. Turn it off when it’s no longer true.</p>
        <fieldset disabled={!canEdit} className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="inline-flex cursor-pointer items-center gap-2 font-semibold md:col-span-2">
            <input type="checkbox" role="switch" checked={banner.enabled} onChange={(e) => setBanner({ ...banner, enabled: e.target.checked })} className="size-4 accent-[#f5a800]" />Show the banner on the website
          </label>
          <label className="block text-sm font-semibold text-[#1a2b57]">Text (English)
            <input value={banner.text_en} onChange={(e) => setBanner({ ...banner, text_en: e.target.value })} maxLength={180} className={`${inputCls} mt-1 h-10`} aria-invalid={errors.text_en ? true : undefined} />{err("text_en")}
          </label>
          <label className="block text-sm font-semibold text-[#1a2b57]">Text (Telugu)
            <input lang="te" value={banner.text_te} onChange={(e) => setBanner({ ...banner, text_te: e.target.value })} maxLength={240} className={`${inputCls} mt-1 h-10`} />{err("text_te")}
          </label>
          <label className="block text-sm font-semibold text-[#1a2b57]">Link (optional)
            <input value={banner.link} onChange={(e) => setBanner({ ...banner, link: e.target.value })} placeholder="/schemes/pm-surya-ghar" className={`${inputCls} mt-1 h-10`} aria-invalid={errors.link ? true : undefined} />{err("link")}
          </label>
          <label className="block text-sm font-semibold text-[#1a2b57]">Colour
            <select value={banner.tone} onChange={(e) => setBanner({ ...banner, tone: e.target.value as Banner["tone"] })} className={`${inputCls} mt-1 h-10`}>
              <option value="saffron">Saffron</option><option value="blue">Blue</option>
            </select>
          </label>
          {banner.text_en && (
            <div className="md:col-span-2">
              <p className="mb-1 text-xs font-semibold text-[#8a94a6]">Preview</p>
              <p className={`rounded-xl px-4 py-2 text-center text-sm font-semibold ${banner.tone === "blue" ? "bg-[#1F3B6E] text-white" : "bg-[#f5a800] text-[#0B1F3A]"}`}>{banner.text_en}{banner.link && " →"}</p>
            </div>
          )}
        </fieldset>
        {canEdit && <button type="button" onClick={() => save("banner")} disabled={!!busy} className="mt-4 inline-flex h-11 items-center gap-2 rounded-xl bg-navy px-5 font-semibold text-white disabled:opacity-60">{busy === "banner" && <Loader2 className="size-4 animate-spin" aria-hidden />}Save banner</button>}
      </section>
    </div>
  );
}
