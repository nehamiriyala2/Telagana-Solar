import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { PERSONAS, type Persona } from "@/config/personas";
import { personaMedia } from "@/data/personas-media";

/**
 * 3D "solar system" for the visitor types: a glowing sun at the centre and every category picture on a
 * circular orbit tilted in perspective (pictures at the back are smaller and pass behind the sun).
 * Each picture is joined to the sun by a sharp golden ray with a glowing end point and a light pulse
 * travelling outward. Pictures always stay upright and face the viewer. Pure CSS 3D (no libraries):
 * tilt plane → spinning ring → arm (angle) → un-angle → counter-spin → un-tilt → picture.
 * Pauses on hover; static for reduced motion. Decorative duplicate of the cards below (aria-hidden, not tabbable).
 */
export function SolarOrbit() {
  const t = useTranslations("personas");
  const items = PERSONAS.filter((p) => personaMedia[p]) as Persona[];
  const n = items.length;

  return (
    <div aria-hidden className="orbit3d-wrap relative mx-auto w-full">
      {/* Sunlight beams radiating from the sun: own layer behind the 3D scene, so they never cross the rays */}
      <span className="orbit3d__beams" />
      <div className="orbit3d relative w-full">

      {/* Tilted orbital plane */}
      <div className="orbit3d__plane">
        <div className="orbit3d__spin">
          {/* Orbit path + golden rays (lie in the plane, so they rotate with the pictures) */}
          <svg viewBox="0 0 100 100" shapeRendering="geometricPrecision" className="absolute inset-0 size-full overflow-visible">
            <circle cx="50" cy="50" r="50" className="orbit3d__path" />
            <circle cx="50" cy="50" r="31" className="orbit3d__path orbit3d__path--inner" />
            {items.map((p, i) => {
              const a = (i / n) * Math.PI * 2;
              const x = 50 + 50 * Math.sin(a), y = 50 - 50 * Math.cos(a);
              return (
                <g key={p}>
                  <line x1="50" y1="50" x2={x} y2={y} className="orbit3d__ray" />
                  <line x1="50" y1="50" x2={x} y2={y} pathLength={100} className="orbit3d__pulse" style={{ animationDelay: `${(i / n) * -2.4}s` }} />
                  <circle cx={x} cy={y} r="1.1" className="orbit3d__node" />
                </g>
              );
            })}
          </svg>

          {items.map((p, i) => {
            const m = personaMedia[p]!;
            const angle = (i / n) * 360;
            return (
              <div key={p} className="orbit3d__arm" style={{ transform: `rotate(${angle}deg)` }}>
                <div className="orbit3d__anchor">
                  <div className="orbit3d__3d" style={{ transform: `rotate(${-angle}deg)` }}>
                    <div className="orbit3d__counter">
                      <div className="orbit3d__upright">
                        <Link href={`/for/${p}`} tabIndex={-1} className="orbit3d__item group">
                          <span className="orbit3d__thumb">
                            <Image src={m.card.src} alt="" width={240} height={150} sizes="(min-width: 768px) 152px, 96px" className="size-full object-cover transition-transform duration-700 group-hover:scale-110" style={{ objectPosition: m.focus ?? "50% 50%" }} />
                          </span>
                          <span className="orbit3d__label">{t(`${p}.name`)}</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* The sun (upright, at the centre of the orbit) */}
      <span className="orbit3d__sun"><span className="orbit3d__core" /></span>
      </div>

      <style>{`
        .orbit3d { z-index: 1; height: clamp(21rem, 52vw, 38rem); perspective: 1600px; perspective-origin: 50% 35%; transform-style: preserve-3d; --tilt: 62deg; --d: clamp(17rem, 60vw, 46rem); }
        .orbit3d__plane { position: absolute; left: 50%; top: 54%; width: var(--d); height: var(--d); translate: -50% -50%; transform: rotateX(var(--tilt)); transform-style: preserve-3d; }
        .orbit3d__spin, .orbit3d__arm { position: absolute; inset: 0; transform-style: preserve-3d; }
        .orbit3d__spin { animation: tsRays 80s linear infinite; }
        .orbit3d__anchor { position: absolute; left: 50%; top: 0; width: 0; height: 0; transform-style: preserve-3d; }
        .orbit3d__3d, .orbit3d__counter, .orbit3d__upright { position: absolute; width: 0; height: 0; transform-style: preserve-3d; }
        .orbit3d__counter { animation: tsRays 80s linear infinite reverse; }
        .orbit3d__upright { transform: rotateX(calc(-1 * var(--tilt))); }
        .orbit3d__item { position: absolute; left: 0; bottom: 0; translate: -50% 0; display: flex; flex-direction: column; align-items: center; gap: .4rem; }
        .orbit3d__thumb { display: block; width: clamp(5.5rem, 10.5vw, 9.5rem); aspect-ratio: 16 / 10; overflow: hidden; border-radius: 1rem;
          border: 3px solid rgb(255 255 255 / 0.95); box-shadow: 0 18px 34px -16px rgb(28 47 71 / 0.55), 0 0 0 1px rgb(43 108 176 / 0.35);
          transition: scale .5s var(--ease-out-soft), box-shadow .5s; }
        .orbit3d__item:hover .orbit3d__thumb { scale: 1.08; box-shadow: 0 24px 44px -16px rgb(28 47 71 / 0.6), 0 0 0 2px #2B6CB0, 0 0 30px -6px rgb(43 108 176 / 0.7); }
        .orbit3d__label { width: max-content; max-width: 10.5rem; padding: .25rem .65rem; border-radius: .8rem; background: rgb(255 255 255 / 0.82); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
          border: 1px solid rgb(255 255 255 / 0.9); box-shadow: 0 6px 16px -10px rgb(28 47 71 / 0.5);
          font: 700 clamp(.625rem, 1vw, .75rem)/1.25 var(--font-jakarta), var(--font-telugu), sans-serif; color: #2B6CB0; text-align: center; text-wrap: balance; }
        .orbit3d__path { fill: none; stroke: rgb(30 64 175 / 0.22); stroke-width: .25; stroke-dasharray: 1 1.2; vector-effect: non-scaling-stroke; }
        .orbit3d__path--inner { stroke: rgb(43 108 176 / 0.30); stroke-dasharray: none; }
        .orbit3d__ray { stroke: #2B6CB0; stroke-width: 2.6; vector-effect: non-scaling-stroke; stroke-linecap: round; shape-rendering: geometricPrecision; }
        .orbit3d__pulse { stroke: #FDEBD6; stroke-width: .9; stroke-linecap: round; stroke-dasharray: 6 94; animation: orbitPulse 2.4s linear infinite; }
        .orbit3d__node { fill: #2B6CB0; stroke: #fff; stroke-width: .5; vector-effect: non-scaling-stroke; filter: drop-shadow(0 0 2px rgb(43 108 176 / 0.9)); }
        @keyframes orbitPulse { from { stroke-dashoffset: 0; } to { stroke-dashoffset: -100; } }
        .orbit3d__sun { position: absolute; left: 50%; top: 54%; width: clamp(4.75rem, 9vw, 7.5rem); aspect-ratio: 1; translate: -50% -50%; border-radius: 999px;
          background: radial-gradient(circle at 38% 34%, #F1F6FC 0%, #2B6CB0 22%, #2B6CB0 48%, #2B6CB0 72%, #2B6CB0 100%);
          box-shadow: 0 0 0 10px rgb(43 108 176 / 0.12), 0 0 50px 14px rgb(43 108 176 / 0.45), 0 0 120px 40px rgb(43 108 176 / 0.28), inset -8px -10px 24px rgb(43 108 176 / 0.3);
          animation: sunBreath 6s ease-in-out infinite; }
        .orbit3d__core { position: absolute; inset: 18%; border-radius: 999px; background: radial-gradient(circle at 40% 35%, rgb(255 255 255 / 0.85), transparent 60%); mix-blend-mode: screen; }
        @keyframes sunBreath { 0%, 100% { scale: 1; } 50% { scale: 1.05; } }
        .orbit3d-wrap { --d: clamp(17rem, 60vw, 46rem); }
        .orbit3d__beams { position: absolute; z-index: 0; left: 50%; top: 54%; width: calc(var(--d) * 1.15); aspect-ratio: 1; translate: -50% -50%; border-radius: 999px; pointer-events: none;
          background: repeating-conic-gradient(from 0deg, rgb(43 108 176 / 0.16) 0deg 2deg, transparent 2deg 12deg);
          -webkit-mask-image: radial-gradient(circle, #000 6%, transparent 55%); mask-image: radial-gradient(circle, #000 6%, transparent 55%);
          animation: tsRays 120s linear infinite reverse; }
        .orbit3d:hover .orbit3d__spin, .orbit3d:hover .orbit3d__counter { animation-play-state: paused; }
        @media (max-width: 640px) { .orbit3d { --tilt: 58deg; } .orbit3d__label { display: none; } }
        @media (prefers-reduced-motion: reduce) {
          .orbit3d__spin, .orbit3d__counter, .orbit3d__pulse, .orbit3d__sun, .orbit3d__beams { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
