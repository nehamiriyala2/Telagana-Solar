import { adminRoute } from "@/lib/admin/api";
import { activityKind, describeActivity, parseDetails, type ActivityRow } from "@/lib/admin/activity";
import { q } from "@/lib/admin/db";
import { LOST_LABEL, SOURCE_LABEL, USE_LABEL, inr, kwLabel, type LostReason } from "@/lib/admin/labels";
import { duplicatesFor, getLead, parseId } from "@/lib/admin/lead-service";
import { parseSchemes } from "@/lib/admin/leads-query";
import { waLink } from "@/lib/admin/phone";
import { can } from "@/lib/admin/roles";
import { ROUTE_PERMS } from "@/lib/admin/route-perms";
import { schemeName } from "@/lib/admin/scheme-names";
import { pickTemplate, renderTemplate } from "@/lib/admin/templates";
import { fullIst } from "@/lib/admin/time";
import { loadStages } from "@/lib/admin/stages-store";
import { stageLabels } from "@/lib/admin/stages";

export const dynamic = "force-dynamic";

/**
 * GET → everything the quick-view drawer shows: key details, duplicates, and one timeline that merges
 * status changes, calls/WhatsApp, notes and follow-ups (newest first). Dates are formatted in IST.
 */
export const GET = adminRoute<{ id: string }>(ROUTE_PERMS["leads.timeline"], async (_req, staff, { id: raw }) => {
  const id = parseId(raw);
  const lead = await getLead(id, staff);
  const [notes, activity, templates, dups, stages, fuNotes] = await Promise.all([
    q<{ id: number; body: string; created_at: Date; author: string | null }>(
      "SELECT n.id, n.body, n.created_at, s.name AS author FROM lead_notes n LEFT JOIN staff s ON s.id = n.staff_id WHERE n.lead_id = ? ORDER BY n.created_at DESC LIMIT 100", [id]),
    q<ActivityRow>("SELECT a.id, a.action, a.details, a.created_at, s.name AS staff_name FROM lead_activity a LEFT JOIN staff s ON s.id = a.staff_id WHERE a.lead_id = ? AND a.action NOT IN ('exported','note_added') ORDER BY a.created_at DESC, a.id DESC LIMIT 150", [id]),
    q<{ key: string; lang: string; body: string; active: number }>("SELECT `key`, lang, body, active FROM wa_templates WHERE `key` = 'welcome'"),
    duplicatesFor([lead.phone_normalized, lead.alt_phone_normalized], id, staff),
    loadStages(),
    q<{ id: number; outcome_note: string | null; note: string | null }>("SELECT id, outcome_note, note FROM follow_ups WHERE lead_id = ?", [id]),
  ]);
  const labels = stageLabels(stages);
  const fuText = new Map(fuNotes.map((f) => [f.id, f]));
  /** Follow-up notes live on the follow-up row (never in the activity log); show them under the entry. */
  const bodyFor = (a: ActivityRow): string | null => {
    const d = parseDetails(a);
    const f = typeof d.follow_up_id === "number" ? fuText.get(d.follow_up_id) : undefined;
    if (!f) return null;
    return a.action === "follow_up_done" ? f.outcome_note : a.action === "follow_up_added" ? f.note : null;
  };

  const timeline = [
    ...activity.map((a) => ({ key: `a${a.id}`, at: a.created_at.getTime(), when: fullIst(a.created_at), who: a.staff_name ?? "System", kind: activityKind(a.action), text: describeActivity(a, labels), body: bodyFor(a) })),
    ...notes.map((n) => ({ key: `n${n.id}`, at: n.created_at.getTime(), when: fullIst(n.created_at), who: n.author ?? "Staff", kind: (n.body.startsWith("Follow-up done:") ? "followup" : "note") as "followup" | "note", text: n.body.startsWith("Follow-up done:") ? "Follow-up done" : "Note", body: n.body.replace(/^Follow-up done:\s*/, "") })),
  ].sort((a, b) => b.at - a.at);

  const phone = lead.phone_normalized;
  const wa = phone ? waLink(phone, renderTemplate(pickTemplate("welcome", lead.lang, templates), {
    name: lead.name, kw: lead.kw ? kwLabel(Number(lead.kw)) : null, district: lead.district_en, area: lead.area, phone,
  })) : null;

  return Response.json({
    lead: {
      id, leadNo: lead.lead_no ?? `TS-${String(id).padStart(4, "0")}`, name: lead.name, status: lead.status,
      lostReason: lead.lost_reason ? LOST_LABEL[lead.lost_reason as LostReason] ?? lead.lost_reason : null,
      phone, altPhone: lead.alt_phone_normalized, email: lead.email, wa,
      district: lead.district_en, districtTe: lead.district_te, area: lead.area, address: lead.address,
      use: lead.use_type ? USE_LABEL[lead.use_type] ?? lead.use_type : null, bill: lead.bill === null ? null : inr(lead.bill),
      roofArea: lead.roof_area_sqft, kw: lead.kw === null ? null : kwLabel(Number(lead.kw)),
      schemes: parseSchemes(lead.schemes).map(schemeName), source: SOURCE_LABEL[lead.source ?? ""] ?? lead.source,
      owner: lead.owner_name, received: fullIst(lead.created_at), nextFollowUp: lead.next_follow_up ? fullIst(lead.next_follow_up) : null,
      isTest: Boolean(lead.is_test), deleted: Boolean(lead.deleted_at),
      won: { kw: lead.final_kw !== null ? Number(lead.final_kw) : lead.kw !== null ? Number(lead.kw) : null, amount: lead.final_amount ?? lead.quote_amount, subsidy: lead.subsidy_applied === null ? null : Boolean(lead.subsidy_applied) },
    },
    duplicates: dups.map((d) => ({ id: d.id, leadNo: d.lead_no, name: d.name, status: d.status, received: fullIst(d.created_at) })),
    timeline: timeline.map(({ at: _at, ...t }) => t), // eslint-disable-line @typescript-eslint/no-unused-vars
    canEdit: can(staff.role, "leads.edit") && !lead.deleted_at,
  });
});
