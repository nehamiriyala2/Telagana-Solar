"use client";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, CloudLightning, MapPin, Mountain, Search, Zap, ZapOff } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { PERSONA_ICONS } from "@/components/illustrations/persona-icons";
import { recommend, tariffFor, unitsFromBill, type FinderResult, type SolarData } from "@/lib/solar/engine";
import type { Persona, Supply } from "@/lib/types";
import { cn, formatINR, pick } from "@/lib/utils";
import { FinderResultView } from "./finder-result";
import { useQueryParam } from "@/lib/use-query-param";

const PERSONAS: Persona[] = ["urban", "apartment", "rural", "farmer", "business"];
const SUPPLIES: { value: Supply; Icon: typeof Zap }[] = [
  { value: "reliable", Icon: Zap },
  { value: "occasional", Icon: CloudLightning },
  { value: "frequent", Icon: ZapOff },
  { value: "remote", Icon: Mountain },
];
const HP = [1, 2, 3, 5, 7.5, 10];
const EASE = [0.22, 1, 0.36, 1] as const;

export function FinderWizard({ data }: { data: SolarData }) {
  const t = useTranslations();
  const locale = useLocale();
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [persona, setPersona] = useState<Persona | undefined>();
  useQueryParam<Persona>("persona", PERSONAS, (p) => { setPersona(p); setStep(1); });
  const [district, setDistrict] = useState<string>();
  const [supply, setSupply] = useState<Supply>();
  const [bill, setBill] = useState(2500);
  const [hp, setHp] = useState(5);
  const [query, setQuery] = useState("");
  const [phase, setPhase] = useState<"form" | "loading" | "result">("form");
  const [result, setResult] = useState<FinderResult | null>(null);

  const go = (n: number) => { setDir(n > step ? 1 : -1); setStep(n); };
  const choose = <T,>(setter: (v: T) => void, v: T, next: number) => { setter(v); setTimeout(() => go(next), 220); };

  const tariff = tariffFor(persona ?? "urban", data.tariffs);
  const units = useMemo(() => unitsFromBill(bill, tariff), [bill, tariff]);

  const districts = useMemo(() => {
    const q = query.trim().toLowerCase();
    return data.districts
      .filter((d) => !q || d.name.en.toLowerCase().includes(q) || d.name.te.includes(query.trim()))
      .sort((a, b) => a.phase - b.phase || a.name.en.localeCompare(b.name.en));
  }, [data.districts, query]);

  function submit() {
    if (!persona || !district || !supply) return;
    setPhase("loading");
    window.scrollTo({ top: 0, behavior: "smooth" });
    const r = recommend({ persona, district, supply, bill, pumpHp: hp }, data);
    setTimeout(() => { setResult(r); setPhase("result"); }, 900);
  }

  function reset() {
    setPhase("form"); setResult(null); setStep(0); setPersona(undefined); setDistrict(undefined); setSupply(undefined);
  }

  if (phase === "loading") return <LoadingResult label={t("finder.calculating")} />;
  if (phase === "result" && result && persona && district)
    return <FinderResultView result={result} data={data} persona={persona} district={district} onReset={reset} />;

  const titles = [t("finder.q1"), t("finder.q2"), t("finder.q3"), persona === "farmer" ? t("finder.q4farmer") : t("finder.q4")];
  const canNext = [!!persona, !!district, !!supply, true][step];

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <div className="mb-3 flex items-center justify-between text-caption text-muted">
          <span>{t("finder.progress", { current: step + 1, total: 4 })}</span>
        </div>
        <Progress value={(step + 1) / 4} label={t("finder.progress", { current: step + 1, total: 4 })} />
      </div>

      <div className="relative min-h-[420px]">
        <AnimatePresence mode="wait" custom={dir} initial={false}>
          <motion.fieldset
            key={step}
            custom={dir}
            initial={{ opacity: 0, x: dir * 48 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: dir * -48 }}
            transition={{ duration: 0.45, ease: EASE }}
          >
            <legend className="mb-6 font-heading text-h3 font-extrabold tracking-tightish">{titles[step]}</legend>

            {step === 0 && (
              <div role="radiogroup" className="grid gap-3 sm:grid-cols-2">
                {PERSONAS.map((p) => {
                  const Icon = PERSONA_ICONS[p];
                  return (
                    <OptionCard key={p} selected={persona === p} onSelect={() => choose(setPersona, p, 1)}
                      icon={<Icon className="size-6" strokeWidth={1.6} />} title={t(`personas.${p}.name`)} desc={t(`personas.${p}.desc`)} />
                  );
                })}
              </div>
            )}

            {step === 1 && (
              <div>
                <label className="relative mb-4 block">
                  <span className="sr-only">{t("finder.searchDistrict")}</span>
                  <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted" aria-hidden />
                  <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("finder.searchDistrict")}
                    className="h-14 w-full rounded-2xl border border-line bg-surface pl-12 pr-4 text-[1rem] outline-none transition-colors focus:border-gold" />
                </label>
                <div role="radiogroup" className="grid max-h-[46svh] gap-2 overflow-y-auto pr-1 sm:grid-cols-2" data-lenis-prevent>
                  {districts.map((d) => (
                    <button key={d.slug} type="button" role="radio" aria-checked={district === d.slug} onClick={() => choose(setDistrict, d.slug, 2)}
                      className={cn("flex min-h-14 items-center justify-between gap-2 rounded-2xl border px-4 py-3 text-left transition-[border-color,background-color] duration-300",
                        district === d.slug ? "border-gold bg-gold-soft/60 dark:bg-gold/10" : "border-line bg-surface hover:border-fg/25")}>
                      <span className="flex items-center gap-2 font-medium"><MapPin className="size-4 text-muted" aria-hidden />{pick(d.name, locale)}</span>
                      {d.phase === 2 && <span className="text-[0.75rem] text-muted">{t("finder.phase2")}</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div role="radiogroup" className="grid gap-3 sm:grid-cols-2">
                {SUPPLIES.map(({ value, Icon }) => (
                  <OptionCard key={value} selected={supply === value} onSelect={() => choose(setSupply, value, 3)}
                    icon={<Icon className="size-6" strokeWidth={1.6} />} title={t(`finder.supply.${value}.title`)} desc={t(`finder.supply.${value}.desc`)} />
                ))}
              </div>
            )}

            {step === 3 && persona !== "farmer" && (
              <div className="rounded-card border border-line bg-surface p-6 md:p-8">
                <label htmlFor="bill-input" className="text-caption text-muted">{t("finder.billLabel")}</label>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="font-heading text-h3 font-extrabold">₹</span>
                  <input id="bill-input" type="number" inputMode="numeric" min={200} max={50000} step={100} value={bill}
                    onChange={(e) => setBill(Math.max(0, Math.min(50000, Number(e.target.value) || 0)))}
                    className="w-full bg-transparent font-heading text-hero font-extrabold tracking-tightish outline-none md:text-hero-lg" />
                </div>
                <Slider className="mt-4" value={[Math.min(bill, 20000)]} min={300} max={20000} step={100} onValueChange={([v]) => setBill(v)} aria-label={t("finder.billLabel")} />
                <div className="mt-2 flex justify-between text-caption text-muted"><span>{formatINR(300)}</span><span>{formatINR(20000)}+</span></div>
                <p className="mt-6"><Badge variant="gold">{t("finder.billHint", { units })}</Badge></p>
              </div>
            )}

            {step === 3 && persona === "farmer" && (
              <div className="rounded-card border border-line bg-surface p-6 md:p-8">
                <p className="mb-5 text-muted">{t("finder.q4farmerHint")}</p>
                <div role="radiogroup" className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                  {HP.map((h) => (
                    <button key={h} type="button" role="radio" aria-checked={hp === h} onClick={() => setHp(h)}
                      className={cn("h-16 rounded-2xl border font-heading text-h4 font-bold transition-colors duration-300", hp === h ? "border-gold bg-sun text-navy" : "border-line hover:border-fg/25")}>
                      {t("finder.hp", { value: h })}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.fieldset>
        </AnimatePresence>
      </div>

      <div className="mt-8 flex items-center justify-between gap-3">
        <Button variant="ghost" onClick={() => go(step - 1)} disabled={step === 0} className={step === 0 ? "invisible" : ""}>
          <ArrowLeft />{t("common.back")}
        </Button>
        {step < 3 ? (
          <Button variant="navy" onClick={() => go(step + 1)} disabled={!canNext}>{t("common.next")}<ArrowRight /></Button>
        ) : (
          <Button size="lg" onClick={submit} disabled={!persona || !district || !supply}>{t("finder.seeResult")}<ArrowRight /></Button>
        )}
      </div>
    </div>
  );
}

function OptionCard({ selected, onSelect, icon, title, desc }: { selected: boolean; onSelect: () => void; icon: React.ReactNode; title: string; desc: string }) {
  return (
    <motion.button
      type="button" role="radio" aria-checked={selected} onClick={onSelect}
      whileHover={{ y: -3 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.3, ease: EASE }}
      className={cn("flex items-start gap-4 rounded-card border p-5 text-left shadow-soft transition-[border-color,background-color,box-shadow] duration-300",
        selected ? "border-gold bg-gold-soft/60 shadow-glow dark:bg-gold/10" : "border-line bg-surface hover:shadow-lift")}
    >
      <span className={cn("grid size-12 shrink-0 place-items-center rounded-2xl transition-colors duration-300", selected ? "bg-sun text-navy" : "bg-navy text-gold dark:bg-navy-700")} aria-hidden>{icon}</span>
      <span>
        <span className="block font-heading text-[1.125rem] font-bold">{title}</span>
        <span className="mt-1 block text-caption text-muted">{desc}</span>
      </span>
    </motion.button>
  );
}

function LoadingResult({ label }: { label: string }) {
  return (
    <div className="mx-auto max-w-5xl" aria-busy="true" aria-live="polite">
      <p className="mb-6 text-center text-muted">{label}</p>
      <div className="grid gap-4 md:grid-cols-3">
        <Skeleton className="h-64 md:col-span-2" />
        <Skeleton className="h-64" />
        <Skeleton className="h-32" /><Skeleton className="h-32" /><Skeleton className="h-32" />
      </div>
    </div>
  );
}
