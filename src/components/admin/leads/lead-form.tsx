"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Loader2, Pencil, Plus, TriangleAlert, X } from "lucide-react";
import { MANUAL_SOURCES, ROOF_LABEL, ROOFS, SOURCE_LABEL, SOURCES, USE_LABEL, USES } from "@/lib/admin/labels";
import { useStages } from "@/components/admin/stages-context";
import { toast } from "@/components/admin/toast";

export type LeadFormOptions = {
  districts: { slug: string; name_en: string; name_te: string }[];
  staff: { id: number; name: string; active: number }[];
  schemes: { slug: string; name: string }[];
};

/** Raw values (not labels) for editing. */
export type LeadFormValues = {
  name: string; phone: string; alt_phone: string; email: string; district: string; area: string; address: string;
  use_type: string; bill: string; units: string; roof: string; roof_area_sqft: string; schemes: string[]; source: string;
  status: string; assigned_to: string; note: string; is_test: boolean;
};

const EMPTY: LeadFormValues = {
  name: "", phone: "", alt_phone: "", email: "", district: "", area: "", address: "", use_type: "home", bill: "", units: "",
  roof: "", roof_area_sqft: "", schemes: [], source: "call", status: "new", assigned_to: "", note: "", is_test: false,
};

type Dup = { id: number; leadNo: string; name: string | null; status: string; owner: string | null };
type Errors = Partial<Record<keyof LeadFormValues | "form", string>>;

const PHONE_RE = /^[6-9]\d{9}$/;
const tenDigits = (v: string) => v.replace(/\D/g, "").replace(/^(91|0)(?=\d{10}$)/, "");
const intOrNull = (v: string) => (v.trim() === "" ? null : Math.round(Number(v)));

/** Client-side checks (the server checks again). */
function validate(v: LeadFormValues, mode: "create" | "edit"): Errors {
  const e: Errors = {};
  if (v.name.trim().length < 2) e.name = "Enter the customer’s name.";
  if (!PHONE_RE.test(tenDigits(v.phone))) e.phone = "Enter a 10-digit mobile number starting with 6, 7, 8 or 9.";
  if (v.alt_phone.trim() && !PHONE_RE.test(tenDigits(v.alt_phone))) e.alt_phone = "Enter a 10-digit mobile number, or leave it empty.";
  if (v.alt_phone.trim() && tenDigits(v.alt_phone) === tenDigits(v.phone)) e.alt_phone = "Same as the main phone.";
  if (v.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email.trim())) e.email = "Enter a valid email, or leave it empty.";
  for (const k of ["bill", "units", "roof_area_sqft"] as const) {
    const n = v[k].trim();
    if (n && (!/^\d+$/.test(n) || Number(n) > 10_000_000)) e[k] = "Numbers only.";
  }
  if (mode === "create" && !v.source) e.source = "Pick where this lead came from.";
  return e;
}

/** "Add lead" button + modal (create), or "Edit details" (edit). */
export function LeadFormButton({ mode, options, leadId, initial, canAssign, staffId, variant = "primary" }: {
  mode: "create" | "edit"; options: LeadFormOptions; leadId?: number; initial?: LeadFormValues; canAssign: boolean; staffId: number;
  variant?: "primary" | "outline";
}) {
  const router = useRouter();
  const st = useStages();
  const ref = useRef<HTMLDialogElement>(null);
  const [v, setV] = useState<LeadFormValues>(initial ?? EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);
  const [dups, setDups] = useState<Dup[] | null>(null);
  const dupRef = useRef<HTMLDivElement>(null);
  // The warning sits next to the phone fields; bring it into view (the form may be scrolled to the bottom).
  useEffect(() => { if (dups) dupRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }); }, [dups]);

  useEffect(() => { if (initial) setV(initial); }, [initial]);

  const open = () => { setV(initial ?? EMPTY); setErrors({}); setDups(null); ref.current?.showModal(); };
  const close = () => ref.current?.close();
  const set = <K extends keyof LeadFormValues>(k: K, val: LeadFormValues[K]) => { setV((cur) => ({ ...cur, [k]: val })); setErrors((e) => ({ ...e, [k]: undefined, form: undefined })); if (k === "phone" || k === "alt_phone") setDups(null); };

  async function submit(e: React.FormEvent, allowDuplicate = false) {
    e.preventDefault();
    const errs = validate(v, mode);
    setErrors(errs);
    if (Object.keys(errs).length) {
      ref.current?.querySelector<HTMLElement>("[aria-invalid=true]")?.focus();
      return;
    }
    const body: Record<string, unknown> = {
      name: v.name.trim(), phone: tenDigits(v.phone), alt_phone: v.alt_phone.trim() ? tenDigits(v.alt_phone) : null,
      email: v.email.trim() || null, district: v.district || null, area: v.area, address: v.address,
      use_type: v.use_type || null, bill: intOrNull(v.bill), units: intOrNull(v.units), roof: v.roof || null,
      roof_area_sqft: intOrNull(v.roof_area_sqft), schemes: v.schemes, is_test: v.is_test,
      ...(allowDuplicate ? { allow_duplicate: true } : {}),
    };
    if (mode === "create") {
      Object.assign(body, { source: v.source, status: v.status, note: v.note });
      if (canAssign) body.assigned_to = v.assigned_to ? Number(v.assigned_to) : null;
    } else {
      body.source = v.source;
    }
    setBusy(true);
    try {
      const res = await fetch(mode === "create" ? "/api/admin/leads" : `/api/admin/leads/${leadId}`, {
        method: mode === "create" ? "POST" : "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
      });
      const d = await res.json().catch(() => ({}));
      if (res.ok) {
        close();
        toast(mode === "create" ? `${d.leadNo} added.` : "Lead details saved.");
        if (mode === "create") router.push(`/admin/leads/${d.id}`); else router.refresh();
        return;
      }
      if (res.status === 409 && d.error === "duplicate") { setDups(d.matches ?? []); return; }
      if (res.status === 400 && Array.isArray(d.issues)) {
        const next: Errors = {};
        for (const i of d.issues as { path: string; message: string }[]) next[(i.path || "form") as keyof Errors] = i.message;
        setErrors(next);
        return;
      }
      setErrors({ form: d.message ?? (res.status === 403 ? "You don’t have permission to do that." : "Couldn’t save. Try again.") });
    } catch {
      setErrors({ form: "No connection. Try again." });
    } finally {
      setBusy(false);
    }
  }

  const field = "h-11 w-full rounded-xl border border-[#e2dccb] bg-white px-3 outline-none focus:border-gold focus:ring-4 focus:ring-gold/20 aria-[invalid=true]:border-danger";
  const label = (k: keyof LeadFormValues, text: string, required = false) => (
    <span className="mb-1 block text-sm font-semibold text-[#1a2b57]">{text}{required && <span className="text-danger" aria-hidden> *</span>}</span>
  );
  const err = (k: keyof LeadFormValues) => errors[k] ? <p id={`lf-${k}-err`} className="mt-1 text-xs font-semibold text-danger">{errors[k]}</p> : null;
  const inv = (k: keyof LeadFormValues) => ({ "aria-invalid": errors[k] ? true : undefined, "aria-describedby": errors[k] ? `lf-${k}-err` : undefined });
  const sourceList = mode === "create" ? MANUAL_SOURCES : SOURCES;

  return (
    <>
      {variant === "primary" ? (
        <button type="button" onClick={open} className="inline-flex h-11 items-center gap-2 rounded-xl bg-gold px-4 text-sm font-bold text-navy outline-none hover:brightness-105 focus-visible:ring-2 focus-visible:ring-navy">
          <Plus className="size-4" aria-hidden />Add lead
        </button>
      ) : (
        <button type="button" onClick={open} className="inline-flex h-11 items-center gap-2 rounded-full border border-[#e2dccb] bg-white px-5 font-semibold text-[#1a2b57] outline-none hover:bg-[#faf7ef] focus-visible:ring-4 focus-visible:ring-gold/40">
          <Pencil className="size-4" aria-hidden />Edit details
        </button>
      )}

      <dialog ref={ref} aria-labelledby="lf-title" onClose={() => setDups(null)}
        className="m-0 h-full max-h-none w-full max-w-none bg-transparent p-0 backdrop:bg-[#07173f]/50 sm:m-auto sm:h-auto sm:max-h-[92vh] sm:max-w-2xl sm:rounded-3xl">
        <form onSubmit={(e) => submit(e)} noValidate className="flex h-full flex-col bg-white sm:max-h-[92vh] sm:rounded-3xl">
          <header className="flex items-center justify-between gap-3 border-b border-[#f1ece0] px-5 py-4 sm:px-6">
            <h2 id="lf-title" className="font-heading text-xl font-bold">{mode === "create" ? "Add a lead" : "Edit lead details"}</h2>
            <button type="button" onClick={close} aria-label="Close" className="grid size-9 place-items-center rounded-full hover:bg-[#faf7ef]"><X className="size-5" aria-hidden /></button>
          </header>

          <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5 sm:px-6">
            {mode === "create" && <p className="text-sm text-[#4b5b75]">For enquiries that came by phone, WhatsApp, referral or walk-in. Website forms add leads on their own.</p>}

            <fieldset className="grid gap-4 sm:grid-cols-2">
              <legend className="mb-2 font-heading text-sm font-bold uppercase tracking-wide text-[#4b5b75]">Customer</legend>
              <label className="block sm:col-span-2">{label("name", "Name", true)}<input value={v.name} onChange={(e) => set("name", e.target.value)} maxLength={120} autoComplete="off" className={field} {...inv("name")} />{err("name")}</label>
              <label className="block">{label("phone", "Phone", true)}<input value={v.phone} onChange={(e) => set("phone", e.target.value)} inputMode="tel" maxLength={16} placeholder="98765 43210" className={field} {...inv("phone")} />{err("phone")}</label>
              <label className="block">{label("alt_phone", "Alternate phone")}<input value={v.alt_phone} onChange={(e) => set("alt_phone", e.target.value)} inputMode="tel" maxLength={16} className={field} {...inv("alt_phone")} />{err("alt_phone")}</label>
              <label className="block sm:col-span-2">{label("email", "Email")}<input type="email" value={v.email} onChange={(e) => set("email", e.target.value)} maxLength={190} className={field} {...inv("email")} />{err("email")}</label>
            </fieldset>

            {dups && (
              <div ref={dupRef} role="alert" className="rounded-2xl border border-[#f5d27a] bg-[#fff8e6] p-4 text-sm">
                <p className="flex items-center gap-2 font-bold text-[#8a5a00]"><TriangleAlert className="size-4" aria-hidden />This phone number is already on {dups.length === 1 ? "a lead" : `${dups.length} leads`}</p>
                <ul className="mt-2 space-y-1">
                  {dups.map((d) => (
                    <li key={d.id}><Link href={`/admin/leads/${d.id}`} className="font-semibold text-navy underline-offset-4 hover:underline">{d.leadNo}</Link> · {d.name ?? "No name"} · {st.label(d.status)}{d.owner ? ` · ${d.owner}` : ""}</li>
                  ))}
                </ul>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button type="button" onClick={(e) => submit(e, true)} disabled={busy} className="h-9 rounded-xl bg-navy px-3 font-semibold text-white disabled:opacity-60">Save anyway</button>
                  <button type="button" onClick={() => setDups(null)} className="h-9 rounded-xl px-3 font-semibold text-[#1a2b57] hover:bg-white">Change number</button>
                </div>
              </div>
            )}

            <fieldset className="grid gap-4 sm:grid-cols-2">
              <legend className="mb-2 font-heading text-sm font-bold uppercase tracking-wide text-[#4b5b75]">Location</legend>
              <label className="block">{label("district", "District")}
                <select value={v.district} onChange={(e) => set("district", e.target.value)} className={field} {...inv("district")}>
                  <option value="">Not known</option>
                  {options.districts.map((d) => <option key={d.slug} value={d.slug}>{d.name_en} · {d.name_te}</option>)}
                </select>{err("district")}
              </label>
              <label className="block">{label("area", "Area / village")}<input value={v.area} onChange={(e) => set("area", e.target.value)} maxLength={160} className={field} {...inv("area")} />{err("area")}</label>
              <label className="block sm:col-span-2">{label("address", "Full address")}<input value={v.address} onChange={(e) => set("address", e.target.value)} maxLength={255} className={field} {...inv("address")} />{err("address")}</label>
            </fieldset>

            <fieldset className="grid gap-4 sm:grid-cols-2">
              <legend className="mb-2 font-heading text-sm font-bold uppercase tracking-wide text-[#4b5b75]">Property and energy</legend>
              <label className="block">{label("use_type", "Property type")}
                <select value={v.use_type} onChange={(e) => set("use_type", e.target.value)} className={field}>
                  <option value="">Not known</option>
                  {USES.map((u) => <option key={u} value={u}>{USE_LABEL[u]}</option>)}
                </select>
              </label>
              <label className="block">{label("bill", "Monthly bill (₹)")}<input value={v.bill} onChange={(e) => set("bill", e.target.value)} inputMode="numeric" maxLength={8} className={field} {...inv("bill")} />{err("bill")}</label>
              <label className="block">{label("units", "Units per month (kWh)")}<input value={v.units} onChange={(e) => set("units", e.target.value)} inputMode="numeric" maxLength={7} className={field} {...inv("units")} />{err("units")}</label>
              <label className="block">{label("roof", "Roof")}
                <select value={v.roof} onChange={(e) => set("roof", e.target.value)} className={field}>
                  <option value="">Not known</option>
                  {ROOFS.map((r) => <option key={r} value={r}>{ROOF_LABEL[r]}</option>)}
                </select>
              </label>
              <label className="block">{label("roof_area_sqft", "Roof area (sq ft)")}<input value={v.roof_area_sqft} onChange={(e) => set("roof_area_sqft", e.target.value)} inputMode="numeric" maxLength={7} className={field} {...inv("roof_area_sqft")} />{err("roof_area_sqft")}</label>
              <div className="sm:col-span-2">
                <span className="mb-1 block text-sm font-semibold text-[#1a2b57]">Interested scheme</span>
                <div className="flex flex-wrap gap-2">
                  {options.schemes.map((s) => {
                    const on = v.schemes.includes(s.slug);
                    return (
                      <button key={s.slug} type="button" aria-pressed={on} onClick={() => set("schemes", on ? v.schemes.filter((x) => x !== s.slug) : [...v.schemes, s.slug])}
                        className={`rounded-full px-3 py-1.5 text-sm font-semibold ring-1 ${on ? "bg-[#e7f5e4] text-[#2b7a23] ring-[#b9e0b1]" : "bg-white text-[#4b5b75] ring-[#e2dccb] hover:bg-[#faf7ef]"}`}>{s.name}</button>
                    );
                  })}
                </div>
              </div>
            </fieldset>

            <fieldset className="grid gap-4 sm:grid-cols-2">
              <legend className="mb-2 font-heading text-sm font-bold uppercase tracking-wide text-[#4b5b75]">Lead</legend>
              <label className="block">{label("source", "Source", mode === "create")}
                <select value={v.source} onChange={(e) => set("source", e.target.value)} className={field} {...inv("source")}>
                  {sourceList.map((s) => <option key={s} value={s}>{SOURCE_LABEL[s]}</option>)}
                </select>{err("source")}
              </label>
              {mode === "create" && (
                <>
                  <label className="block">{label("status", "Status")}
                    <select value={v.status} onChange={(e) => set("status", e.target.value)} className={field}>
                      <option value="new">New</option><option value="contacted">Contacted (already spoke)</option>
                    </select>
                  </label>
                  {canAssign && (
                    <label className="block">{label("assigned_to", "Assign to")}
                      <select value={v.assigned_to} onChange={(e) => set("assigned_to", e.target.value)} className={field} {...inv("assigned_to")}>
                        <option value="">Unassigned</option>
                        {options.staff.filter((s) => s.active).map((s) => <option key={s.id} value={s.id}>{s.name}{s.id === staffId ? " (me)" : ""}</option>)}
                      </select>{err("assigned_to")}
                    </label>
                  )}
                  <label className="block sm:col-span-2">{label("note", "First note")}<textarea value={v.note} onChange={(e) => set("note", e.target.value)} rows={3} maxLength={2000} placeholder="What did they ask about?" className={`${field} h-auto py-2`} /></label>
                </>
              )}
              <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-[#1a2b57] sm:col-span-2">
                <input type="checkbox" checked={v.is_test} onChange={(e) => set("is_test", e.target.checked)} className="size-4 accent-[#f5a800]" />
                Test data (hidden from lists and reports unless “Include test data” is on)
              </label>
            </fieldset>
          </div>

          <footer className="flex flex-wrap items-center justify-end gap-2 border-t border-[#f1ece0] px-5 py-4 sm:px-6">
            {errors.form && <p role="alert" className="mr-auto text-sm font-semibold text-danger">{errors.form}</p>}
            {Object.keys(errors).some((k) => k !== "form" && errors[k as keyof Errors]) && !errors.form && <p role="alert" className="mr-auto text-sm font-semibold text-danger">Fix the highlighted fields.</p>}
            <button type="button" onClick={close} className="h-11 rounded-xl px-4 font-semibold text-[#4b5b75] hover:bg-[#faf7ef]">Cancel</button>
            <button type="submit" disabled={busy} className="inline-flex h-11 items-center gap-2 rounded-xl bg-navy px-5 font-semibold text-white disabled:opacity-60">
              {busy && <Loader2 className="size-4 animate-spin" aria-hidden />}{mode === "create" ? "Add lead" : "Save changes"}
            </button>
          </footer>
        </form>
      </dialog>
    </>
  );
}
