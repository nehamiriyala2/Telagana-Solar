import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CircleCheck, ExternalLink, FileText, HandHelping } from "lucide-react";
import { PageHero } from "@/components/page/page-hero";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { SCHEME_ICONS } from "@/components/home/schemes-section";
import { FinalCta } from "@/components/home/home-sections";
import { SCHEMES, type SchemeSlug } from "@/config/schemes";
import { routing } from "@/i18n/routing";
import { pageMeta } from "@/lib/seo";

/** Scheme page template: who can apply, benefit, documents, steps, how we help. */
export function generateStaticParams() {
  return routing.locales.flatMap((locale) => SCHEMES.map((s) => ({ locale, slug: s.slug })));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!SCHEMES.some((s) => s.slug === slug)) return {};
  const t = await getTranslations({ locale, namespace: `schemes.items.${slug}` });
  return pageMeta({ locale, path: `/schemes/${slug}`, title: t("name"), description: t("short") });
}

export default async function SchemePage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const scheme = SCHEMES.find((s) => s.slug === slug);
  if (!scheme) notFound();
  setRequestLocale(locale);
  const t = await getTranslations("schemes");
  const k = (key: string) => t(`items.${slug}.${key}`);
  const Icon = SCHEME_ICONS[slug as SchemeSlug];

  return (
    <>
      <PageHero eyebrow={t("eyebrow")} title={k("name")} subtitle={k("short")} Icon={Icon} calcType={scheme.audience === "farm" ? "farm" : "home"} />

      <section className="section pt-10 md:pt-14">
        <div className="container-page grid gap-6 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-7">
            <Reveal className="rounded-card bg-[linear-gradient(135deg,#FFF3D1,#FFFBF2)] p-7 md:p-9">
              <h2 className="text-h3">{t("benefit")}</h2>
              <p className="mt-3 text-navy-700 md:text-body-lg">{k("benefit")}</p>
              <p className="mt-4 text-caption font-semibold text-gold-ink">{t("note")}</p>
            </Reveal>

            <Reveal className="rounded-card border border-line bg-white p-7 shadow-soft">
              <h2 className="text-h4">{t("who")}</h2>
              <ul className="mt-4 space-y-2.5">
                {["w1", "w2", "w3"].map((w) => <li key={w} className="flex gap-2.5"><CircleCheck className="mt-0.5 size-5 shrink-0 text-leaf" aria-hidden />{k(w)}</li>)}
              </ul>
            </Reveal>

            <Reveal className="rounded-card border border-line bg-white p-7 shadow-soft">
              <h2 className="text-h4">{t("steps")}</h2>
              <ol className="relative mt-5">
                <span aria-hidden className="absolute bottom-4 left-[15px] top-4 w-0.5 bg-gradient-to-b from-yellow to-gold" />
                {["s1", "s2", "s3", "s4", "s5"].map((s, i) => (
                  <li key={s} className="relative flex gap-4 pb-5 last:pb-0">
                    <span className="relative z-10 grid size-8 shrink-0 place-items-center rounded-full bg-sun text-caption font-extrabold text-navy ring-4 ring-white">{i + 1}</span>
                    <p className="pt-1">{k(s)}</p>
                  </li>
                ))}
              </ol>
            </Reveal>
          </div>

          <div className="space-y-6 lg:col-span-5">
            <Reveal className="rounded-card border border-line bg-white p-7 shadow-soft">
              <h2 className="text-h4">{t("documents")}</h2>
              <ul className="mt-4 grid gap-2">
                {["d1", "d2", "d3", "d4"].map((d) => <li key={d} className="flex items-center gap-3 rounded-xl bg-cream px-4 py-3"><FileText className="size-5 text-royal" aria-hidden />{k(d)}</li>)}
              </ul>
            </Reveal>
            <Reveal className="rounded-card bg-navy-glow p-7 text-white shadow-lift">
              <h2 className="flex items-center gap-2 text-h4"><HandHelping className="size-6 text-yellow" aria-hidden />{t("help")}</h2>
              <ul className="mt-4 space-y-2.5">
                {["h1", "h2", "h3", "h4"].map((h) => <li key={h} className="flex gap-2.5 text-silver"><CircleCheck className="mt-0.5 size-5 shrink-0 text-leaf" aria-hidden />{k(h)}</li>)}
              </ul>
            </Reveal>
            <Button asChild variant="outline" className="w-full">
              <a href={scheme.officialUrl} target="_blank" rel="noopener noreferrer">{t("official")}<ExternalLink aria-hidden /></a>
            </Button>
          </div>
        </div>
      </section>

      <FinalCta defaultType={scheme.audience === "farm" ? "farm" : "home"} />
    </>
  );
}
