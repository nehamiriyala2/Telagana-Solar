import { Building, Factory, GraduationCap, House, Plane, Store, Wheat } from "lucide-react";
import type { Persona } from "@/config/personas";

export const PERSONA_ICONS: Record<Persona, typeof House> = {
  urban: House,
  apartment: Building,
  farmer: Wheat,
  shop: Store,
  factory: Factory,
  institution: GraduationCap,
  landlord: Plane,
};
