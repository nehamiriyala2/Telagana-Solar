"use client";

import { applyCalcSettings } from "@/lib/calculator";
import { applySiteOverrides } from "@/lib/site-runtime";
import type { CalcSettings, Discom } from "@/lib/calc-settings";
import type { SiteOverrides } from "@/lib/site-runtime";

/**
 * Applies the admin's saved settings in the browser before the rest of the page renders
 * (the server applies the same values in the layout). Renders nothing.
 */
export function PublicSettingsBridge({ calc, districtDiscom, site }: { calc: CalcSettings; districtDiscom: Record<string, Discom>; site: SiteOverrides }) {
  applyCalcSettings(calc, districtDiscom);
  applySiteOverrides(site);
  return null;
}
