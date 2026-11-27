"use client";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { ArrowLeft, ArrowRight, FolderOpen, ImageIcon, MapPin } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { ChoiceChips } from "@/components/ui/choice-chips";
import { ProjectCard } from "@/components/cards/project-card";
import { DialogShell } from "@/components/ui/dialog-shell";
import { Button } from "@/components/ui/button";
import { Badge, EditMark } from "@/components/ui/badge";
import { projects as PLACEHOLDERS, type Project } from "@/config/content";
import { SCHEMES } from "@/config/schemes";
import { districts } from "@/data/districts";
import { projectsPage as D } from "@/data/projects-page";
import type { PropertyType } from "@/config/calculator";
import { formatINR, pick } from "@/lib/utils";

type TypeFilter = "all" | PropertyType;

/**
 * Gallery with Home / Farm / Business and district filters (supports ?type= and ?district= deep links),
 * animated re-layout, and a case-study pop-up per project (prev/next inside the pop-up).
 * Missing facts show [EDIT]; nothing is invented.
 */
/** `items` = projects published in the admin; without them, the placeholder slots from src/config/content.ts. */
export function ProjectsGallery({ items }: { items?: Project[] } = {}) {
  const projects = items?.length ? items : PLACEHOLDERS;
  const t = useTranslations();
  const locale = useLocale();
  const L = (v: { en: string; te: string }) => pick(v, locale);
  const [type, setType] = useState<TypeFilter>("all");
  const [district, setDistrict] = useState("all");
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const ty = q.get("type");
    if (ty === "home" || ty === "farm" || ty === "business") setType(ty);
    const d = q.get("district");
    if (d && districts.some((x) => x.slug === d)) setDistrict(d);
  }, []);

  const districtOptions = useMemo(() => {
    const used = new Set(projects.map((p) => p.district));
    return districts.filter((d) => used.has(d.slug)).sort((a, b) => a.name.en.localeCompare(b.name.en));
  }, [projects]);

  const list = projects.filter((p) => (type === "all" || p.type === type) && (district === "all" || p.district === district));
  const idx = list.findIndex((p) => p.id === openId);
  const current = idx >= 0 ? list[idx] : null;

  return (
    <div>
      <div className="card-glass-light mb-10 flex flex-col gap-5 p-5 hover:transform-none sm:flex-row sm:items-end sm:justify-between md:p-6">
        <div className="min-w-0">
          <p className="mb-2 text-caption font-semibold text-ink">{t("projects.type")}</p>
          <ChoiceChips label={t("projects.type")} layoutId="proj-type" value={type} onChange={setType}
            options={[{ value: "all", label: t("projects.all") }, ...(["home", "farm", "business"] as const).map((v) => ({ value: v, label: t(`types.${v}.name`) }))]} />
        </div>
        <div className="flex items-end gap-4">
          <label className="flex flex-1 flex-col gap-2 sm:w-64">
            <span className="text-caption font-semibold text-ink">{t("projects.district")}</span>
            <select className="field" value={district} onChange={(e) => setDistrict(e.target.value)}>
              <option value="all">{t("projects.allDistricts")}</option>
              {districtOptions.map((d) => <option key={d.slug} value={d.slug}>{pick(d.name, locale)}</option>)}
            </select>
          </label>
          <p className="hidden shrink-0 pb-3 text-caption font-semibold text-muted md:block" aria-live="polite">{L(D.count).replace("{n}", String(list.length))}</p>
        </div>
      </div>

      <motion.ul layout className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {list.map((p) => (
            <motion.li key={p.id} layout initial={{ opacity: 0, scale: 0.96, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="group relative">
              <ProjectCard p={p} />
              <button type="button" onClick={() => setOpenId(p.id)} aria-haspopup="dialog"
                aria-label={`${L(D.view)}: ${t(`types.${p.type}.name`)}, ${pick(districts.find((d) => d.slug === p.district)?.name ?? { en: "", te: "" }, locale)}`}
                className="absolute inset-0 rounded-card focus-visible:outline-offset-4">
                <span aria-hidden className="absolute bottom-5 right-5 flex translate-y-2 items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-[0.75rem] font-semibold text-white opacity-0 transition-[opacity,transform] duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                  <FolderOpen className="size-3.5" />{L(D.view)}
                </span>
              </button>
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>
      {!list.length && <p className="py-16 text-center text-muted">{t("projects.empty")}</p>}
      {!items?.length && <p className="mt-8 text-center text-caption text-muted">{L(D.placeholderNote)}</p>}

      <DialogShell open={!!current} onClose={() => setOpenId(null)} title={L(D.caseStudy)} Icon={FolderOpen} closeLabel={L(D.close)}
        footer={list.length > 1 && idx >= 0 ? (
          <div className="flex items-center justify-between gap-3">
            <Button variant="ghost" onClick={() => setOpenId(list[(idx - 1 + list.length) % list.length].id)}><ArrowLeft aria-hidden />{t("projects.prev")}</Button>
            <Button variant="ghost" onClick={() => setOpenId(list[(idx + 1) % list.length].id)}>{t("projects.next")}<ArrowRight aria-hidden /></Button>
          </div>
        ) : undefined}>
        {current && <CaseStudy p={current} />}
      </DialogShell>
    </div>
  );
}

function CaseStudy({ p }: { p: Project }) {
  const t = useTranslations();
  const locale = useLocale();
  const L = (v: { en: string; te: string }) => pick(v, locale);
  const d = districts.find((x) => x.slug === p.district);
  const place = [p.locality, d ? pick(d.name, locale) : null].filter(Boolean).join(", ");
  const cs = p.caseStudy;
  const scheme = cs?.scheme ? SCHEMES.find((s) => s.slug === cs.scheme) : null;
  const text = (v: { en: string; te: string } | null | undefined) => (v ? <p className="text-ink">{L(v)}</p> : p.fromAdmin ? null : <EditMark />);

  return (
    <motion.div key={p.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="space-y-5 px-5 py-5 md:px-7">
      <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-[#EBE3D3]">
        {p.photo
          ? <Image src={p.photo} alt={p.photos?.[0]?.alt ?? `${t(`types.${p.type}.name`)}${place ? `, ${place}` : ""}`} fill sizes="(min-width:768px) 640px, 100vw" className="object-cover" />
          : <div className="grid size-full place-items-center text-muted"><span className="flex flex-col items-center gap-2"><ImageIcon className="size-8" aria-hidden />{!p.fromAdmin && <EditMark label="[EDIT] photo" />}</span></div>}
        <Badge variant="sky" className="absolute left-3 top-3 bg-white/90 shadow-soft">{t(`types.${p.type}.name`)}</Badge>
      </div>
      <p className="flex items-center gap-1.5 text-caption text-muted"><MapPin className="size-4" aria-hidden />{place || (p.fromAdmin ? null : <EditMark />)}</p>
      <dl className="grid grid-cols-2 gap-3">
        <Fact k={L(D.size)} v={p.kw !== null ? `${p.kw} kW` : p.fromAdmin ? null : <EditMark />} />
        <Fact k={L(D.saving)} v={p.monthlySaving !== null ? <span className="text-leaf-ink">{formatINR(p.monthlySaving)}{t("common.perMonth")}</span> : p.fromAdmin ? null : <EditMark />} />
        <Fact k={L(D.scheme)} v={scheme ? <Link href={`/schemes/${scheme.slug}`} className="text-primary-hover hover:underline">{t(`schemes.items.${scheme.slug}.name`)}</Link> : p.fromAdmin ? null : <EditMark />} />
        <Fact k={L(D.completed)} v={cs?.completed ?? (p.fromAdmin ? null : <EditMark />)} />
      </dl>
      {([["challenge", cs?.challenge], ["solution", cs?.solution], ["result", cs?.result]] as const).filter(([, v]) => v || !p.fromAdmin).map(([k, v]) => (
        <section key={k}>
          <h3 className="mb-1.5 font-heading text-[1.0625rem] font-bold text-ink">{L(D[k])}</h3>
          {text(v)}
        </section>
      ))}
    </motion.div>
  );
}

function Fact({ k, v }: { k: string; v: React.ReactNode }) {
  if (v === null || v === undefined) return null;
  return (
    <div className="rounded-xl bg-cream p-3">
      <dt className="text-caption text-muted">{k}</dt>
      <dd className="mt-0.5 font-heading text-[1.0625rem] font-extrabold text-ink">{v}</dd>
    </div>
  );
}
