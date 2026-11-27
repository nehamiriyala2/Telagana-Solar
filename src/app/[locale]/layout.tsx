import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { Manrope, Inter, Noto_Sans_Telugu } from "next/font/google";
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
import "../globals.css";
import "../site-theme.css";

// Headings: Manrope (600–800). Body/UI: Inter. Telugu: Noto Sans Telugu.
const display = Manrope({ subsets: ["latin"], weight: ["600", "700", "800"], variable: "--font-display", display: "swap" });
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

export const viewport: Viewport = { themeColor: "#FCFBF9" };

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const messages = await getMessages();
  const t = await getTranslations("nav");

  return (
    <html lang={locale} className={`site ${display.variable} ${inter.variable} ${telugu.variable}`}>
      <body className="min-h-dvh overflow-x-clip">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-gold focus:px-4 focus:py-2 focus:text-ink">{t("skip")}</a>
        <JsonLd data={localBusinessJsonLd(locale)} />
        <NextIntlClientProvider locale={locale} timeZone="Asia/Kolkata" messages={messages}>
          <SmoothScroll />
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
