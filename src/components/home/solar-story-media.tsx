"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { solarStoryMedia as M } from "@/config/site";
import { Sunlight } from "@/components/page/banner-art";
import { cn } from "@/lib/utils";

type Labels = { panels: string; inverter: string; home: string; grid: string };

/** Points on the photo (in % of the image): where each step happens. */
const SPOTS = {
  panels: { x: 52, y: 22 },
  inverter: { x: 70, y: 56 },
  home: { x: 37, y: 64 },
  grid: { x: 95, y: 74 },
} as const;

/**
 * Realistic solar-house visual for "How solar cuts your bill".
 * - If a rendered video is configured (config/site.ts → solarStoryMedia), it plays muted, looped and inline,
 *   with the photo as poster. Skipped for reduced-motion and data-saver visitors.
 * - Otherwise the photorealistic still is shown with restrained light: sunlight on the panels, a thin energy
 *   line panels → inverter → home → grid, interior lights brightening, and four numbered step markers.
 */
export function SolarStoryMedia({ alt, labels }: { alt: string; labels: Labels }) {
  const [video, setVideo] = useState(false);
  useEffect(() => {
    if (!M.videoMp4 && !M.videoWebm) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const nav = navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } };
    const slow = nav.connection?.saveData || ["slow-2g", "2g"].includes(nav.connection?.effectiveType ?? "");
    if (!reduce && !slow) setVideo(true);
  }, []);

  return (
    <div className="story relative overflow-hidden rounded-[1.6rem] bg-[#EAF1F8]">
      <div className="story__cam relative">
        <Image src={M.image} alt={alt} width={M.width} height={M.height} sizes="(min-width: 1024px) 44rem, 100vw" className="block h-auto w-full" />
        {video ? (
          <video className="absolute inset-0 size-full object-cover" autoPlay muted loop playsInline preload="metadata" poster={M.poster} aria-hidden>
            {M.videoWebm && <source src={M.videoWebm} type="video/webm" />}
            {M.videoMp4 && <source src={M.videoMp4} type="video/mp4" />}
          </video>
        ) : (
          <>
            <Sunlight sun={{ x: "11%", y: "3%" }} />
            {/* Panels brighten as the light reaches them */}
            <span aria-hidden className="story__panels" />
            {/* Interior lights come on */}
            <span aria-hidden className="story__lights" />
            {/* Energy path: panels → inverter → home, and inverter → grid */}
            <svg aria-hidden viewBox={`0 0 ${M.width} ${M.height}`} preserveAspectRatio="none" className="absolute inset-0 size-full">
              <path className="story__flow story__flow--home" d="M640 300 C 690 360 700 420 704 505 L 704 560 C 600 570 520 590 430 600" />
              <path className="story__flow story__flow--grid" d="M760 560 C 860 600 960 660 1100 700" />
            </svg>
          </>
        )}
        {/* Step markers on the real objects */}
        {!video && (
          <ol aria-label={`${labels.panels} → ${labels.inverter} → ${labels.home} → ${labels.grid}`}>
            {(Object.keys(SPOTS) as (keyof typeof SPOTS)[]).map((k, i) => (
              <li key={k} className={cn("story__step absolute", k === "grid" && "-translate-x-full")} style={{ left: `${SPOTS[k].x}%`, top: `${SPOTS[k].y}%`, animationDelay: `${0.6 + i * 0.5}s` }}>
                <span className="flex items-center gap-1.5 rounded-full border border-white/70 bg-white/85 p-1 sm:pr-2.5 text-[0.6875rem] font-bold text-ink shadow-[0_8px_20px_-10px_rgb(27_69_112/0.5)] backdrop-blur sm:text-caption">
                  <span className="grid size-5 place-items-center rounded-full bg-primary text-[0.625rem] text-[#F0BE4A] sm:size-6">{i + 1}</span>
                  <span className="max-sm:sr-only">{labels[k]}</span>
                </span>
              </li>
            ))}
          </ol>
        )}

      </div>

      <style>{`
        .story__cam { animation: storyCam 26s ease-in-out infinite alternate; transform-origin: 55% 40%; }
        @keyframes storyCam { from { transform: scale(1.02) translate3d(0.6%, 0.4%, 0); } to { transform: scale(1.07) translate3d(-0.8%, -0.6%, 0); } }
        .story__panels { position: absolute; inset: 0; pointer-events: none; mix-blend-mode: screen;
          clip-path: polygon(14% 40%, 42% 18%, 87% 10%, 74% 34%, 30% 41%);
          background: linear-gradient(110deg, transparent 20%, rgb(255 240 205 / 0.35) 50%, transparent 80%); background-size: 250% 100%;
          animation: storyPanels 7s ease-in-out infinite; }
        @keyframes storyPanels { 0% { background-position: 120% 0; opacity: 0; } 25% { opacity: 1; } 70% { background-position: -20% 0; opacity: 1; } 100% { background-position: -20% 0; opacity: 0; } }
        .story__lights { position: absolute; left: 24%; top: 50%; width: 32%; height: 30%; pointer-events: none; mix-blend-mode: screen; filter: blur(14px); border-radius: 999px;
          background: radial-gradient(ellipse, rgb(247 210 116 / 0.55), transparent 70%); animation: storyLights 7s ease-in-out infinite; }
        @keyframes storyLights { 0%, 30% { opacity: 0.15; } 55%, 85% { opacity: 0.9; } 100% { opacity: 0.15; } }
        .story__flow { fill: none; stroke-width: 4; stroke-linecap: round; stroke-dasharray: 2 18; filter: drop-shadow(0 0 6px rgb(255 214 120 / 0.9)); animation: storyFlow 1.6s linear infinite; }
        .story__flow--home { stroke: rgb(255 226 150 / 0.95); }
        .story__flow--grid { stroke: rgb(150 205 160 / 0.95); filter: drop-shadow(0 0 6px rgb(62 122 79 / 0.8)); }
        @keyframes storyFlow { to { stroke-dashoffset: -40; } }
        .story__step { animation: storyStep 0.7s var(--ease-out-soft) both; }
        @keyframes storyStep { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
        @media (prefers-reduced-motion: reduce) {
          .story__cam, .story__panels, .story__lights, .story__flow, .story__step { animation: none !important; }
          .story__lights { opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}
