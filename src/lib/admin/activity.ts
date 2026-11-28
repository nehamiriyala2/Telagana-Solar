import { FU_OUTCOME_LABEL, FU_TYPE_LABEL, LOST_LABEL, ROOF_LABEL, SOURCE_LABEL, STATUS_LABEL, USE_LABEL, inr, kwLabel, type FuOutcome, type FuType, type LeadStatus, type LostReason } from "./labels";
import { fullIst } from "./time";

/** Timeline wording, shared by the lead page and the quick-view drawer. */
export type ActivityRow = { id: number; action: string; details: string | Record<string, unknown> | null; created_at: Date; staff_name: string | null };

const FIELD_LABEL: Record<string, string> = {
  next_follow_up: "Next follow-up", site_visit_at: "Site visit", final_kw: "Final kW", quote_amount: "Quote amount", final_amount: "Final amount",
  subsidy_applied: "Subsidy applied", loan_needed: "Loan needed", install_date: "Install date", phone: "Phone",
  alt_phone: "Alternate phone", email: "Email", name: "Name", area: "Area", address: "Address", district: "District",
  use_type: "Property type", bill: "Monthly bill", units: "Units per month", roof: "Roof", roof_area_sqft: "Roof area",
  source: "Source", schemes: "Interested schemes", is_test: "Test data",
};
/** Personal fields: the log says they changed, never what to. */
const PRIVATE = new Set(["name", "phone", "alt_phone", "email", "area", "address"]);

function fmtVal(field: string, v: unknown): string {
  if (v === null || v === undefined || v === "") return "empty";
  if (field === "next_follow_up" || field === "site_visit_at") return fullIst(String(v));
  if (field === "subsidy_applied" || field === "loan_needed" || field === "is_test") return v ? "Yes" : "No";
  if (field === "quote_amount" || field === "final_amount" || field === "bill") return inr(Number(v));
  if (field === "final_kw") return kwLabel(Number(v));
  if (field === "roof_area_sqft") return `${v} sq ft`;
  if (field === "use_type") return USE_LABEL[String(v)] ?? String(v);
  if (field === "roof") return ROOF_LABEL[String(v)] ?? String(v);
  if (field === "source") return SOURCE_LABEL[String(v)] ?? String(v);
  return String(v);
}

export function parseDetails(a: Pick<ActivityRow, "details">): Record<string, unknown> {
  if (!a.details) return {};
  if (typeof a.details !== "string") return a.details;
  try { return JSON.parse(a.details) as Record<string, unknown>; } catch { return {}; }
}

/** Kind of entry, for the timeline icon: status, call, note, follow-up or other. */
export function activityKind(action: string): "status" | "call" | "note" | "followup" | "other" {
  if (action === "status_changed" || action === "created") return "status";
  if (action === "called" || action === "whatsapp_opened" || action === "whatsapp_sent" || action === "email_sent") return "call";
  if (action.startsWith("note_")) return "note";
  if (action.startsWith("follow_up_")) return "followup";
  return "other";
}

/** `labels` = saved stage names (Settings → Pipeline stages); defaults when omitted. */
const fuType = (t: unknown) => FU_TYPE_LABEL[t as FuType]?.replace(" (internal)", "") ?? "Follow-up";

export function describeActivity(a: ActivityRow, labels: Record<string, string> = STATUS_LABEL): string {
  const d = parseDetails(a);
  switch (a.action) {
    case "created":
      return d.manual ? `Lead added by hand (${SOURCE_LABEL[String(d.source)] ?? d.source})` : `Lead received from ${SOURCE_LABEL[String(d.source)] ?? d.source ?? "the website"}${d.demo ? " (demo data)" : ""}`;
    case "email_sent": return "Email alert sent to the owner";
    case "whatsapp_sent": return d.to === "customer" ? "WhatsApp auto-reply sent to the customer" : "WhatsApp alert sent to the owner";
    case "called": return "Called the customer";
    case "whatsapp_opened": return `Opened WhatsApp chat${d.template ? ` (template: ${String(d.template).replace(/_/g, " ")})` : ""}`;
    case "status_changed": return `Status: ${labels[d.from as LeadStatus] ?? d.from} → ${labels[d.to as LeadStatus] ?? d.to}${d.lost_reason ? ` (${LOST_LABEL[d.lost_reason as LostReason] ?? d.lost_reason})` : ""}`;
    case "assigned": return `Owner: ${d.from ?? "Unassigned"} → ${d.to ?? "Unassigned"}`;
    case "field_edited": {
      const f = String(d.field);
      const label = FIELD_LABEL[f] ?? f;
      if (PRIVATE.has(f)) return d.from ? (d.to ? `${label} changed` : `${label} removed`) : `${label} added`;
      if (f === "district") return `${label} changed${d.to ? ` to ${d.to}` : ""}`;
      return `${label}: ${fmtVal(f, d.from)} → ${fmtVal(f, d.to)}`;
    }
    case "note_added": return "Note added";
    case "follow_up_added": return `${fuType(d.type)} follow-up planned for ${fullIst(String(d.due))}`;
    case "follow_up_done": return d.outcome ? `${fuType(d.type)} follow-up done: ${FU_OUTCOME_LABEL[d.outcome as FuOutcome] ?? d.outcome}` : "Follow-up done";
    case "follow_up_rescheduled": return `Follow-up moved: ${fullIst(String(d.from))} → ${fullIst(String(d.to))}`;
    case "follow_up_edited": return d.to ? `Follow-up changed to ${fullIst(String(d.to))}` : "Follow-up edited";
    case "follow_up_deleted": return `${fuType(d.type)} follow-up removed`;
    case "follow_up_cancelled": return `${d.count} open follow-up${Number(d.count) === 1 ? "" : "s"} cancelled (lead marked lost)`;
    case "note_edited": return "Note edited";
    case "note_deleted": return "Note deleted";
    case "merged": return d.merged_from ? `Merged ${d.merged_from} into this lead` : `Merged into ${d.merged_into}`;
    case "exported": return "Included in a CSV export";
    case "deleted": return "Lead deleted";
    case "restored": return "Lead restored";
    case "anonymized": return "Lead anonymized (name, phone and message removed)";
    default: return a.action.replace(/_/g, " ");
  }
}
