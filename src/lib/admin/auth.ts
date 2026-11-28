import "server-only";
import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { exec, isDbConfigured, one } from "./db";
import { can, homeFor, type Permission, type Role } from "./roles";
import { SESSION_COOKIE, SESSION_DAYS, signSession, verifySession } from "./session-token";

export interface Staff { id: number; name: string; email: string; role: Role }

/** Creates a DB session (revocable) and sets the signed cookie. */
export async function createSession(staffId: number) {
  const id = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + SESSION_DAYS * 86400_000);
  await exec("INSERT INTO sessions (id, staff_id, expires_at) VALUES (?, ?, ?)", [id, staffId, expires]);
  await exec("UPDATE staff SET last_login_at = UTC_TIMESTAMP() WHERE id = ?", [staffId]);
  const jar = await cookies();
  jar.set(SESSION_COOKIE, await signSession(id, expires), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires,
  });
}

export async function destroySession() {
  const jar = await cookies();
  const id = await verifySession(jar.get(SESSION_COOKIE)?.value);
  if (id && isDbConfigured()) await exec("DELETE FROM sessions WHERE id = ?", [id]).catch(() => {});
  jar.delete(SESSION_COOKIE);
}

/** The signed-in, ACTIVE staff member with an unexpired, unrevoked session, or null. */
export async function currentStaff(): Promise<Staff | null> {
  if (!isDbConfigured()) return null;
  const jar = await cookies();
  const id = await verifySession(jar.get(SESSION_COOKIE)?.value);
  if (!id) return null;
  return one<Staff>(
    `SELECT s.id, s.name, s.email, s.role FROM sessions se
     JOIN staff s ON s.id = se.staff_id
     WHERE se.id = ? AND se.expires_at > UTC_TIMESTAMP() AND s.active = 1`,
    [id],
  );
}

/** For admin pages: redirects to sign-in, or to the role's home page when the permission is missing. */
export async function requireStaff(perm?: Permission): Promise<Staff> {
  const staff = await currentStaff();
  if (!staff) redirect("/admin/login");
  if (perm && !can(staff.role, perm)) redirect(`${homeFor(staff.role)}?denied=1`);
  return staff;
}

export type Guard = { ok: true; staff: Staff } | { ok: false; res: Response };

/** For /api/admin routes: 401 without a valid session, 403 without the permission. */
export async function guardApi(perm?: Permission): Promise<Guard> {
  let staff: Staff | null = null;
  try { staff = await currentStaff(); } catch { return { ok: false, res: Response.json({ error: "db_unavailable" }, { status: 503 }) }; }
  if (!staff) return { ok: false, res: Response.json({ error: "unauthorized" }, { status: 401 }) };
  if (perm && !can(staff.role, perm)) return { ok: false, res: Response.json({ error: "forbidden" }, { status: 403 }) };
  return { ok: true, staff };
}
