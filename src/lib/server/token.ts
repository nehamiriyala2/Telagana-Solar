import "server-only";
import { createHmac, timingSafeEqual } from "crypto";
import { site } from "@/config/site";

/** Signed "mark as called" links so the team can update a lead from WhatsApp/email with one tap. */
const secret = () => process.env.LEAD_ACTION_SECRET;

export function sign(id: string): string | null {
  const s = secret();
  return s ? createHmac("sha256", s).update(id).digest("base64url").slice(0, 32) : null;
}

export function verify(id: string, token: string): boolean {
  const expected = sign(id);
  if (!expected || expected.length !== token.length) return false;
  return timingSafeEqual(Buffer.from(expected), Buffer.from(token));
}

export function markCalledUrl(id: string): string | null {
  const t = sign(id);
  return t ? `${site.url}/api/leads/called?id=${encodeURIComponent(id)}&t=${t}` : null;
}
