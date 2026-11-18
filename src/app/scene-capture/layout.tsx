import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = { title: "Scene capture", robots: { index: false, follow: false } };

/** Bare layout used only to render the 3D hero scene for the static fallback image. */
export default function CaptureLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ background: "transparent", margin: 0 }}>{children}</body>
    </html>
  );
}
