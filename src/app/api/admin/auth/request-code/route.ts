import { z } from "zod";
import { exec, isDbConfigured, one } from "@/lib/admin/db";
import { sendLoginCode } from "@/lib/admin/mail";
import { OTP_TTL_MINUTES, hashCode, newCode, normalizeEmail } from "@/lib/admin/otp";
import { clientIp, overLimit } from "@/lib/admin/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({ email: z.string().trim().max(190).email() });

/** Same answer for known and unknown emails, so the form never reveals who has access. */
const SENT = { ok: true, message: "If this email has access, a code is on its way." };

export async function POST(req: Request) {
  if (!isDbConfigured()) return Response.json({ ok: false, error: "db_unavailable" }, { status: 503 });
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ ok: false, error: "invalid_email" }, { status: 400 });
  const email = normalizeEmail(parsed.data.email);

  try {
    // 5 codes per email per 15 min, 20 per IP per 15 min.
    if ((await overLimit("otp-req-email", email, 5, 900)) || (await overLimit("otp-req-ip", clientIp(req), 20, 900))) {
      return Response.json({ ok: false, error: "rate_limited" }, { status: 429 });
    }

    const staff = await one<{ id: number }>("SELECT id FROM staff WHERE email = ? AND active = 1", [email]);
    if (staff) {
      const code = newCode();
      // A new code replaces any older unused one.
      await exec("UPDATE otp_codes SET used_at = UTC_TIMESTAMP() WHERE email = ? AND used_at IS NULL", [email]);
      await exec(
        "INSERT INTO otp_codes (email, code_hash, expires_at) VALUES (?, ?, UTC_TIMESTAMP() + INTERVAL ? MINUTE)",
        [email, hashCode(email, code), OTP_TTL_MINUTES],
      );
      // A send failure is logged server-side only; answering differently would reveal that the email has access.
      await sendLoginCode(email, code);
    }
    return Response.json(SENT);
  } catch (e) {
    console.error("[admin] request-code failed:", (e as Error).message);
    return Response.json({ ok: false, error: "db_unavailable" }, { status: 503 });
  }
}
