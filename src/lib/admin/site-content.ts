import { z } from "zod";
import en from "../../../messages/en.json";
import te from "../../../messages/te.json";
import { clean } from "./cms/schema";

/**
 * Home page trust bar (4 slots, fixed icons) and the announcement banner. Pure: shared by admin and site.
 * Stored in `settings` as trust_bar / announcement, with history. Defaults = what the site says today.
 */
export const TRUST_KEY = "trust_bar";
export const BANNER_KEY = "announcement";

const s = (max: number, required = false) => z.string().max(max * 2).transform(clean).refine((v) => v.length <= max, `Keep it under ${max} characters.`)
  .refine((v) => !required || v.length > 0, "This can’t be empty.");

const TrustItem = z.object({ value_en: s(40, true), value_te: s(60, true), caption_en: s(70, true), caption_te: s(100, true) }).strict();
export const TrustSchema = z.array(TrustItem).length(4);
export type TrustItem = z.infer<typeof TrustItem>;

export const BannerSchema = z.object({
  enabled: z.boolean(),
  text_en: s(160), text_te: s(220),
  link: z.string().max(300).transform(clean).refine((v) => v === "" || /^\/[\w\-./#?=&]*$/.test(v) || /^https:\/\/\S+$/.test(v), "Use a site path like /schemes or a full https:// link."),
  tone: z.enum(["saffron", "blue"]),
}).strict().superRefine((b, ctx) => { if (b.enabled && !b.text_en) ctx.addIssue({ code: "custom", path: ["text_en"], message: "Write the banner text before turning it on." }); });
export type Banner = z.infer<typeof BannerSchema>;

type TS = Record<string, string>;
const ts = (m: unknown) => (m as { trustStrip: TS }).trustStrip;
export const DEFAULT_TRUST: TrustItem[] = [1, 2, 3, 4].map((i) => ({
  value_en: ts(en)[`v${i}`], value_te: ts(te)[`v${i}`], caption_en: ts(en)[`c${i}`], caption_te: ts(te)[`c${i}`],
}));
export const DEFAULT_BANNER: Banner = { enabled: false, text_en: "", text_te: "", link: "", tone: "saffron" };

export const BANNED_PHRASES = [/free\s+site\s+(visit|survey)/i, /free\s+survey/i, /ఉచిత\s*సైట్/];
/** Public copy must never offer free site visits or surveys. */
export function bannedPhrase(texts: string[]): string | null {
  for (const t of texts) for (const re of BANNED_PHRASES) if (re.test(t)) return "Don’t offer free site visits or surveys on the website.";
  return null;
}
