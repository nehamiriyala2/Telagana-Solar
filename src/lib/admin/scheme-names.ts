import "server-only";
import en from "../../../messages/en.json";
import te from "../../../messages/te.json";

/* Server only: the message files are large, so client components get names passed in as props. */
type SchemeMsgs = Record<string, { name: string }>;
const enItems = (en as unknown as { schemes: { items: SchemeMsgs } }).schemes.items;
const teItems = (te as unknown as { schemes: { items: SchemeMsgs } }).schemes.items;

/** Scheme slug → full name, from the website's own text. */
export const SCHEME_NAMES: Record<string, { en: string; te: string }> = Object.fromEntries(
  Object.keys(enItems).map((k) => [k, { en: enItems[k].name, te: teItems[k]?.name ?? enItems[k].name }]),
);

export function schemeName(slug: string) {
  return SCHEME_NAMES[slug]?.en ?? slug;
}

