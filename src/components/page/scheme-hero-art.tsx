import Image from "next/image";
import { useLocale } from "next-intl";
import { cn } from "@/lib/utils";

const ALT = {
  en: "3D illustration: a bank building with rooftop solar panels, a Telangana Solar Schemes checklist ticking subsidy, loans and financial support, a gold rupee coin and coin stack, trees and Charminar, on a glowing round platform",
  te: "3D చిత్రం: పైకప్పుపై సోలార్ ప్యానెళ్లతో బ్యాంక్ భవనం, సబ్సిడీ, రుణాలు, ఆర్థిక సహాయం టిక్ చేసిన తెలంగాణ సోలార్ పథకాల చెక్‌లిస్ట్, బంగారు రూపాయి నాణేలు, చెట్లు, చార్మినార్ — వెలిగే గుండ్రని వేదికపై",
};

/**
 * Hero visual for /schemes: 3D bank + rooftop solar + schemes checklist + ₹ coins on a glowing platform.
 * Enlarged illustration (25-35% larger) positioned to fill the right-side space with an ambient solar glow
 * and soft edge mask to blend seamlessly into the navy hero backdrop without overlapping text or buttons.
 */
export function SchemeHeroArt({ className }: { className?: string } = {}) {
  const locale = useLocale();
  return (
    <div className={cn("scheme-3d relative mx-auto w-full max-w-[34rem] sm:max-w-[40rem] md:max-w-[44rem] lg:max-w-none lg:w-[118%] xl:w-[128%] 2xl:w-[134%] lg:origin-right lg:-mr-4 xl:-mr-10 2xl:-mr-16", className)}>
      <span aria-hidden className="pointer-events-none absolute left-1/2 top-[55%] size-[92%] -translate-x-1/2 -translate-y-1/2 animate-glow rounded-full bg-transparent" />
      <div className="scheme-3d__float relative">
        <Image
          src="/schemes/schemes-hero-3d.webp"
          alt={locale === "te" ? ALT.te : ALT.en}
          width={1560}
          height={1120}
          priority
          sizes="(min-width: 1536px) 55vw, (min-width: 1280px) 58vw, (min-width: 1024px) 50vw, 100vw"
          className="scheme-3d__img block h-auto w-full"
        />
      </div>
      <style>{`
        .scheme-3d__img {
          -webkit-mask-image: linear-gradient(90deg, transparent 0%, #000 6%, #000 94%, transparent 100%), linear-gradient(180deg, transparent 0%, #000 6%, #000 94%, transparent 100%);
          -webkit-mask-composite: source-in;
                  mask-image: linear-gradient(90deg, transparent 0%, #000 6%, #000 94%, transparent 100%), linear-gradient(180deg, transparent 0%, #000 6%, #000 94%, transparent 100%);
                  mask-composite: intersect;
          filter: drop-shadow(0 30px 45px rgb(0 0 0 / 0.4));
        }
        .scheme-3d__float { animation: scheme3dFloat 8s ease-in-out infinite; }
        @keyframes scheme3dFloat { 0%, 100% { translate: 0 0; } 50% { translate: 0 -12px; } }
        @media (prefers-reduced-motion: reduce) { .scheme-3d__float { animation: none !important; } }
      `}</style>
    </div>
  );
}
