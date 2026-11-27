export const SOLUTIONS = [
  { href: "/solutions/homes", key: "homes", type: "home" },
  { href: "/solutions/farms", key: "farms", type: "farm" },
  { href: "/solutions/business", key: "business", type: "business" },
] as const;

/** Main menu, in order. `solutions` renders as a dropdown. */
export const NAV = [
  { href: "/", key: "home" },
  { href: "/solutions", key: "solutions" },
  { href: "/savings-calculator", key: "calculator" },
  { href: "/subsidy-loans", key: "subsidy" },
  { href: "/projects", key: "projects" },
  { href: "/about", key: "about" },
  { href: "/contact", key: "contact" },
] as const;


/** Hamburger panel main links, in order (Solutions and Schemes also show their submenus beside these). */
export const MENU_NAV: { href: string; key: string; label?: string }[] = [
  { href: "/", key: "home" },
  { href: "/solutions", key: "solutions" },
  { href: "/schemes", key: "schemes" },
  { href: "/subsidy-loans", key: "subsidy" },
  { href: "/about", key: "about" },
  { href: "/contact", key: "contact", label: "contactUs" },
];

export type HeaderNavItem = { href: string; key: string; label: string; match: string[]; drop?: "solutions" | "schemes" };

/** Header links (desktop row + mobile panel), in order. `match` decides which link is marked as current. */
export const HEADER_NAV: HeaderNavItem[] = [
  { href: "/", key: "home", label: "home", match: ["/"] },
  { href: "/solutions", key: "solutions", label: "solutions", match: ["/solutions", "/projects", "/for"], drop: "solutions" },
  { href: "/schemes", key: "schemes", label: "schemes", match: ["/schemes"], drop: "schemes" },
  { href: "/subsidy-loans", key: "subsidy", label: "subsidy", match: ["/subsidy-loans"] },
  { href: "/about", key: "about", label: "about", match: ["/about"] },
  { href: "/contact", key: "contact", label: "contactUs", match: ["/contact", "/find-my-solar-plan"] },
];
