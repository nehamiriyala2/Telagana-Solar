import { z } from "zod";
import { STATUSES, STATUS_LABEL, type LeadStatus } from "./labels";

/**
 * Pipeline stage settings (Settings → Pipeline stages). Pure: shared by server, client and tests.
 * Stage KEYS are fixed because reports and automations depend on what each means; admins edit the
 * name, colour, order and whether the stage is offered. New, Won and Lost can't be hidden.
 */
export const TONES = {
  gold: { label: "Saffron", pill: "bg-[#fff3d1] text-[#8a5a00] ring-[#f5d27a]", bar: "#f5a800" },
  blue: { label: "Blue", pill: "bg-[#e8f0fe] text-[#1a4fa0] ring-[#bcd2f7]", bar: "#1265d8" },
  orange: { label: "Orange", pill: "bg-[#fdeee3] text-[#a4470d] ring-[#f6cfb2]", bar: "#e0701f" },
  purple: { label: "Purple", pill: "bg-[#efe9fb] text-[#5b3aa6] ring-[#d6c8f3]", bar: "#5b3aa6" },
  teal: { label: "Teal", pill: "bg-[#e6f6f8] text-[#0f6e7a] ring-[#b6e3e9]", bar: "#0f6e7a" },
  green: { label: "Green", pill: "bg-[#e7f5e4] text-[#2b7a23] ring-[#b9e0b1]", bar: "#2b7a23" },
  red: { label: "Red", pill: "bg-[#fdecea] text-[#b42318] ring-[#f3c9c5]", bar: "#b42318" },
  grey: { label: "Grey", pill: "bg-[#f1f2f4] text-[#5b6473] ring-[#d9dde3]", bar: "#8a94a6" },
} as const;
export type Tone = keyof typeof TONES;
const TONE_KEYS = Object.keys(TONES) as [Tone, ...Tone[]];

export type Stage = { key: LeadStatus; label: string; tone: Tone; visible: boolean; internal?: boolean };

/** Stages that must always be offered. */
export const REQUIRED_STAGES: LeadStatus[] = ["new", "won", "lost"];

export const DEFAULT_STAGES: Stage[] = [
  { key: "new", label: STATUS_LABEL.new, tone: "gold", visible: true },
  { key: "contacted", label: STATUS_LABEL.contacted, tone: "blue", visible: true },
  { key: "qualified", label: STATUS_LABEL.qualified, tone: "orange", visible: true },
  // Internal only: the company doesn't advertise site visits; staff can still track them.
  { key: "site_visit", label: STATUS_LABEL.site_visit, tone: "purple", visible: true, internal: true },
  { key: "quote_sent", label: STATUS_LABEL.quote_sent, tone: "teal", visible: true },
  { key: "won", label: STATUS_LABEL.won, tone: "green", visible: true },
  { key: "lost", label: STATUS_LABEL.lost, tone: "grey", visible: true },
];

const StageSchema = z.object({
  key: z.enum(STATUSES),
  label: z.string().trim().min(1, "Give every stage a name.").max(30, "Keep stage names under 30 characters."),
  tone: z.enum(TONE_KEYS),
  visible: z.boolean(),
  internal: z.boolean().optional(),
}).strict();

export const StagesSchema = z.array(StageSchema).superRefine((list, ctx) => {
  const keys = list.map((s) => s.key);
  for (const k of STATUSES) {
    const n = keys.filter((x) => x === k).length;
    if (n !== 1) ctx.addIssue({ code: "custom", message: n ? `“${STATUS_LABEL[k]}” is listed twice.` : `“${STATUS_LABEL[k]}” is missing.` });
  }
  for (const s of list) {
    if (REQUIRED_STAGES.includes(s.key) && !s.visible) ctx.addIssue({ code: "custom", message: `“${s.label}” can’t be hidden.` });
  }
  const labels = list.map((s) => s.label.toLowerCase());
  if (new Set(labels).size !== labels.length) ctx.addIssue({ code: "custom", message: "Two stages have the same name." });
});

/** A stored value, made safe: falls back to defaults, adds any stage missing from an old saved list. */
export function normalizeStages(v: unknown): Stage[] {
  const r = StagesSchema.safeParse(v);
  if (r.success) return r.data;
  if (!Array.isArray(v)) return DEFAULT_STAGES;
  const seen = new Set<string>();
  const out: Stage[] = [];
  for (const raw of v) {
    const one = StageSchema.safeParse(raw);
    if (one.success && !seen.has(one.data.key)) { seen.add(one.data.key); out.push({ ...one.data, visible: one.data.visible || REQUIRED_STAGES.includes(one.data.key) }); }
  }
  for (const d of DEFAULT_STAGES) if (!seen.has(d.key)) out.splice(Math.min(DEFAULT_STAGES.indexOf(d), out.length), 0, d);
  return out;
}

export type StageMap = Record<LeadStatus, Stage>;
export function stageMap(stages: Stage[]): StageMap {
  return Object.fromEntries(stages.map((s) => [s.key, s])) as StageMap;
}
export function stageLabels(stages: Stage[]): Record<LeadStatus, string> {
  return Object.fromEntries(stages.map((s) => [s.key, s.label])) as Record<LeadStatus, string>;
}
