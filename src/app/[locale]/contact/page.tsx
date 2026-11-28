import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { PageHero } from "@/components/page/page-hero";
import { EditMark } from "@/components/ui/badge";
import { CallButton, WhatsAppButton } from "@/components/ui/contact-buttons";
import { ContactForm } from "@/components/page/contact-form";
import { BlurReveal } from "@/components/motion/primitives";
import { site } from "@/config/site";
import { titleEmphasis } from "@/data/pages";
import { pageMeta } from "@/lib/seo";
import { pick } from "@/lib/utils";
import { Develop } from "@/components/motion/develop";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });
  return pageMeta({ locale, path: "/contact", title: t("eyebrow"), description: t("subtitle") });
}

/** Contact: hero → form (#book) + contact details with Call/WhatsApp → map. */
export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("contact");
  const address = site.address.street ? `${site.address.street}, ${site.address.city}, ${site.address.region} ${site.address.postalCode ?? ""}` : null;
  const mapSrc = site.mapEmbedUrl ?? `https://maps.google.com/maps?q=${site.geo.lat},${site.geo.lng}&z=13&output=embed`;

  return (
    <>
      <PageHero eyebrow={t("eyebrow")} title={t("title")} emphasis={pick(titleEmphasis.contact, locale)} subtitle={t("subtitle")} ctas={false} tone="dark" align="center" motif="waves" reveal="chars" />

      <section className="tone tone-mint pb-16 pt-10 md:pb-24">
        <div className="container-page grid gap-6 lg:grid-cols-12">
          <BlurReveal id="book" className="min-w-0 scroll-mt-24 rounded-[1.25rem] border border-line bg-white p-6 shadow-[0_40px_90px_-50px_rgb(11_31_58/0.45)] md:p-9 lg:col-span-7">
            <h2 className="mb-6 font-heading text-h3 font-extrabold tracking-[-0.02em] text-ink">{t("formTitle")}</h2>
            <ContactForm />
          </BlurReveal>

          <div className="min-w-0 space-y-5 lg:col-span-5">
            <BlurReveal delay={0.08} className="tone tone-navy rounded-[1.25rem] p-6 shadow-[0_40px_80px_-40px_rgb(11_31_58/0.7)] md:p-8">
              <ul className="space-y-5">
                <Item i={0} Icon={Phone} label={t("callUs")} value={site.phone ? <a href={`tel:${site.phone}`} className="hover:underline">{site.phone}</a> : <EditMark label="[EDIT] phone" />} />
                <Item i={1} Icon={MessageCircle} label={t("whatsappUs")} value={site.whatsapp ? `+${site.whatsapp}` : <EditMark label="[EDIT] WhatsApp" />} />
                <Item i={2} Icon={Mail} label={t("emailUs")} value={site.email ? <a href={`mailto:${site.email}`} className="break-all hover:underline">{site.email}</a> : <EditMark label="[EDIT] email" />} />
                <Item i={3} Icon={MapPin} label={t("visitUs")} value={address ?? <EditMark label="[EDIT] address" />} />
                <Item i={4} Icon={Clock} label={t("hours")} value={t("hoursValue")} />
              </ul>
              <div className="mt-7 grid grid-cols-2 gap-2">
                <CallButton place="contact-card" className="w-full" />
                <WhatsAppButton place="contact-card" className="w-full" />
              </div>
            </BlurReveal>
            <BlurReveal delay={0.14} className="zoom-frame overflow-hidden rounded-[1.25rem] border border-line bg-white shadow-soft">
              <h2 className="sr-only">{t("mapTitle")}</h2>
              <iframe title={t("mapTitle")} src={mapSrc} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="h-72 w-full border-0" />
            </BlurReveal>
          </div>
        </div>
      </section>
    </>
  );
}

function Item({ i, Icon, label, value }: { i: number; Icon: typeof Phone; label: string; value: React.ReactNode }) {
  return (
    <Develop as="li" kind="row" index={i} className="flex gap-4">
      <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-gold text-ink"><Icon className="size-5" aria-hidden /></span>
      <span className="min-w-0"><span className="on-dark-muted block text-caption">{label}</span><span className="block font-semibold text-white">{value}</span></span>
    </Develop>
  );
}
