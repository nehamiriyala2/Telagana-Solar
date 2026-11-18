"use client";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, CircleCheck, MessageCircle, Sparkles } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { DialogShell } from "@/components/ui/dialog-shell";
import { LeadForm } from "@/components/forms/lead-form";
import { PERSONA_ICONS } from "@/components/tools/persona-icons";
import { GUIDE_PERSONAS, type GuidePersona } from "@/config/personas";
import { calculatorConfig as C } from "@/config/calculator";
import { districts } from "@/data/districts";
import { site } from "@/config/site";
import { buildPlan, planSummary } from "@/lib/plan";
import { recordWhatsappClick, whatsappHref } from "@/lib/contact-links";
import { track } from "@/lib/analytics";
import { cn, formatINR, formatLakh, pick } from "@/lib/utils";

const AREA = [
  { key: "xs", sqft: 150 }, { key: "s", sqft: 350 }, { key: "m", sqft: 750 }, { key: "l", sqft: null }, { key: "unsure", sqft: null },
] as const;
type AreaKey = (typeof AREA)[number]["key"];
const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Find My Solar Plan: Who are you → bill + area → district → plan.
 * Plan: solar type + why, size, cost range, every scheme with estimated benefit,
 * monthly saving (green), payback, what to do next, WhatsApp buttons, optional call-back (plan_request lead).
 */
export function GuideDialog({ open, onClose, initialPersona }: { open: boolean; onClose: () => void; initialPersona?: GuidePersona }) {
  const t = useTranslations();
  const locale = useLocale() as "en" | "te";
  const [step, setStep] = useState(initialPersona ? 1 : 0);
  const [dir, setDir] = useState(1);
  const [persona, setPersona] = useState<GuidePersona | null>(initialPersona ?? null);
  const [bill, setBill] = useState(C.billRange.default);
  const [area, setArea] = useState<AreaKey | null>(null);
  const [district, setDistrict] = useState("");
  const total = 3;

  const plan = useMemo(() => persona ? buildPlan({ persona, bill, roofSqft: AREA.find((a) => a.key === area)?.sqft ?? null, district }) : null, [persona, bill, area, district]);
  const districtName = districts.find((d) => d.slug === district);
  const go = (n: number) => { setDir(n > step ? 1 : -1); setStep(n); };
  const sorted = useMemo(() => [...districts].sort((a, b) => Number(site.serviceAreas.includes(b.slug as never)) - Number(site.serviceAreas.includes(a.slug as never)) || a.name.en.localeCompare(b.name.en)), []);

  const waPlan = plan ? whatsappHref(t("guide.waPlan", {
    type: t(`guide.types.${plan.type}.name`), kw: plan.calc.kw, bill: formatINR(bill), district: districtName ? pick(districtName.name, locale) : "Telangana",
  })) : null;
  const waAsk = whatsappHref(t("common.askMessage"));
  const onWa = (place: string) => { track({ name: "whatsapp_click", location: place }); recordWhatsappClick(`guide#${place}`, locale); };

  const footer = step < total ? (
    <div className="flex items-center justify-between gap-3">
      <Button variant="ghost" onClick={() => go(step - 1)} className={step === 0 ? "invisible" : ""}><ArrowLeft aria-hidden />{t("guide.back")}</Button>
      {step < total - 1
        ? <Button variant="navy" onClick={() => go(step + 1)} disabled={step === 0 && !persona}>{t("guide.next")}<ArrowRight aria-hidden /></Button>
        : <Button onClick={() => { go(total); if (plan) track({ name: "calculator_used", propertyType: plan.calc.type, kw: plan.calc.kw }); }} disabled={!persona}>{t("guide.see")}<ArrowRight aria-hidden /></Button>}
    </div>
  ) : undefined;

  return (
    <DialogShell open={open} onClose={onClose} title={t("guide.title")} Icon={Sparkles} closeLabel={t("guide.close")} footer={footer}>
      {step < total && (
        <div className="px-5 pt-4 md:px-7">
          <p className="mb-2 text-caption text-muted">{t("guide.step", { current: step + 1, total })}</p>
          <Progress value={(step + 1) / total} label={t("guide.step", { current: step + 1, total })} />
        </div>
      )}
      <div className="px-5 py-5 md:px-7">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={step} initial={{ opacity: 0, x: dir * 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: dir * -40 }} transition={{ duration: 0.35, ease: EASE }}>
            {step === 0 && (
              <fieldset>
                <legend className="mb-4 font-heading text-h4 font-bold">{t("guide.q1")}</legend>
                <div role="radiogroup" className="grid gap-2 sm:grid-cols-2">
                  {GUIDE_PERSONAS.map((p) => {
                    const Icon = PERSONA_ICONS[p];
                    return (
                      <button key={p} type="button" role="radio" aria-checked={persona === p} onClick={() => { setPersona(p); setTimeout(() => go(1), 200); }}
                        className={cn("flex min-h-16 items-center gap-3 rounded-2xl border p-3 text-left transition-colors duration-300", persona === p ? "border-gold bg-gold-soft" : "border-line hover:border-royal")}>
                        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-sky-tint text-royal"><Icon className="size-5" aria-hidden /></span>
                        <span className="font-semibold">{t(`guide.who.${p}`)}</span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            )}

            {step === 1 && (
              <div>
                <h3 className="mb-4 font-heading text-h4 font-bold">{t("guide.q2")}</h3>
                <label htmlFor="g-bill" className="text-caption font-semibold text-muted">{t("guide.billLabel")}</label>
                <p className="font-heading text-hero font-extrabold">{formatINR(bill)}</p>
                <Slider id="g-bill" className="mt-2" value={[Math.min(bill, 50000)]} min={C.billRange.min} max={persona && ["shop", "factory", "institution"].includes(persona) ? 50000 : 20000} step={100} onValueChange={([v]) => setBill(v)} aria-label={t("guide.billLabel")} />
                <p className="mb-2 mt-6 text-caption font-semibold text-muted">{t("guide.areaLabel")}</p>
                <div role="radiogroup" aria-label={t("guide.areaLabel")} className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {AREA.map((a) => (
                    <button key={a.key} type="button" role="radio" aria-checked={area === a.key} onClick={() => setArea(a.key)}
                      className={cn("min-h-12 rounded-2xl border px-3 py-2.5 text-caption font-semibold transition-colors duration-300", area === a.key ? "border-gold bg-gold-soft" : "border-line hover:border-royal")}>
                      {t(`guide.area.${a.key}`)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <label htmlFor="g-district" className="mb-4 block font-heading text-h4 font-bold">{t("guide.q3")}</label>
                <select id="g-district" className="field" value={district} onChange={(e) => setDistrict(e.target.value)}>
                  <option value="">{t("guide.districtPh")}</option>
                  {sorted.map((d) => <option key={d.slug} value={d.slug}>{pick(d.name, locale)}</option>)}
                </select>
              </div>
            )}

            {step === total && plan && persona && (
              <div className="space-y-5">
                <div className="relative overflow-hidden rounded-2xl bg-[linear-gradient(135deg,#FFF3D1,#FFFBF2)] p-5">
                  <div aria-hidden className="absolute -right-10 -top-10 size-36 rounded-full bg-[radial-gradient(circle,rgb(255_199_44/0.45),transparent_65%)]" />
                  <p className="text-caption font-semibold text-royal">{t("guide.resultTitle")}</p>
                  <p className="mt-1 font-heading text-h3 font-extrabold">{t(`guide.types.${plan.type}.name`)}</p>
                  <p className="mt-3 text-caption font-semibold">{t("guide.whyTitle")}</p>
                  <p className="mt-1 text-caption text-navy-700">{t(`guide.types.${plan.type}.why`)}</p>
                </div>

                <dl className="grid grid-cols-2 gap-3">
                  <Res k={t("guide.size")} v={`${plan.calc.kw} kW`} />
                  <Res k={t("guide.cost")} v={`${formatLakh(plan.costMin)} – ${formatLakh(plan.costMax)}`} />
                  <Res k={t("guide.saving")} v={`${formatINR(plan.calc.monthlySaving)}${t("common.perMonth")}`} green />
                  <Res k={t("guide.payback")} v={plan.calc.paybackYears !== null ? t("common.years", { count: plan.calc.paybackYears }) : "—"} />
                </dl>

                <div>
                  <h3 className="mb-2 font-heading text-[1.0625rem] font-bold">{t("guide.schemesTitle")}</h3>
                  <ul className="space-y-2">
                    {plan.schemes.map((s) => (
                      <li key={s.slug} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line p-3">
                        <Link href={`/schemes/${s.slug}`} onClick={onClose} className="font-semibold hover:underline">{t(`schemes.items.${s.slug}.name`)}</Link>
                        <span className={cn("text-caption font-semibold", s.amount ? "text-leaf-ink" : "text-muted")}>
                          {s.amount ? t("guide.estimated", { amount: formatINR(s.amount) }) : t(`schemes.items.${s.slug}.cardBenefit`)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="mb-2 font-heading text-[1.0625rem] font-bold">{t("guide.nextTitle")}</h3>
                  <ul className="space-y-1.5 text-caption">
                    {(["n1", "n2", "n3", "n4"] as const).map((n) => <li key={n} className="flex gap-2"><CircleCheck className="mt-0.5 size-4 shrink-0 text-leaf" aria-hidden />{t(`guide.${n}`)}</li>)}
                  </ul>
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  {waPlan
                    ? <Button asChild variant="whatsapp"><a href={waPlan} target="_blank" rel="noopener noreferrer" onClick={() => onWa("send-plan")}><MessageCircle aria-hidden />{t("guide.sendWhatsapp")}</a></Button>
                    : <Button variant="whatsapp" disabled title="[EDIT] Set NEXT_PUBLIC_WHATSAPP_NUMBER"><MessageCircle aria-hidden />{t("guide.sendWhatsapp")}</Button>}
                  {waAsk
                    ? <Button asChild variant="outline"><a href={waAsk} target="_blank" rel="noopener noreferrer" onClick={() => onWa("ask")}>{t("guide.ask")}</a></Button>
                    : <Button variant="outline" asChild><Link href="/contact" onClick={onClose}>{t("guide.ask")}</Link></Button>}
                </div>
                <p className="text-[0.75rem] text-muted">{t("guide.note")} {t("common.subsidyNote")}</p>

                <details className="rounded-2xl border border-line p-4">
                  <summary className="cursor-pointer font-semibold">{t("guide.callbackTitle")}</summary>
                  <div className="mt-4">
                    <LeadForm kind="plan_request" fields={{ location: !district, propertyType: false }} defaultPropertyType={plan.calc.type} calc={planSummary(plan)}
                      presetLocation={district || undefined} note={`persona=${persona}; area=${area ?? "-"}; type=${plan.type}`} wide />
                  </div>
                </details>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </DialogShell>
  );
}

function Res({ k, v, green }: { k: string; v: string; green?: boolean }) {
  return (
    <div className="rounded-xl bg-cream p-3">
      <dt className="text-caption text-muted">{k}</dt>
      <dd className={cn("mt-0.5 font-heading text-[1.0625rem] font-extrabold", green && "text-leaf-ink")}>{v}</dd>
    </div>
  );
}
