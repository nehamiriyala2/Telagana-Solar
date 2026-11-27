"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, CircleCheck, Loader2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { WhatsAppButton } from "@/components/ui/contact-buttons";
import { districts } from "@/data/districts";
import { site } from "@/config/site";
import type { PropertyType } from "@/config/calculator";
import { PROPERTY_TYPES, validateLead, type FieldErrors, type LeadInput, type LeadKind } from "@/lib/leads";
import type { CalcSummary } from "@/lib/calculator";
import { track } from "@/lib/analytics";
import { cn, pick } from "@/lib/utils";

export interface LeadFormProps {
  kind: LeadKind;
  fields?: { location?: boolean; propertyType?: boolean; bill?: boolean; message?: boolean };
  defaultPropertyType?: PropertyType;
  calc?: CalcSummary | null;
  packageId?: string | null;
  submitLabel?: string;
  className?: string;
  /** Two-column layout on wide screens */
  wide?: boolean;
  /** Location already known (e.g. from the quiz), sent when the location field is hidden */
  presetLocation?: string;
  /** Extra context saved with the lead (e.g. quiz answers) */
  note?: string;
}

/**
 * One form for every lead type. Posts to /api/leads with source page, calculator result
 * Includes honeypot + timing spam checks and Indian mobile validation.
 */
export function LeadForm({ kind, fields = { location: true, propertyType: true }, defaultPropertyType, calc, packageId, submitLabel, className, wide, presetLocation, note }: LeadFormProps) {
  const t = useTranslations();
  const locale = useLocale() as "en" | "te";
  const pathname = usePathname();
  const startedAt = useRef(Date.now());
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [propertyType, setPropertyType] = useState<PropertyType | "">(defaultPropertyType ?? "");
  const [bill, setBill] = useState("");
  const [message, setMessage] = useState("");
  const [honey, setHoney] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [touched, setTouched] = useState(false);

  useEffect(() => { if (defaultPropertyType) setPropertyType(defaultPropertyType); }, [defaultPropertyType]);

  const sortedDistricts = useMemo(
    () => [...districts].sort((a, b) => Number(site.serviceAreas.includes(b.slug as never)) - Number(site.serviceAreas.includes(a.slug as never)) || a.name.en.localeCompare(b.name.en)),
    [],
  );

  const payload = (): LeadInput => ({
    kind,
    name: name.trim(),
    phone: phone.trim(),
    location: fields.location ? location : presetLocation,
    propertyType: (propertyType || calc?.type || undefined) as PropertyType | undefined,
    monthlyBill: fields.bill && bill ? Number(bill) : calc?.monthlyBill ?? null,
    message: fields.message ? [note, message.trim()].filter(Boolean).join(" | ") : note,
    slotDate: null,
    slotTime: null,
    calc: calc ?? null,
    packageId: packageId ?? null,
    sourcePage: pathname,
    locale,
    website: honey,
    elapsedMs: Date.now() - startedAt.current,
  });

  // Live re-validation after the first submit attempt
  useEffect(() => { if (touched) setErrors(validateLead(payload())); }, [name, phone, location, propertyType, touched]); // eslint-disable-line react-hooks/exhaustive-deps

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    const p = payload();
    const errs = validateLead(p);
    if (fields.location && !p.location) errs.location = "location";
    if (fields.propertyType && !p.propertyType) errs.propertyType = "propertyType";
    setErrors(errs);
    if (Object.keys(errs).length) {
      const first = Object.keys(errs)[0];
      document.getElementById(`lf-${kind}-${first}`)?.focus();
      return;
    }
    setStatus("sending");
    try {
      const res = await fetch("/api/leads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(p) });
      const data = await res.json().catch(() => ({}));
      if (res.status === 422 && data.errors) { setErrors(data.errors); setStatus("idle"); return; }
      if (!res.ok) throw new Error();
      track({ name: "lead_submit", kind, propertyType: p.propertyType, value: p.monthlyBill ?? undefined });
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  const id = (f: string) => `lf-${kind}-${f}`;
  const err = (f: keyof FieldErrors) => errors[f] ? <p id={`${id(f)}-err`} className="mt-1 text-caption text-danger">{t(`form.errors.${errors[f]}`)}</p> : null;
  const aria = (f: keyof FieldErrors) => ({ "aria-invalid": errors[f] ? true : undefined, "aria-describedby": errors[f] ? `${id(f)}-err` : undefined });

  if (status === "done") {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.45 }} className={cn("text-center", className)} role="status">
        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 16, delay: 0.1 }} className="mx-auto grid size-16 place-items-center rounded-full bg-leaf-tint text-leaf-ink">
          <CircleCheck className="size-9" aria-hidden />
        </motion.span>
        <h3 className="mt-4 text-h3">{t("form.successTitle", { name: name.split(" ")[0] })}</h3>
        <p className="mt-2 text-muted">{t("form.successBody", { hours: site.callbackHours })}</p>
        <div className="mt-6 flex flex-col items-center gap-3">
          <WhatsAppButton place={`form-success-${kind}`} label={t("form.successWhatsapp")} />
          <button type="button" className="text-caption text-muted underline underline-offset-4" onClick={() => { setStatus("idle"); setName(""); setPhone(""); setMessage(""); setTouched(false); startedAt.current = Date.now(); }}>
            {t("form.again")}
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className={cn("relative grid min-w-0 gap-4 [&>*]:min-w-0", wide && "md:grid-cols-2", className)}>
      {/* Honeypot: hidden from people, filled by bots */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>Website<input tabIndex={-1} autoComplete="off" value={honey} onChange={(e) => setHoney(e.target.value)} name="website" /></label>
      </div>

      <div>
        <label htmlFor={id("name")} className="mb-1.5 block text-caption font-semibold">{t("form.name")}</label>
        <input id={id("name")} className="field" autoComplete="name" placeholder={t("form.namePh")} value={name} onChange={(e) => setName(e.target.value)} maxLength={80} {...aria("name")} />
        {err("name")}
      </div>

      <div>
        <label htmlFor={id("phone")} className="mb-1.5 block text-caption font-semibold">{t("form.phone")}</label>
        <div className="relative">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-semibold text-muted">+91</span>
          <input id={id("phone")} className="field pl-14" type="tel" inputMode="numeric" autoComplete="tel-national" placeholder={t("form.phonePh")}
            value={phone} onChange={(e) => setPhone(e.target.value.replace(/[^\d+\s]/g, "").slice(0, 14))} {...aria("phone")} />
        </div>
        {err("phone")}
      </div>

      {fields.location && (
        <div>
          <label htmlFor={id("location")} className="mb-1.5 block text-caption font-semibold">{t("form.location")}</label>
          <select id={id("location")} className="field" value={location} onChange={(e) => setLocation(e.target.value)} {...aria("location")}>
            <option value="">{t("form.locationPh")}</option>
            {sortedDistricts.map((d) => <option key={d.slug} value={d.slug}>{pick(d.name, locale)}</option>)}
          </select>
          {err("location")}
        </div>
      )}

      {fields.propertyType && (
        <div>
          <span id={id("ptype-label")} className="mb-1.5 block text-caption font-semibold">{t("form.propertyType")}</span>
          <div role="radiogroup" aria-labelledby={id("ptype-label")} className="grid grid-cols-3 gap-2" {...aria("propertyType")}>
            {PROPERTY_TYPES.map((p, i) => (
              <button key={p} id={i === 0 ? id("propertyType") : undefined} type="button" role="radio" aria-checked={propertyType === p} onClick={() => setPropertyType(p)}
                className={cn("h-12 rounded-[1.25rem] border text-caption font-semibold transition-colors duration-300", propertyType === p ? "border-gold bg-gold-soft" : "border-line bg-white hover:border-primary-hover", errors.propertyType && "border-danger")}>
                {t(`types.${p}.name`)}
              </button>
            ))}
          </div>
          {err("propertyType")}
        </div>
      )}

      {fields.bill && (
        <div>
          <label htmlFor={id("bill")} className="mb-1.5 block text-caption font-semibold">{t("form.bill")} <span className="font-normal text-muted">({t("form.optional")})</span></label>
          <input id={id("bill")} className="field" type="number" inputMode="numeric" min={0} placeholder={t("form.billPh")} value={bill} onChange={(e) => setBill(e.target.value)} />
        </div>
      )}

      {fields.message && (
        <div className={cn(wide && "md:col-span-2")}>
          <label htmlFor={id("message")} className="mb-1.5 block text-caption font-semibold">{t("form.message")}</label>
          <textarea id={id("message")} className="field h-auto min-h-28 py-3" placeholder={t("form.messagePh")} value={message} onChange={(e) => setMessage(e.target.value)} maxLength={1000} />
        </div>
      )}


      <div className={cn(wide && "md:col-span-2")}>
        <Button type="submit" size="lg" className="w-full" disabled={status === "sending"}>
          {status === "sending" ? <><Loader2 className="animate-spin" aria-hidden />{t("form.submitting")}</> : <>{submitLabel ?? t("form.submit")}<ArrowRight aria-hidden /></>}
        </Button>
        <AnimatePresence>
          {status === "error" && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="alert" className="mt-3 text-caption text-danger">{t("form.error")}</motion.p>}
        </AnimatePresence>
        <p className="mt-3 text-[0.75rem] leading-relaxed text-muted">
          {t("form.consent")} <Link href="/privacy" className="underline underline-offset-2">{t("form.privacy")}</Link>.
        </p>
      </div>
    </form>
  );
}
