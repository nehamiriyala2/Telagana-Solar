import { destroySession } from "@/lib/admin/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Revokes the session row and clears the cookie. POST only, so a link or image cannot sign you out. */
export async function POST() {
  await destroySession();
  return Response.json({ ok: true });
}
