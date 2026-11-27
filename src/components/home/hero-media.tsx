"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { heroMedia as M } from "@/config/site";
import { cn } from "@/lib/utils";

/**
 * Hero photograph in a large rounded 4:3 frame (no overlay, no dark gradient).
 * Very slow zoom (off for reduced motion). When heroMedia.videoMp4/videoWebm are set, a muted looping video
 * replaces the photo for visitors without reduced-motion / data-saver.
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
    <div className={cn("relative aspect-[727/279] overflow-hidden rounded-[1.25rem] bg-tint-ice shadow-[0_24px_60px_-24px_rgb(41_52_64/0.35)] ring-1 ring-card-line", className)}>
      <div className="banner-kenburns absolute inset-0 origin-center">
        <Image src="/images/ui/hero-home.webp" alt={alt} fill priority sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
        {video && (
          <video className="absolute inset-0 size-full object-cover" autoPlay muted loop playsInline poster={M.poster} preload="auto" aria-hidden>
            {M.videoWebm && <source src={M.videoWebm} type="video/webm" />}
            {M.videoMp4 && <source src={M.videoMp4} type="video/mp4" />}
          </video>
        )}
      </div>
    </div>
  );
}
