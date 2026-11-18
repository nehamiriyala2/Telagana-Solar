import { ArrowRight, Calculator, type LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { GuideTrigger } from "@/components/tools/triggers";
import { Magnetic } from "@/components/motion/magnetic";
import { Parallax } from "@/components/motion/primitives";
import { DisplayTitle, Eyebrow } from "@/components/ui/display-title";
import type { GuidePersona } from "@/config/personas";

const TYPE_TO_PERSONA: Record<string, GuidePersona> = { home: "urban", farm: "farmer", business: "shop" };

/**
 * Inner-page hero (typography-first): eyebrow pill, display title with a word mask reveal and
 * optional amber `emphasis` words, subtitle, magnetic CTAs, and parallax sun-lit icon art.
 * Text uses CSS entrances so it paints before JS. `children` renders under the hero copy (stats, chips…).
 */
export function PageHero({ eyebrow, title, subtitle, Icon, ctas = true, calcType, guidePersona, emphasis, children }: {
  eyebrow: string; title: string; subtitle: string; Icon?: LucideIcon; ctas?: boolean; calcType?: string; guidePersona?: GuidePersona;
  emphasis?: string; children?: React.ReactNode;
}) {
  const t = useTranslations("common");
  return (
    <section className="bg-premium-light dot-grid relative isolate overflow-hidden">
      <div aria-hidden className="orb -left-32 -top-24 size-[28rem] bg-yellow/25" />
      <div aria-hidden className="orb -right-40 bottom-0 size-[30rem] bg-sky/20" style={{ animationDelay: "-6s" }} />
      <div className="container-page grid items-center gap-10 pb-16 pt-12 md:pb-20 md:pt-16 lg:grid-cols-12 lg:pb-24 lg:pt-20">
        <div className={Icon ? "lg:col-span-7" : "lg:col-span-10"}>
          <Eyebrow className="animate-rise">{eyebrow}</Eyebrow>
          <DisplayTitle text={title} emphasis={emphasis} className="mt-6" />
          <p className="mt-6 max-w-2xl animate-rise text-muted md:text-body-lg" style={{ animationDelay: "0.3s" }}>{subtitle}</p>
          {ctas && (
            <div className="mt-9 flex animate-rise flex-col gap-3 sm:flex-row" style={{ animationDelay: "0.4s" }}>
              <Magnetic className="inline-block">
                <GuideTrigger size="lg" className="btn-shine w-full shadow-[0_14px_34px_-14px_rgb(245_168_0/0.9)] sm:w-auto" persona={guidePersona ?? (calcType ? TYPE_TO_PERSONA[calcType] : undefined)}>{t("bookVisit")}<ArrowRight aria-hidden /></GuideTrigger>
              </Magnetic>
              <Button asChild size="lg" variant="outline" className="shadow-[0_10px_26px_-18px_rgb(7_23_63/0.4)]"><Link href={{ pathname: "/savings-calculator", query: calcType ? { type: calcType } : {} }}><Calculator aria-hidden />{t("calculate")}</Link></Button>
            </div>
          )}
          {children && <div className="mt-10 animate-rise" style={{ animationDelay: "0.5s" }}>{children}</div>}
        </div>
        {Icon && (
          <div className="relative hidden lg:col-span-5 lg:block" aria-hidden>
            <Parallax offset={70}>
              <div className="relative mx-auto grid aspect-square max-w-md place-items-center">
                <div className="absolute inset-0 animate-rays rounded-full opacity-70 [background:repeating-conic-gradient(from_0deg,rgb(245_168_0/0.2)_0deg_4deg,transparent_4deg_16deg)] [mask-image:radial-gradient(circle,black_25%,transparent_68%)]" />
                <div className="absolute size-2/3 animate-glow rounded-full bg-[radial-gradient(circle,rgb(255_210_122/0.85),rgb(245_168_0/0.22)_55%,transparent_70%)]" />
                <div className="absolute size-[78%] rounded-full border border-white/80" />
                <span className="float-soft relative grid size-44 place-items-center rounded-[2.5rem] border border-white bg-white/80 text-royal shadow-[0_40px_80px_-30px_rgb(7_23_63/0.45)] backdrop-blur-xl">
                  <Icon className="size-20" strokeWidth={1.3} />
                  <span className="absolute -right-3 -top-3 size-7 rounded-full bg-[linear-gradient(135deg,#FFC72C,#F5A800)] shadow-[0_0_24px_#FFC72C]" />
                </span>
              </div>
            </Parallax>
          </div>
        )}
      </div>
    </section>
  );
}
