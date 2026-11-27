"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { heroMedia as M } from "@/config/site";
import { cn } from "@/lib/utils";

/**
 * Full-bleed, bright hero photograph (or optional muted looping video when heroMedia.videoMp4/videoWebm are set;
 * reduced-motion and data-saver visitors always get the still photo).
 * - very slow zoom (off for reduced motion)
 * - NO dark overlay: only a soft cloud-white fade on the text side (~88% → transparent at ~55% width) so the
 *   headline reads clearly; phones get a cream fade from the top instead, because the copy sits over the photo.
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
    <div className={cn("absolute inset-0 -z-10 overflow-hidden bg-mist", className)}>
      <div className="banner-kenburns absolute inset-0 origin-[65%_55%]">
        <Image src={M.image} alt={alt} fill priority sizes="100vw" className="object-cover object-[68%_50%]" />
        {video && (
          <video className="absolute inset-0 size-full object-cover" autoPlay muted loop playsInline poster={M.poster} preload="auto" aria-hidden>
            {M.videoWebm && <source src={M.videoWebm} type="video/webm" />}
            {M.videoMp4 && <source src={M.videoMp4} type="video/mp4" />}
          </video>
        )}
      </div>
      {/* desktop: soft cloud-white fade on the left only (#F7FAFD ~88% → transparent at ~55%) */}
      <div className="absolute inset-0 max-lg:hidden bg-[linear-gradient(90deg,rgb(247_250_253/0.88)_0%,rgb(247_250_253/0.8)_34%,rgb(247_250_253/0)_55%)]" />
      {/* phones / tablets: cloud-white fade from the top, photo stays visible below */}
      <div className="absolute inset-0 lg:hidden bg-[linear-gradient(180deg,rgb(247_250_253/0.94)_0%,rgb(247_250_253/0.88)_55%,rgb(247_250_253/0.55)_100%)]" />
    </div>
  );
}
