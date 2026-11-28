/**
 * npm run db:seed:demo
 * 30 fake leads (is_test = 1) spread over the last 30 days, all sources, statuses and districts.
 * Re-running replaces the previous demo leads. Real leads (is_test = 0) are never touched.
 * Phones use the 90000xxxxx range so they can never be a real customer.
 */
import { connect, run } from "./_db";

const NAMES = ["Ravi Kumar", "Lakshmi Devi", "Srinivas Reddy", "Anitha Rao", "Mahesh Goud", "Padma Priya", "Venkatesh", "Swathi", "Naresh Yadav", "Kavitha",
  "Rajesh", "Sunitha", "Prakash", "Manjula", "Kiran", "Sravani", "Ramesh Babu", "Divya", "Harish", "Bhavani",
  "రమేష్", "సుజాత", "శ్రీనివాస్", "లక్ష్మి", "Anil", "Madhavi", "Suresh", "Rekha", "Gopal", "Vani"];
const SOURCES = ["find-my-plan", "contact", "savings-calculator", "shop-calculator"] as const;
const KIND: Record<string, string> = { "find-my-plan": "plan_request", contact: "contact", "savings-calculator": "calculator_report", "shop-calculator": "calculator_report" };
const PAGE: Record<string, string> = { "find-my-plan": "/find-my-plan", contact: "/contact", "savings-calculator": "/savings-calculator", "shop-calculator": "/savings-calculator" };
const STATUSES = ["new", "new", "new", "contacted", "contacted", "qualified", "site_visit", "quote_sent", "won", "lost"] as const;
const USES = ["home", "home", "apartment", "shop", "farm", "institution"];
const ROOFS = ["own", "own", "own", "shared", "none"];
const SYSTEMS = ["on-grid", "on-grid", "hybrid", "off-grid"];
const SCHEMES = [["pm-surya-ghar"], ["pm-surya-ghar", "net-metering"], ["pm-kusum"], ["state-schemes"], []];
const AREAS = ["Kukatpally", "Madhapur", "Uppal", "LB Nagar", "Miyapur", "Hanamkonda town", "Kothagudem", "Nalgonda town", "Siddipet", "Shamshabad"];
const LOST = ["price", "roof_not_suitable", "went_elsewhere", "no_reply", "other"];

const pick = <T,>(a: readonly T[], i: number) => a[i % a.length];

run(async () => {
  const db = await connect();
  const [d] = await db.query("SELECT id FROM districts ORDER BY sort_order");
  const districtIds = (d as { id: number }[]).map((r) => r.id);
  if (!districtIds.length) throw new Error("No districts yet. Run npm run db:seed:districts first.");

  await db.query("DELETE FROM leads WHERE is_test = 1");

  const now = Date.now();
  for (let i = 0; i < 30; i++) {
    const source = pick(SOURCES, i);
    const status = pick(STATUSES, i * 7 + 3);
    const created = new Date(now - (i * 23 + (i % 5) * 7) * 3600_000); // spread over ~30 days
    const noContact = source !== "contact" && source !== "find-my-plan" && i % 6 === 2; // a few calculator-only leads
    const bill = 1200 + ((i * 1370) % 14000);
    const units = Math.round(bill / 7.5);
    const kw = Math.max(1, Math.round((units / 120) * 2) / 2);
    const phone = noContact ? null : `90000${String(10000 + i * 37).slice(-5)}`;
    const followUp = status === "new" || status === "won" || status === "lost" ? null : new Date(now + ((i % 5) - 2) * 86400_000);

    const [res] = await db.execute(
      `INSERT INTO leads (created_at, submitted_at, source, kind, name, phone, phone_normalized, area, place, use_type, bill, units,
         power_cuts, roof, kw, system_type, monthly_saving, schemes, message, lang, page, district_id, status, next_follow_up,
         final_kw, quote_amount, won_at, install_date, lost_reason, first_contacted_at, utm_source, final_amount, subsidy_applied, is_test)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [
        created, created, source, KIND[source], noContact ? null : pick(NAMES, i), phone, phone, pick(AREAS, i), i % 3 ? "Town" : "Village",
        source === "shop-calculator" ? "shop" : pick(USES, i), bill, units, i % 4 === 0 ? 1 : 0, pick(ROOFS, i), kw, pick(SYSTEMS, i),
        Math.round(bill * 0.85), JSON.stringify(pick(SCHEMES, i)), i % 3 === 0 ? "Please call after 5 pm. [demo]" : null,
        i % 4 === 1 ? "te" : "en", PAGE[source], pick(districtIds, i * 5), status, followUp,
        ["site_visit", "quote_sent", "won"].includes(status) ? kw : null,
        ["quote_sent", "won"].includes(status) ? Math.round(kw * 55000) : null,
        status === "won" ? new Date(created.getTime() + 5 * 86400_000) : null,
        status === "won" ? new Date(now + (i % 10) * 86400_000).toISOString().slice(0, 10) : null,
        status === "lost" ? pick(LOST, i) : null,
        status === "new" ? null : new Date(created.getTime() + ((i % 4) + 1) * 3600_000),
        i % 5 === 0 ? "google" : i % 5 === 1 ? "facebook" : null,
        status === "won" ? Math.round(kw * 52000) : null,
        status === "won" ? (i % 2 === 0 ? 1 : 0) : null,
      ],
    );
    const id = (res as { insertId: number }).insertId;
    await db.execute("UPDATE leads SET lead_no = CONCAT('TS-', LPAD(id, 4, '0')) WHERE id = ?", [id]);
    await db.execute("INSERT INTO lead_activity (lead_id, action, details, created_at) VALUES (?, 'created', ?, ?)", [id, JSON.stringify({ source, demo: true }), created]);
  }
  // Leads staff added by hand (phone call / WhatsApp / referral / walk-in), with the Module 1 contact fields.
  // Two of them share a phone number on purpose so duplicate detection has something to show.
  const [st] = await db.query("SELECT id FROM staff WHERE active = 1 AND role IN ('admin','sales') ORDER BY id");
  const staffIds = (st as { id: number }[]).map((r) => r.id);
  const MANUAL = [
    { name: "Sravan Kumar", phone: "9000077001", alt: "9000077101", email: "sravan.demo@example.com", source: "call", address: "Plot 14, Road 3, Kukatpally", use: "home", bill: 3200, roof: 650, status: "contacted" },
    { name: "Rama Devi", phone: "9000077002", alt: null, email: null, source: "whatsapp", address: "Near bus stand, Siddipet", use: "home", bill: 1800, roof: 400, status: "new" },
    { name: "Sai Traders", phone: "9000077003", alt: "9000077103", email: "accounts.demo@example.com", source: "referral", address: "Main Road, Nalgonda", use: "shop", bill: 14500, roof: 1800, status: "quote_sent" },
    { name: "Venkat Reddy (farm)", phone: "9000077004", alt: null, email: null, source: "walk-in", address: "Survey no. 221, near Kothagudem", use: "farm", bill: 6000, roof: null, status: "new" },
    { name: "Sravan K (repeat)", phone: "9000077001", alt: null, email: null, source: "whatsapp", address: null, use: "home", bill: 3000, roof: null, status: "new" },
  ];
  for (let i = 0; i < MANUAL.length; i++) {
    const m = MANUAL[i];
    const created = new Date(now - (i * 9 + 2) * 3600_000);
    const owner = staffIds.length ? pick(staffIds, i) : null;
    const [res] = await db.execute(
      `INSERT INTO leads (created_at, submitted_at, source, kind, name, phone, phone_normalized, alt_phone, alt_phone_normalized, email, address,
         use_type, bill, roof, roof_area_sqft, schemes, district_id, status, assigned_to, first_contacted_at, created_by, is_test)
       VALUES (?, ?, ?, 'manual', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [created, created, m.source, m.name, m.phone, m.phone, m.alt, m.alt, m.email, m.address, m.use, m.bill, m.roof ? "own" : null, m.roof,
        JSON.stringify(m.use === "farm" ? ["pm-kusum"] : ["pm-surya-ghar"]), pick(districtIds, i * 3 + 1), m.status, owner,
        m.status === "new" ? null : new Date(created.getTime() + 1800_000), owner],
    );
    const id = (res as { insertId: number }).insertId;
    await db.execute("UPDATE leads SET lead_no = CONCAT('TS-', LPAD(id, 4, '0')) WHERE id = ?", [id]);
    await db.execute("INSERT INTO lead_activity (lead_id, staff_id, action, details, created_at) VALUES (?, ?, 'created', ?, ?)", [id, owner, JSON.stringify({ source: m.source, manual: true }), created]);
    if (m.status !== "new") {
      await db.execute("INSERT INTO lead_activity (lead_id, staff_id, action, details, created_at) VALUES (?, ?, 'called', NULL, ?)", [id, owner, new Date(created.getTime() + 1800_000)]);
      await db.execute("INSERT INTO lead_activity (lead_id, staff_id, action, details, created_at) VALUES (?, ?, 'status_changed', ?, ?)", [id, owner, JSON.stringify({ from: "new", to: m.status }), new Date(created.getTime() + 2000_000)]);
      await db.execute("INSERT INTO lead_notes (lead_id, staff_id, body, created_at) VALUES (?, ?, ?, ?)", [id, owner, "Spoke on the phone, wants a call back with a price. [demo]", new Date(created.getTime() + 2100_000)]);
    }
  }
  // Follow-ups (Module 3): one open follow-up per lead that has a date (some overdue, some today, some upcoming),
  // plus a few done ones with outcomes. leads.next_follow_up is then synced to the earliest open one.
  const [open] = await db.query("SELECT id, next_follow_up, assigned_to FROM leads WHERE is_test = 1 AND next_follow_up IS NOT NULL");
  const TYPES = ["call", "call", "whatsapp", "visit"];
  const NOTES = ["Ask for a photo of the roof [demo]", null, "Send PM Surya Ghar brochure [demo]", "Check shade on the terrace [demo]"];
  let k = 0;
  for (const r of open as { id: number; next_follow_up: Date; assigned_to: number | null }[]) {
    await db.execute("INSERT INTO follow_ups (lead_id, due_at, type, note, created_by) VALUES (?, ?, ?, ?, ?)",
      [r.id, r.next_follow_up, pick(TYPES, k), pick(NOTES, k), r.assigned_to]);
    k++;
  }
  // Two more due later today (IST), so the Today tab always has something.
  const [todayLeads] = await db.query("SELECT id, assigned_to FROM leads WHERE is_test = 1 AND status IN ('new','contacted') AND phone_normalized IS NOT NULL ORDER BY id LIMIT 2");
  for (const [i, r] of (todayLeads as { id: number; assigned_to: number | null }[]).entries()) {
    const due = new Date(Math.max(now + 2 * 3600_000, now) + i * 3600_000);
    await db.execute("INSERT INTO follow_ups (lead_id, due_at, type, note, created_by) VALUES (?, ?, 'call', ?, ?)", [r.id, due, "First call [demo]", r.assigned_to]);
  }
  const OUTCOMES = ["reached", "no_answer", "interested", "call_back"];
  const [doneLeads] = await db.query("SELECT id, assigned_to FROM leads WHERE is_test = 1 AND status IN ('contacted','qualified','quote_sent') ORDER BY id LIMIT 6");
  for (const [i, r] of (doneLeads as { id: number; assigned_to: number | null }[]).entries()) {
    const due = new Date(now - (i + 1) * 86400_000);
    await db.execute(
      "INSERT INTO follow_ups (lead_id, due_at, type, status, outcome, outcome_note, done_at, done_by, created_by) VALUES (?, ?, ?, 'done', ?, ?, ?, ?, ?)",
      [r.id, due, pick(TYPES, i), pick(OUTCOMES, i), i % 2 ? "Will discuss with family [demo]" : null, new Date(due.getTime() + 1800_000), r.assigned_to, r.assigned_to],
    );
  }
  await db.query(`UPDATE leads l SET next_follow_up = (SELECT MIN(f.due_at) FROM follow_ups f WHERE f.lead_id = l.id AND f.status = 'open' AND f.deleted_at IS NULL) WHERE l.is_test = 1`);
  console.log(`✔ 30 website demo leads + ${MANUAL.length} hand-added demo leads inserted (is_test = 1), with demo follow-ups.`);
  await db.end();
});
