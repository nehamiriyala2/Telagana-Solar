import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { ArrowRight, Check } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { BlurReveal } from "@/components/motion/primitives";
import { TiltCard } from "@/components/motion/tilt-card";
import { Sunlight } from "./banner-art";
import { ToneSection, type Tone } from "./tone-section";
import { homesHeroImageAlt, solutionBanners } from "@/data/solution-hero";
import { cn, pick } from "@/lib/utils";

/** Preview pictures of each solution page (the same pictures those pages open with). */
const ROWS: { key: "homes" | "farms" | "business"; tone: Tone; img: { src: string; w: number; h: number; sun: { x: string; y: string } }; cut?: boolean }[] = [
  { key: "homes", tone: "sky", img: { src: "/solutions/home-solar-house.webp", w: 826, h: 679, sun: { x: "70%", y: "12%" } }, cut: true },
  { key: "farms", tone: "mint", img: { src: solutionBanners.farms.src, w: solutionBanners.farms.width, h: solutionBanners.farms.height, sun: solutionBanners.farms.sun } },
  { key: "business", tone: "white", img: { src: solutionBanners.business.src, w: solutionBanners.business.width, h: solutionBanners.business.height, sun: solutionBanners.business.sun } },
];

/**
 * /solutions: one image-led editorial row per solution, each on its own colour band, alternating sides,
 * with a big number, the solution's two key points and a link. Text comes from messages (solutions.*).
 */
export function SolutionShowcase() {
  const t = useTranslations();
  const locale = useLocale();
  return (
    <>
      {ROWS.map(({ key, tone, img, cut }, i) => {
        const dark = tone === "navy";
        const alt = key === "homes" ? pick(homesHeroImageAlt, locale) : pick(solutionBanners[key].alt, locale);
        return (
          <ToneSection key={key} tone={tone} label={t(`solutions.${key}.title`)}>
            <div className={cn("container-page grid items-center gap-10 lg:grid-cols-12 lg:gap-14")}>
              <BlurReveal className={cn("lg:col-span-5", i % 2 === 1 && "lg:order-2")}>
                <p aria-hidden className={cn("eyebrow-pill", dark && "eyebrow-pill--dark")}>{String(i + 1).padStart(2, "0")}</p>
                <h2 className={cn("display-lg mt-4", dark ? "text-white" : "text-ink")}>{t(`solutions.${key}.title`)}</h2>
                <ul className="mt-6 space-y-3">
                  {(["b1", "b2"] as const).map((b) => (
                    <li key={b} className={cn("flex gap-3 md:text-body-lg", dark ? "on-dark-muted" : "text-[var(--ts-text)]")}>
                      <span className={cn("mt-1 grid size-6 shrink-0 place-items-center rounded-full", dark ? "bg-[#64758A] text-ink" : "bg-[#536376] text-white")}><Check className="size-3.5" aria-hidden /></span>
                      {t(`solutions.${key}.${b}`)}
                    </li>
                  ))}
                </ul>
                <Link href={`/solutions/${key}`} className={cn("group mt-8 inline-flex items-center gap-2 rounded-full px-6 py-3 font-semibold transition-colors duration-300",
                  dark ? "border border-white/40 text-white hover:border-white hover:bg-white/5" : "bg-primary text-white hover:bg-primary-hover")}>
                  {t("common.learnMore")}<ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
                </Link>
              </BlurReveal>
              <BlurReveal delay={0.1} className={cn("lg:col-span-7", i % 2 === 1 && "lg:order-1")}>
                <TiltCard max={4} className="rounded-[1.25rem]">
                  <Link href={`/solutions/${key}`} tabIndex={-1} aria-hidden className={cn("zoom-frame relative block overflow-hidden rounded-[1.25rem]",
                    cut ? "bg-transparent p-4" : cn("p-2 shadow-[0_40px_80px_-40px_rgb(41_52_64/0.6)]", dark ? "bg-white/10 ring-1 ring-white/15" : "bg-white"))}>
                    <div className={cn("relative overflow-hidden", !cut && "rounded-[1rem]")}>
                      <Image src={img.src} alt={alt} width={img.w} height={img.h} unoptimized sizes="(min-width: 1024px) 44rem, 100vw" className="zoom-img block h-auto w-full" />
                      {!cut && <Sunlight sun={img.sun} />}
                    </div>
                  </Link>
                </TiltCard>
              </BlurReveal>
            </div>
          </ToneSection>
        );
      })}
    </>
  );
}
