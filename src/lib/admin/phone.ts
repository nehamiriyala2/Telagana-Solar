import { normalizeIndianPhone } from "@/lib/leads";

/** 10-digit Indian mobile ("9876543210") from any common format (+91, 91, 0, spaces, dashes), or null. */
export function phone10(raw: string | null | undefined): string | null {
  return normalizeIndianPhone(raw)?.slice(3) ?? null;
}

/** wa.me link for a 10-digit number. */
export function waLink(ten: string, text?: string) {
  return `https://wa.me/91${ten}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}
