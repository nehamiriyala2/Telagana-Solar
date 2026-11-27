/**
 * Roles and permissions. The UI hides what a role cannot use AND every API checks the same table,
 * so hiding a button is never the only protection.
 */
export type Role = "admin" | "sales" | "installer" | "content";

export type Permission =
  | "overview.view"
  | "leads.view" | "leads.create" | "leads.edit" | "leads.assign" | "leads.export" | "leads.delete" | "leads.anonymize"
  | "pipeline.view" | "followups.view"
  | "reports.view" | "reports.export"
  | "templates.view" | "templates.edit"
  | "districts.view" | "districts.edit"
  | "calculator.edit" | "schemes.view" | "schemes.edit" | "projects.edit" | "content.edit"
  | "team.manage" | "settings.manage" | "audit.view"
  | "installer.jobs";

/** Sales see only the leads assigned to them (see leadScope in leads-query). */
const SALES: Permission[] = [
  "overview.view", "leads.view", "leads.create", "leads.edit", "pipeline.view", "followups.view",
  "reports.view", "templates.view", "schemes.view",
];
const INSTALLER: Permission[] = ["installer.jobs"];
/** Content editors: the Website modules only, no customer data. */
const CONTENT: Permission[] = [
  "districts.view", "districts.edit", "calculator.edit", "schemes.view", "schemes.edit", "projects.edit", "content.edit",
  "templates.view", "templates.edit",
];
const BY_ROLE: Record<Exclude<Role, "admin">, Permission[]> = { sales: SALES, installer: INSTALLER, content: CONTENT };

export function can(role: Role | null | undefined, p: Permission): boolean {
  if (!role) return false;
  if (role === "admin") return true;
  return BY_ROLE[role]?.includes(p) ?? false;
}

/** True when this role only ever sees its own leads. */
export function ownLeadsOnly(role: Role) {
  return role === "sales";
}

/** Where each role lands after signing in. */
export function homeFor(role: Role) {
  return role === "installer" ? "/admin/jobs" : role === "content" ? "/admin/districts" : "/admin";
}

export type NavKey =
  | "overview" | "leads" | "pipeline" | "follow-ups" | "reports" | "districts" | "calculator"
  | "schemes" | "projects" | "templates" | "content" | "team" | "settings" | "jobs";

export interface NavItem { key: NavKey; href: string; label: string; perm: Permission; soon: boolean; step: number; group: "work" | "site" | "admin" }

/** Sidebar. `soon` is cleared only when that page actually works. */
export const NAV: NavItem[] = [
  { key: "overview", href: "/admin", label: "Overview", perm: "overview.view", soon: false, step: 3, group: "work" },
  { key: "leads", href: "/admin/leads", label: "Leads", perm: "leads.view", soon: false, step: 2, group: "work" },
  { key: "pipeline", href: "/admin/pipeline", label: "Pipeline", perm: "pipeline.view", soon: false, step: 3, group: "work" },
  { key: "follow-ups", href: "/admin/follow-ups", label: "Follow-ups", perm: "followups.view", soon: false, step: 3, group: "work" },
  { key: "reports", href: "/admin/reports", label: "Reports", perm: "reports.view", soon: false, step: 4, group: "work" },
  { key: "jobs", href: "/admin/jobs", label: "Installer jobs", perm: "installer.jobs", soon: false, step: 3, group: "work" },
  { key: "districts", href: "/admin/districts", label: "Districts", perm: "districts.edit", soon: false, step: 4, group: "site" },
  { key: "calculator", href: "/admin/calculator", label: "Calculator", perm: "calculator.edit", soon: false, step: 5, group: "site" },
  { key: "schemes", href: "/admin/schemes", label: "Schemes", perm: "schemes.edit", soon: false, step: 5, group: "site" },
  { key: "projects", href: "/admin/projects", label: "Projects", perm: "projects.edit", soon: false, step: 5, group: "site" },
  { key: "templates", href: "/admin/templates", label: "Templates", perm: "templates.view", soon: false, step: 4, group: "site" },
  { key: "content", href: "/admin/content", label: "Content", perm: "content.edit", soon: false, step: 5, group: "site" },
  { key: "team", href: "/admin/team", label: "Team", perm: "team.manage", soon: false, step: 4, group: "admin" },
  { key: "settings", href: "/admin/settings", label: "Settings", perm: "settings.manage", soon: false, step: 4, group: "admin" },
];

/** Installers only see their jobs; admins see everything (the jobs list is reachable from Pipeline later). */
export function navFor(role: Role): NavItem[] {
  return NAV.filter((n) => can(role, n.perm) && !(n.key === "jobs" && role === "admin"));
}
