"use client";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { APIProvider, AdvancedMarker, Map, Pin } from "@vis.gl/react-google-maps";
import { BadgeCheck } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { InstallerCard } from "./installer-card";
import type { District, Installer, SolarType } from "@/lib/types";
import { cn, pick } from "@/lib/utils";
import { useQueryParam } from "@/lib/use-query-param";

const TYPES: SolarType[] = ["on-grid", "hybrid", "off-grid", "pumpset", "community", "commercial"];
const MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

export function InstallerLocator({ installers, districts }: { installers: Installer[]; districts: District[] }) {
  const t = useTranslations();
  const locale = useLocale();
  const [district, setDistrict] = useState("all");
  const [type, setType] = useState<SolarType | "all">("all");
  useQueryParam<string>("district", (v) => districts.some((d) => d.slug === v), setDistrict);
  useQueryParam<SolarType>("type", TYPES, setType);
  const [verified, setVerified] = useState(false);
  const [active, setActive] = useState<string | null>(null);

  const list = useMemo(
    () => installers
      .filter((i) => (district === "all" || i.district === district) && (type === "all" || i.types.includes(type)) && (!verified || i.verified))
      .sort((a, b) => Number(b.verified) - Number(a.verified) || b.rating - a.rating),
    [installers, district, type, verified],
  );

  const selectCls = "h-12 rounded-2xl border border-line bg-surface px-4 text-[1rem] outline-none focus:border-gold";

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <label className="flex flex-col gap-1">
          <span className="text-caption text-muted">{t("installers.district")}</span>
          <select value={district} onChange={(e) => setDistrict(e.target.value)} className={selectCls}>
            <option value="all">{t("installers.allDistricts")}</option>
            {[...districts].sort((a, b) => a.phase - b.phase || a.name.en.localeCompare(b.name.en)).map((d) => (
              <option key={d.slug} value={d.slug}>{pick(d.name, locale)}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-caption text-muted">{t("installers.type")}</span>
          <select value={type} onChange={(e) => setType(e.target.value as SolarType | "all")} className={selectCls}>
            <option value="all">{t("installers.allTypes")}</option>
            {TYPES.map((ty) => <option key={ty} value={ty}>{t(`types.${ty}.short`)}</option>)}
          </select>
        </label>
        <button type="button" role="switch" aria-checked={verified} onClick={() => setVerified((v) => !v)}
          className={cn("flex h-12 items-center gap-2 rounded-2xl border px-4 font-medium transition-colors duration-300", verified ? "border-gold bg-gold-soft text-navy dark:bg-gold/10 dark:text-cream" : "border-line bg-surface")}>
          <BadgeCheck className="size-5" aria-hidden />{t("installers.verifiedOnly")}
        </button>
        <p className="text-caption text-muted sm:ml-auto sm:self-center" aria-live="polite">{t("installers.count", { count: list.length })}</p>
      </div>

      <p className="mb-6 rounded-2xl bg-amber/10 px-4 py-3 text-caption text-[#8a4200] dark:text-gold">{t("installers.sampleNote")}</p>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="order-2 space-y-3 lg:order-1 lg:col-span-5">
          <AnimatePresence mode="popLayout">
            {list.map((i) => (
              <motion.div key={i.id} layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
                <InstallerCard installer={i} districts={districts} active={active === i.id} onFocus={() => setActive(i.id)} />
              </motion.div>
            ))}
          </AnimatePresence>
          {!list.length && <p className="py-12 text-center text-muted">{t("installers.empty")}</p>}
        </div>
        <div className="order-1 lg:order-2 lg:col-span-7">
          <div className="sticky top-[calc(var(--header-h)+1rem)] h-[320px] overflow-hidden rounded-card border border-line shadow-soft md:h-[480px] lg:h-[calc(100svh-var(--header-h)-3rem)]">
            {MAPS_KEY ? <LiveMap list={list} active={active} onSelect={setActive} /> : <PreviewMap list={list} active={active} onSelect={setActive} note={t("installers.mapMissing")} />}
          </div>
        </div>
      </div>
    </div>
  );
}

function LiveMap({ list, active, onSelect }: { list: Installer[]; active: string | null; onSelect: (id: string) => void }) {
  const focus = list.find((i) => i.id === active);
  return (
    <APIProvider apiKey={MAPS_KEY!}>
      <Map
        mapId="DEMO_MAP_ID"
        defaultCenter={{ lat: 17.42, lng: 78.45 }}
        defaultZoom={11}
        center={focus ? { lat: focus.lat, lng: focus.lng } : undefined}
        gestureHandling="cooperative"
        disableDefaultUI
        zoomControl
        style={{ width: "100%", height: "100%" }}
      >
        {list.map((i) => (
          <AdvancedMarker key={i.id} position={{ lat: i.lat, lng: i.lng }} onClick={() => onSelect(i.id)} title={i.name}>
            <Pin background={i.id === active ? "#FF8A00" : "#FFB800"} borderColor="#0B1B3A" glyphColor="#0B1B3A" scale={i.id === active ? 1.3 : 1} />
          </AdvancedMarker>
        ))}
      </Map>
    </APIProvider>
  );
}

/** Key-less stylised preview: projects lat/lng into a soft grid. */
function PreviewMap({ list, active, onSelect, note }: { list: Installer[]; active: string | null; onSelect: (id: string) => void; note: string }) {
  const pts = list.length ? list : [];
  const lats = pts.map((p) => p.lat), lngs = pts.map((p) => p.lng);
  const [minLat, maxLat] = [Math.min(17.3, ...lats) - 0.03, Math.max(17.55, ...lats) + 0.03];
  const [minLng, maxLng] = [Math.min(78.25, ...lngs) - 0.03, Math.max(78.6, ...lngs) + 0.03];
  const pos = (i: Installer) => ({ left: `${((i.lng - minLng) / (maxLng - minLng)) * 100}%`, top: `${(1 - (i.lat - minLat) / (maxLat - minLat)) * 100}%` });

  return (
    <div className="relative size-full bg-[linear-gradient(var(--line)_1px,transparent_1px),linear-gradient(90deg,var(--line)_1px,transparent_1px)] bg-surface-2 [background-size:48px_48px]">
      <svg aria-hidden className="absolute inset-0 size-full" preserveAspectRatio="none" viewBox="0 0 100 100">
        <path d="M0 62 C 20 55, 35 70, 55 58 S 85 50, 100 56" className="stroke-navy-200 dark:stroke-navy-600" strokeWidth="1.4" fill="none" />
        <ellipse cx="46" cy="52" rx="7" ry="4" className="fill-navy-200/70 dark:fill-navy-600/70" />
        <path d="M10 10 L90 90 M10 90 L90 10 M50 0 V100 M0 50 H100" className="stroke-fg/10" strokeWidth=".4" />
      </svg>
      {pts.map((i) => (
        <button key={i.id} type="button" onClick={() => onSelect(i.id)} aria-label={i.name} style={pos(i)}
          className="group absolute -translate-x-1/2 -translate-y-full">
          <motion.span animate={{ scale: i.id === active ? 1.25 : 1 }} transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className={cn("block size-8 rounded-full rounded-br-none rotate-45 border-2 border-navy shadow-lift", i.id === active ? "bg-amber" : "bg-gold")} />
          <span className={cn("pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-full bg-navy px-3 py-1 text-caption text-cream transition-opacity", i.id === active ? "opacity-100" : "opacity-0 group-hover:opacity-100")}>
            {i.area}
          </span>
        </button>
      ))}
      <p className="glass absolute bottom-3 left-3 right-3 rounded-xl px-3 py-2 text-caption text-muted">{note}</p>
    </div>
  );
}
