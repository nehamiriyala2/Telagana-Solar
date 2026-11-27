import { useLocale, useTranslations } from "next-intl";
import { ArrowRight, Calculator, Landmark, Sparkles } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { DisplayTitle } from "@/components/ui/display-title";
import { titleEmphasis } from "@/data/pages";
import { pick } from "@/lib/utils";

/** 404: a sun behind a drifting cloud, the display title, and three ways back in. */
export default function NotFound() {
  const t = useTranslations();
  const locale = useLocale();
  const links = [
    { href: "/find-my-solar-plan", label: t("nav.siteVisit"), Icon: Sparkles },
    { href: "/savings-calculator", label: t("nav.calculator"), Icon: Calculator },
    { href: "/schemes", label: t("nav.schemes"), Icon: Landmark },
  ] as const;
  return (
    <section className="relative isolate grid min-h-[78svh] place-items-center overflow-hidden bg-cloud py-16">
      <div className="container-page text-center">
        <span aria-hidden className="mx-auto mb-8 block size-20 rounded-full border border-gold/60 bg-gold-soft shadow-[0_0_0_10px_rgb(43_108_176/0.08)]" />
        <p className="font-heading text-[clamp(4rem,14vw,9rem)] font-semibold leading-none tracking-[-0.02em] text-ink/10">404</p>
        <DisplayTitle text={t("notFound.title")} emphasis={pick(titleEmphasis.notFound, locale)} size="lg" className="-mt-6 md:-mt-10" />
        <p className="mx-auto mt-5 max-w-md animate-rise text-muted md:text-body-lg" style={{ animationDelay: "0.3s" }}>{t("notFound.body")}</p>
        <Button asChild size="lg" className="mt-8 animate-rise" style={{ animationDelay: "0.4s" }}><Link href="/">{t("notFound.cta")}<ArrowRight aria-hidden /></Link></Button>
        <ul className="mx-auto mt-10 flex max-w-2xl animate-rise flex-wrap justify-center gap-3" style={{ animationDelay: "0.5s" }}>
          {links.map(({ href, label, Icon }) => (
            <li key={href}>
              <Link href={href} className="flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2.5 text-caption font-semibold text-ink shadow-soft transition-[border-color,transform] duration-300 hover:-translate-y-0.5 hover:border-gold">
                <Icon className="size-4 text-gold-text" aria-hidden />{label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
