import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Sunlight } from "./banner-art";
import { solutionBanners } from "@/data/solution-hero";
import { cn, pick } from "@/lib/utils";

/** The four scheme pictures, fanned out (position, size, tilt, float phase). */
const CARDS = [
  { slug: "pm-surya-ghar", pos: "left-0 top-[4%] w-[52%]", tilt: "-6deg", z: "z-20", delay: "0s", labelRight: false },
  { slug: "pm-kusum", pos: "right-0 top-0 w-[48%]", tilt: "5deg", z: "z-10", delay: "-2.5s", labelRight: true },
  { slug: "net-metering", pos: "left-[4%] bottom-[2%] w-[50%]", tilt: "4deg", z: "z-10", delay: "-5s", labelRight: false },
  { slug: "state-schemes", pos: "right-[2%] bottom-0 w-[54%]", tilt: "-4deg", z: "z-30", delay: "-7.5s", labelRight: false },
] as const;

/**
 * Hero visual for /schemes: the four scheme pictures as floating glass cards with depth, fanned around a
 * sun glow. The group sways slowly in 3D, each card floats on its own rhythm, sunlight drifts across the
 * pictures; hover lifts a card. Each card links to its scheme page. Reduced motion: static.
 */
export function SchemeCollage() {
  const t = useTranslations("schemes");
  const locale = useLocale();
  return (
    <div className="scheme-collage relative mx-auto aspect-square w-full max-w-[34rem]">
      <span aria-hidden className="absolute left-1/2 top-1/2 size-[70%] -translate-x-1/2 -translate-y-1/2 animate-glow rounded-full bg-[radial-gradient(circle,rgb(255_199_44/0.45),transparent_65%)]" />
      <div className="scheme-collage__sway absolute inset-0">
        {CARDS.map(({ slug, pos, tilt, z, delay, labelRight }) => {
          const b = solutionBanners[slug];
          return (
            <Link key={slug} href={`/schemes/${slug}`} className={cn("scheme-collage__card group absolute", pos, z)} style={{ rotate: tilt, animationDelay: delay }}>
              <span className="block overflow-hidden rounded-[1.4rem] border border-white/70 bg-white/25 p-1.5 shadow-[0_30px_60px_-24px_rgb(0_0_0/0.6)] backdrop-blur-md transition-[border-color,box-shadow] duration-500 group-hover:border-[#FFD76A] group-hover:shadow-[0_40px_70px_-24px_rgb(0_0_0/0.65),0_0_40px_-10px_rgb(255_184_0/0.7)]">
                <span className="relative block aspect-[4/3] overflow-hidden rounded-[1.05rem]">
                  <Image src={b.src} alt={pick(b.alt, locale)} width={b.width} height={b.height} priority sizes="(min-width: 1024px) 19rem, 55vw"
                    className="size-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <Sunlight sun={b.sun} />
                  <span aria-hidden className="absolute inset-x-0 bottom-0 h-2/5 bg-[linear-gradient(0deg,rgb(7_27_73/0.75),transparent)]" />
                  <span className={cn("absolute inset-x-2.5 bottom-2 line-clamp-2 font-heading text-[0.75rem] font-bold leading-tight text-white drop-shadow sm:text-caption", labelRight && "text-right")}>{t(`items.${slug}.name`)}</span>
                </span>
              </span>
            </Link>
          );
        })}
      </div>
      <style>{`
        .scheme-collage { perspective: 1400px; }
        .scheme-collage__sway { transform-style: preserve-3d; animation: collageSway 16s ease-in-out infinite alternate; }
        @keyframes collageSway { from { transform: rotateY(-9deg) rotateX(4deg); } to { transform: rotateY(9deg) rotateX(-3deg); } }
        .scheme-collage__card { animation: collageFloat 9s ease-in-out infinite; transition: scale .5s var(--ease-out-soft); }
        .scheme-collage__card:hover, .scheme-collage__card:focus-visible { scale: 1.06; z-index: 40; }
        @keyframes collageFloat { 0%, 100% { translate: 0 0; } 50% { translate: 0 -12px; } }
        @media (prefers-reduced-motion: reduce) { .scheme-collage__sway, .scheme-collage__card { animation: none !important; } }
      `}</style>
    </div>
  );
}
