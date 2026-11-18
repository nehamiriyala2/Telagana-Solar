import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { Card } from "@/components/ui/card";
import { EditMark } from "@/components/ui/badge";
import { CallButton, WhatsAppButton } from "@/components/ui/contact-buttons";
import { ContactForm } from "@/components/page/contact-form";
import { site } from "@/config/site";
import { pageMeta } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });
  return pageMeta({ locale, path: "/contact", title: t("eyebrow"), description: t("subtitle") });
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("contact");
  const address = site.address.street ? `${site.address.street}, ${site.address.city}, ${site.address.region} ${site.address.postalCode ?? ""}` : null;
  const mapSrc = site.mapEmbedUrl ?? `https://maps.google.com/maps?q=${site.geo.lat},${site.geo.lng}&z=13&output=embed`;

  return (
    <div className="bg-[linear-gradient(180deg,#FFFFFF_0%,#FFFBF2_100%)]">
      <div className="container-page pb-20 pt-12 md:pt-16">
        <SectionHeading as="h1" eyebrow={t("eyebrow")} title={t("title")} subtitle={t("subtitle")} />

        <div className="grid gap-6 lg:grid-cols-12">
          <Card id="book" className="min-w-0 scroll-mt-24 p-6 md:p-8 lg:col-span-7">
            <h2 className="mb-6 text-h3">{t("formTitle")}</h2>
            <ContactForm />
          </Card>

          <div className="min-w-0 space-y-4 lg:col-span-5">
            <Card className="p-6">
              <ul className="space-y-5">
                <Item Icon={Phone} label={t("callUs")} value={site.phone ? <a href={`tel:${site.phone}`} className="hover:underline">{site.phone}</a> : <EditMark label="[EDIT] phone" />} />
                <Item Icon={MessageCircle} label={t("whatsappUs")} value={site.whatsapp ? `+${site.whatsapp}` : <EditMark label="[EDIT] WhatsApp" />} />
                <Item Icon={Mail} label={t("emailUs")} value={site.email ? <a href={`mailto:${site.email}`} className="hover:underline">{site.email}</a> : <EditMark label="[EDIT] email" />} />
                <Item Icon={MapPin} label={t("visitUs")} value={address ?? <EditMark label="[EDIT] address" />} />
                <Item Icon={Clock} label={t("hours")} value={t("hoursValue")} />
              </ul>
              <div className="mt-6 grid grid-cols-2 gap-2">
                <CallButton place="contact-card" className="w-full" />
                <WhatsAppButton place="contact-card" className="w-full" />
              </div>
            </Card>
            <Card className="overflow-hidden">
              <h2 className="sr-only">{t("mapTitle")}</h2>
              <iframe title={t("mapTitle")} src={mapSrc} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="h-72 w-full border-0" />
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function Item({ Icon, label, value }: { Icon: typeof Phone; label: string; value: React.ReactNode }) {
  return (
    <li className="flex gap-4">
      <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-sky-tint text-sky-ink"><Icon className="size-5" aria-hidden /></span>
      <span><span className="block text-caption text-muted">{label}</span><span className="block font-semibold">{value}</span></span>
    </li>
  );
}
