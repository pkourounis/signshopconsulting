import { useMemo } from 'react'
import { SHOPS } from '../lib/seed'
import { computeHealth } from '../lib/metrics'
import ShopCard from '../components/ShopCard'

export default function Portfolio() {
  const summary = useMemo(() => {
    const rows = SHOPS.map((s) => {
      const last = s.entries.length - 1
      const health = computeHealth(s, last)
      return { shop: s, health, revenue: s.entries[last].revenue }
    })
    const avg = Math.round(rows.reduce((a, r) => a + r.health.score, 0) / rows.length)
    const attention = rows.filter((r) => r.health.score < 70).length
    const revenue = rows.reduce((a, r) => a + r.revenue, 0)
    // worst first — the consultant should see who needs them most
    const sorted = [...rows].sort((a, b) => a.health.score - b.health.score)
    return { rows, sorted, avg, attention, revenue }
  }, [])

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h2>Client Portfolio</h2>
          <div className="lead">Health across every sign shop you advise — worst first, so you know where to spend your time.</div>
        </div>
      </div>

      <div className="stat-strip">
        <div className="card stat">
          <div className="k">Active shops</div>
          <div className="v">{SHOPS.length}</div>
          <div className="meta">under management</div>
        </div>
        <div className="card stat">
          <div className="k">Average health</div>
          <div className="v" style={{ color: summary.avg >= 80 ? 'var(--good)' : summary.avg >= 60 ? 'var(--warn)' : 'var(--bad)' }}>{summary.avg}</div>
          <div className="meta">portfolio score (0–100)</div>
        </div>
        <div className="card stat">
          <div className="k">Need attention</div>
          <div className="v" style={{ color: summary.attention ? 'var(--bad)' : 'var(--good)' }}>{summary.attention}</div>
          <div className="meta">scoring below 70</div>
        </div>
        <div className="card stat">
          <div className="k">Latest-month revenue</div>
          <div className="v">${Math.round(summary.revenue / 1000)}k</div>
          <div className="meta">across all shops</div>
        </div>
      </div>

      <div className="shop-grid">
        {summary.sorted.map(({ shop }) => <ShopCard key={shop.id} shop={shop} />)}
      </div>
    </div>
  )
}
