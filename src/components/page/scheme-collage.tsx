import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Sunlight } from "./banner-art";
import { solutionBanners } from "@/data/solution-hero";
import { cn, pick } from "@/lib/utils";

/** The four scheme pictures in reading order; the right column sits a little lower for movement. */
const CARDS = [
  { slug: "pm-surya-ghar", tilt: "-2deg", delay: "0s", offset: false },
  { slug: "pm-kusum", tilt: "2deg", delay: "-2.5s", offset: true },
  { slug: "net-metering", tilt: "2deg", delay: "-5s", offset: false },
  { slug: "state-schemes", tilt: "-2deg", delay: "-7.5s", offset: true },
] as const;

/**
 * Hero visual for /schemes: the four scheme pictures as a clean 2×2 grid of glass cards (even gaps, no
 * overlap), the right column offset slightly lower. The grid sways gently in 3D, each card floats on its own
 * rhythm, sunlight drifts across the pictures; hover lifts a card. Each card links to its scheme page.
 * Reduced motion: static.
 */
export function SchemeCollage() {
  const t = useTranslations("schemes");
  const locale = useLocale();
  return (
    <div className="scheme-collage relative mx-auto w-full max-w-[34rem] py-6 lg:py-10">
      <span aria-hidden className="absolute left-1/2 top-1/2 size-[80%] -translate-x-1/2 -translate-y-1/2 animate-glow rounded-full bg-[radial-gradient(circle,rgb(255_199_44/0.4),transparent_65%)]" />
      <div className="scheme-collage__sway relative grid grid-cols-2 gap-x-4 gap-y-7 sm:gap-x-5 sm:gap-y-8">
        {CARDS.map(({ slug, tilt, delay, offset }) => {
          const b = solutionBanners[slug];
          return (
            <div key={slug} className={cn(offset && "translate-y-[12%]")}>
              <Link href={`/schemes/${slug}`} className="scheme-collage__card group block" style={{ rotate: tilt, animationDelay: delay }}>
                <span className="block overflow-hidden rounded-[1.4rem] border border-white/70 bg-white/20 p-1.5 shadow-[0_30px_60px_-26px_rgb(0_0_0/0.65)] backdrop-blur-md transition-[border-color,box-shadow] duration-500 group-hover:border-[#FFD76A] group-hover:shadow-[0_40px_70px_-24px_rgb(0_0_0/0.7),0_0_40px_-10px_rgb(255_184_0/0.7)]">
                  <span className="relative block aspect-[4/3] overflow-hidden rounded-[1.05rem]">
                    <Image src={b.src} alt={pick(b.alt, locale)} width={b.width} height={b.height} priority unoptimized
                      className="size-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <Sunlight sun={b.sun} />
                    <span aria-hidden className="absolute inset-x-0 bottom-0 h-1/2 bg-[linear-gradient(0deg,rgb(7_27_73/0.85),transparent)]" />
                    <span className="absolute inset-x-3 bottom-2.5 line-clamp-2 font-heading text-[0.75rem] font-bold leading-tight text-white sm:text-caption">{t(`items.${slug}.name`)}</span>
                  </span>
                </span>
              </Link>
            </div>
          );
        })}
      </div>
      <style>{`
        .scheme-collage { perspective: 1400px; }
        .scheme-collage__sway { transform-style: preserve-3d; animation: collageSway 16s ease-in-out infinite alternate; }
        @keyframes collageSway { from { transform: rotateY(-6deg) rotateX(3deg); } to { transform: rotateY(6deg) rotateX(-2deg); } }
        .scheme-collage__card { animation: collageFloat 9s ease-in-out infinite; transition: scale .5s var(--ease-out-soft); }
        .scheme-collage__card:hover, .scheme-collage__card:focus-visible { scale: 1.05; position: relative; z-index: 10; }
        @keyframes collageFloat { 0%, 100% { translate: 0 0; } 50% { translate: 0 -10px; } }
        @media (prefers-reduced-motion: reduce) { .scheme-collage__sway, .scheme-collage__card { animation: none !important; } }
      `}</style>
    </div>
  );
}
