import { ArrowRight, Calculator, type LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { GuideTrigger } from "@/components/tools/triggers";
import { Magnetic } from "@/components/motion/magnetic";
import { Parallax } from "@/components/motion/primitives";
import { DisplayTitle, type TitleReveal } from "@/components/ui/display-title";
import { SolarBackdrop, type Motif } from "./solar-backdrop";
import type { GuidePersona } from "@/config/personas";
import { cn } from "@/lib/utils";

const TYPE_TO_PERSONA: Record<string, GuidePersona> = { home: "urban", farm: "farmer", business: "shop" };

/**
 * Inner-page hero (typography-first) on the animated <SolarBackdrop>:
 * eyebrow pill, display title with a word mask reveal and shining golden `emphasis` words, subtitle,
 * magnetic CTAs, and parallax sun-lit icon art, or a custom `art` illustration (shown on every screen size).
 * Always a light mist band with a sky-blue breadcrumb and gold separators (Home / page), bold display title in the heading colour, blue accent words.
 * - align="center": centred copy for pages without art.
 * Text uses CSS entrances so it paints before JS. `children` renders under the hero copy.
 */
export function PageHero({ eyebrow, title, subtitle, Icon, ctas = true, calcType, guidePersona, emphasis, children, art, align = "left", motif = "rays", reveal = "mask", underline = false, containerClassName, artSpan = "equal", gapClassName, contentClassName, artClassName, containerStyle }: {
  eyebrow: string; title: string; subtitle: string; Icon?: LucideIcon; ctas?: boolean; calcType?: string; guidePersona?: GuidePersona;
  emphasis?: string; children?: React.ReactNode; art?: React.ReactNode; tone?: "light" | "dark"; align?: "left" | "center"; motif?: Motif; reveal?: TitleReveal; underline?: boolean;
  containerClassName?: string; artSpan?: "equal" | "wide"; gapClassName?: string; contentClassName?: string; artClassName?: string; containerStyle?: React.CSSProperties;
}) {
  const t = useTranslations("common");
  const tn = useTranslations("nav");
  // Every inner page uses the same light band (the `tone` prop is kept for compatibility).
  const dark = false;
  const center = align === "center" && !art && !Icon;
  const sun = center ? { x: "50%", y: "6%" } : art || Icon ? { x: "78%", y: "40%" } : { x: "88%", y: "16%" };
  return (
    <section className={cn("relative isolate overflow-hidden", dark && "text-white")}>
      <SolarBackdrop sun={sun} motif={motif} />
      <div
        className={cn(
          "container-page grid items-center pt-12 md:pt-16 lg:grid-cols-12 lg:pt-20",
          gapClassName ?? "gap-10",
          containerClassName,
          "pb-16 md:pb-20 lg:pb-24"
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
          <nav aria-label="Breadcrumb" className="animate-rise">
            <ol className={cn("breadcrumb flex flex-wrap items-center gap-2 text-primary", center && "justify-center")}>
              <li><Link href="/" className="text-muted transition-colors hover:text-primary">{tn("home")}</Link></li>
              <li aria-hidden className="text-gold">/</li>
              <li aria-current="page">{eyebrow}</li>
            </ol>
          </nav>
          <DisplayTitle text={title} emphasis={emphasis} reveal={reveal} underline={underline} className={cn("mt-6", dark && "text-white", center && "mx-auto max-w-4xl", art && "display-art")} />
          <p className={cn("mt-6 max-w-2xl animate-rise md:text-body-lg", dark ? "text-silver/85" : "text-[var(--ts-text)]", center && "mx-auto")} style={{ animationDelay: "0.3s" }}>{subtitle}</p>
          {ctas && (
            <div className={cn("mt-9 flex animate-rise flex-col gap-3 sm:flex-row", center && "sm:justify-center")} style={{ animationDelay: "0.4s" }}>
              <Magnetic className="inline-block">
                <GuideTrigger size="lg" className="btn-shine w-full sm:w-auto" persona={guidePersona ?? (calcType ? TYPE_TO_PERSONA[calcType] : undefined)}>{t("bookVisit")}<ArrowRight aria-hidden /></GuideTrigger>
              </Magnetic>
              <Button asChild size="lg" variant="accent">
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
                <span className={cn("float-soft relative grid size-44 place-items-center rounded-2xl border",
                  dark ? "border-white/15 bg-white/10 text-white shadow-[0_40px_80px_-30px_rgb(0_0_0/0.6)]" : "border-white bg-white/80 text-[var(--ts-royal)] shadow-[0_40px_80px_-30px_rgb(28_47_71/0.45)]")}>
                  <Icon className="size-20" strokeWidth={1.3} />
                  
                </span>
              </div>
            </Parallax>
          </div>
        )}
      </div>
    </section>
  );
}
