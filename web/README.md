# Sign Shop Consulting — CEO Dashboard (web app)

A real web dashboard for sign-shop performance. Each client shop has its own
live dashboard (health score, KPIs, trends, action list), and everything rolls
up to a **master Portfolio view** for the consultant.

## Stack
- **React + TypeScript + Vite**
- **Recharts** for trend charts and sparklines
- **React Router** for the portfolio ↔ shop views
- Pure-CSS design system (no UI framework) in `src/index.css`

## Run locally
```bash
cd web
npm install
npm run dev      # http://localhost:5173
npm run build    # production build to web/dist
npm run preview  # serve the production build
```

## Structure
```
src/
  types.ts              # domain types (Shop, MonthlyEntry, metrics…)
  lib/
    benchmarks.ts       # KPI definitions, goals, industry ranges, pillar weights
    metrics.ts          # metric + health-score + action-list engine
    seed.ts             # demo portfolio (4 shops × 12 months)
    format.ts           # value/goal formatting + color helpers
  components/           # HealthRing, Charts, KpiTable, Pillars, Actions, ShopCard
  pages/
    Portfolio.tsx       # master roll-up: every shop, worst-first
    ShopDashboard.tsx   # single shop: hero score, pillars, KPIs, trends, actions
```

## How the score works
Identical methodology to `../docs/methodology.md`: each KPI scores 0–100 vs its
goal (lower-is-better metrics invert), pillars average their KPIs, and the
overall health score weights Profitability 40% / Sales 25% / Marketing 20% /
Growth 15%.

## Status & roadmap
This iteration runs on **seeded demo data** with a clean data layer
(`lib/seed.ts`) so the UX is real and reviewable. Next:
1. **Supabase** — Postgres tables for shops + monthly entries, swap `seed.ts`
   for API calls (types already match).
2. **Auth** — consultant (master) login + per-shop client logins; clients enter
   their own numbers, which roll up to the portfolio automatically.
3. **Editing** — in-app monthly data entry and editable per-shop goals.
