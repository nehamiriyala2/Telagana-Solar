/**
 * npm run db:seed:districts
 * Inserts / updates all 33 Telangana districts from the website's own list (src/data/districts.ts),
 * so slugs and Telugu names always match the public site. Safe to re-run: existing rows are updated,
 * except fields edited in the admin (summary, hero image, published) which are left alone.
 */
import { districts } from "../src/data/districts";
import { connect, run } from "./_db";

type Discom = "TGSPDCL" | "TGNPDCL";

/*
 * VERIFY: DISCOM + region per district. Mapping follows the erstwhile-district split
 * (TGSPDCL = southern Telangana incl. Hyderabad; TGNPDCL = Warangal, Karimnagar, Khammam, Adilabad,
 * Nizamabad regions). Border mandals can be served by the other DISCOM. Check with TGSPDCL/TGNPDCL
 * before relying on it, then correct here or in Admin → Districts.
 */
const MAP: Record<string, { discom: Discom; region: string }> = {
  "hyderabad": { discom: "TGSPDCL", region: "Hyderabad metro" },
  "ranga-reddy": { discom: "TGSPDCL", region: "Hyderabad metro" },
  "medchal-malkajgiri": { discom: "TGSPDCL", region: "Hyderabad metro" },
  "sangareddy": { discom: "TGSPDCL", region: "Hyderabad metro" },
  "vikarabad": { discom: "TGSPDCL", region: "South" },
  "medak": { discom: "TGSPDCL", region: "South" },
  "siddipet": { discom: "TGSPDCL", region: "South" },
  "mahabubnagar": { discom: "TGSPDCL", region: "South" },
  "narayanpet": { discom: "TGSPDCL", region: "South" },
  "wanaparthy": { discom: "TGSPDCL", region: "South" },
  "nagarkurnool": { discom: "TGSPDCL", region: "South" },
  "jogulamba-gadwal": { discom: "TGSPDCL", region: "South" },
  "nalgonda": { discom: "TGSPDCL", region: "South" },
  "suryapet": { discom: "TGSPDCL", region: "South" },
  "yadadri-bhuvanagiri": { discom: "TGSPDCL", region: "South" },
  "warangal": { discom: "TGNPDCL", region: "North" },
  "hanumakonda": { discom: "TGNPDCL", region: "North" },
  "jangaon": { discom: "TGNPDCL", region: "North" },
  "mahabubabad": { discom: "TGNPDCL", region: "North" },
  "jayashankar-bhupalpally": { discom: "TGNPDCL", region: "North" },
  "mulugu": { discom: "TGNPDCL", region: "North" },
  "karimnagar": { discom: "TGNPDCL", region: "North" },
  "peddapalli": { discom: "TGNPDCL", region: "North" },
  "jagtial": { discom: "TGNPDCL", region: "North" },
  "rajanna-sircilla": { discom: "TGNPDCL", region: "North" },
  "khammam": { discom: "TGNPDCL", region: "North" },
  "bhadradri-kothagudem": { discom: "TGNPDCL", region: "North" },
  "adilabad": { discom: "TGNPDCL", region: "North" },
  "kumuram-bheem-asifabad": { discom: "TGNPDCL", region: "North" },
  "mancherial": { discom: "TGNPDCL", region: "North" },
  "nirmal": { discom: "TGNPDCL", region: "North" },
  "nizamabad": { discom: "TGNPDCL", region: "North" },
  "kamareddy": { discom: "TGNPDCL", region: "North" },
};

run(async () => {
  const missing = districts.filter((d) => !MAP[d.slug]).map((d) => d.slug);
  if (missing.length) throw new Error(`No DISCOM mapping for: ${missing.join(", ")}`);
  if (districts.length !== 33) console.warn(`! Expected 33 districts, found ${districts.length}`);

  const db = await connect();
  let i = 0;
  for (const d of districts) {
    const m = MAP[d.slug];
    await db.execute(
      `INSERT INTO districts (slug, name_en, name_te, discom, region, published, sort_order)
       VALUES (?, ?, ?, ?, ?, 1, ?)
       ON DUPLICATE KEY UPDATE name_en = VALUES(name_en), name_te = VALUES(name_te),
         discom = VALUES(discom), region = VALUES(region), sort_order = VALUES(sort_order)`,
      [d.slug, d.name.en, d.name.te, m.discom, m.region, ++i],
    );
  }
  const [rows] = await db.query("SELECT discom, COUNT(*) AS n FROM districts GROUP BY discom");
  console.log(`✔ ${districts.length} districts seeded:`, (rows as { discom: string; n: number }[]).map((r) => `${r.discom} ${r.n}`).join(", "));
  await db.end();
});
