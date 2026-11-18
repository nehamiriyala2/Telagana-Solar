import "server-only";
import { cache } from "react";
import { createClient } from "@supabase/supabase-js";
import type { Appliance, Assumptions, District, Installer, Scheme, Tariff } from "@/lib/types";
import type { SolarData } from "@/lib/solar/engine";
import { districts as seedDistricts } from "@/data/districts";
import { appliances as seedAppliances } from "@/data/appliances";
import { schemes as seedSchemes } from "@/data/schemes";
import { installers as seedInstallers } from "@/data/installers";
import { tariffs as seedTariffs, assumptions as seedAssumptions } from "@/data/tariffs";

/**
 * Single entry point for all editable data.
 * - Supabase configured → reads the `content` table (one JSON row per collection,
 *   edited by the admin panel). See supabase/schema.sql.
 * - Otherwise → typed seed files in src/data.
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = url && key ? createClient(url, key, { auth: { persistSession: false } }) : null;

async function fromDb<T>(collection: string, fallback: T): Promise<T> {
  if (!supabase) return fallback;
  const { data, error } = await supabase.from("content").select("data").eq("collection", collection).maybeSingle();
  if (error || !data) return fallback;
  return data.data as T;
}

export const getDistricts = cache(() => fromDb<District[]>("districts", seedDistricts));
export const getAppliances = cache(() => fromDb<Appliance[]>("appliances", seedAppliances));
export const getSchemes = cache(() => fromDb<Scheme[]>("schemes", seedSchemes));
export const getInstallers = cache(() => fromDb<Installer[]>("installers", seedInstallers));
export const getTariffs = cache(() => fromDb<Tariff[]>("tariffs", seedTariffs));
export const getAssumptions = cache(() => fromDb<Assumptions>("assumptions", seedAssumptions));

export const getSolarData = cache(async (): Promise<SolarData> => {
  const [assumptions, tariffs, schemes, installers, districts] = await Promise.all([
    getAssumptions(), getTariffs(), getSchemes(), getInstallers(), getDistricts(),
  ]);
  return { assumptions, tariffs, schemes, installers, districts };
});
