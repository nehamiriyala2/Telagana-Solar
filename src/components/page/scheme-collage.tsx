import Image from "next/image";
import { useLocale } from "next-intl";

const ALT = {
  en: "Telangana Solar Schemes: PM Surya Ghar Muft Bijli Yojana, PM-KUSUM, Telangana net metering and Telangana state schemes, with government schemes, bank loans and subsidies, over a solar farm at sunrise",
  te: "తెలంగాణ సోలార్ పథకాలు: పీఎం సూర్య ఘర్ ముఫ్త్ బిజ్లీ యోజన, పీఎం-కుసుమ్, తెలంగాణ నెట్ మీటరింగ్, తెలంగాణ రాష్ట్ర పథకాలు — ప్రభుత్వ పథకాలు, బ్యాంక్ రుణాలు, సబ్సిడీలు",
};

/**
 * Hero visual for /schemes: the "Telangana Solar Schemes" banner in one framed glass card
 * (white border, rounded corners, soft gold glow) that floats gently. Reduced motion: static.
 */
export function SchemeCollage() {
  const locale = useLocale();
  return (
    <div className="schemes-banner relative mx-auto flex w-full max-w-full items-center justify-center lg:justify-end">
      {/* Ambient solar golden glow */}
      <span
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 size-[95%] -translate-x-1/2 -translate-y-1/2 animate-glow rounded-full bg-transparent"
      />

      {/* Floating framed white card */}
      <div className="schemes-banner__card relative aspect-[1671/941] w-full max-w-full overflow-hidden rounded-[1.25rem] border-[5px] border-white bg-white shadow-[0_40px_80px_-30px_rgb(0_0_0/0.7),0_0_0_1px_rgb(255_255_255/0.25)] sm:rounded-[1.25rem] sm:border-[6px] lg:max-w-[924px] lg:rounded-[1.25rem] lg:border-[7px]">
        <Image
          src="/schemes/schemes-hero.webp"
          alt={locale === "te" ? ALT.te : ALT.en}
          width={1671}
          height={941}
          priority
          sizes="(min-width: 1536px) 924px, (min-width: 1280px) 60vw, (min-width: 1024px) 58vw, 100vw"
          className="block size-full object-contain"
          style={{ objectFit: "contain", aspectRatio: "1671 / 941" }}
        />
      </div>
      <style>{`
        .schemes-banner__card { animation: schemesBannerFloat 9s ease-in-out infinite; }
        @keyframes schemesBannerFloat { 0%, 100% { translate: 0 0; } 50% { translate: 0 -10px; } }
        @media (prefers-reduced-motion: reduce) { .schemes-banner__card { animation: none !important; } }
      `}</style>
    </div>
  );
}
