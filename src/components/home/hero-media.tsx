"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { heroMedia as M } from "@/config/site";
import { cn } from "@/lib/utils";

/**
 * Full-bleed hero photograph with a slow, subtle Ken Burns zoom (20s; off for reduced motion), a light warm grade
 * and a deep navy overlay left → right (~65% → 20%) so the ivory headline reads clearly. Optional muted looping
 * video when heroMedia.videoMp4/videoWebm are set (never for reduced-motion / data-saver visitors).
 */
export function HeroMedia({ alt, className }: { alt: string; className?: string }) {
  const [video, setVideo] = useState(false);

  useEffect(() => {
    if (!M.videoMp4 && !M.videoWebm) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const nav = navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } };
    const slow = nav.connection?.saveData || ["slow-2g", "2g"].includes(nav.connection?.effectiveType ?? "");
    if (!reduce && !slow) setVideo(true);
  }, []);

  return (
    <div className={cn("absolute inset-0 -z-10 overflow-hidden bg-[#0B1F3A]", className)}>
      <div className="banner-kenburns absolute inset-0 origin-[65%_55%]">
        <Image src={M.image} alt={alt} fill priority sizes="100vw" className="object-cover object-[68%_50%]" />
        {video && (
          <video className="absolute inset-0 size-full object-cover" autoPlay muted loop playsInline poster={M.poster} preload="auto" aria-hidden>
            {M.videoWebm && <source src={M.videoWebm} type="video/webm" />}
            {M.videoMp4 && <source src={M.videoMp4} type="video/mp4" />}
          </video>
        )}
      </div>
      {/* warm grade */}
      <div className="absolute inset-0 bg-[rgb(184_145_63/0.10)] mix-blend-multiply" />
      {/* navy overlay: left → right */}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgb(11_31_58/0.82)_0%,rgb(11_31_58/0.65)_40%,rgb(11_31_58/0.3)_70%,rgb(11_31_58/0.2)_100%)]" />
      {/* phones: extra depth so the stacked copy stays readable */}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(11_31_58/0.3)_0%,rgb(11_31_58/0.55)_60%,rgb(11_31_58/0.75)_100%)] lg:bg-[linear-gradient(0deg,rgb(11_31_58/0.4),transparent_35%)]" />
    </div>
  );
}
