import { z } from "zod";
import { createSession } from "@/lib/admin/auth";
import { exec, isDbConfigured, one } from "@/lib/admin/db";
import { OTP_MAX_ATTEMPTS, codeMatches, normalizeEmail } from "@/lib/admin/otp";
import { clientIp, overLimit } from "@/lib/admin/rate-limit";
import { homeFor, type Role } from "@/lib/admin/roles";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  email: z.string().trim().max(190).email(),
  code: z.string().trim().regex(/^\d{6}$/),
});

const WRONG = { ok: false, error: "wrong_code" } as const;

export async function POST(req: Request) {
  if (!isDbConfigured()) return Response.json({ ok: false, error: "db_unavailable" }, { status: 503 });
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json(WRONG, { status: 400 });
  const email = normalizeEmail(parsed.data.email);

  try {
    if ((await overLimit("otp-verify-ip", clientIp(req), 30, 900)) || (await overLimit("otp-verify-email", email, 10, 900))) {
      return Response.json({ ok: false, error: "rate_limited" }, { status: 429 });
    }

    const otp = await one<{ id: number; code_hash: string; attempts: number; expired: number }>(
      `SELECT id, code_hash, attempts, expires_at < UTC_TIMESTAMP() AS expired
       FROM otp_codes WHERE email = ? AND used_at IS NULL ORDER BY id DESC LIMIT 1`,
      [email],
    );
    if (!otp) return Response.json(WRONG, { status: 400 });
    if (Number(otp.expired)) return Response.json({ ok: false, error: "expired" }, { status: 400 });
    if (otp.attempts >= OTP_MAX_ATTEMPTS) return Response.json({ ok: false, error: "too_many_attempts" }, { status: 400 });

    if (!codeMatches(email, parsed.data.code, otp.code_hash)) {
      await exec("UPDATE otp_codes SET attempts = attempts + 1 WHERE id = ?", [otp.id]);
      const left = OTP_MAX_ATTEMPTS - otp.attempts - 1;
      return Response.json(left > 0 ? { ...WRONG, attemptsLeft: left } : { ok: false, error: "too_many_attempts" }, { status: 400 });
    }

    // Single use: claim the code atomically so two parallel requests cannot both succeed.
    const claimed = await exec("UPDATE otp_codes SET used_at = UTC_TIMESTAMP() WHERE id = ? AND used_at IS NULL", [otp.id]);
    if (claimed.affectedRows !== 1) return Response.json(WRONG, { status: 400 });

    const staff = await one<{ id: number; role: Role }>("SELECT id, role FROM staff WHERE email = ? AND active = 1", [email]);
    if (!staff) return Response.json(WRONG, { status: 400 });

    await createSession(staff.id);
    return Response.json({ ok: true, redirect: homeFor(staff.role) });
  } catch (e) {
    console.error("[admin] verify failed:", (e as Error).message);
    return Response.json({ ok: false, error: "db_unavailable" }, { status: 503 });
  }
}
