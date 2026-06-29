import type { KpiResult } from '../types'

export function formatValue(k: KpiResult): string {
  if (k.value === null || !isFinite(k.value)) return '—'
  switch (k.def.format) {
    case 'percent':    return `${(k.value * 100).toFixed(1)}%`
    case 'currency':   return `$${Math.round(k.value).toLocaleString()}`
    case 'multiplier': return `${k.value.toFixed(1)}x`
    default:           return Math.round(k.value).toLocaleString()
  }
}

export function formatGoal(k: KpiResult): string {
  const g = k.def.goal
  switch (k.def.format) {
    case 'percent':    return `${Math.round(g * 100)}%`
    case 'currency':   return `$${g.toLocaleString()}`
    case 'multiplier': return `${g.toFixed(1)}x`
    default:           return g.toLocaleString()
  }
}

export const scoreColor = (s: number): string =>
  s >= 80 ? 'var(--good)' : s >= 60 ? 'var(--warn)' : 'var(--bad)'

// hex equivalents — needed where the color feeds an SVG gradient (charts)
export const scoreHex = (s: number): string =>
  s >= 80 ? '#16a36a' : s >= 60 ? '#c98a12' : '#d64545'

export const statusClass = (s: 'GOOD' | 'WATCH' | 'LOW'): string =>
  s === 'GOOD' ? 'good' : s === 'WATCH' ? 'warn' : 'bad'

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
