import { requireStaff } from "@/lib/admin/auth";
import { sidebarCounts } from "@/lib/admin/counts";
import { navFor } from "@/lib/admin/roles";
import { AdminShell, SidebarPrefScript } from "@/components/admin/shell";
import { Toaster } from "@/components/admin/toast";
import { StagesProvider } from "@/components/admin/stages-context";
import { loadStages } from "@/lib/admin/stages-store";
import { loadFuRules } from "@/lib/admin/followup-rules-store";

export const dynamic = "force-dynamic";

/** Every page in this group requires a signed-in, active staff member. */
export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const staff = await requireStaff();
  const [counts, stages, fuRules] = await Promise.all([
    staff.role === "admin" || staff.role === "sales" ? sidebarCounts(staff) : Promise.resolve(null),
    loadStages(),
    loadFuRules(),
  ]);
  const items = navFor(staff.role).map(({ key, href, label, soon, group }) => ({ key, href, label, soon, group }));

  return (
    <>
      <SidebarPrefScript staffId={staff.id} />
      <StagesProvider stages={stages} fuRules={fuRules}>
        <AdminShell items={items} counts={counts} staff={{ id: staff.id, name: staff.name, role: staff.role }}>{children}</AdminShell>
      </StagesProvider>
      <Toaster />
    </>
  );
}
