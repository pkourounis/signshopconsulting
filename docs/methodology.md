# Methodology — definitions, scoring, benchmarks

This is the reference for *why* the numbers say what they say. All of it is
editable in the sheet; the defaults below are sensible starting points for a
custom sign / wrap shop.

## 1. Inputs (what the owner types)

On the **Monthly Input** tab, one row per month:

| Field | Meaning |
|---|---|
| Total Revenue $ | Recognized revenue (income) for the month. The base for all % ratios. |
| Booked Sales $ | Value of orders booked (used for Average Sale). |
| Material / COGS $ | Direct materials cost (substrate, vinyl, ink, hardware). |
| Direct Labor $ | Production labor that goes onto jobs (fully burdened). |
| G&A / Overhead $ | Everything else: rent, admin, owner salary, software, etc. |
| # Leads | New inquiries received. |
| Prior-Yr # Leads | Same month last year (drives YoY lead growth). |
| Marketing Spend $ | Ad + marketing spend for the month. |
| # Ad Clicks | Paid clicks (drives Cost per Click). |
| # Estimates | Estimates/quotes produced. |
| # Orders | Jobs won. |
| # New Customers | First-time customers among the orders. |
| Signs & Wraps Sales $ | Revenue from core sign/wrap work. |
| Marketing Sales $ | Revenue attributable to marketing (drives ROAS). |
| Top Industry / Top Product | Free-text notes for the month. |

## 2. Derived metrics (auto-calculated)

All expense ratios use **Total Revenue** as the denominator (standard P&L
common-sizing), so the percentages are internally consistent and comparable
month to month.

| Metric | Formula |
|---|---|
| Gross Profit $ | Revenue − Material − Direct Labor |
| Gross Profit % | Gross Profit $ ÷ Revenue |
| Material % | Material ÷ Revenue |
| Labor % | Direct Labor ÷ Revenue |
| G&A % | G&A ÷ Revenue |
| Net Profit $ | Gross Profit $ − G&A |
| Net Profit % | Net Profit $ ÷ Revenue |
| Cost per Lead | Marketing Spend ÷ Leads |
| Cost per Click | Marketing Spend ÷ Clicks |
| Marketing % of Revenue | Marketing Spend ÷ Revenue |
| Estimate Rate | Estimates ÷ Leads |
| Close Rate | Orders ÷ Estimates |
| Average Sale | Booked Sales ÷ Orders |
| New Customer % | New Customers ÷ Orders |
| Lead Growth % (YoY) | (Leads − Prior-Yr Leads) ÷ Prior-Yr Leads |
| ROAS | Marketing Sales ÷ Marketing Spend |

## 3. Health Score

Each scored KPI gets a **0–100 sub-score** = how close the month is to its goal,
capped at 100:

- **Higher-is-better** (e.g. Gross Profit %, ROAS): `min(100, actual ÷ goal × 100)`
- **Lower-is-better** (e.g. Material %, Cost per Lead): `min(100, goal ÷ actual × 100)`

Pillar score = average of its KPI sub-scores. Overall score = weighted blend:

```
Overall = Profitability×0.40 + Sales×0.25 + Marketing×0.20 + Growth×0.15
```

Grades / status: **A** ≥ 90, **B** ≥ 80, **C** ≥ 70, **D** ≥ 60, else **F**.
Status chips: **GOOD** ≥ 80, **WATCH** 60–79, **LOW** < 60.

## 4. Default goals & industry benchmarks

Editable on the Dashboard (yellow **Your Goal** column). Benchmarks shown are
rules of thumb for custom sign/wrap shops — adjust to your market.

| KPI | Default goal | Industry range | Pillar | Better when |
|---|---|---|---|---|
| Gross Profit % | 50% | 45–55% | Profitability | higher |
| Net Profit % | 12% | 10–15% | Profitability | higher |
| Material / COGS % | 30% | 25–32% | Profitability | lower |
| Direct Labor % | 24% | 20–25% | Profitability | lower |
| G&A / Overhead % | 33% | 30–38% | Profitability | lower |
| Close Rate % | 65% | 60–70% | Sales | higher |
| Estimate Rate % | 70% | 65–80% | Sales | higher |
| Average Sale $ | $1,500 | shop-set | Sales | higher |
| Marketing % of Revenue | 5% | 3–6% | Marketing | lower |
| ROAS | 5.0x | 4–6x | Marketing | higher |
| Cost per Lead $ | $40 | $30–50 | Marketing | lower |
| Lead Growth % (YoY) | +10% | +10% | Growth | higher |
| Total Revenue $ | $175,000 | shop-set | Growth | higher |

## 5. Tuning notes

- If your shop is bigger/smaller, set **Total Revenue** and **Average Sale**
  goals to your reality first — they anchor the Growth and Sales pillars.
- "Lower is better" metrics are penalized only above goal, so beating the goal
  caps at 100 (you're not rewarded for, e.g., starving marketing to near-zero).
- Want a metric to matter more? It already does if it's in a heavier pillar —
  Profitability (40%) dominates by design, which is correct for an owner asking
  "is this business actually making money?"
