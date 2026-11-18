"use client";
import { useMemo, useState } from "react";
import { BadgeIndianRupee, ExternalLink, MessageCircle } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { ChoiceChips } from "@/components/ui/choice-chips";
import { DialogShell } from "@/components/ui/dialog-shell";
import { LeadForm } from "@/components/forms/lead-form";
import { GUIDE_PERSONAS, personaConfig, type GuidePersona } from "@/config/personas";
import { SCHEMES } from "@/config/schemes";
import { districts } from "@/data/districts";
import { checkSubsidy, type SubsidyStatus } from "@/lib/plan";
import { recordWhatsappClick, whatsappHref } from "@/lib/contact-links";
import { track } from "@/lib/analytics";
import { cn, formatINR, pick } from "@/lib/utils";

const STATUS_STYLE: Record<SubsidyStatus, string> = {
  likely: "bg-leaf-tint text-leaf-ink",
  check: "bg-gold-soft text-gold-ink",
  owner: "bg-sky-tint text-royal",
};

/**
 * Check My Subsidy: property type, system size or bill, district, own/rented →
 * schemes you may qualify for, with eligibility, benefit, documents and steps.
 */
export function SubsidyDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const t = useTranslations();
  const locale = useLocale() as "en" | "te";
  const [persona, setPersona] = useState<GuidePersona>("urban");
  const [mode, setMode] = useState<"kw" | "bill">("bill");
  const [value, setValue] = useState(3000);
  const [district, setDistrict] = useState("");
  const [own, setOwn] = useState<"own" | "rented">("own");
  const [done, setDone] = useState(false);

  const res = useMemo(() => checkSubsidy({ persona, mode, value, own: own === "own" }), [persona, mode, value, own]);
  const waAsk = whatsappHref(t("common.askMessage"));
  const sortedDistricts = useMemo(() => [...districts].sort((a, b) => a.name.en.localeCompare(b.name.en)), []);

  return (
    <DialogShell open={open} onClose={onClose} title={t("checker.title")} Icon={BadgeIndianRupee} closeLabel={t("guide.close")}>
      <div className="space-y-5 px-5 py-5 md:px-7">
        {!done ? (
          <>
            <p className="text-muted">{t("checker.subtitle")}</p>
            <div>
              <label htmlFor="sc-type" className="mb-1.5 block text-caption font-semibold">{t("checker.property")}</label>
              <select id="sc-type" className="field" value={persona} onChange={(e) => setPersona(e.target.value as GuidePersona)} data-autofocus>
                {GUIDE_PERSONAS.map((p) => <option key={p} value={p}>{t(`guide.who.${p}`)}</option>)}
              </select>
            </div>
            <div>
              <p className="mb-1.5 text-caption font-semibold">{t("checker.by")}</p>
              <ChoiceChips label={t("checker.by")} layoutId="sc-mode" value={mode} onChange={(m) => { setMode(m); setValue(m === "kw" ? 3 : 3000); }}
                options={[{ value: "bill", label: t("checker.byBill") }, { value: "kw", label: t("checker.byKw") }]} />
              <label htmlFor="sc-value" className="mb-1.5 mt-3 block text-caption font-semibold">{mode === "kw" ? t("checker.kwInput") : t("checker.billInput")}</label>
              <input id="sc-value" className="field max-w-56" type="number" inputMode="decimal" min={0} step={mode === "kw" ? 0.5 : 100} value={value}
                onChange={(e) => setValue(Math.max(0, Math.min(mode === "kw" ? 1000 : 1000000, Number(e.target.value) || 0)))} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="sc-district" className="mb-1.5 block text-caption font-semibold">{t("checker.district")}</label>
                <select id="sc-district" className="field" value={district} onChange={(e) => setDistrict(e.target.value)}>
                  <option value="">{t("guide.districtPh")}</option>
                  {sortedDistricts.map((d) => <option key={d.slug} value={d.slug}>{pick(d.name, locale)}</option>)}
                </select>
              </div>
              <div>
                <p className="mb-1.5 text-caption font-semibold">{t("checker.ownership")}</p>
                <ChoiceChips label={t("checker.ownership")} layoutId="sc-own" value={own} onChange={setOwn}
                  options={[{ value: "own", label: t("checker.own") }, { value: "rented", label: t("checker.rented") }]} />
              </div>
            </div>
            <Button size="lg" className="w-full" onClick={() => setDone(true)}>{t("checker.see")}</Button>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-heading text-h4 font-bold">{t("checker.resultTitle")}</h3>
              <button type="button" onClick={() => setDone(false)} className="text-caption font-semibold text-royal underline underline-offset-4">{t("checker.back")}</button>
            </div>
            <ul className="space-y-3">
              {res.results.map((r) => {
                const scheme = SCHEMES.find((s) => s.slug === r.slug)!;
                const k = (x: string) => t(`schemes.items.${r.slug}.${x}`);
                return (
                  <li key={r.slug} className="rounded-2xl border border-line p-4">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <p className="font-heading font-bold">{k("name")}</p>
                      <span className={cn("rounded-full px-2.5 py-1 text-[0.75rem] font-semibold", STATUS_STYLE[r.status])}>{t(`checker.status.${r.status}`)}</span>
                    </div>
                    <p className="mt-2 text-caption text-navy-700">{t(`checker.explain.${r.explain}`)}</p>
                    <p className="mt-2 text-caption">
                      {r.amount
                        ? <span className="font-semibold text-leaf-ink">{t("checker.estimated", { amount: formatINR(r.amount) })}</span>
                        : <><span className="font-semibold">{t("checker.benefitLabel")}: </span>{k("cardBenefit")}</>}
                    </p>
                    <details className="mt-2 text-caption">
                      <summary className="cursor-pointer font-semibold text-royal">{t("checker.docsLabel")} · {t("checker.stepsLabel")}</summary>
                      <div className="mt-2 grid gap-3 sm:grid-cols-2">
                        <ul className="list-disc space-y-1 pl-5">{["d1", "d2", "d3", "d4"].map((d) => <li key={d}>{k(d)}</li>)}</ul>
                        <ol className="list-decimal space-y-1 pl-5">{["s1", "s2", "s3", "s4", "s5"].map((s) => <li key={s}>{k(s)}</li>)}</ol>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-3">
                        <Link href={`/schemes/${r.slug}`} onClick={onClose} className="font-semibold text-royal underline underline-offset-4">{t("schemes.learnMore")}</Link>
                        <a href={scheme.officialUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold text-royal underline underline-offset-4">{t("schemes.official")}<ExternalLink className="size-3.5" aria-hidden /></a>
                      </div>
                    </details>
                  </li>
                );
              })}
            </ul>
            <p className="text-[0.75rem] text-muted">{t("checker.note")}</p>
            {waAsk ? (
              <Button asChild variant="whatsapp" className="w-full">
                <a href={waAsk} target="_blank" rel="noopener noreferrer" onClick={() => { track({ name: "whatsapp_click", location: "subsidy-checker" }); recordWhatsappClick("subsidy-checker", locale); }}>
                  <MessageCircle aria-hidden />{t("common.askWhatsapp")}
                </a>
              </Button>
            ) : (
              <Button variant="whatsapp" className="w-full" disabled title="[EDIT] Set NEXT_PUBLIC_WHATSAPP_NUMBER"><MessageCircle aria-hidden />{t("common.askWhatsapp")}</Button>
            )}
            <details className="rounded-2xl border border-line p-4">
              <summary className="cursor-pointer font-semibold">{t("checker.callbackTitle")}</summary>
              <div className="mt-4">
                <LeadForm kind="subsidy_check" fields={{ location: !district, propertyType: false }} defaultPropertyType={personaConfig[persona].type}
                  presetLocation={district || undefined} note={`persona=${persona}; ${mode}=${value}; ${own}; kw=${res.kw}`} wide />
              </div>
            </details>
          </>
        )}
      </div>
    </DialogShell>
  );
}
