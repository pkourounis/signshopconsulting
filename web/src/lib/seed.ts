import type { MonthlyEntry, Shop } from '../types'
import { MONTHS } from './format'

// A shop "profile" describes its central monthly economics; gen() expands it
// into 12 coherent months with mild seasonality so charts look real.
interface Profile {
  id: string
  name: string
  location: string
  owner: string
  rev: number
  cogsPct: number
  laborPct: number
  gaPct: number
  leads: number
  estRate: number     // estimates / leads
  closeRate: number   // orders / estimates
  cpl: number
  roas: number
  avgSale: number
  newCustPct: number
  leadGrowth: number
  industries: string[]
  products: string[]
}

const SEASON = [0.82, 0.88, 1.12, 1.18, 1.04, 1.06, 0.92, 1.0, 0.94, 1.02, 1.08, 1.0]
const wobble = (i: number, phase: number) => 1 + 0.035 * Math.sin(i * 1.3 + phase)

function gen(p: Profile): MonthlyEntry[] {
  const entries: MonthlyEntry[] = []
  for (let i = 0; i < 12; i++) {
    const revMul = SEASON[i] * wobble(i, p.rev % 7)
    const leadMul = SEASON[(i + 2) % 12] * wobble(i, p.leads % 5)
    const revenue = Math.round(p.rev * revMul)
    const leads = Math.round(p.leads * leadMul)
    const estimates = Math.round(leads * p.estRate * wobble(i, 1.1))
    const orders = Math.round(estimates * p.closeRate * wobble(i, 2.2))
    const marketingSpend = Math.round(p.cpl * leads)
    const cpc = p.cpl * 1.8
    entries.push({
      month: MONTHS[i],
      revenue,
      bookedSales: Math.round(p.avgSale * orders),
      materialCost: Math.round(revenue * p.cogsPct * wobble(i, 0.5)),
      directLabor: Math.round(revenue * p.laborPct * wobble(i, 3.1)),
      overhead: Math.round(revenue * p.gaPct * wobble(i, 1.7)),
      leads,
      priorYearLeads: i === 0 ? null : Math.round(leads / (1 + p.leadGrowth)),
      marketingSpend,
      adClicks: Math.round(marketingSpend / cpc),
      estimates,
      orders,
      newCustomers: Math.round(orders * p.newCustPct),
      signsWrapsSales: Math.round(revenue * 0.82),
      marketingSales: Math.round(p.roas * marketingSpend),
      topIndustry: p.industries[i % p.industries.length],
      topProduct: p.products[i % p.products.length],
    })
  }
  return entries
}

const PROFILES: Profile[] = [
  {
    id: 'summit', name: 'Summit Sign Co.', location: 'Denver, CO', owner: 'Dana Reyes',
    rev: 212000, cogsPct: 0.26, laborPct: 0.20, gaPct: 0.30, leads: 240, estRate: 0.76,
    closeRate: 0.72, cpl: 32, roas: 6.0, avgSale: 1850, newCustPct: 0.82, leadGrowth: 0.18,
    industries: ['Healthcare', 'Professional Services', 'Real Estate'], products: ['Vehicle Wraps', 'Channel Letters', 'Monument Signs'],
  },
  {
    id: 'precision', name: 'Precision Signs & Graphics', location: 'Austin, TX', owner: 'Marcus Hall',
    rev: 175000, cogsPct: 0.30, laborPct: 0.23, gaPct: 0.33, leads: 190, estRate: 0.72,
    closeRate: 0.66, cpl: 40, roas: 5.0, avgSale: 1500, newCustPct: 0.85, leadGrowth: 0.10,
    industries: ['Service Business', 'Healthcare', 'Faith-based'], products: ['Vinyl', 'Installation', 'Custom Work'],
  },
  {
    id: 'riverside', name: 'Riverside Signworks', location: 'Portland, OR', owner: 'Priya Nair',
    rev: 132000, cogsPct: 0.33, laborPct: 0.26, gaPct: 0.36, leads: 150, estRate: 0.66,
    closeRate: 0.58, cpl: 52, roas: 3.8, avgSale: 1300, newCustPct: 0.88, leadGrowth: 0.03,
    industries: ['Service Business', 'Beauty', 'Hospitality'], products: ['Banners', 'Labor', 'Window Graphics'],
  },
  {
    id: 'gateway', name: 'Gateway Wraps', location: 'Tampa, FL', owner: 'Eli Brooks',
    rev: 96000, cogsPct: 0.36, laborPct: 0.29, gaPct: 0.38, leads: 120, estRate: 0.60,
    closeRate: 0.50, cpl: 66, roas: 2.8, avgSale: 1100, newCustPct: 0.9, leadGrowth: -0.15,
    industries: ['Service Business', 'Automotive', 'Retail'], products: ['Vehicle Wraps', 'Decals', 'Yard Signs'],
  },
]

export const SHOPS: Shop[] = PROFILES.map((p) => ({
  id: p.id, name: p.name, location: p.location, owner: p.owner, entries: gen(p),
}))

export const getShop = (id: string): Shop | undefined => SHOPS.find((s) => s.id === id)
