/**
 * Schemes shown on the home page and at /schemes/<slug>.
 * Text lives in messages/*.json under schemes.items.<slug>.
 * Official links: verify before going live. [EDIT]
 */
export const SCHEMES = [
  { slug: "pm-surya-ghar", officialUrl: "https://pmsuryaghar.gov.in", audience: "home" },
  { slug: "pm-kusum", officialUrl: "https://pmkusum.mnre.gov.in", audience: "farm" },
  { slug: "net-metering", officialUrl: "https://tgsouthernpower.org", audience: "all" },
  { slug: "state-schemes", officialUrl: "https://tgredco.telangana.gov.in", audience: "all" },
] as const;

export type SchemeSlug = (typeof SCHEMES)[number]["slug"];
