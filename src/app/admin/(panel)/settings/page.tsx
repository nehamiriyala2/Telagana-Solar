import type { Metadata } from "next";
import { requireStaff } from "@/lib/admin/auth";
import { loadSettings } from "@/lib/admin/settings-store";
import { fullIst } from "@/lib/admin/time";
import { PageHeader } from "@/components/admin/ui";
import { SettingsForm, type SettingView } from "@/components/admin/settings-form";
import { StageSettings } from "@/components/admin/stage-settings";
import { loadStages } from "@/lib/admin/stages-store";
import { loadFuRules } from "@/lib/admin/followup-rules-store";
import { FollowUpRulesSettings } from "@/components/admin/followup-rules-settings";

export const metadata: Metadata = { title: "Settings" };
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  await requireStaff("settings.manage");
  let initial: Record<string, SettingView> | null = null;
  try {
    const s = await loadSettings();
    initial = Object.fromEntries(Object.entries(s).map(([k, v]) => [k, { ...v, updatedAt: v.updatedAt ? fullIst(v.updatedAt) : null }]));
  } catch { initial = null; }
  const [stages, fuRules] = await Promise.all([loadStages(), loadFuRules()]);
  return (
    <>
      <PageHeader title="Settings" subtitle="Business details, contact numbers and SEO used across the website, plus pipeline stages and follow-up timing." />
      {initial ? (
        <div className="space-y-8">
          <SettingsForm initial={initial} />
          <StageSettings initial={stages} />
          <FollowUpRulesSettings initial={fuRules} />
        </div>
      ) : (
        <p role="alert" className="rounded-2xl border border-[#f3c9c5] bg-[#fdecea] p-6 text-danger">Settings couldn’t load. If you’re on XAMPP, check that MySQL is running, then refresh.</p>
      )}
    </>
  );
}
