import { adminRoute, jsonBody } from "@/lib/admin/api";
import { NoteSchema, addNote, parseId } from "@/lib/admin/lead-service";
import { ROUTE_PERMS } from "@/lib/admin/route-perms";

export const dynamic = "force-dynamic";

export const POST = adminRoute<{ id: string }>(ROUTE_PERMS["leads.notes.add"], async (req, staff, { id }) => {
  const { body } = NoteSchema.parse(await jsonBody(req));
  return Response.json({ ok: true, id: await addNote(parseId(id), body, staff) });
});
