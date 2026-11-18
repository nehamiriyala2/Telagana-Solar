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
  { key: "homes", tone: "cream", img: { src: "/solutions/home-solar-house.webp", w: 826, h: 679, sun: { x: "70%", y: "12%" } }, cut: true },
  { key: "farms", tone: "mint", img: { src: solutionBanners.farms.src, w: solutionBanners.farms.width, h: solutionBanners.farms.height, sun: solutionBanners.farms.sun } },
  { key: "business", tone: "navy", img: { src: solutionBanners.business.src, w: solutionBanners.business.width, h: solutionBanners.business.height, sun: solutionBanners.business.sun } },
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
                <p aria-hidden className={cn("font-heading text-[5rem] font-extrabold leading-none tracking-[-0.05em] md:text-[7rem]", dark ? "text-white/15" : "text-[#1265D8]/15")}>{String(i + 1).padStart(2, "0")}</p>
                <h2 className={cn("display-lg -mt-6 md:-mt-10", dark ? "text-white" : "text-navy")}>{t(`solutions.${key}.title`)}</h2>
                <ul className="mt-6 space-y-3">
                  {(["b1", "b2"] as const).map((b) => (
                    <li key={b} className={cn("flex gap-3 md:text-body-lg", dark ? "on-dark-muted" : "text-[var(--ts-text)]")}>
                      <span className={cn("mt-1 grid size-6 shrink-0 place-items-center rounded-full", dark ? "bg-[#FFB800] text-navy" : "bg-[#24A66A] text-white")}><Check className="size-3.5" aria-hidden /></span>
                      {t(`solutions.${key}.${b}`)}
                    </li>
                  ))}
                </ul>
                <Link href={`/solutions/${key}`} className={cn("group mt-8 inline-flex items-center gap-2 rounded-full px-6 py-3 font-semibold transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5",
                  dark ? "bg-sun text-navy shadow-[0_14px_34px_-12px_rgb(255_184_0/0.8)]" : "bg-navy text-white shadow-[0_14px_34px_-16px_rgb(7_27_73/0.6)]")}>
                  {t("common.learnMore")}<ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
                </Link>
              </BlurReveal>
              <BlurReveal delay={0.1} className={cn("lg:col-span-7", i % 2 === 1 && "lg:order-1")}>
                <TiltCard max={4} className="rounded-[2rem]">
                  <Link href={`/solutions/${key}`} tabIndex={-1} aria-hidden className={cn("zoom-frame relative block overflow-hidden rounded-[2rem]",
                    cut ? "bg-[radial-gradient(circle_at_60%_40%,rgb(255_215_106/0.45),transparent_65%)] p-4" : cn("p-2 shadow-[0_40px_80px_-40px_rgb(7_27_73/0.6)]", dark ? "bg-white/10 ring-1 ring-white/15" : "bg-white"))}>
                    <div className={cn("relative overflow-hidden", !cut && "rounded-[1.6rem]")}>
                      <Image src={img.src} alt={alt} width={img.w} height={img.h} sizes="(min-width: 1024px) 44rem, 100vw" className="zoom-img block h-auto w-full" />
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
