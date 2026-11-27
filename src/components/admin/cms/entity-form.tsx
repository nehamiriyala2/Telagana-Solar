"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ExternalLink, Eye, EyeOff, Loader2, Trash2 } from "lucide-react";
import type { CollectionDef } from "@/lib/admin/cms/types";
import { Field, type Opt } from "@/components/admin/cms/fields";
import { toast } from "@/components/admin/toast";

type Values = Record<string, unknown>;

/**
 * Create / edit form for any collection. Sections come from the field definitions.
 * New: "Save as draft" or "Save and publish". Existing: "Save changes", Publish/Unpublish, Delete.
 */
export function EntityForm({ c, id, initial, published: initiallyPublished, options = {}, districts, publicUrl, children }: {
  c: CollectionDef; id: number | null; initial: Values; published: boolean;
  options?: Record<string, Opt[]>; districts?: { id: number; name: string }[]; publicUrl?: string | null; children?: React.ReactNode;
}) {
  const router = useRouter();
  const [v, setV] = useState<Values>(initial);
  const [saved, setSaved] = useState(JSON.stringify(initial));
  const [published, setPublished] = useState(initiallyPublished);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const dirty = JSON.stringify(v) !== saved;
  const sections = useMemo(() => [...new Set(c.fields.map((f) => f.section))], [c.fields]);
  const folder = c.key === "posts" ? "posts" : c.key === "projects" ? "projects" : "site";

  async function call(method: string, url: string, body?: unknown) {
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: body === undefined ? undefined : JSON.stringify(body) }).catch(() => null);
    const d = await res?.json().catch(() => ({}));
    return { ok: !!res?.ok, status: res?.status ?? 0, d: d ?? {} };
  }
  function showErrors(d: { issues?: { path: string; message: string }[]; message?: string }, status: number) {
    const errs: Record<string, string> = {};
    for (const i of d.issues ?? []) errs[i.path.split(".")[0] || "form"] = i.message;
    setErrors(errs);
    toast(Object.keys(errs).length ? "Please fix the highlighted fields." : d.message ?? (status === 403 ? "You don’t have permission to do that." : "Couldn’t save. Try again."), "err");
    if (Object.keys(errs).length) document.getElementById(`cms-${Object.keys(errs)[0]}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  async function save(publish?: boolean) {
    setBusy(publish === undefined ? "save" : publish ? "publish" : "draft"); setErrors({});
    const r = id === null
      ? await call("POST", `/api/admin/cms/${c.key}`, { values: v, publish: !!publish })
      : await call("PATCH", `/api/admin/cms/${c.key}/${id}`, { values: v });
    setBusy(null);
    if (!r.ok) { showErrors(r.d, r.status); return; }
    setSaved(JSON.stringify(v));
    if (id === null) { toast(publish ? `${c.label} published.` : `${c.label} saved as a draft.`); router.push(`${c.basePath}/${r.d.id}`); return; }
    toast(r.d.changed?.length ? "Changes saved." : "No changes to save.");
    router.refresh();
  }

  async function togglePublish() {
    if (dirty) { toast("Save your changes first.", "err"); return; }
    setBusy("toggle");
    const r = await call("PATCH", `/api/admin/cms/${c.key}/${id}`, { publish: !published });
    setBusy(null);
    if (!r.ok) { showErrors(r.d, r.status); return; }
    setPublished(!published);
    toast(published ? `${c.label} unpublished. It no longer shows on the website.` : `${c.label} is live on the website.`);
    router.refresh();
  }

  async function remove() {
    if (!window.confirm(`Delete this ${c.label.toLowerCase()}? It disappears from the website and this list. (It stays in the database and can be restored by a developer.)`)) return;
    setBusy("delete");
    const r = await call("DELETE", `/api/admin/cms/${c.key}/${id}`);
    setBusy(null);
    if (!r.ok) { showErrors(r.d, r.status); return; }
    toast(`${c.label} deleted.`);
    router.push(c.basePath);
  }

  const spin = (k: string) => busy === k && <Loader2 className="size-4 animate-spin" aria-hidden />;
  return (
    <form onSubmit={(e) => { e.preventDefault(); void save(); }} noValidate className="space-y-6 pb-24">
      {id !== null && (
        <div className={`flex flex-wrap items-center gap-3 rounded-2xl border px-4 py-3 text-sm ${published ? "border-[#b9e0b1] bg-[#e7f5e4]" : "border-[#e2dccb] bg-white"}`}>
          {published ? <Eye className="size-4 text-success" aria-hidden /> : <EyeOff className="size-4 text-[#5b6473]" aria-hidden />}
          <span className="font-semibold">{published ? "Published: visible on the website." : "Draft: not visible on the website."}</span>
          {published && publicUrl && <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold text-[#1a2b57] hover:underline"><ExternalLink className="size-4" aria-hidden />View on website</a>}
        </div>
      )}
      {sections.map((s) => (
        <section key={s} aria-label={s} className="rounded-2xl border border-[#ece4cf] bg-white p-5 shadow-[0_18px_40px_-34px_rgb(7_23_63/0.45)] sm:p-6">
          <h2 className="mb-4 font-heading text-lg font-bold">{s}</h2>
          <div className="grid gap-5 md:grid-cols-2">
            {c.fields.filter((f) => f.section === s).map((f) => (
              <Field key={f.key} f={f} value={v[f.key]} onChange={(x) => { setV((cur) => ({ ...cur, [f.key]: x })); setErrors((e) => ({ ...e, [f.key]: "" })); }}
                error={errors[f.key] || undefined} options={options[f.key]} districts={districts} folder={folder} />
            ))}
          </div>
        </section>
      ))}
      {children}

      <div className="sticky bottom-3 z-20 flex flex-wrap items-center gap-2 rounded-2xl border border-[#ece4cf] bg-white/95 p-3 shadow-[0_24px_48px_-24px_rgb(7_23_63/0.45)] backdrop-blur">
        {id === null ? (
          <>
            <button type="button" onClick={() => save(false)} disabled={!!busy} className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#e2dccb] bg-white px-4 font-semibold text-[#1a2b57] disabled:opacity-60">{spin("draft")}Save as draft</button>
            <button type="button" onClick={() => save(true)} disabled={!!busy} className="inline-flex h-11 items-center gap-2 rounded-xl bg-gold px-5 font-bold text-navy disabled:opacity-60">{spin("publish")}Save and publish</button>
          </>
        ) : (
          <>
            <button type="submit" disabled={!!busy || !dirty} className="inline-flex h-11 items-center gap-2 rounded-xl bg-navy px-5 font-semibold text-white disabled:opacity-50">{spin("save")}Save changes</button>
            <button type="button" onClick={togglePublish} disabled={!!busy} className={`inline-flex h-11 items-center gap-2 rounded-xl px-4 font-semibold disabled:opacity-60 ${published ? "border border-[#e2dccb] bg-white text-[#1a2b57]" : "bg-gold font-bold text-navy"}`}>
              {spin("toggle")}{published ? <><EyeOff className="size-4" aria-hidden />Unpublish</> : <><Eye className="size-4" aria-hidden />Publish</>}
            </button>
            {dirty && <span className="text-sm font-semibold text-gold-ink">Unsaved changes</span>}
            <button type="button" onClick={remove} disabled={!!busy} className="ml-auto inline-flex h-11 items-center gap-1.5 rounded-xl px-3 text-sm font-semibold text-danger hover:bg-[#fdecea] disabled:opacity-60">{spin("delete")}<Trash2 className="size-4" aria-hidden />Delete</button>
          </>
        )}
      </div>
    </form>
  );
}
