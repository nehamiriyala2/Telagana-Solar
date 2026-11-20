import { ArrowRight, Calculator, type LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { GuideTrigger } from "@/components/tools/triggers";
import { Magnetic } from "@/components/motion/magnetic";
import { Parallax } from "@/components/motion/primitives";
import { DisplayTitle, Eyebrow, type TitleReveal } from "@/components/ui/display-title";
import { SolarBackdrop, type Motif } from "./solar-backdrop";
import type { GuidePersona } from "@/config/personas";
import { cn } from "@/lib/utils";

const TYPE_TO_PERSONA: Record<string, GuidePersona> = { home: "urban", farm: "farmer", business: "shop" };

/**
 * Inner-page hero (typography-first) on the animated <SolarBackdrop>:
 * eyebrow pill, display title with a word mask reveal and shining golden `emphasis` words, subtitle,
 * magnetic CTAs, and parallax sun-lit icon art, or a custom `art` illustration (shown on every screen size).
 * - tone="light" (default): soft blue → white, navy headings. tone="dark": deep navy, white headings, wave edge.
 * - align="center": centred copy for pages without art.
 * Text uses CSS entrances so it paints before JS. `children` renders under the hero copy.
 */
export function PageHero({ eyebrow, title, subtitle, Icon, ctas = true, calcType, guidePersona, emphasis, children, art, tone = "light", align = "left", motif = "rays", reveal = "mask", underline = false, containerClassName, artSpan = "equal", gapClassName, contentClassName, artClassName, containerStyle }: {
  eyebrow: string; title: string; subtitle: string; Icon?: LucideIcon; ctas?: boolean; calcType?: string; guidePersona?: GuidePersona;
  emphasis?: string; children?: React.ReactNode; art?: React.ReactNode; tone?: "light" | "dark"; align?: "left" | "center"; motif?: Motif; reveal?: TitleReveal; underline?: boolean;
  containerClassName?: string; artSpan?: "equal" | "wide"; gapClassName?: string; contentClassName?: string; artClassName?: string; containerStyle?: React.CSSProperties;
}) {
  const t = useTranslations("common");
  const dark = tone === "dark";
  const center = align === "center" && !art && !Icon;
  const sun = center ? { x: "50%", y: "6%" } : art || Icon ? { x: "78%", y: "40%" } : { x: "88%", y: "16%" };
  return (
    <section className={cn("relative isolate overflow-hidden", dark && "text-white")}>
      <SolarBackdrop tone={tone} sun={sun} motif={motif} />
      <div
        className={cn(
          "container-page grid items-center pt-12 md:pt-16 lg:grid-cols-12 lg:pt-20",
          gapClassName ?? "gap-10",
          containerClassName,
          dark ? "pb-24 md:pb-28 lg:pb-32" : "pb-16 md:pb-20 lg:pb-24"
        )}
        style={containerStyle}
      >
        <div
          className={cn(
            art
              ? artSpan === "wide"
                ? "lg:col-span-6 xl:col-span-5"
                : "lg:col-span-6"
              : Icon
                ? "lg:col-span-7"
                : center
                  ? "text-center lg:col-span-10 lg:col-start-2"
                  : "lg:col-span-10",
            contentClassName
          )}
        >
          <Eyebrow className={cn("animate-rise", dark && "eyebrow-pill--dark")}>{eyebrow}</Eyebrow>
          <DisplayTitle text={title} emphasis={emphasis} reveal={reveal} underline={underline} className={cn("mt-6", dark && "text-white", center && "mx-auto max-w-4xl", art && "display-art")} />
          <p className={cn("mt-6 max-w-2xl animate-rise md:text-body-lg", dark ? "text-silver/85" : "text-[var(--ts-text)]", center && "mx-auto")} style={{ animationDelay: "0.3s" }}>{subtitle}</p>
          {ctas && (
            <div className={cn("mt-9 flex animate-rise flex-col gap-3 sm:flex-row", center && "sm:justify-center")} style={{ animationDelay: "0.4s" }}>
              <Magnetic className="inline-block">
                <GuideTrigger size="lg" className="btn-shine w-full shadow-[0_14px_34px_-14px_rgb(245_168_0/0.9)] sm:w-auto" persona={guidePersona ?? (calcType ? TYPE_TO_PERSONA[calcType] : undefined)}>{t("bookVisit")}<ArrowRight aria-hidden /></GuideTrigger>
              </Magnetic>
              <Button asChild size="lg" variant="outline"
                className={dark ? "border-white/30 bg-white/10 text-white backdrop-blur-md hover:border-yellow hover:bg-white/15" : "shadow-[0_10px_26px_-18px_rgb(7_23_63/0.4)]"}>
                <Link href={{ pathname: "/savings-calculator", query: calcType ? { type: calcType } : {} }}><Calculator aria-hidden />{t("calculate")}</Link>
              </Button>
            </div>
          )}
          {children && <div className="mt-10 animate-rise" style={{ animationDelay: "0.5s" }}>{children}</div>}
        </div>
        {art && (
          <div
            className={cn(
              "relative flex items-center justify-center lg:justify-end",
              artSpan === "wide" ? "lg:col-span-6 xl:col-span-7" : "lg:col-span-6",
              artClassName
            )}
          >
            {art}
          </div>
        )}
        {Icon && !art && (
          <div className="relative hidden lg:col-span-5 lg:block" aria-hidden>
            <Parallax offset={70}>
              <div className="relative mx-auto grid aspect-square max-w-md place-items-center">
                <div className={cn("absolute size-[78%] rounded-full border", dark ? "border-white/15" : "border-white/80")} />
                <div className={cn("absolute size-[56%] rounded-full border border-dashed", dark ? "border-yellow/25" : "border-gold/30")} />
                <span className={cn("float-soft relative grid size-44 place-items-center rounded-[2.5rem] border backdrop-blur-xl",
                  dark ? "border-white/15 bg-white/10 text-white shadow-[0_40px_80px_-30px_rgb(0_0_0/0.6)]" : "border-white bg-white/80 text-[var(--ts-royal)] shadow-[0_40px_80px_-30px_rgb(7_23_63/0.45)]")}>
                  <Icon className="size-20" strokeWidth={1.3} />
                  <span className="absolute -right-3 -top-3 size-7 rounded-full bg-[linear-gradient(135deg,#FFC72C,#F5A800)] shadow-[0_0_24px_#FFC72C]" />
                </span>
              </div>
            </Parallax>
          </div>
        )}
      </div>
      {dark && (
        <svg aria-hidden viewBox="0 0 1440 90" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-12 w-full md:h-16">
          <path d="M0 90 V44 C 260 88 520 8 760 34 C 1000 60 1220 16 1440 42 V90 Z" fill="#FFFFFF" />
        </svg>
      )}
    </section>
  );
}
