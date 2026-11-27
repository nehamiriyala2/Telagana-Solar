import "server-only";
import { SOURCE_LABEL } from "./labels";
import { schemeName } from "./scheme-names";
import { parseSchemes, type LeadRow } from "./leads-query";
import { fullIst, receivedLabel } from "./time";

/** Plain, serializable lead for client tables (dates pre-formatted in IST). */
export interface LeadDto {
  id: number; leadNo: string; received: string; receivedFull: string; source: string; sourceKey: string;
  name: string | null; phone: string | null; altPhone: string | null; email: string | null; district: string | null; districtTe: string | null; discom: string | null;
  area: string | null; place: string | null; use: string | null; bill: number | null; units: number | null;
  powerCuts: boolean | null; roof: string | null; kw: number | null; system: string | null; monthlySaving: number | null;
  schemes: string[]; message: string | null; lang: string | null; page: string | null; status: string;
  owner: string | null; ownerInactive: boolean; repeat: boolean; isTest: boolean; deleted: boolean; anonymized: boolean;
}

export function toDto(l: LeadRow & { anonymized_at?: Date | null }, now = new Date()): LeadDto {
  return {
    id: l.id, leadNo: l.lead_no ?? `TS-${String(l.id).padStart(4, "0")}`,
    received: receivedLabel(l.created_at, now), receivedFull: fullIst(l.created_at),
    source: SOURCE_LABEL[l.source ?? ""] ?? l.source ?? "-", sourceKey: l.source ?? "",
    name: l.name, phone: l.phone_normalized, altPhone: l.alt_phone_normalized ?? null, email: l.email ?? null, district: l.district_en, districtTe: l.district_te, discom: l.discom,
    area: l.area, place: l.place, use: l.use_type, bill: l.bill, units: l.units,
    powerCuts: l.power_cuts === null ? null : Boolean(l.power_cuts), roof: l.roof,
    kw: l.kw === null ? null : Number(l.kw), system: l.system_type, monthlySaving: l.monthly_saving,
    schemes: parseSchemes(l.schemes).map(schemeName), message: l.message, lang: l.lang, page: l.page, status: l.status,
    owner: l.owner_name, ownerInactive: l.owner_name !== null && !l.owner_active, repeat: Number(l.repeat_count) > 0,
    isTest: Boolean(l.is_test), deleted: Boolean(l.deleted_at), anonymized: Boolean(l.anonymized_at),
  };
}
