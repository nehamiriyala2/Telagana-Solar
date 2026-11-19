# Telangana Solar website (Phase 1)

**"Make your own power. Pay less for it."** A fast, bilingual (English / Telugu) website for a solar installation company serving homes, farms and businesses across Telangana. It teaches visitors which solar suits them and which government schemes they can use, then turns them into leads: solar plan requests, subsidy checks, calculator reports and WhatsApp chats. (No free site surveys are offered.)

## Run it

```bash
npm install
cp .env.example .env.local     # fill in what you have; everything is optional for local testing
npm run dev                    # http://localhost:3000   (Telugu: /te)
npm run build && npm start     # production
```

With no keys set, forms still work locally: leads are written to `.data/leads.jsonl`.

## Pages

| Page | URL |
|---|---|
| Home (14 sections) | `/` |
| Solar for Homes / Farms / Business | `/solutions/homes`, `/solutions/farms`, `/solutions/business` |
| Savings Calculator | `/savings-calculator` (accepts `?bill=3000&type=farm`) |
| Subsidy & Loans (+ EMI estimate, FAQ) | `/subsidy-loans` |
| Projects (filter by type and district) | `/projects` |
| About Us | `/about` |
| Contact (get my solar plan) | `/contact` |
| Visitor pages | `/for/urban`, `/for/farmer` … (7) |
| Schemes | `/schemes`, `/schemes/pm-surya-ghar` … |
| City landing pages (all 33 districts) | `/solar-installation/hyderabad`, `/solar-installation/warangal` … |
| Privacy, Terms, 404 | `/privacy`, `/terms` |

Every page also exists in Telugu under `/te/...`.

## How to edit

Anything you still need to fill in shows on the site as a dashed **[EDIT]** marker. Search the code for `[EDIT]` to find them all.

| What | Where |
|---|---|
| Phone, WhatsApp, email, site URL | `.env.local` (`NEXT_PUBLIC_PHONE`, `NEXT_PUBLIC_WHATSAPP_NUMBER`, …) |
| Address, map, hours, social links, counters, brands, service areas, call-back promise ("within X hours") | `src/config/site.ts` |
| Calculator values: tariff per unit, generation per kW, cost per kW, subsidy rules, CO₂ factor, Hot/Warm threshold, loan rate | `src/config/calculator.ts` |
| Packages and "Starting from ₹" prices | `src/config/packages.ts` (`priceFrom: null` shows `₹[EDIT]`) |
| Projects, testimonials, team, certifications | `src/config/content.ts` |
| Scheme benefit rules (PM Surya Ghar, RWA, PM-KUSUM) | `schemeRules` in `src/config/calculator.ts` |
| All page text (English / Telugu) | `messages/en.json`, `messages/te.json`: same keys in both |
| Logo | `src/components/layout/logo.tsx` and `public/icon.svg` |

### Images

- **Project photos:** put WebP files (about 1200px wide, under 150 KB) in `public/projects/`, then set `photo: "/projects/your-file.webp"` in `src/config/content.ts`.
- **Brand logos:** put them in `public/brands/` and set `logo` in `src/config/site.ts`.
- **Team photos:** use `photo` in `team` (`src/config/content.ts`).
- **Testimonial videos:** set `videoUrl` to a YouTube embed link (`https://www.youtube-nocookie.com/embed/VIDEO_ID`).

Project images use Next.js `<Image>`, which serves WebP/AVIF automatically and lazy-loads below the fold. The social share image is generated at `/og-image.png`; replace it with a designed image when ready.

### Content rules built in

- No reviews, certifications or numbers are invented: empty fields show `[EDIT]`.
- Subsidy amounts are never shown as fixed facts. Wherever a subsidy appears, the site says "as per current government scheme" and "Subsidy amounts depend on current government rules. We confirm them for you."
- Every estimate carries: "Estimates only, based on current rules."

## Lead automation

```
Plan request / subsidy check / calculator / contact / WhatsApp click
        │
        ▼
POST /api/leads ── honeypot + timing spam check, +91 mobile validation, rate limit
        │           auto-tags: Home / Farm / Business, Hot / Warm (by bill), lead type
        ├─► Supabase table "leads"          (SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY)
        ├─► Webhook → Google Sheets / Zapier / Make / n8n   (LEAD_WEBHOOK_URL)
        ├─► Owner alert: WhatsApp + email, with a one-tap "Mark as called" link
        └─► Customer auto-reply on WhatsApp: "Thanks… we will call you within X hours"

Daily (Vercel Hobby) or every 15 min (external cron): /api/cron/lead-reminders ─► reminds the owner about leads not marked "called" after 1 hour
```

What is saved with each lead: name, phone (+91), location, property type, monthly bill, calculator result or solar plan, package, tags, Hot/Warm, source page, language and time.

### Setup checklist

1. **Google Sheets:** follow `automation/google-sheets-apps-script.gs` (paste the script, deploy as a web app), then set `LEAD_WEBHOOK_URL` and `LEAD_WEBHOOK_SECRET`.
2. **Supabase** (needed for reminders): create a project, run `supabase/schema.sql`, then set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`. The `open_leads` view lists uncalled leads, hottest first.
3. **Email alerts:** create a [Resend](https://resend.com) account, verify your domain, then set `RESEND_API_KEY`, `EMAIL_FROM` and `OWNER_EMAIL`.
4. **WhatsApp alerts and auto-reply (WhatsApp Cloud API, Meta):**
   - Set `WHATSAPP_CLOUD_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID` and `OWNER_WHATSAPP_NUMBER`.
   - Create and get approval for two message templates in Meta Business Manager:
     - `WHATSAPP_TEMPLATE_CUSTOMER_REPLY`, for example: *"Hi {{1}}! Thanks for contacting Telangana Solar. Our team will call you within {{2}} hours."* Create both an `en` and a `te` version.
     - `WHATSAPP_TEMPLATE_OWNER_ALERT`, for example: *"{{1}}\n{{2}}\nMark as called: {{3}}"*.
   - WhatsApp only delivers business-initiated messages through approved templates.
5. **Follow-up reminders:**
   - Set `LEAD_ACTION_SECRET` (signs the "Mark as called" links) and `CRON_SECRET`.
   - On Vercel, `vercel.json` runs the job once a day at 03:30 UTC (09:00 IST), which the Hobby plan allows. For reminders every 15 minutes, add a free external cron such as cron-job.org that calls `GET /api/cron/lead-reminders` with the header `Authorization: Bearer <CRON_SECRET>` (or use the Pro plan and set the schedule back to `*/15 * * * *`).
6. **Tracking:** set `NEXT_PUBLIC_GA4_ID`, `NEXT_PUBLIC_META_PIXEL_ID` and `NEXT_PUBLIC_GOOGLE_ADS_ID`, plus the conversion labels. These events fire automatically:
   - `generate_lead` / Meta `Lead` / Ads conversion: every successful form submit
   - `whatsapp_click` / Meta `Contact` / Ads conversion: every WhatsApp button
   - `call_click`
   - `calculator_used`

## SEO

- Clean URLs in both languages, with `hreflang` alternates and canonical tags.
- Per-page titles and descriptions, and Open Graph and Twitter cards.
- Schema markup: `LocalBusiness` on every page (city-specific on city pages) and `FAQPage` on FAQ pages. Fields still marked `[EDIT]` are left out, not faked.
- `sitemap.xml` (including all city pages) and `robots.txt`.
- City pages are generated from `src/data/districts.ts`. Add city-specific text or projects later for stronger local ranking.

## Brand, 3D hero and visitor pages

**Logo and colours**

| Asset | File |
|---|---|
| Original logo | `public/brand/logo-original.png` |
| Header/footer crop | `public/brand/logo.webp` (shown in a rounded navy badge on the white header, and directly on the navy footer) |
| Favicon / app icon | `public/brand/mark-64.png`, `public/apple-icon.png` (sun + panel crop). `public/brand/mark.png` (512px) works as a WhatsApp Business profile photo. |
| Watermark | `public/brand/outline-gold.webp`: the gold map + Charminar outline from the logo, used faintly in the hero and footer |

Brand colours are tokens in `src/app/globals.css`:
- deep navy `#07173F`, royal blue `#1E5BD8`, sky blue `#4DA3FF`
- sun gold `#F5A800`, sun yellow `#FFC72C`, leaf green `#3FA535`
- silver `#E6EAF0`, warm off-white `#FFFBF2`, sky tint `#EAF4FF`

Green is used only for ticks, savings and success. Text-safe darker variants (`text-leaf-ink`, `text-gold-ink`, `text-royal`) keep WCAG AA contrast on white.

If you get a transparent-background PNG or SVG of the logo, replace `public/brand/logo.webp` and remove the navy badge in `src/components/layout/logo.tsx`.

**3D hero** (`src/components/hero3d/`)
- `scene.tsx`: the React Three Fiber scene. Parts: house, glossy panels, garden, trees, floating platform, golden Charminar, pulsing sun and beams, logo-style gold ring, drifting clouds, energy particles (roof → inverter → meter → house), mouse parallax, drag to rotate, auto-sway on touch, day/night.
- `hero-visual.tsx`: shows the static image `public/hero/scene-fallback.webp` first (fast first paint).
  - It loads the 3D code only after the page is idle, and only on capable devices.
  - It never loads 3D with "reduce motion", data-saver or slow connections, ≤2 GB memory / ≤2 CPU cores, or no WebGL.
  - It pauses rendering when scrolled off screen, and holds the glass info cards, the bill countdown (₹3,200 → ₹400, labelled "Example home") and the Day/Night toggle.
- **After changing the scene, regenerate the fallback image:** run `npm run build && npm start`, then `node automation/capture-hero.mjs http://localhost:3000`. This uses Chrome and the hidden, no-index page `/scene-capture`.

**"Which solar is right for you?"**
- 7 visitor pages at `/for/<persona>`: `urban`, `apartment`, `farmer`, `shop`, `factory`, `institution`, `landlord`.
- Settings are in `src/config/personas.ts`: property type, linked solution page, relevant schemes, FAQ.
- Text is in `messages/*.json` → `personas`.

**Find My Solar Plan** (`src/components/tools/guide-dialog.tsx`)
- Questions: who are you → monthly bill + roof/land area → district.
- The plan shows the solar type and why, size, cost range, every scheme with its estimated benefit, monthly saving (green), payback and a "what to do next" checklist.
- Buttons: "Send my plan on WhatsApp" and "Ask a question", plus an optional call-back form (lead kind `plan_request`).

**Check My Subsidy** (`src/components/tools/subsidy-dialog.tsx`)
- Inputs: property type, system size or bill, district, own/rented.
- Output: schemes the visitor may qualify for, with eligibility, estimated benefit, documents and steps. The optional call-back saves a `subsidy_check` lead.
- Logic is in `src/lib/plan.ts`.

**Schemes**
- `/schemes` and `/schemes/<slug>` for `pm-surya-ghar`, `pm-kusum`, `net-metering` and `state-schemes`.
- Every scheme page uses the same template: who can apply, benefit, documents, steps, how we help, official link.
- Official links are in `src/config/schemes.ts`. Verify them before going live. [EDIT]

> The hero says "Up to ₹78,000 subsidy*", "MNRE-approved panels" and "25-year warranty", as requested. Each must be true for your business before launch: the subsidy line carries a footnote ("as per the current PM Surya Ghar scheme"), and the warranty and MNRE claims should match what you actually supply.

## Tech

Next.js 15 (App Router), TypeScript, Tailwind CSS v4 (design tokens in `src/app/globals.css`), next-intl, Framer Motion, Lenis, Recharts (lazy-loaded), Supabase.

All motion respects `prefers-reduced-motion`. Headline content paints before JavaScript loads, for fast first paint and a good LCP score.

## Folder map

```
src/config/            ← EDIT ME: site, calculator (+ scheme rules), packages, personas, schemes, content
messages/              ← all text, English + Telugu
src/app/[locale]/      pages
src/app/api/leads/     lead endpoint (+ /called for "Mark as called")
src/app/api/cron/      1-hour follow-up reminders
src/components/        ui, layout, home sections, forms, calculator, cards, page parts
src/lib/               calculator maths, lead validation/tagging, analytics, SEO, server notify/store
automation/            Google Sheets Apps Script
supabase/schema.sql    leads table
archive/guide-v1/      previous "neutral guide" version of the site (not built)
```
