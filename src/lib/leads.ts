/**
 * Lead schema, validation and tagging, shared by forms (client) and /api/leads (server).
 */
import { calculatorConfig, type PropertyType } from "@/config/calculator";
import type { CalcSummary } from "./calculator";

export type LeadKind = "plan_request" | "subsidy_check" | "calculator_report" | "contact" | "whatsapp_click" | "quote";
export const PROPERTY_TYPES: PropertyType[] = ["home", "farm", "business"];

export interface LeadInput {
  kind: LeadKind;
  name?: string;
  phone?: string;
  location?: string;        // district slug or free text
  propertyType?: PropertyType;
  monthlyBill?: number | null;
  message?: string;
  slotDate?: string | null; // YYYY-MM-DD
  slotTime?: string | null; // HH:MM
  calc?: CalcSummary | null;
  packageId?: string | null;
  sourcePage: string;
  locale: "en" | "te";
  /** Attribution (optional; the server also reads utm_* from the page URL) */
  utm_source?: string | null;
  utm_campaign?: string | null;
  referrer?: string | null;
  /** Customer ticked a consent box (forms have none yet) */
  consent?: boolean;
  /** District slug, when known separately from `location` */
  district?: string | null;
  /** Honeypot: must stay empty */
  website?: string;
  /** ms since form render: bots submit instantly */
  elapsedMs?: number;
}

export interface Lead extends Omit<LeadInput, "website" | "elapsedMs"> {
  id: string;
  createdAt: string;
  tags: string[];
  temperature: "hot" | "warm" | null;
  phoneE164: string | null;
}

/** Indian mobile: optional +91 / 91 / 0 prefix, then 10 digits starting 6–9. Returns +91XXXXXXXXXX or null. */
export function normalizeIndianPhone(raw: string | undefined | null): string | null {
  if (!raw) return null;
  const digits = raw.replace(/[^\d]/g, "");
  const ten = digits.length === 12 && digits.startsWith("91") ? digits.slice(2)
    : digits.length === 11 && digits.startsWith("0") ? digits.slice(1)
    : digits;
  return /^[6-9]\d{9}$/.test(ten) ? `+91${ten}` : null;
}

export type FieldErrors = Partial<Record<"name" | "phone" | "location" | "propertyType" | "slot", string>>;

/** Returns error keys (i18n keys under "form.errors") per field. */
export function validateLead(input: LeadInput): FieldErrors {
  const e: FieldErrors = {};
  if (input.kind === "whatsapp_click") return e;
  if (!input.name || input.name.trim().length < 2 || input.name.length > 80) e.name = "name";
  if (!normalizeIndianPhone(input.phone)) e.phone = "phone";
  if (input.kind === "plan_request") {
    if (!input.location?.trim()) e.location = "location";
    if (!input.propertyType || !PROPERTY_TYPES.includes(input.propertyType)) e.propertyType = "propertyType";
  }
  if ((input.slotDate && !/^\d{4}-\d{2}-\d{2}$/.test(input.slotDate)) || (input.slotTime && !/^\d{2}:\d{2}$/.test(input.slotTime))) e.slot = "slot";
  return e;
}

export function isSpam(input: LeadInput): boolean {
  if (input.website && input.website.trim() !== "") return true;
  if (typeof input.elapsedMs === "number" && input.elapsedMs < 1500 && input.kind !== "whatsapp_click") return true;
  return false;
}

/** Auto-tags: property type, Hot/Warm by bill size, and lead kind. */
export function tagLead(input: LeadInput): { tags: string[]; temperature: "hot" | "warm" | null } {
  const tags: string[] = [];
  const type = input.propertyType ?? input.calc?.type;
  if (type) tags.push(type[0].toUpperCase() + type.slice(1));
  const bill = input.monthlyBill ?? input.calc?.monthlyBill ?? null;
  let temperature: "hot" | "warm" | null = null;
  if (input.kind !== "whatsapp_click") {
    temperature = bill !== null && bill !== undefined && bill >= calculatorConfig.leadTemperature.hotBill ? "hot" : "warm";
    tags.push(temperature === "hot" ? "Hot" : "Warm");
  }
  tags.push(input.kind.replace(/_/g, " "));
  return { tags, temperature };
}
