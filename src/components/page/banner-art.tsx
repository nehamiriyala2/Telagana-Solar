import Image from "next/image";
import { solutionBanners } from "@/data/solution-hero";
import { pick } from "@/lib/utils";

/**
 * Hero banner photo for /solutions/farms and /solutions/business (from the supplied blueprint).
 * - lg+: fills the right column and runs to the screen edge, fading into the hero background on the
 *   left/top/bottom. A 2:1 frame with object-fit: cover and a focus point chosen so the main subjects
 *   (farmer, pump, panels / building, roof panels, sign) always stay fully in view.
 * - Phones/tablets: the whole photo at its natural proportions (no cropping), full width, under the text.
 */
export function BannerArt({ kind, locale }: { kind: keyof typeof solutionBanners; locale: string }) {
  const b = solutionBanners[kind];
  return (
    <div className="banner-art relative">
      <div aria-hidden className="absolute left-[60%] top-1/2 -z-10 aspect-square w-[70%] -translate-x-1/2 -translate-y-1/2 animate-glow rounded-full bg-[radial-gradient(circle,rgb(255_210_110/0.35),transparent_70%)] max-lg:hidden" />
      <div className="banner-art__frame relative overflow-hidden">
        <Image
          src={b.src}
          alt={pick(b.alt, locale)}
          width={b.width}
          height={b.height}
          priority
          sizes="(min-width: 1024px) 60vw, 100vw"
          className="banner-art__img block h-auto w-full"
          style={{ objectPosition: b.focus }}
        />
      </div>
      <style>{`
        /* Phones/tablets: full width (cancel the page padding), whole image, soft top/bottom edges */
        .banner-art { margin-inline: -1rem; }
        @media (min-width: 768px) { .banner-art { margin-inline: -2rem; } }
        .banner-art__frame {
          -webkit-mask-image: linear-gradient(180deg, transparent 0%, #000 8%, #000 90%, transparent 100%);
                  mask-image: linear-gradient(180deg, transparent 0%, #000 8%, #000 90%, transparent 100%);
        }
        /* Desktop: right column to the screen edge, 2:1 frame, fade into the background on the left */
        @media (min-width: 1024px) {
          .banner-art { margin-left: 0; margin-right: calc(-1 * ((100vw - min(100vw, var(--content-max))) / 2 + 2rem)); }
          .banner-art__frame {
            aspect-ratio: 2 / 1;
            -webkit-mask-image: linear-gradient(90deg, transparent 0%, #000 22%), linear-gradient(180deg, transparent 0%, #000 10%, #000 88%, transparent 100%);
            -webkit-mask-composite: source-in;
                    mask-image: linear-gradient(90deg, transparent 0%, #000 22%), linear-gradient(180deg, transparent 0%, #000 10%, #000 88%, transparent 100%);
                    mask-composite: intersect;
          }
          .banner-art__img { height: 100%; object-fit: cover; }
        }
      `}</style>
    </div>
  );
}
