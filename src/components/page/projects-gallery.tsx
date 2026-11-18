"use client";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { ChoiceChips } from "@/components/ui/choice-chips";
import { ProjectCard } from "@/components/cards/project-card";
import { projects } from "@/config/content";
import { districts } from "@/data/districts";
import type { PropertyType } from "@/config/calculator";
import { pick } from "@/lib/utils";

type TypeFilter = "all" | PropertyType;

/** Gallery with Home / Farm / Business and district filters. Supports ?type= and ?district= deep links. */
export function ProjectsGallery() {
  const t = useTranslations();
  const locale = useLocale();
  const [type, setType] = useState<TypeFilter>("all");
  const [district, setDistrict] = useState("all");

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const ty = q.get("type");
    if (ty === "home" || ty === "farm" || ty === "business") setType(ty);
    const d = q.get("district");
    if (d && districts.some((x) => x.slug === d)) setDistrict(d);
  }, []);

  // Only offer districts that have projects
  const districtOptions = useMemo(() => {
    const used = new Set(projects.map((p) => p.district));
    return districts.filter((d) => used.has(d.slug)).sort((a, b) => a.name.en.localeCompare(b.name.en));
  }, []);

  const list = projects.filter((p) => (type === "all" || p.type === type) && (district === "all" || p.district === district));

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-caption font-semibold">{t("projects.type")}</p>
          <ChoiceChips label={t("projects.type")} layoutId="proj-type" value={type} onChange={setType}
            options={[{ value: "all", label: t("projects.all") }, ...(["home", "farm", "business"] as const).map((v) => ({ value: v, label: t(`types.${v}.name`) }))]} />
        </div>
        <label className="flex flex-col gap-2 sm:w-64">
          <span className="text-caption font-semibold">{t("projects.district")}</span>
          <select className="field" value={district} onChange={(e) => setDistrict(e.target.value)}>
            <option value="all">{t("projects.allDistricts")}</option>
            {districtOptions.map((d) => <option key={d.slug} value={d.slug}>{pick(d.name, locale)}</option>)}
          </select>
        </label>
      </div>

      <motion.ul layout className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-live="polite">
        <AnimatePresence mode="popLayout">
          {list.map((p) => (
            <motion.li key={p.id} layout initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.35 }}>
              <ProjectCard p={p} />
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>
      {!list.length && <p className="py-16 text-center text-muted">{t("projects.empty")}</p>}
    </div>
  );
}
