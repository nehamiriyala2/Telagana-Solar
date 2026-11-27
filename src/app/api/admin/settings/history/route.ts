import { adminRoute } from "@/lib/admin/api";
import { ROUTE_PERMS } from "@/lib/admin/route-perms";
import { SETTING_KEYS } from "@/lib/admin/settings-schema";
import { settingHistory } from "@/lib/admin/settings-store";
import { fullIst } from "@/lib/admin/time";

export const dynamic = "force-dynamic";

/** GET ?key=phone → last 50 changes of that setting. */
export const GET = adminRoute(ROUTE_PERMS["settings.history"], async (req) => {
  const key = new URL(req.url).searchParams.get("key") ?? "";
  if (!SETTING_KEYS.includes(key)) return Response.json({ error: "unknown_key" }, { status: 400 });
  const rows = await settingHistory(key);
  return Response.json({ history: rows.map((r) => ({ ...r, at: fullIst(r.at) })) });
});
