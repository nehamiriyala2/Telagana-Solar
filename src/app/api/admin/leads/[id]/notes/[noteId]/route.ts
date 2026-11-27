import { adminRoute, jsonBody } from "@/lib/admin/api";
import { NoteSchema, deleteNote, editNote, parseId } from "@/lib/admin/lead-service";
import { ROUTE_PERMS } from "@/lib/admin/route-perms";

export const dynamic = "force-dynamic";
type P = { id: string; noteId: string };

/** Author or admin only (checked in the service). */
export const PATCH = adminRoute<P>(ROUTE_PERMS["leads.notes.edit"], async (req, staff, { id, noteId }) => {
  const { body } = NoteSchema.parse(await jsonBody(req));
  await editNote(parseId(id), parseId(noteId), body, staff);
  return Response.json({ ok: true });
});

export const DELETE = adminRoute<P>(ROUTE_PERMS["leads.notes.edit"], async (_req, staff, { id, noteId }) => {
  await deleteNote(parseId(id), parseId(noteId), staff);
  return Response.json({ ok: true });
});
