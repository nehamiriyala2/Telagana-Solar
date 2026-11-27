import { Check, Minus } from "lucide-react";

/** What each role can see and change. Mirrors src/lib/admin/roles.ts (the API enforces the same rules). */
const ROWS: [string, string, string, string][] = [
  ["Overview, Reports", "All data", "Own leads only", "No"],
  ["Leads, Pipeline, Follow-ups", "All leads", "Own leads only", "No"],
  ["Export CSV, delete, merge, bulk assign", "Yes", "No", "No"],
  ["Districts, Calculator, Schemes, Projects, Content", "Edit", "Schemes: view only", "Edit"],
  ["WhatsApp templates", "Edit", "Use (view and copy)", "Edit"],
  ["Team, Settings", "Edit", "No", "No"],
];
const cell = (v: string) => (v === "No" ? <span className="inline-flex items-center gap-1 text-[#8a94a6]"><Minus className="size-4" aria-hidden />No</span>
  : v === "Yes" || v === "Edit" ? <span className="inline-flex items-center gap-1 font-semibold text-success"><Check className="size-4" aria-hidden />{v}</span> : <span>{v}</span>);

export function RoleMatrix() {
  return (
    <section aria-labelledby="roles-title" className="rounded-2xl border border-[#ece4cf] bg-white p-5 sm:p-6">
      <h2 id="roles-title" className="font-heading text-lg font-bold">What each role can do</h2>
      <p className="mt-1 text-sm text-[#4b5b75]">Installers only see their installation jobs.</p>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[34rem] text-left text-sm">
          <thead className="text-xs uppercase tracking-wide text-[#4b5b75]"><tr><th className="py-2 pr-4 font-semibold">Area</th><th className="py-2 pr-4 font-semibold">Admin</th><th className="py-2 pr-4 font-semibold">Sales</th><th className="py-2 font-semibold">Content</th></tr></thead>
          <tbody>{ROWS.map(([area, ...v]) => <tr key={area} className="border-t border-[#f1ece0]"><th scope="row" className="py-2.5 pr-4 font-semibold">{area}</th>{v.map((x, i) => <td key={i} className="py-2.5 pr-4">{cell(x)}</td>)}</tr>)}</tbody>
        </table>
      </div>
    </section>
  );
}
