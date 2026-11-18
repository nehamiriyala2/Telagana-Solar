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

/** Header menu, in order. `solutions` and `schemes` open mega-menus. `match` = path prefix for the active state. */
export const HEADER_NAV: { href: string; key: string; label?: string; match?: string }[] = [
  { href: "/", key: "home" },
  { href: "/solutions", key: "solutions" },
  { href: "/schemes", key: "schemes" },
  { href: "/savings-calculator", key: "calculator", label: "calculatorShort" },
  { href: "/projects", key: "projects" },
  { href: "/about", key: "about" },
  { href: "/contact", key: "contact" },
];
