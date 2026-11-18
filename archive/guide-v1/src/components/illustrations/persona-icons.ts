import { BuildingComplex, House, Store, Trees, Wheat } from "lucide-react";
import type { Persona } from "@/lib/types";

export const PERSONA_ICONS: Record<Persona, typeof House> = {
  urban: House,
  apartment: BuildingComplex,
  rural: Trees,
  farmer: Wheat,
  business: Store,
};
