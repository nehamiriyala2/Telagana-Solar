"use client";
import { NextIntlClientProvider } from "next-intl";
import messages from "../../../messages/en.json";
import { HeroVisual } from "@/components/hero3d/hero-visual";

/** Client-only wrapper: provides English messages to the scene without the locale layout. */
export function CaptureClient() {
  return (
    <NextIntlClientProvider locale="en" timeZone="Asia/Kolkata" messages={messages}>
      <div style={{ width: 640, padding: 0 }}>
        <HeroVisual capture />
      </div>
    </NextIntlClientProvider>
  );
}
