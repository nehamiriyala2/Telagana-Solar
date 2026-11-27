"use client";
import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, CircleCheck, MessageCircle, RotateCcw } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { CountUp } from "@/components/motion/count-up";
import { LeadForm } from "@/components/forms/lead-form";
import { PERSONA_ICONS } from "@/components/tools/persona-icons";
import { GUIDE_PERSONAS, type GuidePersona } from "@/config/personas";
import { calculatorConfig as C } from "@/config/calculator";
import { districts } from "@/data/districts";
import { planPage as D } from "@/data/plan-page";
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
 * Full-page "Find My Solar Plan": 3-step stepper (who → bill + roof → district) → plan.
 * Same questions, logic (buildPlan) and plan_request lead as the header pop-up; only the layout differs.
 */
export function PlanStepper() {
  const t = useTranslations();
  const locale = useLocale() as "en" | "te";
  const reduce = useReducedMotion();
  const L = (v: { en: string; te: string }) => pick(v, locale);
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [persona, setPersona] = useState<GuidePersona | null>(null);
  const [bill, setBill] = useState(C.billRange.default);
  const [area, setArea] = useState<AreaKey | null>(null);
  const [district, setDistrict] = useState("");
  const total = 3;

  const plan = useMemo(() => persona ? buildPlan({ persona, bill, roofSqft: AREA.find((a) => a.key === area)?.sqft ?? null, district }) : null, [persona, bill, area, district]);
  const districtName = districts.find((d) => d.slug === district);
  const sorted = useMemo(() => [...districts].sort((a, b) => Number(site.serviceAreas.includes(b.slug as never)) - Number(site.serviceAreas.includes(a.slug as never)) || a.name.en.localeCompare(b.name.en)), []);
  const go = (n: number) => { setDir(n > step ? 1 : -1); setStep(n); document.getElementById("plan-stepper")?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" }); };
  const finish = () => { go(total); if (plan) track({ name: "calculator_used", propertyType: plan.calc.type, kw: plan.calc.kw }); };

  const waPlan = plan ? whatsappHref(t("guide.waPlan", {
    type: t(`guide.types.${plan.type}.name`), kw: plan.calc.kw, bill: formatINR(bill), district: districtName ? pick(districtName.name, locale) : "Telangana",
  })) : null;
  const onWa = (place: string) => { track({ name: "whatsapp_click", location: place }); recordWhatsappClick(`plan-page#${place}`, locale); };

  return (
    <div id="plan-stepper" className="scroll-mt-28">
      {/* Stepper */}
      <ol className="relative mb-8 grid grid-cols-4 gap-2" aria-label={t("guide.step", { current: Math.min(step + 1, total), total })}>
        <span aria-hidden className="absolute left-[12.5%] right-[12.5%] top-5 h-1 rounded-full bg-primary/[0.08]" />
        <motion.span aria-hidden className="absolute left-[12.5%] top-5 h-1 origin-left rounded-full bg-gold" style={{ width: "75%" }}
          initial={false} animate={{ scaleX: step / total }} transition={{ duration: 0.6, ease: EASE }} />
        {[...D.steps, D.result].map((label, i) => {
          const done = i < step, on = i === step;
          return (
            <li key={i} className="relative flex flex-col items-center gap-2 text-center" aria-current={on ? "step" : undefined}>
              <span className={cn("relative z-10 grid size-11 place-items-center rounded-full font-heading font-extrabold ring-4 ring-white transition-colors duration-500",
                done ? "bg-leaf text-white" : on ? "icon-sun" : "bg-[#DCEAF7] text-muted")}>
                {done ? <Check className="size-5" aria-hidden /> : i + 1}
              </span>
              <span className={cn("text-[0.75rem] font-semibold sm:text-caption", on ? "text-ink" : "text-muted")}>{L(label)}</span>
            </li>
          );
        })}
      </ol>

      <div className="overflow-hidden rounded-[1.25rem] border border-white bg-white/85 shadow-[0_40px_90px_-50px_rgb(28_47_71/0.45)] backdrop-blur-xl">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={step} className="p-6 md:p-10"
            initial={reduce ? { opacity: 0 } : { opacity: 0, x: dir * 40 }} animate={{ opacity: 1, x: 0 }} exit={reduce ? { opacity: 0 } : { opacity: 0, x: dir * -40 }} transition={{ duration: 0.4, ease: EASE }}>
            {step === 0 && (
              <fieldset>
                <legend className="mb-6 font-heading text-[1.5rem] font-extrabold tracking-[-0.02em] text-ink md:text-[2rem]">{t("guide.q1")}</legend>
                <div role="radiogroup" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {GUIDE_PERSONAS.map((p) => {
                    const Icon = PERSONA_ICONS[p];
                    return (
                      <button key={p} type="button" role="radio" aria-checked={persona === p} onClick={() => { setPersona(p); setTimeout(() => go(1), 220); }}
                        className={cn("group flex min-h-20 items-center gap-4 rounded-xl border p-4 text-left transition-[border-color,background-color,transform,box-shadow] duration-300 hover:-translate-y-0.5",
                          persona === p ? "border-gold bg-gold-soft" : "border-line bg-white hover:border-primary-hover/40 hover:shadow-soft")}>
                        <span className={cn("grid size-12 shrink-0 place-items-center rounded-2xl transition-colors", persona === p ? "icon-sun" : "icon-primary-hover")}><Icon className="size-6" aria-hidden /></span>
                        <span className="font-semibold text-ink">{t(`guide.who.${p}`)}</span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            )}

            {step === 1 && (
              <div>
                <h2 className="mb-6 font-heading text-[1.5rem] font-extrabold tracking-[-0.02em] text-ink md:text-[2rem]">{t("guide.q2")}</h2>
                <div className="grid gap-8 lg:grid-cols-2">
                  <div className="rounded-[1.25rem] bg-[#F1F6FC] p-6 ring-1 ring-gold/20">
                    <label htmlFor="p-bill" className="text-caption font-semibold text-muted">{t("guide.billLabel")}</label>
                    <p className="font-heading text-[3rem] font-extrabold leading-tight tracking-[-0.03em] text-ink" aria-live="polite">{formatINR(bill)}</p>
                    <Slider id="p-bill" className="mt-3" value={[Math.min(bill, 50000)]} min={C.billRange.min} max={persona && ["shop", "factory", "institution"].includes(persona) ? 50000 : 20000} step={100} onValueChange={([v]) => setBill(v)} aria-label={t("guide.billLabel")} />
                  </div>
                  <div>
                    <p className="mb-3 text-caption font-semibold text-muted">{t("guide.areaLabel")}</p>
                    <div role="radiogroup" aria-label={t("guide.areaLabel")} className="grid grid-cols-2 gap-2">
                      {AREA.map((a) => (
                        <button key={a.key} type="button" role="radio" aria-checked={area === a.key} onClick={() => setArea(a.key)}
                          className={cn("min-h-12 rounded-2xl border px-3 py-3 text-caption font-semibold text-ink transition-colors duration-300", area === a.key ? "border-gold bg-gold-soft" : "border-line bg-white hover:border-primary-hover/40")}>
                          {t(`guide.area.${a.key}`)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="max-w-xl">
                <label htmlFor="p-district" className="mb-6 block font-heading text-[1.5rem] font-extrabold tracking-[-0.02em] text-ink md:text-[2rem]">{t("guide.q3")}</label>
                <select id="p-district" className="field h-14 text-[1.0625rem]" value={district} onChange={(e) => setDistrict(e.target.value)}>
                  <option value="">{t("guide.districtPh")}</option>
                  {sorted.map((d) => <option key={d.slug} value={d.slug}>{pick(d.name, locale)}</option>)}
                </select>
              </div>
            )}

            {step === total && plan && persona && (
              <div className="space-y-8">
                <div className="bg-premium-sun relative overflow-hidden rounded-[1.25rem] p-6 ring-1 ring-gold/25 md:p-8">
                  <p className="relative text-caption font-bold uppercase tracking-[0.08em] text-primary-hover">{t("guide.resultTitle")}</p>
                  <p className="relative mt-2 font-heading text-[2rem] font-extrabold leading-tight tracking-[-0.03em] text-ink md:text-[2.75rem]">{t(`guide.types.${plan.type}.name`)}</p>
                  <p className="relative mt-3 max-w-2xl text-body"><span className="font-semibold">{t("guide.whyTitle")} </span>{t(`guide.types.${plan.type}.why`)}</p>
                </div>

                <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                  <Res k={t("guide.size")} v={<><CountUp value={plan.calc.kw} /> kW</>} />
                  <Res k={t("guide.cost")} v={`${formatLakh(plan.costMin)} – ${formatLakh(plan.costMax)}`} />
                  <Res k={t("guide.saving")} v={<><CountUp value={plan.calc.monthlySaving} format={formatINR} />{t("common.perMonth")}</>} green />
                  <Res k={t("guide.payback")} v={plan.calc.paybackYears !== null ? t("common.years", { count: plan.calc.paybackYears }) : "—"} />
                </dl>

                <div className="grid gap-8 lg:grid-cols-2">
                  <div>
                    <h3 className="mb-3 font-heading text-[1.25rem] font-bold text-ink">{t("guide.schemesTitle")}</h3>
                    <ul className="space-y-2">
                      {plan.schemes.map((s) => (
                        <li key={s.slug} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-line bg-white p-4">
                          <Link href={`/schemes/${s.slug}`} className="font-semibold text-ink hover:text-primary-hover hover:underline">{t(`schemes.items.${s.slug}.name`)}</Link>
                          <span className={cn("text-caption font-semibold", s.amount ? "text-leaf-ink" : "text-muted")}>
                            {s.amount ? t("guide.estimated", { amount: formatINR(s.amount) }) : t(`schemes.items.${s.slug}.cardBenefit`)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="mb-3 font-heading text-[1.25rem] font-bold text-ink">{t("guide.nextTitle")}</h3>
                    <ul className="space-y-2.5">
                      {(["n1", "n2", "n3", "n4"] as const).map((n) => <li key={n} className="flex gap-2.5 text-ink"><CircleCheck className="mt-0.5 size-5 shrink-0 text-leaf" aria-hidden />{t(`guide.${n}`)}</li>)}
                    </ul>
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  {waPlan
                    ? <Button asChild variant="whatsapp" size="lg"><a href={waPlan} target="_blank" rel="noopener noreferrer" onClick={() => onWa("send-plan")}><MessageCircle aria-hidden />{t("guide.sendWhatsapp")}</a></Button>
                    : <Button variant="whatsapp" size="lg" disabled title="[EDIT] Set NEXT_PUBLIC_WHATSAPP_NUMBER"><MessageCircle aria-hidden />{t("guide.sendWhatsapp")}</Button>}
                  <Button variant="outline" size="lg" onClick={() => { setPersona(null); setArea(null); setDistrict(""); go(0); }}><RotateCcw aria-hidden />{L(D.restart)}</Button>
                </div>
                <p className="text-[0.75rem] text-muted">{t("guide.note")} {t("common.subsidyNote")}</p>

                <div className="rounded-[1.25rem] border border-line bg-[#DCEAF7] p-5 md:p-7">
                  <h3 className="mb-4 font-heading text-[1.25rem] font-bold text-ink">{t("guide.callbackTitle")}</h3>
                  <LeadForm kind="plan_request" fields={{ location: !district, propertyType: false }} defaultPropertyType={plan.calc.type} calc={planSummary(plan)}
                    presetLocation={district || undefined} note={`persona=${persona}; area=${area ?? "-"}; type=${plan.type}; source=plan-page`} wide />
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {step < total && (
          <div className="flex items-center justify-between gap-3 border-t border-line bg-white/70 px-6 py-4 md:px-10">
            <Button variant="ghost" onClick={() => go(step - 1)} className={step === 0 ? "invisible" : ""}><ArrowLeft aria-hidden />{t("guide.back")}</Button>
            {step < total - 1
              ? <Button variant="solid" onClick={() => go(step + 1)} disabled={step === 0 && !persona}>{t("guide.next")}<ArrowRight aria-hidden /></Button>
              : <Button className="btn-shine" onClick={finish} disabled={!persona}>{t("guide.see")}<ArrowRight aria-hidden /></Button>}
          </div>
        )}
      </div>
    </div>
  );
}

function Res({ k, v, green }: { k: string; v: React.ReactNode; green?: boolean }) {
  return (
    <div className="card-glass-light p-4 hover:transform-none">
      <dt className="text-caption text-muted">{k}</dt>
      <dd className={cn("mt-1 font-heading text-[1.25rem] font-extrabold text-ink", green && "text-leaf-ink")}>{v}</dd>
    </div>
  );
}
