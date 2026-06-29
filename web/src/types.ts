// Core domain types. Designed so the seed data can later be swapped for a
// Supabase-backed API with the same shapes.

export interface MonthlyEntry {
  month: string            // 'January' ... 'December'
  revenue: number          // total recognized revenue $
  bookedSales: number      // value of orders booked $
  materialCost: number     // direct material / COGS $
  directLabor: number      // production labor $
  overhead: number         // G&A / overhead $
  leads: number
  priorYearLeads: number | null
  marketingSpend: number
  adClicks: number
  estimates: number
  orders: number
  newCustomers: number
  signsWrapsSales: number
  marketingSales: number
  topIndustry: string
  topProduct: string
}

export interface Shop {
  id: string
  name: string
  location: string
  owner: string
  entries: MonthlyEntry[]  // chronological, up to 12 months
}

export type Pillar = 'Profitability' | 'Sales' | 'Marketing' | 'Growth'

export type Direction = 1 | -1   // 1 = higher is better, -1 = lower is better

export interface KpiDef {
  key: string
  label: string
  pillar: Pillar
  goal: number
  benchmark: string        // industry range, human readable
  direction: Direction
  format: 'percent' | 'currency' | 'multiplier' | 'number'
  // pulls the metric value for an entry's computed metrics
  metric: keyof ComputedMetrics
}

export interface ComputedMetrics {
  grossProfit: number
  grossProfitPct: number
  materialPct: number
  laborPct: number
  overheadPct: number
  netProfit: number
  netProfitPct: number
  costPerLead: number
  costPerClick: number
  marketingPctRevenue: number
  estimateRate: number
  closeRate: number
  avgSale: number
  newCustomerPct: number
  leadGrowthPct: number | null
  roas: number
  revenue: number
}

export interface KpiResult {
  def: KpiDef
  value: number | null
  score: number            // 0-100
  status: 'GOOD' | 'WATCH' | 'LOW'
  trend: (number | null)[] // 12-month series of the metric
}

export interface HealthResult {
  score: number            // 0-100
  grade: string            // A-F
  label: string            // GOING GREAT / TRENDING / NEEDS ATTENTION
  pillars: Record<Pillar, number>
  kpis: KpiResult[]
  actions: string[]
}
