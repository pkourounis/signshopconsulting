import {
  Area, AreaChart, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import { MONTHS } from '../lib/format'

/** Tiny inline sparkline for KPI rows and shop cards. */
export function Sparkline({ data, color = 'var(--brand)', height = 30, width = 120 }:
  { data: (number | null)[]; color?: string; height?: number; width?: number }) {
  const rows = data.map((v, i) => ({ i, v: v ?? null }))
  return (
    <LineChart width={width} height={height} data={rows} margin={{ top: 3, bottom: 3, left: 0, right: 0 }}>
      <Line type="monotone" dataKey="v" stroke={color} strokeWidth={2} dot={false} isAnimationActive={false} connectNulls />
    </LineChart>
  )
}

/** Full-width trend chart used on the shop dashboard. */
export function TrendChart({ data, color = '#2f6df6', format }:
  { data: (number | null)[]; color?: string; format: (n: number) => string }) {
  const rows = data.map((v, i) => ({ month: MONTHS[i].slice(0, 3), v: v ?? null }))
  const gid = 'grad-' + color.replace(/[^a-z0-9]/gi, '')
  return (
    <ResponsiveContainer width="100%" height={210}>
      <AreaChart data={rows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.28} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#5b6982' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#5b6982' }} axisLine={false} tickLine={false} width={54}
          tickFormatter={(n) => format(n as number)} />
        <Tooltip
          formatter={(n) => [format(n as number), '']}
          contentStyle={{ borderRadius: 12, border: '1px solid #e6eaf2', fontSize: 12, boxShadow: '0 8px 24px rgba(16,33,70,.12)' }}
          labelStyle={{ color: '#5b6982', fontWeight: 600 }}
        />
        <Area type="monotone" dataKey="v" stroke={color} strokeWidth={2.5} fill={`url(#${gid})`} isAnimationActive={false} connectNulls />
      </AreaChart>
    </ResponsiveContainer>
  )
}
