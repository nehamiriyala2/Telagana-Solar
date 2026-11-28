import type { Metadata, Viewport } from "next";
import { Inter, Noto_Sans_Telugu, Plus_Jakarta_Sans } from "next/font/google";
import "../globals.css";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["600", "700", "800"], variable: "--font-jakarta", display: "swap" });
const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-inter", display: "swap" });
const telugu = Noto_Sans_Telugu({ subsets: ["telugu"], weight: ["400", "600"], variable: "--font-telugu", display: "swap", preload: false });

/** Separate root layout for the private admin: no public header/footer, never indexed. */
export const metadata: Metadata = {
  title: { default: "Admin | Telangana Solar", template: "%s | Telangana Solar" },
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
  icons: { icon: "/brand/mark-64.png" },
};

export const viewport: Viewport = { themeColor: "#07173f" };

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${jakarta.variable} ${inter.variable} ${telugu.variable}`}>
      <body className="min-h-dvh bg-[#fbf8f1] text-navy antialiased">{children}</body>
    </html>
  );
}
