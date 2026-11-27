"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Check, Copy, Loader2 } from "lucide-react";
import { TEMPLATE_KEYS, TEMPLATE_VARS, renderTemplate, unknownVars, type TemplateKey } from "@/lib/admin/templates";

export type Tpl = { key: TemplateKey; lang: "en" | "te"; body: string; active: boolean; updatedBy: string | null; updatedAt: string | null; isDefault: boolean };

const KEY_LABEL: Record<TemplateKey, { title: string; when: string }> = {
  welcome: { title: "Lead welcome", when: "First message after a lead comes in (Lead page WhatsApp button)." },
  day1: { title: "Follow-up 1", when: "Used on follow-ups for leads under 2 days old." },
  day3: { title: "Follow-up 2", when: "Used on follow-ups for leads 2–5 days old." },
  day7: { title: "Follow-up 3", when: "Used on follow-ups for older leads." },
  quote_sent: { title: "Quote sent", when: "After you send the quotation." },
  install_done: { title: "Installation done", when: "After the system is installed." },
};
const WARN = 700;

export function TemplateEditor({ templates, canEdit }: { templates: Tpl[]; canEdit: boolean }) {
  const [key, setKey] = useState<TemplateKey>("welcome");
  const [sample, setSample] = useState({ name: "Ravi Kumar", kw: "3 kW", district: "Warangal", area: "Hanamkonda", phone: "9876543210" });
  return (
    <div className="grid gap-6 xl:grid-cols-[16rem_minmax(0,1fr)]">
      <nav aria-label="Templates" className="flex gap-2 overflow-x-auto xl:flex-col">
        {TEMPLATE_KEYS.map((k) => {
          const on = k === key;
          const off = templates.filter((t) => t.key === k && !t.active).length;
          return (
            <button key={k} type="button" aria-pressed={on} onClick={() => setKey(k)}
              className={`shrink-0 rounded-2xl border px-4 py-3 text-left outline-none transition focus-visible:ring-2 focus-visible:ring-gold ${on ? "border-navy bg-navy text-white" : "border-[#ece4cf] bg-white hover:bg-[#faf7ef]"}`}>
              <span className="block font-semibold">{KEY_LABEL[k].title}</span>
              <span className={`block text-xs ${on ? "text-silver/80" : "text-[#4b5b75]"}`}>{off ? `${off} language${off > 1 ? "s" : ""} off` : "EN + తెలుగు active"}</span>
            </button>
          );
        })}
      </nav>
      <div className="min-w-0 space-y-5">
        <div>
          <h2 className="font-heading text-xl font-bold">{KEY_LABEL[key].title}</h2>
          <p className="text-sm text-[#4b5b75]">{KEY_LABEL[key].when}</p>
        </div>
        <fieldset className="rounded-2xl border border-[#ece4cf] bg-white p-4">
          <legend className="px-1 text-sm font-semibold text-[#1a2b57]">Sample lead for the preview</legend>
          <div className="grid gap-2 sm:grid-cols-5">
            {TEMPLATE_VARS.map((v) => (
              <label key={v} className="text-xs font-semibold text-[#4b5b75]">{`{${v}}`}
                <input value={sample[v]} onChange={(e) => setSample({ ...sample, [v]: e.target.value })}
                  className="mt-1 h-9 w-full rounded-lg border border-[#e2dccb] px-2 text-sm font-normal text-navy outline-none focus:border-gold focus:ring-2 focus:ring-gold/20" />
              </label>
            ))}
          </div>
        </fieldset>
        <div className="grid gap-5 2xl:grid-cols-2">
          {(["en", "te"] as const).map((lang) => {
            const t = templates.find((x) => x.key === key && x.lang === lang)!;
            return <OneTemplate key={`${key}-${lang}`} t={t} sample={sample} canEdit={canEdit} />;
          })}
        </div>
      </div>
    </div>
  );
}

function OneTemplate({ t, sample, canEdit }: { t: Tpl; sample: Record<string, string>; canEdit: boolean }) {
  const router = useRouter();
  const [body, setBody] = useState(t.body);
  const [active, setActive] = useState(t.active);
  const [state, setState] = useState<"idle" | "saving" | "saved" | "copied">("idle");
  const [err, setErr] = useState<string | null>(null);
  const area = useRef<HTMLTextAreaElement>(null);
  const bad = unknownVars(body);
  const dirty = body !== t.body || active !== t.active;
  const preview = renderTemplate(body, sample);
  const id = `tpl-${t.key}-${t.lang}`;

  function insert(v: string) {
    const el = area.current;
    if (!el) return;
    const s = el.selectionStart, e = el.selectionEnd;
    const next = `${body.slice(0, s)}{${v}}${body.slice(e)}`;
    setBody(next);
    requestAnimationFrame(() => { el.focus(); el.setSelectionRange(s + v.length + 2, s + v.length + 2); });
  }
  async function save() {
    setState("saving"); setErr(null);
    const res = await fetch("/api/admin/templates", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key: t.key, lang: t.lang, body, active }) }).catch(() => null);
    if (!res?.ok) { const d = await res?.json().catch(() => ({})); setErr(d?.message ?? d?.issues?.[0]?.message ?? "Couldn’t save."); setState("idle"); return; }
    setState("saved"); router.refresh();
  }
  async function copy() {
    try { await navigator.clipboard.writeText(preview); setState("copied"); setTimeout(() => setState("idle"), 1500); } catch { setErr("Copy failed. Select the preview text instead."); }
  }

  return (
    <section aria-labelledby={`${id}-h`} className={`rounded-2xl border bg-white p-5 ${active ? "border-[#ece4cf]" : "border-dashed border-[#d6dbe4]"}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 id={`${id}-h`} className="font-heading font-bold">{t.lang === "en" ? "English" : "తెలుగు (Telugu)"}</h3>
        <label className={`inline-flex items-center gap-2 text-sm font-semibold ${canEdit ? "cursor-pointer" : ""}`}>
          <input type="checkbox" role="switch" checked={active} disabled={!canEdit} onChange={(e) => setActive(e.target.checked)} className="size-4 accent-[#f5a800]" />Active
        </label>
      </div>
      <p className="mt-1 text-xs text-[#8a94a6]">{t.isDefault ? "Built-in default (not saved yet)" : t.updatedBy ? `Last changed by ${t.updatedBy} · ${t.updatedAt}` : "Default message"}{!active && " · Off: the English or built-in message is used instead"}</p>

      {canEdit && (
        <div className="mt-3 flex flex-wrap gap-1.5" role="group" aria-label="Insert a variable">
          {TEMPLATE_VARS.map((v) => (
            <button key={v} type="button" onClick={() => insert(v)} className="rounded-lg bg-[#eef2f9] px-2 py-1 font-mono text-xs font-semibold text-navy hover:bg-[#dfe6f3]">{`{${v}}`}</button>
          ))}
        </div>
      )}
      <label htmlFor={id} className="sr-only">{t.lang === "en" ? "English" : "Telugu"} message</label>
      <textarea id={id} ref={area} rows={6} value={body} readOnly={!canEdit} onChange={(e) => setBody(e.target.value)} maxLength={1000}
        aria-invalid={bad.length ? true : undefined} aria-describedby={`${id}-count ${id}-bad`}
        className="mt-2 w-full rounded-xl border border-[#e2dccb] p-3 text-sm leading-relaxed outline-none focus:border-gold focus:ring-4 focus:ring-gold/20 read-only:bg-[#faf7ef]" />
      <div className="mt-1 flex flex-wrap items-center justify-between gap-2 text-xs">
        <p id={`${id}-bad`} className={bad.length ? "font-semibold text-danger" : "text-[#4b5b75]"} role={bad.length ? "alert" : undefined}>
          {bad.length ? `Unknown: ${bad.map((v) => `{${v}}`).join(", ")}. Fix to save.` : "Variables: {name} {kw} {district} {area} {phone}"}
        </p>
        <p id={`${id}-count`} className={body.length > WARN ? "font-semibold text-gold-ink" : "text-[#8a94a6]"}>{body.length} characters{body.length > WARN ? " · long for WhatsApp, try to shorten" : ""}</p>
      </div>

      <div className="mt-3 rounded-xl bg-[#e7f5e4] p-3">
        <p className="text-xs font-semibold text-success">Preview</p>
        <p className="mt-1 whitespace-pre-wrap text-sm">
          {body.split(/(\{[^{}\s]*\})/g).map((part, i) => {
            const m = /^\{([^{}\s]*)\}$/.exec(part);
            if (!m) return <span key={i}>{renderTemplate(part, {})}</span>;
            const known = (TEMPLATE_VARS as readonly string[]).includes(m[1]);
            return known ? <mark key={i} className="rounded bg-[#c8e8c1] px-0.5 text-navy">{sample[m[1]] || ""}</mark>
              : <mark key={i} className="rounded bg-[#fdecea] px-0.5 font-semibold text-danger">{part}</mark>;
          })}
        </p>
      </div>

      {err && <p role="alert" className="mt-2 text-sm text-danger">{err}</p>}
      <div className="mt-3 flex items-center justify-end gap-2">
        <button type="button" onClick={copy} className="inline-flex h-10 items-center gap-1.5 rounded-full border border-[#e2dccb] px-4 text-sm font-semibold text-[#1a2b57] hover:bg-[#faf7ef]">
          {state === "copied" ? <Check className="size-4 text-success" aria-hidden /> : <Copy className="size-4" aria-hidden />}{state === "copied" ? "Copied" : "Copy message"}
        </button>
        {canEdit && (
          <button type="button" onClick={save} disabled={!dirty || bad.length > 0 || state === "saving" || !body.trim()}
            className="inline-flex h-10 items-center gap-1.5 rounded-full bg-gold px-5 text-sm font-bold text-navy disabled:opacity-50">
            {state === "saving" && <Loader2 className="size-4 animate-spin" aria-hidden />}{state === "saved" && !dirty ? "Saved" : "Save"}
          </button>
        )}
      </div>
    </section>
  );
}
