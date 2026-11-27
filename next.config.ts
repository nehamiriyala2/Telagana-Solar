import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // Optional separate build folder (e.g. NEXT_DIST_DIR=.next-verify) so a test build does not disturb a running dev server
  distDir: process.env.NEXT_DIST_DIR || ".next",
  outputFileTracingRoot: process.cwd(),
  images: { formats: ["image/avif", "image/webp"] },
  experimental: { optimizePackageImports: ["lucide-react", "recharts"] },
  // Dev-only "N" badge: keep it bottom-right so it never covers the admin sidebar's Sign out button.
  devIndicators: { position: "bottom-right" },
};

export default withNextIntl(nextConfig);
