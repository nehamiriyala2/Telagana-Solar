"use client";
import { motion } from "framer-motion";
import { ArrowRight, ArrowUpRight, BatteryCharging, BookOpen, Leaf, RotateCcw, Ruler, ShieldExclamationPoint, Sun } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CountUp } from "@/components/motion/count-up";
import { InstallerCard } from "@/components/tools/installer-card";
import type { FinderResult, SolarData } from "@/lib/solar/engine";
import type { Persona } from "@/lib/types";
import { formatINR, formatLakh, formatNum, pick } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;
const item = (i: number) => ({
  initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, ease: EASE, delay: 0.08 * i },
});

export function FinderResultView({ result: r, data, persona, district, onReset }: {
  result: FinderResult; data: SolarData; persona: Persona; district: string; onReset: () => void;
}) {
  const t = useTranslations();
  const locale = useLocale();
  const isPump = r.type === "pumpset";
  const anyUnverified = r.schemes.some((s) => !s.verified);

  return (
    <div className="mx-auto max-w-5xl">
      {/* Headline card */}
      <motion.div {...item(0)}>
        <Card className="relative overflow-hidden p-6 md:p-10">
          <div aria-hidden className="absolute -right-24 -top-24 size-72 rounded-full bg-[radial-gradient(circle,rgb(255_184_0/0.35),transparent_65%)]" />
          <div className="relative grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p className="eyebrow">{t("result.eyebrow")}</p>
              <h2 className="mt-2 text-h3 md:text-h2-lg">{t(`types.${r.type}.name`)}</h2>
              <p className="mt-4 max-w-xl text-muted"><span className="font-medium text-fg">{t("result.why")} </span>{t(r.reasons[0])}</p>
            </div>
            <SizeRing kw={r.kw} label={t("result.size")} />
          </div>

          <dl className="relative mt-8 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-line pt-6 md:grid-cols-4">
            <Metric icon={<Ruler />} label={isPump ? t("result.land") : t("result.roof")} value={t("common.sqft", { value: formatNum(r.roofSqft) })} />
            <Metric icon={<BatteryCharging />} label={t("result.battery")} value={r.needsBattery ? t("result.batteryKwh", { value: r.batteryKwh }) : t("result.noBattery")} />
            <Metric icon={<Sun />} label={t("result.generationLabel")} value={`${formatNum(r.generationMonthly)} kWh`} />
            <Metric icon={<Leaf />} label={t("result.co2Label")} value={`${r.co2TonnesPerYear} t`} />
          </dl>
        </Card>
      </motion.div>

      {/* Money */}
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <motion.div {...item(1)}>
          <Card className="h-full p-6">
            <p className="text-caption text-muted">{t("result.cost")}</p>
            <p className="mt-2 font-heading text-h3 font-extrabold">{formatLakh(r.cost.min)} – {formatLakh(r.cost.max)}</p>
            {r.subsidy > 0 && (
              <p className="mt-3 text-caption">
                <span className="text-muted">{t("result.subsidy")}: </span>
                <span className="font-medium text-savings-text">−{formatINR(r.subsidy)}</span>
              </p>
            )}
          </Card>
        </motion.div>
        <motion.div {...item(2)}>
          <Card className="h-full border-gold/50 bg-gold-soft/40 p-6 dark:bg-gold/5">
            <p className="text-caption text-muted">{t("result.afterSubsidy")}</p>
            <p className="mt-2 font-heading text-h3 font-extrabold">{formatLakh(r.costAfterSubsidy.min)} – {formatLakh(r.costAfterSubsidy.max)}</p>
            {r.subsidyScheme && !r.subsidyScheme.verified && (
              <Badge variant="warn" className="mt-3"><ShieldExclamationPoint aria-hidden />{t("common.needsVerification")}</Badge>
            )}
          </Card>
        </motion.div>
        <motion.div {...item(3)}>
          <Card className="h-full p-6">
            {isPump ? (
              <p className="text-muted">{t("result.noPayback")}</p>
            ) : (
              <>
                <p className="text-caption text-muted">{t("result.saving")}</p>
                <p className="mt-2 font-heading text-h3 font-extrabold text-savings-text">
                  <CountUp value={r.monthlySavings} format={formatINR} /><span className="text-caption font-medium text-muted">{t("common.perMonth")}</span>
                </p>
                {r.paybackYears !== null && (
                  <p className="mt-3 text-caption text-muted">{t("result.payback")}: <span className="font-medium text-fg">{t("common.years", { count: r.paybackYears })}</span></p>
                )}
              </>
            )}
          </Card>
        </motion.div>
      </div>

      {/* Schemes */}
      <motion.section {...item(4)} className="mt-12" aria-labelledby="res-schemes">
        <Header id="res-schemes" title={t("result.schemes")} href="/schemes" more={t("result.seeAll")} />
        <div className="grid gap-4 md:grid-cols-2">
          {r.schemes.map((s) => (
            <Link key={s.slug} href={`/schemes#${s.slug}`} className="group rounded-card border border-line bg-surface p-5 shadow-soft transition-shadow duration-300 hover:shadow-lift">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-heading text-[1.0625rem] font-bold">{pick(s.name, locale)}</h3>
                <ArrowUpRight className="size-5 shrink-0 text-muted transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
              </div>
              <p className="mt-2 text-caption text-muted">{pick(s.short, locale)}</p>
              <div className="mt-3 flex gap-1.5">
                <Badge variant="outline">{t(`schemes.${s.level}`)}</Badge>
                {!s.verified && <Badge variant="warn">{t("common.needsVerification")}</Badge>}
              </div>
            </Link>
          ))}
        </div>
        {anyUnverified && <p className="mt-3 text-caption text-muted">{t("schemes.unverifiedNote")}</p>}
      </motion.section>

      {/* Installers */}
      <motion.section {...item(5)} className="mt-12" aria-labelledby="res-installers">
        <Header id="res-installers" title={t("result.installers")} href={`/installers?district=${district}`} more={t("result.seeAll")} />
        <div className="grid gap-4 md:grid-cols-3">
          {r.installers.map((i) => <InstallerCard key={i.id} installer={i} districts={data.districts} compact />)}
        </div>
        {r.installers.some((i) => i.sample) && <p className="mt-3 text-caption text-muted">{t("installers.sampleNote")}</p>}
      </motion.section>

      {/* Lessons */}
      <motion.section {...item(6)} className="mt-12" aria-labelledby="res-lessons">
        <Header id="res-lessons" title={t("result.lessons")} />
        <div className="grid gap-4 md:grid-cols-3">
          {r.lessons.map((l) => (
            <Link key={l.key} href={l.href} className="group flex gap-4 rounded-card border border-line bg-surface p-5 transition-shadow duration-300 hover:shadow-lift">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-gold-soft text-navy dark:bg-gold/10 dark:text-gold"><BookOpen className="size-5" aria-hidden /></span>
              <span>
                <span className="block font-heading font-bold">{t(`${l.key}.title`)}</span>
                <span className="mt-1 block text-caption text-muted">{t(`${l.key}.desc`)}</span>
              </span>
            </Link>
          ))}
        </div>
      </motion.section>

      <motion.div {...item(7)} className="mt-12 flex flex-col items-start justify-between gap-4 rounded-card bg-navy p-6 text-cream sm:flex-row sm:items-center md:p-8">
        <p className="max-w-lg text-caption text-navy-200">{t("common.disclaimer")}</p>
        <div className="flex gap-2">
          <Button variant="ghost" className="text-cream hover:bg-white/10" onClick={onReset}><RotateCcw />{t("common.startOver")}</Button>
          <Button asChild><Link href={`/installers?district=${district}&type=${r.type}`}>{t("result.getQuote")}<ArrowRight /></Link></Button>
        </div>
      </motion.div>
      <span className="sr-only" aria-live="polite">{t(`types.${r.type}.name`)}, {r.kw} kW, {t(`personas.${persona}.name`)}</span>
    </div>
  );
}

function Header({ id, title, href, more }: { id: string; title: string; href?: string; more?: string }) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <h2 id={id} className="text-h4 md:text-h3">{title}</h2>
      {href && more && <Link href={href} className="text-caption font-medium text-muted hover:text-fg">{more} →</Link>}
    </div>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      <dt className="flex items-center gap-1.5 text-caption text-muted [&_svg]:size-4">{icon}<span className="line-clamp-1">{label}</span></dt>
      <dd className="mt-1 font-heading text-[1.125rem] font-bold">{value}</dd>
    </div>
  );
}

/** Animated ring showing system size. */
function SizeRing({ kw, label }: { kw: number; label: string }) {
  const max = Math.max(10, Math.ceil(kw / 5) * 5);
  const c = 2 * Math.PI * 70;
  return (
    <div className="relative mx-auto grid size-44 place-items-center md:size-48">
      <svg viewBox="0 0 160 160" className="absolute inset-0 -rotate-90" aria-hidden>
        <defs><linearGradient id="ring" x1="0" x2="1"><stop offset="0" stopColor="#FFB800" /><stop offset="1" stopColor="#FF8A00" /></linearGradient></defs>
        <circle cx="80" cy="80" r="70" className="stroke-fg/10" strokeWidth="12" fill="none" />
        <motion.circle cx="80" cy="80" r="70" stroke="url(#ring)" strokeWidth="12" strokeLinecap="round" fill="none" strokeDasharray={c}
          initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: c * (1 - Math.min(1, kw / max)) }} transition={{ duration: 1.2, ease: EASE, delay: 0.3 }} />
      </svg>
      <div className="text-center">
        <p className="font-heading text-[3rem] font-extrabold leading-none tracking-tightish"><CountUp value={kw} /></p>
        <p className="mt-1 text-caption text-muted">kW · {label}</p>
      </div>
    </div>
  );
}
