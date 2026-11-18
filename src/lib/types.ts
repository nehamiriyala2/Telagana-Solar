export type Locale = "en" | "te";
export type L10n = { en: string; te: string };

export interface District {
  slug: string;
  name: L10n;
  /** 1 = Hyderabad metro, 2 = rest of Telangana */
  phase: 1 | 2;
  sunHours?: number;
  lat: number;
  lng: number;
}
