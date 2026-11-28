import "server-only";
import { createHmac, randomInt, timingSafeEqual } from "node:crypto";

export const OTP_TTL_MINUTES = 10;
export const OTP_MAX_ATTEMPTS = 5;

/**
 * 6-digit code from a CSPRNG.
 * Local convenience: ADMIN_DEV_CODE (e.g. 123456) is used instead, but ONLY when running `next dev`
 * with no SMTP configured. Production builds and any setup that sends real email ignore it.
 */
export function newCode(): string {
  const dev = process.env.ADMIN_DEV_CODE?.trim();
  if (process.env.NODE_ENV === "development" && !process.env.SMTP_HOST && dev && /^\d{6}$/.test(dev)) return dev;
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

/** Codes are stored only as HMAC(AUTH_SECRET, email:code): a DB leak does not reveal live codes. */
export function hashCode(email: string, code: string): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET missing");
  return createHmac("sha256", secret).update(`${email.toLowerCase()}:${code}`).digest("hex");
}

export function codeMatches(email: string, code: string, storedHash: string): boolean {
  const a = Buffer.from(hashCode(email, code), "hex");
  const b = Buffer.from(storedHash, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}

export function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}
