import { useTranslations } from "next-intl";
import { ArrowRight, Check, Home, Store, Wheat } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { SectionHeading } from "@/components/ui/section-heading";
import { TiltCard } from "@/components/motion/tilt-card";
import { Reveal } from "@/components/motion/reveal";

const ITEMS = [
  { key: "homes", href: "/solutions/homes", Icon: Home, tint: "from-gold-soft to-white" },
  { key: "farms", href: "/solutions/farms", Icon: Wheat, tint: "from-[#EAF1F8] to-white" },
  { key: "business", href: "/solutions/business", Icon: Store, tint: "from-mist to-white" },
] as const;

export function Solutions() {
  const t = useTranslations();
  return (
    <section className="bg-section-white py-16 md:py-24" aria-labelledby="sol-title">
      <div className="container-page">
        <SectionHeading premium eyebrow={t("solutions.eyebrow")} title={t("solutions.title")} subtitle={t("solutions.subtitle")} />
        <ul className="grid gap-5 md:grid-cols-3">
          {ITEMS.map(({ key, href, Icon, tint }, i) => (
            <Reveal key={key} delay={i * 0.08} className="h-full">
              <li className="h-full list-none">
                <TiltCard className="h-full rounded-card" max={5}>
                  <Link href={href} className={`group flex h-full flex-col rounded-card border border-line bg-gradient-to-b ${tint} p-7 shadow-soft transition-shadow duration-500 hover:shadow-lift md:p-8`}>
                    <span className="icon-primary-hover grid size-14 place-items-center rounded-2xl transition-transform duration-500 group-hover:-translate-y-1"><Icon className="size-7" strokeWidth={1.6} aria-hidden /></span>
                    <h3 className="mt-8 text-h3 text-ink">{t(`solutions.${key}.title`)}</h3>
                    <ul className="mt-4 flex-1 space-y-2.5">
                      {(["b1", "b2"] as const).map((b) => (
                        <li key={b} className="flex gap-2.5 text-muted"><Check className="mt-1 size-4 shrink-0 text-leaf" aria-hidden />{t(`solutions.${key}.${b}`)}</li>
                      ))}
                    </ul>
                    <span className="mt-6 inline-flex items-center gap-1.5 font-semibold text-primary-hover">
                      {t("common.learnMore")}<ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
                    </span>
                  </Link>
                </TiltCard>
              </li>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
