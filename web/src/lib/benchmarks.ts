import type { KpiDef, Pillar } from '../types'

export const PILLAR_WEIGHTS: Record<Pillar, number> = {
  Profitability: 0.40,
  Sales: 0.25,
  Marketing: 0.20,
  Growth: 0.15,
}

// Default goals + industry benchmarks for custom sign / wrap shops.
// Editable per shop in a later iteration; sensible starting points for now.
export const KPI_DEFS: KpiDef[] = [
  { key: 'gp',     label: 'Gross Profit %',        pillar: 'Profitability', goal: 0.50, benchmark: '45–55%', direction: 1,  format: 'percent',    metric: 'grossProfitPct' },
  { key: 'np',     label: 'Net Profit %',          pillar: 'Profitability', goal: 0.12, benchmark: '10–15%', direction: 1,  format: 'percent',    metric: 'netProfitPct' },
  { key: 'cogs',   label: 'Material / COGS %',     pillar: 'Profitability', goal: 0.30, benchmark: '25–32%', direction: -1, format: 'percent',    metric: 'materialPct' },
  { key: 'labor',  label: 'Direct Labor %',        pillar: 'Profitability', goal: 0.24, benchmark: '20–25%', direction: -1, format: 'percent',    metric: 'laborPct' },
  { key: 'ga',     label: 'G&A / Overhead %',      pillar: 'Profitability', goal: 0.33, benchmark: '30–38%', direction: -1, format: 'percent',    metric: 'overheadPct' },
  { key: 'close',  label: 'Close Rate %',          pillar: 'Sales',         goal: 0.65, benchmark: '60–70%', direction: 1,  format: 'percent',    metric: 'closeRate' },
  { key: 'est',    label: 'Estimate Rate %',       pillar: 'Sales',         goal: 0.70, benchmark: '65–80%', direction: 1,  format: 'percent',    metric: 'estimateRate' },
  { key: 'avg',    label: 'Average Sale',          pillar: 'Sales',         goal: 1500, benchmark: 'shop set',direction: 1,  format: 'currency',   metric: 'avgSale' },
  { key: 'mktpct', label: 'Marketing % of Revenue',pillar: 'Marketing',     goal: 0.05, benchmark: '3–6%',   direction: -1, format: 'percent',    metric: 'marketingPctRevenue' },
  { key: 'roas',   label: 'ROAS',                  pillar: 'Marketing',     goal: 5,    benchmark: '4–6x',   direction: 1,  format: 'multiplier', metric: 'roas' },
  { key: 'cpl',    label: 'Cost per Lead',         pillar: 'Marketing',     goal: 40,   benchmark: '$30–50', direction: -1, format: 'currency',   metric: 'costPerLead' },
  { key: 'lead',   label: 'Lead Growth % (YoY)',   pillar: 'Growth',        goal: 0.10, benchmark: '+10%',   direction: 1,  format: 'percent',    metric: 'leadGrowthPct' },
  { key: 'rev',    label: 'Total Revenue',         pillar: 'Growth',        goal: 175000,benchmark: 'shop set',direction: 1, format: 'currency',   metric: 'revenue' },
]

export const PILLARS: Pillar[] = ['Profitability', 'Sales', 'Marketing', 'Growth']
