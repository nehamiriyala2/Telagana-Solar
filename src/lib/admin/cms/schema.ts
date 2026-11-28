import { z } from "zod";
import type { CollectionDef, FieldDef } from "./types";

/** Strips control characters (keeps newlines and tabs) and trims. */
export const clean = (s: string) => s.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "").trim();

export const slugify = (s: string) =>
  s.toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g, "").trim().replace(/[\s_]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").slice(0, 80);

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const IMG_RE = /^(\/media\/[\w\-./]+\.(webp|jpg|jpeg|png|avif)|\/[\w\-./]+\.(webp|jpg|jpeg|png|avif)|https:\/\/\S+)$/i;

const str = (max: number, required: boolean, label: string) => {
  const base = z.string().max(max * 2).transform(clean).refine((v) => v.length <= max, `Keep “${label}” under ${max} characters.`);
  return required ? base.refine((v) => v.length > 0, `“${label}” can’t be empty.`) : base;
};
const lines = (max: number) => z.array(z.string().max(500).transform(clean)).max(max).transform((a) => a.filter(Boolean));

/** Validation for one field's form value. */
function fieldSchema(f: FieldDef): z.ZodType {
  const max = f.max ?? 200;
  switch (f.kind) {
    case "text": case "textarea": return str(max, !!f.required, f.label);
    case "slug": return z.string().max(120).transform(clean).refine((v) => v === "" || SLUG_RE.test(v), "Use lowercase letters, numbers and dashes, e.g. pm-surya-ghar.");
    case "url": return z.string().max(500).transform(clean).refine((v) => v === "" || /^https?:\/\/[^\s]+\.[^\s]+/.test(v), "Enter a full link starting with https://");
    case "image": return z.string().max(255).transform(clean).refine((v) => v === "" || IMG_RE.test(v), "Upload an image, or use a path like /images/photo.webp.");
    case "date": return z.string().refine((v) => v === "" || /^\d{4}-\d{2}-\d{2}$/.test(v), "Pick a date.");
    case "number": {
      let n = z.number({ message: `Enter a number for “${f.label}”.` });
      if (f.min !== undefined) n = n.min(f.min, `“${f.label}” must be at least ${f.min}.`);
      if (f.max !== undefined) n = n.max(f.max, `“${f.label}” must be at most ${f.max}.`);
      return f.required ? n : n.nullable();
    }
    case "select": return f.options ? z.enum(f.options.map(([v]) => v) as [string, ...string[]]) : z.number().int().positive().nullable();
    case "bool": return z.boolean();
    case "i18n": case "i18nArea": return z.object({ en: str(max, !!f.required, `${f.label} (English)`), te: str(Math.round(max * 1.5), false, `${f.label} (Telugu)`) }).strict();
    case "i18nLines": return z.object({ en: lines(max), te: lines(max) }).strict();
    case "districts": return z.object({ all: z.boolean(), ids: z.array(z.number().int().positive()).max(40) }).strict();
  }
}

export function formSchema(c: CollectionDef) {
  return z.object(Object.fromEntries(c.fields.map((f) => [f.key, fieldSchema(f)]))).strict();
}
export type FormValues = Record<string, unknown>;

/** Form values → DB columns (districts are returned separately; they live in a link table). */
export function toColumns(c: CollectionDef, v: FormValues): { cols: Record<string, unknown>; districts?: { all: boolean; ids: number[] } } {
  const cols: Record<string, unknown> = {};
  let districts: { all: boolean; ids: number[] } | undefined;
  for (const f of c.fields) {
    const val = v[f.key];
    if (val === undefined) continue;
    const col = f.col ?? f.key;
    switch (f.kind) {
      case "i18n": case "i18nArea": { const o = val as { en: string; te: string }; cols[`${f.key}_en`] = o.en || null; cols[`${f.key}_te`] = o.te || null; break; }
      case "i18nLines": cols[col] = JSON.stringify(val); break;
      case "districts": districts = val as { all: boolean; ids: number[] }; break;
      case "bool": cols[col] = val ? 1 : 0; break;
      case "date": cols[col] = val || null; break;
      default: cols[col] = val === "" ? null : val;
    }
  }
  if (c.slugKey && !cols[c.slugKey]) {
    const title = c.titleIsI18n ? cols[`${c.titleKey}_en`] : cols[c.titleKey];
    if (typeof title === "string") cols[c.slugKey] = slugify(title) || null;
  }
  return { cols, districts };
}

/** DB row → form values. */
export function fromRow(c: CollectionDef, row: Record<string, unknown>, districtIds: number[] = []): FormValues {
  const out: FormValues = {};
  const s = (x: unknown) => (x === null || x === undefined ? "" : String(x));
  for (const f of c.fields) {
    const col = f.col ?? f.key;
    switch (f.kind) {
      case "i18n": case "i18nArea": out[f.key] = { en: s(row[`${f.key}_en`]), te: s(row[`${f.key}_te`]) }; break;
      case "i18nLines": out[f.key] = parseLines(row[col]); break;
      case "districts": out[f.key] = { all: row.all_districts === undefined ? true : Boolean(row.all_districts), ids: districtIds }; break;
      case "bool": out[f.key] = Boolean(row[col]); break;
      case "number": out[f.key] = row[col] === null || row[col] === undefined ? null : Number(row[col]); break;
      case "select": out[f.key] = f.options ? s(row[col]) || f.options[0][0] : row[col] === null || row[col] === undefined ? null : Number(row[col]); break;
      case "date": { const d = row[col]; out[f.key] = d instanceof Date ? d.toISOString().slice(0, 10) : s(d).slice(0, 10); break; }
      default: out[f.key] = s(row[col]);
    }
  }
  return out;
}

/** Empty values for a new record. */
export function emptyValues(c: CollectionDef): FormValues {
  return fromRow(c, {});
}

export function parseLines(v: unknown): { en: string[]; te: string[] } {
  let o: unknown = v;
  if (typeof v === "string") { try { o = JSON.parse(v); } catch { o = null; } }
  if (Array.isArray(o)) return { en: o.map(String), te: [] };
  const x = (o ?? {}) as { en?: unknown; te?: unknown };
  return { en: Array.isArray(x.en) ? x.en.map(String) : [], te: Array.isArray(x.te) ? x.te.map(String) : [] };
}
