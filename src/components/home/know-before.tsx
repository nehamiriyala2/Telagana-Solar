import { useTranslations } from "next-intl";
import { BadgeCheck, Gauge, Headset, Ruler, ShieldCheck, Sun, Zap } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/motion/reveal";

const ITEMS = [
  { key: "k1", Icon: Ruler },
  { key: "k2", Icon: Sun },
  { key: "k3", Icon: Zap },
  { key: "k4", Icon: Gauge },
  { key: "k5", Icon: BadgeCheck },
  { key: "k6", Icon: ShieldCheck },
  { key: "k7", Icon: Headset },
] as const;

/** "Know before you buy": a simple pre-purchase checklist. */
export function KnowBefore() {
  const t = useTranslations("knowBefore");
  return (
    <section className="tone tone-mint py-16 md:py-24" aria-labelledby="kb-title">
      <div aria-hidden className="orb -right-24 top-1/3 size-96 bg-[#24A66A]/15" />
      <div className="container-page">
        <SectionHeading premium eyebrow={t("eyebrow")} title={t("title")} subtitle={t("subtitle")} />
        <ol className="mx-auto grid max-w-5xl gap-3 md:grid-cols-2">
          {ITEMS.map(({ key, Icon }, i) => (
            <Reveal key={key} delay={(i % 2) * 0.06}>
              <li className="card-premium group flex h-full list-none items-start gap-4 p-5">
                <span className="relative grid size-12 shrink-0 place-items-center rounded-2xl bg-leaf-tint text-leaf-ink transition-colors duration-500 group-hover:bg-leaf group-hover:text-white">
                  <Icon className="size-5" aria-hidden />
                  <span className="icon-sun absolute -right-2 -top-2 grid size-6 place-items-center rounded-full text-[0.6875rem] font-extrabold">{i + 1}</span>
                </span>
                <span>
                  <span className="block font-bold text-navy" style={{ fontFamily: "var(--font-display), var(--font-jakarta), var(--font-telugu), sans-serif" }}>{t(`${key}.title`)}</span>
                  <span className="mt-1 block text-caption text-muted">{t(`${key}.desc`)}</span>
                </span>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
