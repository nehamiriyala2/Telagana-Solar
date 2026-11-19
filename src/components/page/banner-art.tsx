import Image from "next/image";
import { TiltCard } from "@/components/motion/tilt-card";
import { Parallax } from "@/components/motion/primitives";
import { solutionBanners } from "@/data/solution-hero";
import { pick } from "@/lib/utils";

/**
 * Hero picture for a page (from the supplied blueprints), with realistic sunlight:
 * a soft glow + slowly turning rays at the sun's position, a gentle golden light band drifting across
 * panels and roofs every few seconds, a few floating light particles, and a very slow camera drift.
 * - variant "bleed" (Farms, Business): runs to the screen edge on desktop, fades into the hero on the left.
 * - variant "card" (scheme pages, Subsidy & Loans): framed glass card with depth, 3D tilt on hover, float, parallax.
 * Phones/tablets: the whole picture at natural proportions, under the text. All motion stops for reduced motion.
 */
export function BannerArt({ kind, locale }: { kind: keyof typeof solutionBanners; locale: string }) {
  const b = solutionBanners[kind];
  const img = (
    <Image
      src={b.src}
      alt={pick(b.alt, locale)}
      width={b.width}
      height={b.height}
      priority
      sizes={b.variant === "bleed" ? "(min-width: 1024px) 60vw, 100vw" : "(min-width: 1024px) 34rem, 100vw"}
      className="banner-art__img banner-kenburns block h-auto w-full"
      style={{ objectPosition: b.focus }}
    />
  );

  if (b.variant === "card") return <PhotoCard sun={b.sun}>{img}</PhotoCard>;

  return (
    <div className="banner-art banner-reveal relative">
      <div aria-hidden className="absolute left-[60%] top-1/2 -z-10 aspect-square w-[70%] -translate-x-1/2 -translate-y-1/2 animate-glow rounded-full bg-[radial-gradient(circle,rgb(255_210_110/0.35),transparent_70%)] max-lg:hidden" />
      <div className="banner-art__frame relative overflow-hidden">
        {img}
        <Sunlight sun={b.sun} />
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

/** Sunlight over a photo: glow + rays at the sun, a drifting light band, a few light particles. Decorative. */
export function Sunlight({ sun }: { sun: { x: string; y: string } }) {
  return (
    <div aria-hidden className="sunlight">
      <span className="sunlight__rays" style={{ left: sun.x, top: sun.y }} />
      <span className="sunlight__glow" style={{ left: sun.x, top: sun.y }} />
      <span className="sunlight__sweep" />
      {[[18, 30, 0], [42, 62, -3], [66, 24, -6], [80, 70, -2], [30, 80, -8]].map(([x, y, d], i) => (
        <span key={i} className="sunlight__p" style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${d}s` }} />
      ))}
    </div>
  );
}

/** Framed glass photo card with depth: glow, gentle float, 3D tilt on hover, parallax, sunlight, entrance. */
export function PhotoCard({ children, sun }: { children: React.ReactNode; sun: { x: string; y: string } }) {
  return (
    <Parallax offset={40} className="relative mx-auto w-full max-w-[34rem] lg:mr-0">
      <div className="banner-reveal relative">
        <div aria-hidden className="absolute -inset-8 -z-10 animate-glow rounded-full bg-[radial-gradient(circle,rgb(255_210_110/0.35),transparent_68%)]" />
        <div className="float-soft" style={{ animationDuration: "9s" }}>
          <TiltCard max={4} className="rounded-[2rem]">
            <div className="rounded-[2rem] border border-white/70 bg-white/35 p-2 shadow-[0_40px_80px_-34px_rgb(7_23_63/0.55),0_0_0_1px_rgb(23_105_232/0.06)] backdrop-blur-md">
              <div className="relative overflow-hidden rounded-[1.6rem]">
                {children}
                <Sunlight sun={sun} />
                {/* glass highlight on the top edge for depth */}
                <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-1/3 bg-[linear-gradient(180deg,rgb(255_255_255/0.18),transparent)]" />
              </div>
            </div>
          </TiltCard>
        </div>
      </div>
    </Parallax>
  );
}
