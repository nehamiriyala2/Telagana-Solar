import { db } from "@/lib/server/store";
import { notifyOwner } from "@/lib/server/notify";
import { markCalledUrl } from "@/lib/server/token";
import type { Lead } from "@/lib/leads";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Reminds the team about leads not marked "called" within 1 hour.
 * vercel.json runs it once a day (03:30 UTC = 09:00 IST): the Vercel Hobby plan only allows daily crons.
 * For more frequent reminders (e.g. every 15 minutes) use a free external cron (cron-job.org) calling
 * GET /api/cron/lead-reminders with header "Authorization: Bearer <CRON_SECRET>", or move to Vercel Pro.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) return new Response("Unauthorized", { status: 401 });
  const supa = db();
  if (!supa) return Response.json({ ok: false, error: "Supabase not configured" }, { status: 500 });

  const cutoff = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { data, error } = await supa
    .from("leads")
    .select("*")
    .eq("status", "new")
    .is("reminder_sent_at", null)
    .lt("created_at", cutoff)
    .limit(50);
  if (error) return Response.json({ ok: false, error: error.message }, { status: 500 });

  let sent = 0;
  for (const r of data ?? []) {
    const lead: Lead = {
      id: r.id, createdAt: r.created_at, kind: r.kind, name: r.name, phone: r.phone, phoneE164: r.phone,
      location: r.location, propertyType: r.property_type, monthlyBill: r.monthly_bill, message: r.message,
      slotDate: r.slot_date, slotTime: r.slot_time, calc: r.calc, packageId: r.package_id,
      tags: r.tags ?? [], temperature: r.temperature, sourcePage: r.source_page, locale: r.locale,
    };
    await notifyOwner(lead, markCalledUrl(lead.id), { reminder: true });
    await supa.from("leads").update({ reminder_sent_at: new Date().toISOString() }).eq("id", lead.id);
    sent++;
  }
  return Response.json({ ok: true, reminded: sent });
}
