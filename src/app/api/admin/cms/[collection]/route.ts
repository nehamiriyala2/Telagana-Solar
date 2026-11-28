import { z } from "zod";
import { jsonBody } from "@/lib/admin/api";
import { cmsRoute } from "@/lib/admin/cms/api";
import { createRow, listRows } from "@/lib/admin/cms/store";

export const dynamic = "force-dynamic";

/** GET ?q=&state=all|published|draft → rows. Permission: the collection's (e.g. schemes.edit). */
export const GET = cmsRoute(async (req, _staff, c) => {
  const sp = new URL(req.url).searchParams;
  const state = (["published", "draft"].includes(sp.get("state") ?? "") ? sp.get("state") : "all") as "all" | "published" | "draft";
  const rows = await listRows(c, { q: (sp.get("q") ?? "").trim().slice(0, 80), state });
  return Response.json({ rows: rows.map(({ raw: _r, ...r }) => r) }); // eslint-disable-line @typescript-eslint/no-unused-vars
});

/** POST { values, publish } → new row. Validated by the collection's field rules; logged in the audit log. */
export const POST = cmsRoute(async (req, staff, c) => {
  const body = z.object({ values: z.unknown(), publish: z.boolean().default(false) }).parse(await jsonBody(req));
  const id = await createRow(c, body.values, body.publish, staff);
  return Response.json({ ok: true, id }, { status: 201 });
});
