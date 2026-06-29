# Sign Shop Consulting — CEO Dashboard (v2)

A self-calculating **"how healthy is my sign shop?"** dashboard for Google Sheets,
built for sign / wrap shop owners. The owner types raw numbers on one tab; the
dashboard turns them into a single **Health Score**, a letter grade, 12-month
**trend sparklines**, **benchmark** comparisons, and an auto-generated
**"What To Do Next"** list.

It's a big upgrade over the original flat monthly scorecard: that sheet held the
data but never answered *"am I winning, which way am I trending, and what should
I fix first?"* This one does.

---

## What it shows

**Top of the Dashboard — "Am I winning?"**
- **Overall Health Score (0–100)** + **A–F grade** + Red/Yellow/Green status.
- Four **pillar scores** that roll up into it:
  | Pillar | Weight | What it measures |
  |---|---|---|
  | Profitability | 40% | Gross margin, net margin, material %, labor %, overhead % |
  | Sales | 25% | Close rate, estimate rate, average sale |
  | Marketing | 20% | Marketing % of revenue, ROAS, cost per lead |
  | Growth | 15% | Lead growth (YoY), revenue vs goal |

**KPI table — every metric, three ways**
- **This Month** vs **Your Goal** (editable) vs **Industry range** (sign-shop rules of thumb).
- A **status** chip (GOOD / WATCH / LOW) and a **12-month sparkline** for trajectory.

**"What To Do Next"**
- Plain-English priorities that appear only when something is off target
  (e.g. *"Net profit 4.4% is below your 12% target — review overhead, pricing and shop rate."*).
  Perfect to drive the monthly consulting call.

---

## Install (one time, ~2 minutes)

1. Open a blank Google Sheet → [sheets.new](https://sheets.new).
2. **Extensions ▸ Apps Script**.
3. Delete the starter code, paste the entire contents of
   [`apps-script/Code.gs`](apps-script/Code.gs), and **Save**.
4. Run the function **`buildDashboard`** once (click **Run**, authorize when asked).
5. Reload the sheet. You'll have five tabs and a new **📊 Dashboard** menu.

Then, from the **📊 Dashboard** menu:
- **Load sample data (12 months)** — see it fully working with realistic numbers.
- **Clear all data** — wipe the sample and enter your own.

---

## How you use it each month

1. On **Monthly Input**, fill the **yellow cells** for the month (only the yellow
   cells need typing).
2. Open **Dashboard**, pick the month at the top — score, KPIs, trends and actions
   all update.
3. Adjust any target in the yellow **Your Goal** column to fit your shop/market.

The **Metrics** tab does all the ratio math automatically — you never touch it.

---

## Tabs

| Tab | Purpose |
|---|---|
| **Dashboard** | The owner view: health score, pillars, KPI table, actions. |
| **Monthly Input** | The only tab you type into. One row per month. |
| **Metrics** | Auto-calculated ratios feeding the dashboard. |
| **Call Log** | Log of consulting calls, notes, and commitments. |
| **Read Me** | In-sheet quick reference. |

---

## One shop now, many shops later

Today this is **one file = one shop** (there's a Shop name field on the
Dashboard). To run a second client, **make a copy of the file** and change the
name — same structure, separate data. The data model (a flat monthly input
table + a derived metrics table) is intentionally simple so it migrates cleanly
into a true multi-tenant tool (e.g. a web app on Supabase) when you're ready.

See [`docs/methodology.md`](docs/methodology.md) for exact metric definitions,
the scoring math, and the default benchmark targets.

---

## Files

```
apps-script/
  Code.gs            # the whole builder — paste this into Apps Script
  appsscript.json    # Apps Script manifest
docs/
  methodology.md     # metric definitions, scoring, benchmarks
templates/
  monthly-input-template.csv   # the input columns, for reference / bulk paste
```
