import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Banner } from "@/lib/admin/site-content";

/** Thin strip above the header, from Admin → Content → Home page & banner. Hidden unless turned on. */
export function AnnouncementBanner({ banner, locale }: { banner: Banner; locale: string }) {
  if (!banner.enabled || !banner.text_en) return null;
  const text = locale === "te" && banner.text_te ? banner.text_te : banner.text_en;
  const tone = banner.tone === "blue" ? "bg-[#1F3B6E] text-white" : "bg-[#f5a800] text-[#0B1F3A]";
  const inner = <>{text}{banner.link && <ArrowRight className="ml-1.5 inline size-4" aria-hidden />}</>;
  return (
    <div role="region" aria-label={locale === "te" ? "ప్రకటన" : "Announcement"} className={`relative z-[60] px-4 py-2 text-center text-sm font-semibold ${tone}`}>
      {banner.link
        ? banner.link.startsWith("/") ? <Link href={banner.link} className="underline-offset-4 hover:underline">{inner}</Link> : <a href={banner.link} target="_blank" rel="noopener noreferrer" className="underline-offset-4 hover:underline">{inner}</a>
        : inner}
    </div>
  );
}
