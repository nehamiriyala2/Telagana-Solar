import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";
import type { L10n, Locale } from "./types";

/** Teach tailwind-merge our custom type scale so `text-caption` isn't mistaken for a colour. */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: ["hero", "hero-lg", "h2", "h2-lg", "h3", "h4", "body", "body-lg", "caption"] }],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const pick = (v: L10n, locale: string) => v[(locale as Locale) === "te" ? "te" : "en"];

const inr = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
export const formatINR = (n: number) => `₹${inr.format(Math.round(n))}`;
export const formatNum = (n: number, digits = 0) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: digits, minimumFractionDigits: 0 }).format(n);

/** Compact lakh notation for big rupee values: ₹1.2L */
export const formatLakh = (n: number): string => {
  if (n < 0) return `−${formatLakh(-n)}`;
  return n >= 100000 ? `₹${formatNum(n / 100000, 1)}L` : n >= 1000 ? `₹${formatNum(n / 1000, 0)}k` : formatINR(n);
};

export const formatRange = (min: number, max: number) =>
  min === max ? formatLakh(min) : `${formatLakh(min)} – ${formatLakh(max)}`;
