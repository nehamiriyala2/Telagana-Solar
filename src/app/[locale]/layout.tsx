import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { Playfair_Display, Inter, Noto_Sans_Telugu } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { FloatingContact } from "@/components/layout/floating-contact";
import { Analytics } from "@/components/layout/analytics";
import { SmoothScroll } from "@/components/motion/smooth-scroll";
import { site } from "@/config/site";
import { JsonLd, localBusinessJsonLd } from "@/lib/seo";
import { loadPublicSettings } from "@/lib/public-settings";
import { applyCalcSettings } from "@/lib/calculator";
import { applySiteOverrides } from "@/lib/site-runtime";
import { PublicSettingsBridge } from "@/components/layout/public-settings-bridge";
import { AnnouncementBanner } from "@/components/layout/announcement-banner";
import "../globals.css";
import "../site-theme.css";
import "../motion.css";

// Headings: Playfair Display (classic serif, 600–700). Body/UI: Inter. Telugu: Noto Sans Telugu.
const display = Playfair_Display({ subsets: ["latin"], weight: ["600", "700"], variable: "--font-display", display: "swap" });
const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-inter", display: "swap" });
const telugu = Noto_Sans_Telugu({ subsets: ["telugu"], weight: ["400", "500", "600", "700"], variable: "--font-telugu", display: "swap", preload: false });

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    metadataBase: new URL(site.url),
    title: { default: t("title"), template: "%s | Telangana Solar" },
    description: t("description"),
    alternates: { canonical: locale === "te" ? "/te" : "/", languages: { en: "/", te: "/te" } },
    openGraph: { title: t("title"), description: t("description"), siteName: site.name, type: "website", locale: locale === "te" ? "te_IN" : "en_IN", images: [{ url: "/og-image.png", width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image" },
    icons: { icon: [{ url: "/brand/ts-mark.svg", type: "image/svg+xml" }, { url: "/brand/ts-mark-64.png", sizes: "64x64" }], apple: "/brand/ts-apple-icon.png" },
  };
}

export const viewport: Viewport = { themeColor: "#F5F0E6" };

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const messages = await getMessages();
  const t = await getTranslations("nav");
  // Admin-edited settings (calculator, contact details, banner); falls back to src/config without MySQL.
  const ps = await loadPublicSettings();
  applyCalcSettings(ps.calc, ps.districtDiscom);
  applySiteOverrides(ps.site);

  return (
    <html lang={locale} className={`site ${display.variable} ${inter.variable} ${telugu.variable}`}>
      <body className="min-h-dvh overflow-x-clip">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-gold focus:px-4 focus:py-2 focus:text-ink">{t("skip")}</a>
        <JsonLd data={localBusinessJsonLd(locale)} />
        <NextIntlClientProvider locale={locale} timeZone="Asia/Kolkata" messages={messages}>
          <PublicSettingsBridge calc={ps.calc} districtDiscom={ps.districtDiscom} site={ps.site} />
          <SmoothScroll />
          <AnnouncementBanner banner={ps.banner} locale={locale} />
          <Header />
          <main id="main" className="pt-[var(--header-h)]">{children}</main>
          <Footer />
          <FloatingContact />
        </NextIntlClientProvider>
        <Analytics />
      </body>
    </html>
  );
}
