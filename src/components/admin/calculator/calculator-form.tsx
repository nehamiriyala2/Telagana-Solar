"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { CircleCheck, History, Loader2, Plus, RotateCcw, Trash2 } from "lucide-react";
import { CalcSchema, DEFAULT_CALC, VERIFY_FIELDS, homeQuote, type CalcSettings, type Discom, type Slab } from "@/lib/calc-settings";
import { inr } from "@/lib/admin/labels";
import { inputCls } from "@/components/admin/cms/fields";
import { toast } from "@/components/admin/toast";

const DISCOMS: Discom[] = ["TGSPDCL", "TGNPDCL"];
const num = (v: string) => (v.trim() === "" ? NaN : Number(v));

/** Admin → Calculator: every number the public calculator uses, a live preview and version history. */
export function CalculatorForm({ initial }: { initial: CalcSettings }) {
  const router = useRouter();
  const [s, setS] = useState<CalcSettings>(initial);
  const [saved, setSaved] = useState(JSON.stringify(initial));
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [sizes, setSizes] = useState(initial.systemSizes.join(", "));
  const [history, setHistory] = useState<{ id: number; at: string; by: string | null }[] | null>(null);
  const dirty = JSON.stringify(s) !== saved;

  const set = <K extends keyof CalcSettings>(k: K, v: CalcSettings[K]) => { setS((x) => ({ ...x, [k]: v })); setErr(null); };
  const verified = (k: string) => s.verified.includes(k);
  const toggleVerified = (k: string) => set("verified", verified(k) ? s.verified.filter((x) => x !== k) : [...s.verified, k]);
  const setSlab = (d: Discom, i: number, p: Partial<Slab>) => set("slabs", { ...s.slabs, [d]: s.slabs[d].map((x, j) => (j === i ? { ...x, ...p } : x)) });

  async function save() {
    const parsed = CalcSchema.safeParse(s);
    if (!parsed.success) { const m = parsed.error.issues[0]?.message ?? "Check the values."; setErr(m); toast(m, "err"); return; }
    setBusy(true); setErr(null);
    const res = await fetch("/api/admin/calculator", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ settings: parsed.data }) }).catch(() => null);
    setBusy(false);
    const d = await res?.json().catch(() => ({}));
    if (!res?.ok) { const m = d?.issues?.[0]?.message ?? d?.message ?? "Couldn’t save."; setErr(m); toast(m, "err"); return; }
    setSaved(JSON.stringify(parsed.data)); setHistory(null);
    toast(d.changed ? "Calculator settings saved. The website uses them now." : "No changes to save.");
    router.refresh();
  }
  async function loadHistory() {
    const res = await fetch("/api/admin/calculator").catch(() => null);
    if (!res?.ok) { toast("Couldn’t load the history.", "err"); return; }
    setHistory((await res.json()).history);
  }
  async function restore(id: number) {
    if (!window.confirm("Put the calculator back to this version?")) return;
    const res = await fetch("/api/admin/calculator", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ history_id: id }) }).catch(() => null);
    if (!res?.ok) { toast("Couldn’t restore that version.", "err"); return; }
    toast("Version restored."); window.location.reload();
  }

  const card = "rounded-2xl border border-[#ece4cf] bg-white p-5 shadow-[0_18px_40px_-34px_rgb(7_23_63/0.45)] sm:p-6";
  const verify = (k: string) => <VerifyToggle on={verified(k)} onToggle={() => toggleVerified(k)} />;
  const unverified = VERIFY_FIELDS.filter((f) => !verified(f.key));

  return (
    <div className="grid gap-6 pb-24 xl:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="min-w-0 space-y-6">
        {unverified.length > 0 && (
          <p className="rounded-xl border border-[#f5d27a] bg-[#fff8e6] px-4 py-3 text-sm text-gold-ink">
            <b>VERIFY:</b> {unverified.length} of {VERIFY_FIELDS.length} groups are not confirmed yet ({unverified.map((f) => f.label).join(", ")}). Check them against the current TGERC tariff order and the official scheme site, then tick “Confirmed”.
          </p>
        )}

        {DISCOMS.map((d) => (
          <section key={d} className={card} aria-labelledby={`slabs-${d}`}>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <h2 id={`slabs-${d}`} className="font-heading text-lg font-bold">{d} domestic tariff slabs</h2>
              {verify(`slabs.${d}`)}
            </div>
            <p className="mb-3 text-sm text-[#4b5b75]">Energy charge per unit for homes, slab by slab (telescopic). The last slab is “and above”.</p>
            <table className="w-full max-w-lg text-sm">
              <thead><tr className="text-left text-xs uppercase text-[#4b5b75]"><th className="pb-2 font-semibold">Units from</th><th className="pb-2 font-semibold">Up to</th><th className="pb-2 font-semibold">₹ per unit</th><th><span className="sr-only">Remove</span></th></tr></thead>
              <tbody>
                {s.slabs[d].map((b, i) => {
                  const from = i === 0 ? 0 : (s.slabs[d][i - 1].upto ?? 0) + 1;
                  const last = i === s.slabs[d].length - 1;
                  return (
                    <tr key={i}>
                      <td className="py-1 pr-2 text-[#4b5b75]">{from}</td>
                      <td className="py-1 pr-2">{last ? <span className="text-[#4b5b75]">and above</span>
                        : <input aria-label={`Slab ${i + 1} upper limit`} type="number" value={b.upto ?? ""} onChange={(e) => setSlab(d, i, { upto: num(e.target.value) })} className={`${inputCls} h-9 w-24`} />}</td>
                      <td className="py-1 pr-2"><input aria-label={`Slab ${i + 1} rate`} type="number" step={0.05} value={Number.isFinite(b.rate) ? b.rate : ""} onChange={(e) => setSlab(d, i, { rate: num(e.target.value) })} className={`${inputCls} h-9 w-24`} /></td>
                      <td className="py-1">{s.slabs[d].length > 1 && !last && (
                        <button type="button" aria-label={`Remove slab ${i + 1}`} onClick={() => set("slabs", { ...s.slabs, [d]: s.slabs[d].filter((_, j) => j !== i) })} className="grid size-8 place-items-center rounded-lg text-danger hover:bg-[#fdecea]"><Trash2 className="size-4" aria-hidden /></button>
                      )}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="mt-3 flex flex-wrap items-end gap-3">
              <button type="button" onClick={() => { const list = s.slabs[d]; const prevTop = list.length > 1 ? list[list.length - 2].upto ?? 0 : 0; set("slabs", { ...s.slabs, [d]: [...list.slice(0, -1), { upto: prevTop + 100, rate: list[list.length - 1].rate }, list[list.length - 1]] }); }}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-[#e2dccb] px-3 text-sm font-semibold text-[#1a2b57] hover:bg-[#faf7ef]"><Plus className="size-4" aria-hidden />Add slab</button>
              <div className="w-44"><Num label="Fixed charge / month" prefix="₹" value={s.fixedCharge[d]} onChange={(n) => set("fixedCharge", { ...s.fixedCharge, [d]: n })} /></div>
              {d === "TGSPDCL" && (
                <button type="button" onClick={() => set("slabs", { ...s.slabs, TGNPDCL: s.slabs.TGSPDCL.map((x) => ({ ...x })) })} className="h-9 rounded-xl px-3 text-sm font-semibold text-gold-ink hover:bg-[#faf7ef]">Copy these slabs to TGNPDCL</button>
              )}
            </div>
          </section>
        ))}

        <section className={card} aria-labelledby="calc-cost">
          <div className="mb-3 flex flex-wrap items-center gap-2"><h2 id="calc-cost" className="font-heading text-lg font-bold">Cost and generation</h2>{verify("costPerKw")}</div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Num label="Cost per kW · home" prefix="₹" value={s.costPerKw.home} onChange={(n) => set("costPerKw", { ...s.costPerKw, home: n })} />
            <Num label="Cost per kW · farm" prefix="₹" value={s.costPerKw.farm} onChange={(n) => set("costPerKw", { ...s.costPerKw, farm: n })} />
            <Num label="Cost per kW · business" prefix="₹" value={s.costPerKw.business} onChange={(n) => set("costPerKw", { ...s.costPerKw, business: n })} />
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <div><Num label="Units per kW per day" step={0.1} value={s.unitsPerKwDay} onChange={(n) => set("unitsPerKwDay", n)} /><div className="mt-1">{verify("unitsPerKwDay")}</div></div>
            <div><Num label="CO₂ saved, kg per unit" step={0.01} value={s.co2KgPerUnit} onChange={(n) => set("co2KgPerUnit", n)} /><div className="mt-1">{verify("co2KgPerUnit")}</div></div>
            <div>
              <label className="block text-sm font-semibold text-[#1a2b57]">System sizes for homes (kW)
                <input value={sizes} onChange={(e) => { setSizes(e.target.value); set("systemSizes", e.target.value.split(/[,\s]+/).filter(Boolean).map(Number)); }} className={`${inputCls} mt-1 h-10`} />
              </label>
              <p className="mt-1 text-xs text-[#4b5b75]">Comma separated, smallest first.</p>
              <div className="mt-1">{verify("systemSizes")}</div>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap items-end gap-4">
            <div className="w-44"><Num label="Farm tariff ₹/unit" step={0.1} value={s.flatTariff.farm} onChange={(n) => set("flatTariff", { ...s.flatTariff, farm: n })} /></div>
            <div className="w-44"><Num label="Business tariff ₹/unit" step={0.1} value={s.flatTariff.business} onChange={(n) => set("flatTariff", { ...s.flatTariff, business: n })} /></div>
            {verify("flatTariff")}
          </div>
        </section>

        <section className={card} aria-labelledby="calc-subsidy">
          <div className="mb-3 flex flex-wrap items-center gap-2"><h2 id="calc-subsidy" className="font-heading text-lg font-bold">Home subsidy (PM Surya Ghar)</h2>{verify("subsidy")}</div>
          <p className="mb-3 text-sm text-[#4b5b75]">₹ per kW in each band, then capped. Example: ₹30,000/kW up to 2 kW, ₹18,000 for the 3rd kW, capped at ₹78,000.</p>
          <div className="space-y-2">
            {s.subsidyTiers.map((t, i) => (
              <div key={i} className="flex flex-wrap items-end gap-3">
                <div className="w-36"><Num label={i === 0 ? "Up to kW" : "Next band up to kW"} step={0.5} value={t.uptoKw} onChange={(n) => set("subsidyTiers", s.subsidyTiers.map((x, j) => (j === i ? { ...x, uptoKw: n } : x)))} /></div>
                <div className="w-44"><Num label="₹ per kW" prefix="₹" value={t.perKw} onChange={(n) => set("subsidyTiers", s.subsidyTiers.map((x, j) => (j === i ? { ...x, perKw: n } : x)))} /></div>
                <button type="button" aria-label={`Remove band ${i + 1}`} onClick={() => set("subsidyTiers", s.subsidyTiers.filter((_, j) => j !== i))} className="grid size-10 place-items-center rounded-lg text-danger hover:bg-[#fdecea]"><Trash2 className="size-4" aria-hidden /></button>
              </div>
            ))}
            <button type="button" onClick={() => set("subsidyTiers", [...s.subsidyTiers, { uptoKw: (s.subsidyTiers.at(-1)?.uptoKw ?? 0) + 1, perKw: 0 }])} className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-[#e2dccb] px-3 text-sm font-semibold text-[#1a2b57] hover:bg-[#faf7ef]"><Plus className="size-4" aria-hidden />Add band</button>
          </div>
          <div className="mt-4 w-52"><Num label="Maximum subsidy" prefix="₹" value={s.subsidyCap} onChange={(n) => set("subsidyCap", n)} /></div>
        </section>

        <section className={card} aria-labelledby="calc-disc">
          <h2 id="calc-disc" className="mb-3 font-heading text-lg font-bold">Disclaimer under the results</h2>
          <div className="grid gap-3 lg:grid-cols-2">
            <label className="block text-xs font-semibold text-[#8a94a6]">English<textarea rows={4} value={s.disclaimer.en} onChange={(e) => set("disclaimer", { ...s.disclaimer, en: e.target.value })} className={`${inputCls} mt-1 py-2`} /></label>
            <label className="block text-xs font-semibold text-[#8a94a6]">తెలుగు (Telugu)<textarea lang="te" rows={4} value={s.disclaimer.te} onChange={(e) => set("disclaimer", { ...s.disclaimer, te: e.target.value })} className={`${inputCls} mt-1 py-2`} /></label>
          </div>
        </section>

        {history && (
          <section className={card} aria-labelledby="calc-hist">
            <h2 id="calc-hist" className="font-heading text-lg font-bold">Version history</h2>
            {history.length ? (
              <ul className="mt-2 divide-y divide-[#f1ece0] text-sm">
                {history.map((h) => <li key={h.id} className="flex flex-wrap items-center justify-between gap-2 py-2"><span>{h.at} · {h.by ?? "Unknown"}</span><button type="button" onClick={() => restore(h.id)} className="font-semibold text-gold-ink hover:underline">Restore this version</button></li>)}
              </ul>
            ) : <p className="mt-2 text-sm text-[#4b5b75]">No saved versions yet. The defaults are in use.</p>}
          </section>
        )}
      </div>

      <aside className="xl:sticky xl:top-20 xl:self-start"><Preview s={s} /></aside>

      <div className="sticky bottom-3 z-20 flex flex-wrap items-center gap-2 rounded-2xl border border-[#ece4cf] bg-white/95 p-3 shadow-[0_24px_48px_-24px_rgb(7_23_63/0.45)] backdrop-blur xl:col-span-2">
        <button type="button" onClick={save} disabled={busy || !dirty} className="inline-flex h-11 items-center gap-2 rounded-xl bg-navy px-5 font-semibold text-white disabled:opacity-50">{busy && <Loader2 className="size-4 animate-spin" aria-hidden />}Save settings</button>
        {dirty && <span className="text-sm font-semibold text-gold-ink">Unsaved changes</span>}
        {err && <span role="alert" className="text-sm font-semibold text-danger">{err}</span>}
        <button type="button" onClick={loadHistory} className="ml-auto inline-flex h-10 items-center gap-1.5 rounded-xl px-3 text-sm font-semibold text-[#1a2b57] hover:bg-[#faf7ef]"><History className="size-4" aria-hidden />History</button>
        <button type="button" onClick={() => { setS(DEFAULT_CALC); setSizes(DEFAULT_CALC.systemSizes.join(", ")); }} className="inline-flex h-10 items-center gap-1.5 rounded-xl px-3 text-sm font-semibold text-[#4b5b75] hover:bg-[#faf7ef]"><RotateCcw className="size-4" aria-hidden />Defaults</button>
      </div>
    </div>
  );
}

/** Live preview: what a visitor with this monthly bill sees (home, domestic connection). */
function Preview({ s }: { s: CalcSettings }) {
  const [bill, setBill] = useState("3000");
  const [discom, setDiscom] = useState<Discom>("TGSPDCL");
  const ok = CalcSchema.safeParse(s).success;
  const r = useMemo(() => (ok && Number(bill) > 0 ? homeQuote(s, Number(bill), discom) : null), [s, bill, discom, ok]);
  const row = (k: string, v: string, strong = false) => <div className="flex justify-between gap-3 py-1.5"><dt className="text-[#4b5b75]">{k}</dt><dd className={strong ? "font-bold text-navy" : "font-semibold"}>{v}</dd></div>;
  return (
    <section aria-labelledby="calc-prev" className="rounded-2xl border-2 border-gold/50 bg-white p-5 shadow-[0_18px_40px_-34px_rgb(7_23_63/0.45)]">
      <h2 id="calc-prev" className="font-heading text-lg font-bold">Live preview</h2>
      <p className="text-xs text-[#4b5b75]">A home on a domestic connection, using the values on this page (saved or not).</p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <label className="block text-xs font-semibold text-[#4b5b75]">Monthly bill (₹)<input type="number" inputMode="numeric" value={bill} onChange={(e) => setBill(e.target.value)} className={`${inputCls} mt-1 h-10`} /></label>
        <label className="block text-xs font-semibold text-[#4b5b75]">DISCOM<select value={discom} onChange={(e) => setDiscom(e.target.value as Discom)} className={`${inputCls} mt-1 h-10`}>{DISCOMS.map((d) => <option key={d}>{d}</option>)}</select></label>
      </div>
      {!ok ? <p role="alert" className="mt-3 text-sm font-semibold text-danger">Fix the values on the left to see a preview.</p>
        : !r ? <p className="mt-3 text-sm text-[#4b5b75]">Enter a monthly bill.</p>
        : (
          <dl className="mt-3 divide-y divide-[#f1ece0] text-sm" aria-live="polite">
            {row("Units per month", `${r.units}`)}
            {row("Recommended size", `${r.kw} kW`, true)}
            {row("Generates", `${r.generation} units/month`)}
            {row("Cost before subsidy", inr(r.cost))}
            {row("Subsidy", inr(r.subsidy))}
            {row("Net cost", inr(r.netCost), true)}
            {row("Saving per month", inr(r.monthlySaving), true)}
            {row("Pays back in", r.paybackYears === null ? "-" : `${r.paybackYears} years`)}
          </dl>
        )}
    </section>
  );
}

/* Module-level so inputs keep focus while typing (components defined inside a render remount every keystroke). */
function VerifyToggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <label className={`ml-auto inline-flex cursor-pointer items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${on ? "bg-[#e7f5e4] text-success" : "bg-[#fff3d1] text-gold-ink"}`}>
      <input type="checkbox" checked={on} onChange={onToggle} className="size-3.5 accent-[#2b7a23]" />
      {on ? <><CircleCheck className="size-3.5" aria-hidden />Confirmed</> : "VERIFY"}
    </label>
  );
}

function Num({ label, value, onChange, step = 1, prefix }: { label: string; value: number; onChange: (n: number) => void; step?: number; prefix?: string }) {
  return (
    <label className="block text-sm font-semibold text-[#1a2b57]">{label}
      <span className="relative mt-1 block">
        {prefix && <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#8a94a6]">{prefix}</span>}
        <input type="number" inputMode="decimal" step={step} value={Number.isFinite(value) ? value : ""} onChange={(e) => onChange(num(e.target.value))} className={`${inputCls} h-10 ${prefix ? "pl-7" : ""}`} />
      </span>
    </label>
  );
}
