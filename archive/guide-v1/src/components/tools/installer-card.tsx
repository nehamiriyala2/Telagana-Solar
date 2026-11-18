"use client";
import { BadgeCheck, MapPin, MessageCircle, Phone, Star } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { District, Installer } from "@/lib/types";
import { cn, pick } from "@/lib/utils";

export function InstallerCard({ installer: i, districts, active, onFocus, compact }: {
  installer: Installer; districts: District[]; active?: boolean; onFocus?: () => void; compact?: boolean;
}) {
  const t = useTranslations();
  const locale = useLocale();
  const district = districts.find((d) => d.slug === i.district);
  const wa = `https://wa.me/${i.whatsapp}?text=${encodeURIComponent(t("installers.whatsappText"))}`;

  return (
    <article
      className={cn("rounded-card border bg-surface p-5 shadow-soft transition-[border-color,box-shadow] duration-300", active ? "border-gold shadow-lift" : "border-line hover:shadow-lift")}
      onMouseEnter={onFocus}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-heading text-[1.0625rem] font-bold leading-snug">
            {onFocus ? <button type="button" onClick={onFocus} className="text-left hover:underline" aria-label={t("installers.showOnMap", { name: i.name })}>{i.name}</button> : i.name}
          </h3>
          <p className="mt-1 flex items-center gap-1 text-caption text-muted">
            <MapPin className="size-3.5" aria-hidden />{i.area}{district ? `, ${pick(district.name, locale)}` : ""}
          </p>
        </div>
        <p className="flex shrink-0 items-center gap-1 text-caption font-medium" aria-label={`${i.rating} / 5`}>
          <Star className="size-4 fill-gold text-gold" aria-hidden />{i.rating.toFixed(1)}
          <span className="text-muted">({t("installers.reviews", { count: i.reviews })})</span>
        </p>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {i.verified && <Badge variant="savings"><BadgeCheck aria-hidden />{t("common.verified")}</Badge>}
        {i.sample && <Badge variant="warn">{t("common.sample")}</Badge>}
        {i.types.map((ty) => <Badge key={ty} variant="outline">{t(`types.${ty}.short`)}</Badge>)}
      </div>

      {!compact && (
        <ul className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-caption text-muted" aria-label={t("installers.services")}>
          {i.services.map((s) => <li key={s.en}>· {pick(s, locale)}</li>)}
        </ul>
      )}

      <div className="mt-4 flex gap-2">
        <Button asChild size="sm" variant="navy"><a href={`tel:${i.phone}`}><Phone />{t("common.call")}</a></Button>
        <Button asChild size="sm" variant="outline"><a href={wa} target="_blank" rel="noopener noreferrer"><MessageCircle />{t("common.whatsapp")}</a></Button>
      </div>
    </article>
  );
}
