import { useLocale, useTranslations } from "next-intl";
import { ImageIcon, MapPin } from "lucide-react";
import Image from "next/image";
import { Badge, EditMark } from "@/components/ui/badge";
import type { Project } from "@/config/content";
import { districts } from "@/data/districts";
import { formatINR, pick } from "@/lib/utils";

/** Project card. Unfilled fields show [EDIT]; nothing is invented. */
export function ProjectCard({ p }: { p: Project }) {
  const t = useTranslations();
  const locale = useLocale();
  const d = districts.find((x) => x.slug === p.district);
  const place = [p.locality, d ? pick(d.name, locale) : null].filter(Boolean).join(", ");
  return (
    <article className="group h-full overflow-hidden rounded-card border border-line bg-white shadow-soft transition-[transform,box-shadow] duration-500 ease-out-soft hover:-translate-y-1 hover:shadow-lift">
      <div className="relative aspect-[4/3] overflow-hidden bg-[#EEF3FA]">
        {p.photo ? (
          <Image src={p.photo} alt={`${t(`types.${p.type}.name`)} solar project${place ? `, ${place}` : ""}`} fill sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
        ) : (
          <div className="grid size-full place-items-center text-muted">
            <span className="flex flex-col items-center gap-2"><ImageIcon className="size-8" aria-hidden /><span className="text-caption">{t("projects.photo")}</span><EditMark /></span>
          </div>
        )}
        <Badge variant="sky" className="absolute left-3 top-3 bg-white/90 shadow-soft">{t(`types.${p.type}.name`)}</Badge>
      </div>
      <div className="p-5">
        <p className="flex items-center gap-1.5 text-caption text-muted"><MapPin className="size-4" aria-hidden />{place || <EditMark />}{!p.locality && place && <EditMark className="ml-1" label="[EDIT] locality" />}</p>
        <div className="mt-3 flex items-end justify-between gap-3">
          <p className="font-heading text-h3 font-extrabold">{p.kw !== null ? <>{p.kw} kW</> : <EditMark label="[EDIT] kW" />}</p>
          <p className="text-right text-caption font-semibold text-leaf-ink">
            {p.monthlySaving !== null ? t("projects.saving", { amount: formatINR(p.monthlySaving) }) : <EditMark label="[EDIT] saving" />}
          </p>
        </div>
      </div>
    </article>
  );
}
