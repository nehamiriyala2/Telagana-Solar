import { z } from "zod";
import { jsonBody } from "@/lib/admin/api";
import { cmsRoute, rowId } from "@/lib/admin/cms/api";
import { deleteRow, getRow, setPublished, updateRow } from "@/lib/admin/cms/store";

export const dynamic = "force-dynamic";
type P = { collection: string; id: string };

export const GET = cmsRoute<P>(async (_req, _staff, c, { id }) => {
  const { values, published } = await getRow(c, rowId(id));
  return Response.json({ values, published });
});

/** PATCH { values } saves the form; PATCH { publish: true|false } publishes or unpublishes. */
export const PATCH = cmsRoute<P>(async (req, staff, c, { id }) => {
  const body = z.union([z.object({ values: z.unknown() }).strict(), z.object({ publish: z.boolean() }).strict()]).parse(await jsonBody(req));
  if ("publish" in body) { await setPublished(c, rowId(id), body.publish, staff); return Response.json({ ok: true }); }
  const changed = await updateRow(c, rowId(id), body.values, staff);
  return Response.json({ ok: true, changed });
});

/** DELETE → soft delete (kept in the database, hidden everywhere). */
export const DELETE = cmsRoute<P>(async (_req, staff, c, { id }) => {
  await deleteRow(c, rowId(id), staff);
  return Response.json({ ok: true });
});
