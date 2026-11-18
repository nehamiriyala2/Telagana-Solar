# Telangana Solar

A bilingual (English / Telugu) guide that helps people in Telangana choose, cost, fund and buy solar: homes, apartments, farmers and small businesses. Hyderabad first, all 33 districts included.

> **Status: Stage 1 (design system) + Stage 2 (MVP) built.**
> All costs, tariffs, subsidy amounts and installer listings in `src/data` are **placeholders marked `verified: false`**. The UI shows a "Needs verification" badge until they are checked and updated.

## Quick start

```bash
npm install
cp .env.example .env.local   # all keys optional
npm run dev                  # http://localhost:3000  (Telugu at /te)
npm run build && npm start   # production
```

| Variable | Needed for | Without it |
|---|---|---|
| `ANTHROPIC_API_KEY` | "Solar Mitra" AI assistant (Claude) | Falls back to an offline rule-based answer from the same Finder engine |
| `ANTHROPIC_MODEL` | Override assistant model | Uses `claude-opus-5-5` |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Live map on /installers | Shows a stylised preview map |
| `NEXT_PUBLIC_SUPABASE_URL` / `_ANON_KEY` | Editable data from the database | Reads typed seed files in `src/data` |
| `NEXT_PUBLIC_SITE_URL` | Canonical URLs, sitemap | `http://localhost:3000` |

## Stack

Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · shadcn-style components (Radix + cva) · Framer Motion · GSAP ScrollTrigger · Lenis · Recharts · next-intl · Supabase · Google Maps (`@vis.gl/react-google-maps`) · Anthropic SDK.

## Folder structure

```
messages/                 en.json, te.json: every piece of UI copy
public/images/            drop generated renders here (see list below)
public/frames/            scroll image sequence for "How solar works"
supabase/schema.sql       content store, history, leads, RLS
src/
  app/
    [locale]/             home, finder, what-can-solar-run, bill-calculator, schemes, installers
    api/assistant/        Claude assistant route (tool: recommend_solar)
    globals.css           DESIGN TOKENS (CSS variables + Tailwind @theme)
  components/
    ui/                   Button, Card, Badge, Slider, Progress, Skeleton, ChoiceChips, SectionHeading
    motion/               SmoothScroll (Lenis+GSAP), Reveal, Magnetic, TiltCard, CountUp
    layout/               Header, Footer, Logo, AssistantBubble
    home/                 Hero, CategoryCards, HowSolarWorks, SavingsHighlights, TrustBadges/FAQ
    finder/               FinderWizard, FinderResultView
    tools/                ApplianceCalculator, BillCalculator, SchemeExplorer, InstallerLocator, InstallerCard
    illustrations/        Coded SVG skyline + energy-flow diagram (placeholders for renders)
  data/                   SEED DATA: districts, appliances, schemes, installers, tariffs + assumptions
  lib/
    solar/engine.ts       All calculations (single source of truth)
    solar/assistant.ts    Text parsing + offline answers
    data/repository.ts    Supabase-or-seed data access
    assets.ts             Image/frame manifest (flip `ready: true` when files exist)
```

## Design tokens

Defined once in `src/app/globals.css` as Tailwind v4 `@theme` values, so each is both a CSS variable and a utility class (`bg-navy`, `text-gold`, `rounded-card`, `shadow-glow`, `text-h2`, `ease-out-soft`…).

- **Colour (60/30/10):** navy `#0B1B3A`, sun gradient `#FFB800 → #FF8A00`, off-white `#FAF8F3`, savings green `#2FBF71` (savings numbers only). On light backgrounds green text uses `#187A45` to pass WCAG AA.
- **Type:** Plus Jakarta Sans 700/800 (headings, −2% tracking), Inter 400/500 (body), Noto Sans Telugu (Telugu, line-height 1.7, switched automatically on `/te`).
- **Scale:** hero 72/80 (mobile 40/44), H2 48, H3 32, H4 24, body 18 (mobile 16), caption 14.
- **Layout:** 8px grid, sections 120px desktop / 64px mobile, max width 1200px.
- **Motion:** ease-out `cubic-bezier(.22,1,.36,1)`, 300–600ms. All motion respects `prefers-reduced-motion`.
- **Charts:** `--chart-1/2` validated for colour-blind separation in light and dark.

## Calculation logic (`src/lib/solar/engine.ts`)

- Bill → units: inverse of Telangana's telescopic slab tariff (slab group chosen by total units).
- System kW = units/day ÷ (sun hours × performance ratio), rounded up. Defaults 4.5 h × 0.8.
- Roof ≈ 100 sq ft per kW. Appliances: units/day = W × qty × h ÷ 1000.
- Recommendation: frequent cuts → hybrid + battery; remote → off-grid; reliable/occasional → on-grid + net metering; apartment → shared rooftop via RWA (capped 3 kW share); farmer → pumpset sized by HP (PM-KUSUM); business → commercial on-grid (hybrid if frequent cuts).
- Subsidy from each scheme's rule in data (`per-kw-tiers` with cap, or `percent-of-cost`).
- 25-year projection with tariff escalation and panel degradation; payback interpolated.

## Images to generate

Style for all: premium 3D render, soft golden-hour light, navy + gold palette, clean background, ultra-detailed. Export WebP (and AVIF if you like) at 1x and `@2x`. Hero < 300 KB, others < 150 KB. Then set `ready: true` in `src/lib/assets.ts`.

| File | Prompt idea |
|---|---|
| `public/images/hero-skyline.webp` (1920×1080) | Hyderabad skyline at sunrise, rooftop solar panels glinting, sun rising behind, navy silhouettes, gold sky |
| `panel-exploded.webp` | Exploded view of a solar panel: glass, EVA, cells, backsheet, frame |
| `rooftop-system.webp` | Rooftop system diagram: panels → inverter → net meter → home → grid |
| `rural-home.webp` | Telangana village home with panels on a tiled roof |
| `farm-pumpset.webp` | Farm field with solar array powering a water pump, water flowing into a channel |
| `apartment-rooftop.webp` | Apartment block with panels across the common roof |
| `schemes-illustration.webp`, `installer-illustration.webp` | Matching illustrations for schemes and installers |
| `how-solar-works-static.webp` | Static fallback for the scroll section |
| `og-default.webp` (1200×630) | Social share card |
| `public/frames/f_0001.webp … f_0200.webp` (16:9) | ~200-frame product-video sequence: sun → panels (DC) → inverter (AC) → net meter → appliances → grid |
| `public/frames/mobile/f_0001.webp … f_0080.webp` | ~80 narrower frames for phones |

Icons use the Lucide line set throughout.

## Build stages

1. ✅ Design system + component library
2. ✅ MVP: Home, Solar Finder, What Can Solar Run, Bill Calculator, Schemes, Installer Locator, AI assistant
3. ⏳ Solar Types, Buying Guide (+ PDF checklist), Get a Quote (leads → installer + WhatsApp), **Admin panel**
4. ⏳ Resources, About, Careers, Contact + Legal, district-level installer coverage
