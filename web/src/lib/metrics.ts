import type {
  ComputedMetrics, HealthResult, KpiResult, MonthlyEntry, Pillar, Shop,
} from '../types'
import { KPI_DEFS, PILLARS, PILLAR_WEIGHTS } from './benchmarks'

const safe = (n: number, d: number): number => (d === 0 ? 0 : n / d)

export function computeMetrics(e: MonthlyEntry): ComputedMetrics {
  const grossProfit = e.revenue - e.materialCost - e.directLabor
  const netProfit = grossProfit - e.overhead
  return {
    grossProfit,
    grossProfitPct: safe(grossProfit, e.revenue),
    materialPct: safe(e.materialCost, e.revenue),
    laborPct: safe(e.directLabor, e.revenue),
    overheadPct: safe(e.overhead, e.revenue),
    netProfit,
    netProfitPct: safe(netProfit, e.revenue),
    costPerLead: safe(e.marketingSpend, e.leads),
    costPerClick: safe(e.marketingSpend, e.adClicks),
    marketingPctRevenue: safe(e.marketingSpend, e.revenue),
    estimateRate: safe(e.estimates, e.leads),
    closeRate: safe(e.orders, e.estimates),
    avgSale: safe(e.bookedSales, e.orders),
    newCustomerPct: safe(e.newCustomers, e.orders),
    leadGrowthPct: e.priorYearLeads ? (e.leads - e.priorYearLeads) / e.priorYearLeads : null,
    roas: safe(e.marketingSales, e.marketingSpend),
    revenue: e.revenue,
  }
}

function scoreOf(value: number | null, goal: number, direction: 1 | -1): number {
  if (value === null || !isFinite(value)) return 0
  if (goal === 0) return 0
  const raw = direction === 1 ? value / goal : goal / value
  return Math.max(0, Math.min(100, Math.round(raw * 100)))
}

function statusOf(score: number): 'GOOD' | 'WATCH' | 'LOW' {
  return score >= 80 ? 'GOOD' : score >= 60 ? 'WATCH' : 'LOW'
}

/** Compute the full health picture for a shop at a given month index. */
export function computeHealth(shop: Shop, monthIndex: number): HealthResult {
  const series = shop.entries.map(computeMetrics)
  const current = series[monthIndex]

  const kpis: KpiResult[] = KPI_DEFS.map((def) => {
    const value = current ? (current[def.metric] as number | null) : null
    const score = scoreOf(value, def.goal, def.direction)
    const trend = series.map((m) => m[def.metric] as number | null)
    return { def, value, score, status: statusOf(score), trend }
  })

  const pillars = {} as Record<Pillar, number>
  for (const p of PILLARS) {
    const inPillar = kpis.filter((k) => k.def.pillar === p)
    pillars[p] = inPillar.length
      ? Math.round(inPillar.reduce((s, k) => s + k.score, 0) / inPillar.length)
      : 0
  }

  const score = Math.round(
    PILLARS.reduce((s, p) => s + pillars[p] * PILLAR_WEIGHTS[p], 0),
  )

  return {
    score,
    grade: gradeOf(score),
    label: score >= 80 ? 'GOING GREAT' : score >= 60 ? 'TRENDING' : 'NEEDS ATTENTION',
    pillars,
    kpis,
    actions: buildActions(kpis),
  }
}

export function gradeOf(score: number): string {
  return score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : score >= 60 ? 'D' : 'F'
}

const pct = (n: number) => `${(n * 100).toFixed(1)}%`
const usd = (n: number) => `$${Math.round(n).toLocaleString()}`

function buildActions(kpis: KpiResult[]): string[] {
  const by = (key: string) => kpis.find((k) => k.def.key === key)!
  const out: string[] = []
  const v = (k: KpiResult) => k.value ?? 0
  const has = (k: KpiResult) => k.value !== null

  const np = by('np'), gp = by('gp'), cogs = by('cogs'), labor = by('labor'),
    ga = by('ga'), close = by('close'), cpl = by('cpl'), roas = by('roas'),
    lead = by('lead'), mkt = by('mktpct')

  if (has(np) && v(np) < np.def.goal)
    out.push(`Net profit ${pct(v(np))} is below the ${pct(np.def.goal)} target — review overhead, pricing and shop rate.`)
  if (has(gp) && v(gp) < gp.def.goal)
    out.push(`Gross margin ${pct(v(gp))} is under ${pct(gp.def.goal)} — check material waste, job costing and quoting accuracy.`)
  if (has(cogs) && v(cogs) > cogs.def.goal)
    out.push(`Material cost ${pct(v(cogs))} exceeds the ${pct(cogs.def.goal)} target — re-quote suppliers and cut scrap.`)
  if (has(labor) && v(labor) > labor.def.goal)
    out.push(`Direct labor ${pct(v(labor))} is high vs ${pct(labor.def.goal)} — tighten scheduling and production efficiency.`)
  if (has(ga) && v(ga) > ga.def.goal)
    out.push(`Overhead ${pct(v(ga))} is above ${pct(ga.def.goal)} — every fixed cost should earn its keep.`)
  if (has(close) && v(close) < close.def.goal)
    out.push(`Close rate ${pct(v(close))} is below ${pct(close.def.goal)} — add estimate follow-up within 48 hours.`)
  if (has(cpl) && v(cpl) > cpl.def.goal)
    out.push(`Cost per lead ${usd(v(cpl))} is above ${usd(cpl.def.goal)} — review ad targeting and channel mix.`)
  if (has(roas) && v(roas) < roas.def.goal)
    out.push(`ROAS ${v(roas).toFixed(1)}x is under ${roas.def.goal.toFixed(1)}x — shift spend to best-performing channels.`)
  if (has(lead) && v(lead) < lead.def.goal)
    out.push(`Lead growth ${pct(v(lead))} is below the ${pct(lead.def.goal)} goal — invest in referrals and marketing.`)
  if (has(mkt) && v(mkt) > mkt.def.goal * 1.5)
    out.push(`Marketing is ${pct(v(mkt))} of revenue (>1.5× target) — make sure that spend is converting.`)

  return out
}
