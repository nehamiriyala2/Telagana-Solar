/**
 * npm run db:seed:content
 * Fills the admin tables from what the website already says, without overwriting staff edits:
 *  - wa_templates: WhatsApp defaults (EN + TE) for welcome, follow-ups 1–3, quote sent, installation done
 *  - schemes: the 4 schemes on the public site, with eligibility, benefit, documents and steps from messages/*.json
 *    (only fills fields that are still empty)
 *  - faqs: the home page FAQs (only when the table is empty)
 *  - demo drafts marked "[demo]" (2 projects, 1 guide, 1 testimonial): never published, so never shown publicly
 * Safe to re-run.
 */
import en from "../messages/en.json";
import te from "../messages/te.json";
import { SCHEMES } from "../src/config/schemes";
import { DEFAULT_TEMPLATES, TEMPLATE_KEYS } from "../src/lib/admin/templates";
import { connect, run } from "./_db";

type Item = Record<string, string | undefined> & { name: string; short?: string; benefit?: string };
const items = (m: unknown) => (m as { schemes: { items: Record<string, Item> } }).schemes.items;
const faq = (m: unknown) => (m as { faq: Record<string, { q: string; a: string }> }).faq;
const list = (it: Item | undefined, prefix: string) => Object.keys(it ?? {}).filter((k) => new RegExp(`^${prefix}\\d+$`).test(k)).sort().map((k) => it![k] as string);

/** Who runs each scheme. VERIFY on the official sites; staff confirm via "Last verified". */
const AUTHORITY: Record<string, { en: string; te: string }> = {
  "pm-surya-ghar": { en: "Ministry of New and Renewable Energy (MNRE), Government of India", te: "నూతన మరియు పునరుత్పాదక ఇంధన మంత్రిత్వ శాఖ (MNRE), భారత ప్రభుత్వం" },
  "pm-kusum": { en: "Ministry of New and Renewable Energy (MNRE), with the state nodal agency", te: "నూతన మరియు పునరుత్పాదక ఇంధన మంత్రిత్వ శాఖ (MNRE), రాష్ట్ర నోడల్ ఏజెన్సీతో" },
  "net-metering": { en: "Your DISCOM (TGSPDCL or TGNPDCL)", te: "మీ డిస్కమ్ (TGSPDCL లేదా TGNPDCL)" },
  "state-schemes": { en: "Telangana Renewable Energy Development Corporation (TGREDCO)", te: "తెలంగాణ పునరుత్పాదక ఇంధన అభివృద్ధి సంస్థ (TGREDCO)" },
};

run(async () => {
  const db = await connect();
  let t = 0;
  for (const key of TEMPLATE_KEYS) {
    for (const lang of ["en", "te"] as const) {
      const [r] = await db.execute("INSERT IGNORE INTO wa_templates (`key`, lang, body, active) VALUES (?, ?, ?, 1)", [key, lang, DEFAULT_TEMPLATES[key][lang]]);
      t += (r as { affectedRows: number }).affectedRows;
    }
  }

  let s = 0, filled = 0;
  for (const [i, sc] of SCHEMES.entries()) {
    const e = items(en)[sc.slug];
    const tt = items(te)[sc.slug];
    const [r] = await db.execute(
      `INSERT IGNORE INTO schemes (slug, name_en, name_te, summary_en, summary_te, official_url, status, last_verified_at)
       VALUES (?, ?, ?, ?, ?, ?, 'published', NULL)`,
      [sc.slug, e?.name ?? sc.slug, tt?.name ?? e?.name ?? sc.slug, e?.short ?? null, tt?.short ?? null, sc.officialUrl],
    );
    s += (r as { affectedRows: number }).affectedRows;
    // Fill the new detail fields only where they are still empty (never overwrite edits).
    const [u] = await db.execute(
      `UPDATE schemes SET
         authority_en = COALESCE(authority_en, ?), authority_te = COALESCE(authority_te, ?),
         eligibility_en = COALESCE(eligibility_en, ?), eligibility_te = COALESCE(eligibility_te, ?),
         benefit_en = COALESCE(benefit_en, ?), benefit_te = COALESCE(benefit_te, ?),
         documents = COALESCE(documents, ?), steps = COALESCE(steps, ?),
         sort_order = IF(sort_order = 0, ?, sort_order)
       WHERE slug = ?`,
      [
        AUTHORITY[sc.slug]?.en ?? null, AUTHORITY[sc.slug]?.te ?? null,
        list(e, "w").join("\n") || null, list(tt, "w").join("\n") || null,
        e?.benefit ?? null, tt?.benefit ?? null,
        JSON.stringify({ en: list(e, "d"), te: list(tt, "d") }), JSON.stringify({ en: list(e, "s"), te: list(tt, "s") }),
        (i + 1) * 10, sc.slug,
      ],
    );
    filled += (u as { changedRows: number }).changedRows;
  }

  const [[{ n: faqCount }]] = (await db.query("SELECT COUNT(*) AS n FROM faqs WHERE deleted_at IS NULL")) as unknown as [{ n: number }[]];
  let f = 0;
  if (!Number(faqCount)) {
    const keys = Object.keys(faq(en)).filter((k) => /^q\d+$/.test(k)).sort();
    for (const [i, k] of keys.entries()) {
      // The home page shows the first four today; the rest start as drafts.
      await db.execute("INSERT INTO faqs (question_en, question_te, answer_en, answer_te, sort_order, published) VALUES (?, ?, ?, ?, ?, ?)",
        [faq(en)[k].q, faq(te)[k]?.q ?? faq(en)[k].q, faq(en)[k].a, faq(te)[k]?.a ?? faq(en)[k].a, (i + 1) * 10, i < 4 ? 1 : 0]);
      f++;
    }
  }

  // Demo drafts so staff can see each module working. Status draft / not approved → never on the public site.
  let demo = 0;
  const [[{ n: hasDemo }]] = (await db.query("SELECT COUNT(*) AS n FROM projects WHERE title LIKE '%[demo]%'")) as unknown as [{ n: number }[]];
  if (!Number(hasDemo)) {
    const [d] = await db.query("SELECT id, slug FROM districts WHERE slug IN ('warangal', 'nalgonda') ORDER BY slug");
    const dist = d as { id: number; slug: string }[];
    await db.execute(
      `INSERT INTO projects (title, title_te, slug, district_id, area, type, kw, install_date, savings_month, story_en, story_te, customer_name, customer_permission, featured, status)
       VALUES (?, ?, 'demo-rooftop-hanamkonda', ?, 'Hanamkonda', 'home', 3, CURDATE() - INTERVAL 40 DAY, NULL, ?, ?, NULL, 0, 1, 'draft')`,
      ["3 kW rooftop for a family home [demo]", "కుటుంబ ఇంటికి 3 kW రూఫ్‌టాప్ [demo]", dist.find((x) => x.slug === "warangal")?.id ?? null,
        "Demo record so staff can see how a project looks. Replace with a real installation, add photos and tick the customer’s permission before publishing.",
        "సిబ్బంది చూడడానికి డెమో రికార్డు. నిజమైన ఇన్‌స్టాలేషన్‌తో మార్చి, ఫోటోలు జోడించి, ప్రచురించే ముందు కస్టమర్ అనుమతిని టిక్ చేయండి."],
    );
    await db.execute(
      `INSERT INTO projects (title, title_te, slug, district_id, area, type, kw, status) VALUES (?, ?, 'demo-farm-pump-nalgonda', ?, 'Nalgonda', 'farm', 5, 'draft')`,
      ["5 kW solar pump on a farm [demo]", "పొలంలో 5 kW సోలార్ పంప్ [demo]", dist.find((x) => x.slug === "nalgonda")?.id ?? null],
    );
    await db.execute(
      `INSERT IGNORE INTO posts (slug, kind, title_en, title_te, excerpt_en, excerpt_te, body_en, status) VALUES ('demo-how-net-metering-works', 'guide', ?, ?, ?, ?, ?, 'draft')`,
      ["How net metering works [demo]", "నెట్ మీటరింగ్ ఎలా పనిచేస్తుంది [demo]",
        "Demo guide: replace with a checked article before publishing.", "డెమో గైడ్: ప్రచురించే ముందు సరిచూసిన వ్యాసంతో మార్చండి.",
        "## Draft\n\nThis is a demo guide so staff can see the editor. Write the real article here, check every fact, then publish."],
    );
    await db.execute("INSERT INTO testimonials (name, type, place, text_en, text_te, approved) VALUES ('Demo customer [demo]', 'home', 'Warangal', ?, NULL, 0)",
      ["Demo testimonial. Replace with a real customer’s words, with their permission, before approving."]);
    demo = 4;
  }
  console.log(`✔ ${t} template(s), ${s} new scheme(s), ${filled} scheme(s) filled in, ${f} FAQ(s), ${demo} demo draft(s). Existing rows kept.`);
  await db.end();
});
