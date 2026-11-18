"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { heroMedia as M } from "@/config/site";

/**
 * Full-bleed cinematic hero background built from one photo.
 *
 * Code animation (default): slow push-in loop, sun flare + turning rays, light glint sweeping the
 * solar panels (clipped to the panel shape), warm window + wall-lamp glow, drifting cloud wisps, mist.
 * Video (optional): when heroMedia.videoMp4/videoWebm are set, a muted looping <video> replaces the
 * code animation, with the photo as poster. Reduced-motion and data-saver visitors get the still photo.
 *
 * All layers sit on a "stage" with the photo's exact aspect ratio that covers the hero, so overlay
 * positions (in % of the photo) always line up with the sun, panels and windows.
 */
const PANELS = "polygon(29.6% 67.2%, 52% 44.6%, 99.6% 28.9%, 100% 31%, 86.1% 59.1%)"; // panel array outline
const SUN = { x: "24%", y: "64%" };

export function HeroMedia({ alt }: { alt: string }) {
  const [video, setVideo] = useState(false);

  useEffect(() => {
    if (!M.videoMp4 && !M.videoWebm) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const nav = navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } };
    const slow = nav.connection?.saveData || ["slow-2g", "2g"].includes(nav.connection?.effectiveType ?? "");
    if (!reduce && !slow) setVideo(true);
  }, []);

  return (
    <div className="hero-media absolute inset-0 -z-10 overflow-hidden bg-navy">
      {/* Stage 1: photo (or video) + overlays that sit under the readability fade */}
      <div className="hero-stage">
        <div className="hero-push">
          <Image src={M.image} alt={alt} fill priority sizes="(max-width: 768px) 200vw, 100vw" className="object-cover" />
          {video && (
            <video className="absolute inset-0 size-full object-cover" autoPlay muted loop playsInline poster={M.poster} preload="auto" aria-hidden>
              {M.videoWebm && <source src={M.videoWebm} type="video/webm" />}
              {M.videoMp4 && <source src={M.videoMp4} type="video/mp4" />}
            </video>
          )}
          {!video && (
            <>
              {/* Panel glint: a soft light band sweeping across the panels */}
              <div className="absolute inset-0" style={{ clipPath: PANELS }}>
                <span className="hero-glint" />
              </div>
              {/* Warm interior glow through the glass + wall lamp */}
              <span className="hero-glow" style={{ left: "47%", top: "68%", width: "34%", height: "28%" }} />
              <span className="hero-glow hero-glow--lamp" style={{ left: "82.5%", top: "76%", width: "4%", height: "7%" }} />
              {/* Cloud wisps drifting across the sky */}
              <span className="hero-cloud" style={{ left: "46%", top: "18%", width: "16%", height: "5%" }} />
              <span className="hero-cloud hero-cloud--b" style={{ left: "64%", top: "8%", width: "12%", height: "4%" }} />
              {/* Light mist rolling through the background trees */}
              <span className="hero-mist" />
            </>
          )}
        </div>
      </div>

      {/* Readability fade: navy on the text side, light elsewhere */}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgb(7_23_63/0.88)_0%,rgb(7_23_63/0.62)_34%,rgb(7_23_63/0.18)_58%,transparent_75%)] max-md:bg-[linear-gradient(180deg,rgb(7_23_63/0.86)_0%,rgb(7_23_63/0.62)_45%,rgb(7_23_63/0.15)_78%,rgb(7_23_63/0.3)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-[linear-gradient(0deg,rgb(7_23_63/0.55),transparent)]" />

      {/* Stage 2: sun flare on top of the fade so the sun stays bright (same geometry + push-in) */}
      {!video && (
        <div className="hero-stage pointer-events-none">
          <div className="hero-push">
            <span className="hero-sun" style={{ left: SUN.x, top: SUN.y }}>
              <span className="hero-rays" />
              <span className="hero-core" />
            </span>
          </div>
        </div>
      )}

      <style>{`
        .hero-media { container-type: size; }
        .hero-stage {
          position: absolute; left: 50%; top: 50%;
          width: max(100cqw, calc(100cqh * ${M.width} / ${M.height}));
          aspect-ratio: ${M.width} / ${M.height};
          transform: translate(-50%, -50%);
        }
        /* Portrait screens: keep the house in view */
        @container (max-aspect-ratio: 1/1) { .hero-stage { transform: translate(-66%, -50%); } }
        .hero-push { position: absolute; inset: 0; transform-origin: 62% 58%; animation: heroPush 24s ease-in-out infinite alternate; will-change: transform; }
        @keyframes heroPush { from { transform: scale(1) translate3d(0,0,0); } to { transform: scale(1.08) translate3d(-0.8%, -0.6%, 0); } }

        .hero-glint {
          position: absolute; top: -30%; left: -40%; width: 22%; height: 160%;
          background: linear-gradient(90deg, transparent, rgb(255 255 255 / 0.55) 45%, rgb(255 236 170 / 0.75) 50%, rgb(255 255 255 / 0.55) 55%, transparent);
          transform: rotate(24deg); mix-blend-mode: screen; filter: blur(6px);
          animation: heroGlint 7s cubic-bezier(.45,.05,.3,1) infinite 1.2s;
        }
        @keyframes heroGlint { 0% { left: -40%; opacity: 0; } 12% { opacity: 1; } 55% { left: 115%; opacity: 1; } 56%, 100% { left: 115%; opacity: 0; } }

        .hero-glow {
          position: absolute; border-radius: 999px; mix-blend-mode: screen; filter: blur(18px);
          background: radial-gradient(ellipse, rgb(255 196 90 / 0.55), rgb(255 170 60 / 0.15) 55%, transparent 72%);
          animation: heroGlow 4.5s ease-in-out infinite;
        }
        .hero-glow--lamp { filter: blur(8px); background: radial-gradient(circle, rgb(255 225 150 / 0.9), transparent 70%); animation-duration: 3.2s; }
        @keyframes heroGlow { 0%, 100% { opacity: 0.55; } 50% { opacity: 1; } }

        .hero-cloud {
          position: absolute; border-radius: 999px; filter: blur(10px);
          background: radial-gradient(ellipse, rgb(255 255 255 / 0.75), rgb(255 255 255 / 0) 70%);
          animation: heroCloud 38s ease-in-out infinite alternate;
        }
        .hero-cloud--b { animation-duration: 52s; animation-direction: alternate-reverse; opacity: .7; }
        @keyframes heroCloud { from { transform: translateX(-8%); } to { transform: translateX(28%); } }

        .hero-mist {
          position: absolute; left: -10%; top: 70%; width: 60%; height: 16%; filter: blur(22px);
          background: linear-gradient(90deg, transparent, rgb(255 244 220 / 0.45) 30%, rgb(255 244 220 / 0.3) 70%, transparent);
          animation: heroMist 26s ease-in-out infinite alternate;
        }
        @keyframes heroMist { from { transform: translateX(-6%); opacity: .55; } to { transform: translateX(14%); opacity: .9; } }

        .hero-sun { position: absolute; width: 0; height: 0; }
        .hero-core {
          position: absolute; left: -9cqmin; top: -9cqmin; width: 18cqmin; height: 18cqmin; border-radius: 999px;
          background: radial-gradient(circle, rgb(255 250 225 / 0.7) 0%, rgb(255 214 110 / 0.35) 22%, rgb(255 180 60 / 0.1) 48%, transparent 70%);
          mix-blend-mode: screen; animation: heroSun 5s ease-in-out infinite;
        }
        .hero-rays {
          position: absolute; left: -40cqmin; top: -40cqmin; width: 80cqmin; height: 80cqmin; border-radius: 999px;
          background: repeating-conic-gradient(from 0deg, rgb(255 226 140 / 0.11) 0deg 3deg, transparent 3deg 14deg);
          -webkit-mask-image: radial-gradient(circle, black 8%, transparent 62%); mask-image: radial-gradient(circle, black 8%, transparent 62%);
          mix-blend-mode: screen; animation: heroRays 60s linear infinite;
        }
        @keyframes heroSun { 0%, 100% { transform: scale(1); opacity: .7; } 50% { transform: scale(1.1); opacity: .9; } }
        @keyframes heroRays { to { transform: rotate(360deg); } }

        @media (prefers-reduced-motion: reduce) {
          .hero-push, .hero-glint, .hero-glow, .hero-cloud, .hero-mist, .hero-core, .hero-rays { animation: none !important; }
          .hero-glint { display: none; }
        }
      `}</style>
    </div>
  );
}
