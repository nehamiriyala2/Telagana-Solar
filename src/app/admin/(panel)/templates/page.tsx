import type { Metadata } from "next";
import { requireStaff } from "@/lib/admin/auth";
import { q } from "@/lib/admin/db";
import { can } from "@/lib/admin/roles";
import { DEFAULT_TEMPLATES, TEMPLATE_KEYS } from "@/lib/admin/templates";
import { fullIst } from "@/lib/admin/time";
import { PageHeader } from "@/components/admin/ui";
import { TemplateEditor, type Tpl } from "@/components/admin/template-editor";

export const metadata: Metadata = { title: "Templates" };
export const dynamic = "force-dynamic";

export default async function TemplatesPage() {
  const staff = await requireStaff("templates.view");
  let rows: { key: string; lang: string; body: string; active: number; updated_at: Date; name: string | null }[] | null = null;
  try {
    rows = await q("SELECT t.`key`, t.lang, t.body, t.active, t.updated_at, s.name FROM wa_templates t LEFT JOIN staff s ON s.id = t.updated_by");
  } catch { rows = null; }
  const canEdit = can(staff.role, "templates.edit");
  const templates: Tpl[] = TEMPLATE_KEYS.flatMap((key) => (["en", "te"] as const).map((lang) => {
    const r = rows?.find((x) => x.key === key && x.lang === lang);
    return r
      ? { key, lang, body: r.body, active: Boolean(r.active), updatedBy: r.name, updatedAt: r.name ? fullIst(r.updated_at) : null, isDefault: false }
      : { key, lang, body: DEFAULT_TEMPLATES[key][lang], active: true, updatedBy: null, updatedAt: null, isDefault: true };
  }));
  return (
    <>
      <PageHeader title="WhatsApp templates" subtitle={canEdit
        ? "Messages used by the WhatsApp buttons on leads and follow-ups, in the lead’s language. Never promise savings or subsidy amounts."
        : "Read-only for your role. Use “Copy message” to paste into WhatsApp."} />
      {rows === null && <p role="alert" className="mb-4 rounded-2xl border border-[#f3c9c5] bg-[#fdecea] p-4 text-danger">Saved templates couldn’t load (is MySQL running?). Showing the built-in defaults.</p>}
      <TemplateEditor templates={templates} canEdit={canEdit && rows !== null} />
    </>
  );
}
