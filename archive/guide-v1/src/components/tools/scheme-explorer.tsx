"use client";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CircleCheck, ExternalLink, FileText, ShieldCheck, ShieldExclamationPoint } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChoiceChips } from "@/components/ui/choice-chips";
import type { Scheme, SchemeCategory, SchemeLevel } from "@/lib/types";
import { formatNum, pick } from "@/lib/utils";
import { useQueryParam } from "@/lib/use-query-param";

type CatFilter = "all" | SchemeCategory;
type LevelFilter = "all" | SchemeLevel;
const EASE = [0.22, 1, 0.36, 1] as const;

export function SchemeExplorer({ schemes }: { schemes: Scheme[] }) {
  const t = useTranslations("schemes");
  const [cat, setCat] = useState<CatFilter>("all");
  useQueryParam<SchemeCategory>("category", ["home", "farmer", "business", "apartment"], setCat);
  const [level, setLevel] = useState<LevelFilter>("all");
  const list = useMemo(
    () => schemes.filter((s) => (cat === "all" || s.categories.includes(cat)) && (level === "all" || s.level === level)),
    [schemes, cat, level],
  );

  return (
    <div>
      <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <ChoiceChips label={t("category")} layoutId="sch-cat" value={cat} onChange={setCat}
          options={(["all", "home", "apartment", "farmer", "business"] as const).map((v) => ({ value: v, label: t(v) }))} />
        <ChoiceChips label={t("level")} layoutId="sch-level" value={level} onChange={setLevel}
          options={(["all", "central", "telangana"] as const).map((v) => ({ value: v, label: t(v) }))} />
      </div>

      <motion.div layout className="space-y-6">
        <AnimatePresence mode="popLayout">
          {list.map((s) => (
            <motion.div key={s.slug} layout initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.45, ease: EASE }}>
              <SchemeCard s={s} />
            </motion.div>
          ))}
        </AnimatePresence>
        {!list.length && <p className="py-16 text-center text-muted">{t("empty")}</p>}
      </motion.div>
    </div>
  );
}

function SchemeCard({ s }: { s: Scheme }) {
  const t = useTranslations();
  const locale = useLocale();
  const L = (v: { en: string; te: string }) => pick(v, locale);

  return (
    <Card id={s.slug} className="scroll-mt-28 overflow-hidden">
      <div className="border-b border-line p-6 md:p-8">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="gold">{t(`schemes.${s.level}`)}</Badge>
          {s.categories.map((c) => <Badge key={c} variant="outline">{t(`schemes.${c}`)}</Badge>)}
          {s.verified && s.lastVerified
            ? <Badge variant="savings"><ShieldCheck aria-hidden />{t("common.lastVerified", { date: s.lastVerified })}</Badge>
            : <Badge variant="warn"><ShieldExclamationPoint aria-hidden />{t("common.needsVerification")}</Badge>}
        </div>
        <h2 className="mt-4 text-h4 md:text-h3">{L(s.name)}</h2>
        <p className="mt-2 text-muted">{L(s.short)}</p>
      </div>

      <div className="grid gap-8 p-6 md:grid-cols-2 md:p-8">
        <div className="space-y-6">
          <Block title={t("schemes.what")}><p className="text-muted">{L(s.what)}</p></Block>
          <Block title={t("schemes.eligibility")}>
            <ul className="space-y-2">
              {s.eligibility.map((e) => (
                <li key={e.en} className="flex gap-2 text-muted"><CircleCheck className="mt-1 size-4 shrink-0 text-savings-text" aria-hidden />{L(e)}</li>
              ))}
            </ul>
          </Block>
          <Block title={t("schemes.benefit")}>
            <p className="text-muted">{L(s.benefit)}</p>
            <SubsidyRule s={s} />
          </Block>
          <Block title={t("schemes.documents")}>
            <ul className="grid gap-2 sm:grid-cols-2">
              {s.documents.map((d) => (
                <li key={d.en} className="flex items-start gap-2 rounded-xl bg-fg/[0.04] px-3 py-2 text-caption"><FileText className="mt-0.5 size-4 shrink-0 text-muted" aria-hidden />{L(d)}</li>
              ))}
            </ul>
          </Block>
        </div>

        <div>
          <Block title={t("schemes.howToApply")}>
            <Timeline steps={s.steps.map((st) => ({ title: L(st.title), detail: L(st.detail) }))} />
          </Block>
          <Button asChild className="mt-6">
            <a href={s.officialUrl} target="_blank" rel="noopener noreferrer">{t("schemes.official")}<ExternalLink /></a>
          </Button>
          {!s.verified && <p className="mt-3 text-caption text-muted">{t("schemes.unverifiedNote")}</p>}
        </div>
      </div>
    </Card>
  );
}

function SubsidyRule({ s }: { s: Scheme }) {
  const t = useTranslations("schemes");
  const r = s.subsidy;
  if (r.kind === "none") return null;
  const lines: string[] = [];
  if (r.kind === "per-kw-tiers") r.tiers?.forEach((x) => lines.push(t("perKwTier", { amount: formatNum(x.perKw), kw: x.upToKw })));
  if (r.kind === "percent-of-cost") lines.push(t("percentRule", { percent: Math.round((r.percent ?? 0) * 100) }));
  if (r.cap) lines.push(t("capRule", { amount: formatNum(r.cap) }));
  return (
    <div className="mt-3 rounded-2xl border border-dashed border-line p-4">
      <p className="text-caption font-medium">{t("subsidyRule")}</p>
      <ul className="mt-1 space-y-0.5 text-caption text-muted">{lines.map((l) => <li key={l}>{l}</li>)}</ul>
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="mb-3 font-heading text-[1.0625rem] font-bold">{title}</h3>
      {children}
    </section>
  );
}

/** Animated "How to apply" timeline: line draws down, steps fade in as they enter view. */
function Timeline({ steps }: { steps: { title: string; detail: string }[] }) {
  return (
    <ol className="relative">
      <motion.span aria-hidden className="absolute left-[15px] top-2 w-0.5 origin-top bg-gradient-to-b from-gold to-amber"
        style={{ bottom: 8 }} initial={{ scaleY: 0 }} whileInView={{ scaleY: 1 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 1.2, ease: EASE }} />
      <span aria-hidden className="absolute bottom-2 left-[15px] top-2 w-0.5 bg-fg/10" style={{ zIndex: -1 }} />
      {steps.map((st, i) => (
        <motion.li key={i} className="relative flex gap-4 pb-6 last:pb-0"
          initial={{ opacity: 0, x: 12 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.5, ease: EASE, delay: 0.12 * i }}>
          <span className="relative z-10 grid size-8 shrink-0 place-items-center rounded-full bg-navy font-heading text-caption font-bold text-gold ring-4 ring-surface dark:bg-navy-600">{i + 1}</span>
          <div className="pt-1">
            <p className="font-medium">{st.title}</p>
            <p className="mt-1 text-caption text-muted">{st.detail}</p>
          </div>
        </motion.li>
      ))}
    </ol>
  );
}
