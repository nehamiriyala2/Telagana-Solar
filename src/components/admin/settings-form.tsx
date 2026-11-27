"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Check, History, Loader2, RotateCcw, X } from "lucide-react";
import { GROUP_LABEL, SETTING_DEFS, SOCIAL_KEYS, type SettingDef } from "@/lib/admin/settings-schema";

export type SettingView = { value: unknown; saved: boolean; updatedBy: string | null; updatedAt: string | null };
type Hist = { id: number; oldValue: unknown; newValue: unknown; at: string; by: string | null };

/** Form value ↔ stored value. Emails are one per line; social is an object of links. */
const toForm = (def: SettingDef, v: unknown): string | Record<string, string> =>
  def.kind === "emails" ? (Array.isArray(v) ? v.join("\n") : "")
  : def.kind === "social" ? Object.fromEntries(SOCIAL_KEYS.map((k) => [k, String((v as Record<string, string> | null)?.[k] ?? "")]))
  : String(v ?? "");
const fromForm = (def: SettingDef, v: string | Record<string, string>): unknown =>
  def.kind === "emails" ? String(v).split(/[\n,]+/).map((s) => s.trim()).filter(Boolean)
  : def.kind === "social" ? Object.fromEntries(Object.entries(v as Record<string, string>).map(([k, x]) => [k, x.trim()]))
  : String(v).trim();
const show = (v: unknown) => (Array.isArray(v) ? v.join(", ") || "(none)" : v && typeof v === "object" ? Object.entries(v).filter(([, x]) => x).map(([k, x]) => `${k}: ${x}`).join(" · ") || "(none)" : v === null || v === "" ? "(empty)" : String(v));

export function SettingsForm({ initial }: { initial: Record<string, SettingView> }) {
  const router = useRouter();
  const [form, setForm] = useState<Record<string, string | Record<string, string>>>(() =>
    Object.fromEntries(SETTING_DEFS.map((d) => [d.key, toForm(d, initial[d.key]?.value)])));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [historyKey, setHistoryKey] = useState<string | null>(null);

  async function saveGroup(group: SettingDef["group"]) {
    const defs = SETTING_DEFS.filter((d) => d.group === group);
    const values = Object.fromEntries(defs
      .filter((d) => JSON.stringify(fromForm(d, form[d.key])) !== JSON.stringify(initial[d.key]?.value) || !initial[d.key]?.saved)
      .map((d) => [d.key, fromForm(d, form[d.key])]));
    if (!Object.keys(values).length) { setSaved(group); return; }
    setBusy(group); setSaved(null);
    setErrors((e) => Object.fromEntries(Object.entries(e).filter(([k]) => !defs.some((d) => d.key === k))));
    const res = await fetch("/api/admin/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ values }) }).catch(() => null);
    setBusy(null);
    const data = await res?.json().catch(() => ({}));
    if (!res?.ok) { setErrors((e) => ({ ...e, ...(data?.errors ?? { [defs[0].key]: "Couldn’t save. Try again." }) })); return; }
    setSaved(group);
    router.refresh();
  }

  const input = "mt-1.5 w-full rounded-xl border border-[#e2dccb] bg-white px-3 text-sm outline-none focus:border-gold focus:ring-4 focus:ring-gold/20";

  return (
    <div className="space-y-6">
      {(Object.keys(GROUP_LABEL) as SettingDef["group"][]).map((group) => (
        <section key={group} className="rounded-2xl border border-[#ece4cf] bg-white p-6 shadow-[0_18px_40px_-34px_rgb(7_23_63/0.45)]" aria-labelledby={`g-${group}`}>
          <h2 id={`g-${group}`} className="font-heading text-lg font-bold">{GROUP_LABEL[group]}</h2>
          <form onSubmit={(e) => { e.preventDefault(); void saveGroup(group); }} noValidate>
            <div className="mt-4 grid gap-5 md:grid-cols-2">
              {SETTING_DEFS.filter((d) => d.group === group).map((d) => {
                const st = initial[d.key];
                const err = errors[d.key];
                const id = `set-${d.key}`;
                const wide = d.kind === "textarea" || d.kind === "social" || d.kind === "emails";
                return (
                  <div key={d.key} className={wide ? "md:col-span-2" : ""}>
                    <div className="flex items-center justify-between gap-2">
                      <label htmlFor={d.kind === "social" ? `${id}-facebook` : id} className="text-sm font-semibold text-[#1a2b57]">{d.label}{d.required && <span className="text-danger"> *</span>}</label>
                      <button type="button" onClick={() => setHistoryKey(d.key)} className="inline-flex items-center gap-1 rounded-lg px-1.5 py-0.5 text-xs font-semibold text-[#4b5b75] outline-none hover:bg-[#faf7ef] focus-visible:ring-2 focus-visible:ring-gold">
                        <History className="size-3.5" aria-hidden />History<span className="sr-only"> of {d.label}</span>
                      </button>
                    </div>
                    {d.kind === "social" ? (
                      <div className="grid gap-2 sm:grid-cols-2">
                        {SOCIAL_KEYS.map((k) => (
                          <label key={k} className="block text-xs font-semibold capitalize text-[#4b5b75]">{k === "x" ? "X (Twitter)" : k}
                            <input id={`${id}-${k}`} type="url" inputMode="url" placeholder="https://" value={(form[d.key] as Record<string, string>)[k] ?? ""}
                              onChange={(e) => setForm((f) => ({ ...f, [d.key]: { ...(f[d.key] as Record<string, string>), [k]: e.target.value } }))} className={`${input} h-10 font-normal`} />
                          </label>
                        ))}
                      </div>
                    ) : d.kind === "textarea" || d.kind === "emails" ? (
                      <textarea id={id} rows={d.kind === "emails" ? 3 : 3} value={String(form[d.key])} onChange={(e) => setForm((f) => ({ ...f, [d.key]: e.target.value }))}
                        aria-invalid={err ? true : undefined} aria-describedby={`${id}-help`} className={`${input} py-2`} />
                    ) : (
                      <div className="relative">
                        {d.kind === "phone10" && <span className="pointer-events-none absolute left-3 top-1/2 mt-[3px] -translate-y-1/2 text-sm text-[#8a94a6]">+91</span>}
                        <input id={id} type={d.kind === "email" ? "email" : d.kind === "url" ? "url" : "text"} inputMode={d.kind === "phone10" ? "numeric" : undefined}
                          maxLength={d.kind === "phone10" ? 10 : undefined} value={String(form[d.key])} onChange={(e) => setForm((f) => ({ ...f, [d.key]: e.target.value }))}
                          aria-invalid={err ? true : undefined} aria-describedby={`${id}-help`} className={`${input} h-10 ${d.kind === "phone10" ? "pl-11" : ""}`} />
                      </div>
                    )}
                    <div id={`${id}-help`} className="mt-1 text-xs">
                      {err ? <p role="alert" className="font-semibold text-danger">{err}</p> : d.hint && <p className="text-[#4b5b75]">{d.hint}</p>}
                      {d.max && (d.kind === "text" || d.kind === "textarea") && <p className={String(form[d.key]).length > d.max ? "text-danger" : "text-[#8a94a6]"}>{String(form[d.key]).length}/{d.max}</p>}
                      <p className="text-[#8a94a6]">{st?.saved ? `Last changed by ${st.updatedBy ?? "former staff"} · ${st.updatedAt}` : "Using the website’s current value"}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-5 flex items-center justify-end gap-3">
              {saved === group && <span className="flex items-center gap-1 text-sm font-semibold text-success" role="status"><Check className="size-4" aria-hidden />Saved</span>}
              <button type="submit" disabled={busy === group} className="inline-flex h-11 items-center gap-2 rounded-full bg-gold px-6 font-bold text-navy outline-none hover:brightness-105 focus-visible:ring-4 focus-visible:ring-navy/30 disabled:opacity-60">
                {busy === group && <Loader2 className="size-4 animate-spin" aria-hidden />}Save {GROUP_LABEL[group].toLowerCase()}
              </button>
            </div>
          </form>
        </section>
      ))}
      {historyKey && <HistoryDrawer settingKey={historyKey} label={SETTING_DEFS.find((d) => d.key === historyKey)!.label} onClose={() => setHistoryKey(null)} onRestored={() => { setHistoryKey(null); router.refresh(); window.location.reload(); }} />}
    </div>
  );
}

function HistoryDrawer({ settingKey, label, onClose, onRestored }: { settingKey: string; label: string; onClose: () => void; onRestored: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [rows, setRows] = useState<Hist[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = async (el: HTMLDialogElement | null) => {
    if (!el || el.open) return;
    el.showModal();
    const res = await fetch(`/api/admin/settings/history?key=${encodeURIComponent(settingKey)}`).catch(() => null);
    if (!res?.ok) { setErr("History couldn’t load."); setRows([]); return; }
    setRows((await res.json()).history);
  };
  async function restore(id: number, which: "old" | "new") {
    setBusy(`${id}-${which}`); setErr(null);
    const res = await fetch("/api/admin/settings/restore", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ history_id: id, which }) }).catch(() => null);
    setBusy(null);
    if (!res?.ok) { const d = await res?.json().catch(() => ({})); setErr(d?.message ?? "Couldn’t restore."); return; }
    onRestored();
  }

  return (
    <dialog ref={(el) => { ref.current = el; void load(el); }} onClose={onClose} aria-labelledby="hist-title"
      className="ml-auto mr-0 h-dvh max-h-dvh w-[min(28rem,100vw)] rounded-none p-0 backdrop:bg-navy/50">
      <div className="flex h-full flex-col">
        <header className="flex items-center justify-between border-b border-[#ece4cf] px-5 py-4">
          <h2 id="hist-title" className="font-heading text-lg font-bold">History: {label}</h2>
          <button type="button" onClick={() => ref.current?.close()} aria-label="Close" className="grid size-9 place-items-center rounded-xl hover:bg-[#faf7ef]"><X className="size-5" aria-hidden /></button>
        </header>
        <div className="flex-1 overflow-y-auto p-5">
          {err && <p role="alert" className="mb-3 rounded-lg bg-[#fdecea] px-3 py-2 text-sm text-danger">{err}</p>}
          {rows === null ? <p className="text-sm text-[#4b5b75]">Loading…</p> : rows.length === 0 ? <p className="text-sm text-[#4b5b75]">No changes yet. The website’s current value is in use.</p> : (
            <ol className="space-y-4">
              {rows.map((h) => (
                <li key={h.id} className="rounded-xl border border-[#ece4cf] p-3 text-sm">
                  <p className="text-xs text-[#4b5b75]">{h.at} · {h.by ?? "former staff"}</p>
                  <p className="mt-1.5 break-words"><span className="text-[#8a94a6]">From</span> {show(h.oldValue)}</p>
                  <p className="break-words"><span className="text-[#8a94a6]">To</span> <b>{show(h.newValue)}</b></p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(["new", "old"] as const).map((w) => (
                      <button key={w} type="button" disabled={!!busy} onClick={() => restore(h.id, w)}
                        className="inline-flex h-8 items-center gap-1 rounded-lg border border-[#e2dccb] px-2.5 text-xs font-semibold text-[#1a2b57] hover:bg-[#faf7ef] disabled:opacity-50">
                        {busy === `${h.id}-${w}` ? <Loader2 className="size-3.5 animate-spin" aria-hidden /> : <RotateCcw className="size-3.5" aria-hidden />}
                        Restore this value{w === "old" ? " (before)" : ""}
                      </button>
                    ))}
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </dialog>
  );
}
