import Image from "next/image";
import { Cog, Gauge, House, IndianRupee } from "lucide-react";
import { homesHeroChips, homesHeroImageAlt } from "@/data/solution-hero";
import { pick } from "@/lib/utils";

const ICONS = { size: House, subsidy: IndianRupee, install: Cog, net: Gauge } as const;

/**
 * Hero art for /solutions/homes (layout from the supplied blueprint): the 3D solar house (transparent WebP
 * cut from the blueprint, object-fit: contain) on the right with a soft golden glow and a gentle float,
 * and the four labels stacked on its left. From 1400px the house may extend into the empty page margin,
 * never past the screen edge (widths are tuned per breakpoint so nothing is cropped). Phones: labels below.
 */
export function HomeHeroArt({ locale }: { locale: string }) {
  return (
    <div className="hha relative w-full">
      <div className="relative">
        <div className="hha-house relative">
          {/* Golden glow behind the house */}
          <div aria-hidden className="absolute left-1/2 top-[45%] -z-10 aspect-square w-[85%] -translate-x-1/2 -translate-y-1/2 animate-glow rounded-full bg-[radial-gradient(circle,rgb(255_210_110/0.5),rgb(255_199_44/0.16)_45%,transparent_70%)]" />
          <div className="float-soft" style={{ animationDuration: "7s" }}>
            <Image
              src="/solutions/home-solar-house.webp"
              alt={pick(homesHeroImageAlt, locale)}
              width={826}
              height={679}
              priority
              sizes="(min-width: 1400px) 560px, (min-width: 1024px) 40vw, (min-width: 768px) 72vw, 100vw"
              className="h-auto w-full object-contain drop-shadow-[0_30px_40px_rgb(7_23_63/0.16)]"
            />
          </div>
        </div>

        {/* Labels on the left of the house (md+) */}
        <ul className="absolute left-0 top-[12%] hidden h-[66%] flex-col justify-between md:flex">
          <span aria-hidden className="absolute bottom-6 left-[1.3rem] top-6 w-0.5 rounded-full bg-[linear-gradient(180deg,#FFC72C,#F5A800)] opacity-60 lg:left-[1.4rem]" />
          {homesHeroChips.map((c, i) => <Chip key={c.key} k={c.key} label={pick(c.label, locale)} delay={i * -1.2} />)}
        </ul>
      </div>

      {/* Phones: labels below the house */}
      <ul className="mt-4 grid grid-cols-2 gap-2 md:hidden">
        {homesHeroChips.map((c) => <Chip key={c.key} k={c.key} label={pick(c.label, locale)} compact />)}
      </ul>

      <style>{`
        /* House position: labels take the left part; house fills the rest (and may use the page margin on wide screens) */
        @media (min-width: 768px)  { .hha-house { margin-left: 30%; width: 70%; } }
        @media (min-width: 1024px) { .hha-house { margin-left: 33%; width: 72%; } }
        @media (min-width: 1280px) { .hha-house { margin-left: 30%; width: 78%; } }
        @media (min-width: 1400px) { .hha-house { margin-left: 30%; width: 90%; } }
      `}</style>
    </div>
  );
}

function Chip({ k, label, delay = 0, compact = false }: { k: keyof typeof ICONS; label: string; delay?: number; compact?: boolean }) {
  const Icon = ICONS[k];
  return (
    <li className="relative list-none">
      <div className={`${compact ? "" : "float-soft"} flex items-center gap-2.5 rounded-full border border-white bg-white/90 py-1.5 pl-1.5 pr-4 shadow-[0_14px_30px_-16px_rgb(7_23_63/0.4)] backdrop-blur`}
        style={compact ? undefined : { animationDelay: `${delay}s` }}>
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white text-gold-ink ring-2 ring-gold/70">
          <Icon className="size-5" strokeWidth={2} aria-hidden />
        </span>
        <span className={`font-heading text-[0.8125rem] font-bold leading-tight text-navy ${compact ? "" : "max-w-[7.5rem] xl:max-w-[8.5rem] xl:text-[0.875rem]"}`}>{label}</span>
      </div>
    </li>
  );
}
