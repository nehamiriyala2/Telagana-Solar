import type { Metadata } from "next";
import { requireStaff } from "@/lib/admin/auth";
import { listTeam } from "@/lib/admin/team-service";
import { fullIst } from "@/lib/admin/time";
import { PageHeader } from "@/components/admin/ui";
import { TeamManager, type Member } from "@/components/admin/team-manager";
import { RoleMatrix } from "@/components/admin/role-matrix";

export const metadata: Metadata = { title: "Team" };
export const dynamic = "force-dynamic";

export default async function TeamPage() {
  const me = await requireStaff("team.manage");
  let members: Member[] | null = null;
  try {
    members = (await listTeam()).map((m) => ({
      id: m.id, name: m.name, email: m.email, role: m.role, active: Boolean(m.active), openLeads: Number(m.open_leads),
      lastLogin: m.last_login_at ? fullIst(m.last_login_at) : null,
    }));
  } catch { members = null; }
  return (
    <>
      <PageHeader title="Team" subtitle="Who can sign in, and what they can see." />
      {members ? <TeamManager members={members} meId={me.id} /> : (
        <p role="alert" className="rounded-2xl border border-[#f3c9c5] bg-[#fdecea] p-6 text-danger">The team couldn’t load. If you’re on XAMPP, check that MySQL is running, then refresh.</p>
      )}
      <div className="mt-8"><RoleMatrix /></div>
    </>
  );
}
