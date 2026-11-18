import { db } from "@/lib/server/store";
import { verify } from "@/lib/server/token";

export const runtime = "nodejs";

/** One-tap "Mark as called" link from the owner's WhatsApp / email alert. */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id") ?? "";
  const t = url.searchParams.get("t") ?? "";
  const page = (msg: string, ok: boolean) =>
    new Response(
      `<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><title>Lead</title><body style="font-family:system-ui;display:grid;place-items:center;min-height:90vh;background:#FFFBF2;color:#07173F"><div style="text-align:center"><div style="font-size:48px">${ok ? "✅" : "⚠️"}</div><h1 style="font-size:22px">${msg}</h1></div></body>`,
      { status: ok ? 200 : 400, headers: { "Content-Type": "text/html; charset=utf-8" } },
    );

  if (!id || !verify(id, t)) return page("Invalid or expired link", false);
  const supa = db();
  if (!supa) return page("Database not configured (set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY)", false);
  const { error } = await supa.from("leads").update({ status: "called", called_at: new Date().toISOString() }).eq("id", id);
  return error ? page(`Could not update: ${error.message}`, false) : page("Marked as called. Thank you!", true);
}
