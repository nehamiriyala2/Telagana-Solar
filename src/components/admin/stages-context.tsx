"use client";

import { createContext, useContext, useMemo } from "react";
import { STATUSES, STATUS_LABEL, type LeadStatus } from "@/lib/admin/labels";
import { DEFAULT_STAGES, TONES, stageMap, type Stage, type StageMap } from "@/lib/admin/stages";
import { DEFAULT_FU_RULES, type FuRules } from "@/lib/admin/followup-rules";

type Ctx = { stages: Stage[]; map: StageMap; fuRules: FuRules };
const StagesCtx = createContext<Ctx>({ stages: DEFAULT_STAGES, map: stageMap(DEFAULT_STAGES), fuRules: DEFAULT_FU_RULES });

/** Provides the saved pipeline stages (names, colours, order) and follow-up timing rules to every admin client component. */
export function StagesProvider({ stages, fuRules = DEFAULT_FU_RULES, children }: { stages: Stage[]; fuRules?: FuRules; children: React.ReactNode }) {
  const value = useMemo(() => ({ stages, map: stageMap(stages), fuRules }), [stages, fuRules]);
  return <StagesCtx.Provider value={value}>{children}</StagesCtx.Provider>;
}

export function useStages() {
  const { stages, map } = useContext(StagesCtx);
  return {
    /** All stages in the saved order. */
    stages,
    /** Stages staff can move a lead into (hidden ones are left out). */
    selectable: stages.filter((s) => s.visible),
    label: (k: string) => map[k as LeadStatus]?.label ?? STATUS_LABEL[k as LeadStatus] ?? k,
    pill: (k: string) => TONES[map[k as LeadStatus]?.tone ?? "grey"].pill,
    bar: (k: string) => TONES[map[k as LeadStatus]?.tone ?? "grey"].bar,
    isStatus: (k: string): k is LeadStatus => (STATUSES as readonly string[]).includes(k),
  };
}

/** Follow-up timing rules from Settings (days until the next suggested follow-up, default time). */
export function useFuRules(): FuRules {
  return useContext(StagesCtx).fuRules;
}
