/**
 * Field-driven admin modules (Schemes, Projects, Guides, FAQs, Testimonials).
 * Pure and serializable: the same definitions drive the server (validation, SQL) and the form UI.
 *
 * Storage per kind:
 *   text / textarea / url / slug / image / date / number / select / bool → one column (`col` or `key`)
 *   i18n / i18nArea → two columns `<key>_en` and `<key>_te`
 *   i18nLines       → one JSON column `{ en: string[], te: string[] }` (one item per line in the form)
 *   districts       → the scheme_districts link table (Schemes only)
 */
export type FieldKind =
  | "text" | "textarea" | "url" | "slug" | "image" | "date" | "number" | "select" | "bool"
  | "i18n" | "i18nArea" | "i18nLines" | "districts";

export type FieldDef = {
  key: string;
  label: string;
  kind: FieldKind;
  section: string;
  /** For i18n kinds: English is required (Telugu falls back to English on the site). */
  required?: boolean;
  max?: number;
  min?: number;
  step?: number;
  hint?: string;
  options?: [string, string][];
  /** Column name when it differs from `key` (single-column kinds). */
  col?: string;
  /** Take the full form width. */
  full?: boolean;
  /** Shows a "VERIFY" marker next to the label (facts staff must confirm). */
  verify?: boolean;
};

export type ListColumn = { key: string; label: string };

export type PublishRule = { col: string; on: string | number; off: string | number };

export type CollectionDef = {
  key: string;
  label: string;          // "Scheme"
  plural: string;         // "Schemes"
  intro: string;
  table: string;
  perm: "schemes.edit" | "projects.edit" | "content.edit";
  basePath: string;       // admin list URL
  /** Field whose English value names a row ("name" → name_en). */
  titleKey: string;
  titleIsI18n: boolean;
  /** Slug made from the title when left empty. */
  slugKey?: string;
  publish: PublishRule;
  hasDeletedAt: boolean;
  orderBy: string;
  search: string[];
  fields: FieldDef[];
  /** Public URL of a row (shown as "View on website"). `{slug}` is replaced. */
  publicPath?: string;
};

export const i18nCols = (k: string) => [`${k}_en`, `${k}_te`] as const;
