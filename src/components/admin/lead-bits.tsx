"use client";

import { SYSTEM_LABEL } from "@/lib/admin/labels";
import { useStages } from "@/components/admin/stages-context";

/** Status pill in the stage's saved name and colour (Settings → Pipeline stages). */
export function StatusPill({ status, className = "" }: { status: string; className?: string }) {
  const st = useStages();
  return (
    <span className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-bold ring-1 ring-inset ${st.pill(status)} ${className}`}>
      {st.label(status)}
    </span>
  );
}

const BADGE = {
  repeat: "bg-[#e8f0fe] text-[#1a4fa0]",
  backup: "bg-[#fff3d1] text-[#8a5a00]",
  noroof: "bg-[#fdecea] text-[#b42318]",
  test: "bg-[#f1f2f4] text-[#5b6473]",
  deleted: "bg-[#fdecea] text-[#b42318]",
  anon: "bg-[#f1f2f4] text-[#5b6473]",
} as const;

export function Badge({ kind, children }: { kind: keyof typeof BADGE; children: React.ReactNode }) {
  return <span className={`inline-flex items-center whitespace-nowrap rounded-md px-1.5 py-0.5 text-[0.7rem] font-bold ${BADGE[kind]}`}>{children}</span>;
}

export function LeadBadges({ l }: { l: { repeat: boolean; powerCuts: boolean | null; roof: string | null; isTest: boolean; deleted: boolean; anonymized?: boolean } }) {
  return (
    <>
      {l.repeat && <Badge kind="repeat">Repeat enquirer</Badge>}
      {l.powerCuts && <Badge kind="backup">Needs backup</Badge>}
      {l.roof === "none" && <Badge kind="noroof">No roof</Badge>}
      {l.isTest && <Badge kind="test">Test</Badge>}
      {l.deleted && <Badge kind="deleted">Deleted</Badge>}
      {l.anonymized && <Badge kind="anon">Anonymized</Badge>}
    </>
  );
}

export function SystemChip({ system }: { system: string | null }) {
  if (!system) return null;
  const tone = system === "hybrid" ? "bg-[#efe9fb] text-[#5b3aa6]" : system === "off-grid" ? "bg-[#e6f6f8] text-[#0f6e7a]" : "bg-[#e8f0fe] text-[#1a4fa0]";
  return <span className={`inline-flex rounded-md px-1.5 py-0.5 text-[0.7rem] font-bold ${tone}`}>{SYSTEM_LABEL[system] ?? system}</span>;
}
