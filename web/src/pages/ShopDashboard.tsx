import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getShop } from '../lib/seed'
import { computeHealth, computeMetrics } from '../lib/metrics'
import { MONTHS, scoreHex } from '../lib/format'
import HealthRing from '../components/HealthRing'
import Pillars from '../components/Pillars'
import KpiTable from '../components/KpiTable'
import Actions from '../components/Actions'
import { TrendChart } from '../components/Charts'

export default function ShopDashboard() {
  const { id } = useParams()
  const shop = id ? getShop(id) : undefined
  const lastIdx = shop ? shop.entries.length - 1 : 0
  const [monthIdx, setMonthIdx] = useState(lastIdx)

  const health = useMemo(() => (shop ? computeHealth(shop, monthIdx) : null), [shop, monthIdx])

  if (!shop || !health) {
    return (
      <div className="page">
        <Link to="/" className="back">← Back to portfolio</Link>
        <p style={{ marginTop: 16 }}>Shop not found.</p>
      </div>
    )
  }

  const metrics = shop.entries.map(computeMetrics)
  const revSeries = shop.entries.map((e) => e.revenue)
  const netSeries = metrics.map((m) => m.netProfitPct)
  const leadSeries = shop.entries.map((e) => e.leads)
  const usd = (n: number) => `$${Math.round(n / 1000)}k`
  const pctFmt = (n: number) => `${Math.round(n * 100)}%`
  const num = (n: number) => `${Math.round(n)}`

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <Link to="/" className="back">← Portfolio</Link>
          <h2 style={{ marginTop: 6 }}>{shop.name}</h2>
          <div className="lead">{shop.location} · Owner {shop.owner}</div>
        </div>
        <label className="row">
          <span className="muted" style={{ fontSize: 13 }}>Month</span>
          <select className="month-select" value={monthIdx} onChange={(e) => setMonthIdx(Number(e.target.value))}>
            {shop.entries.map((e, i) => <option key={e.month} value={i}>{MONTHS[i]}</option>)}
          </select>
        </label>
      </div>

      <div className="stack">
        {/* Hero */}
        <div className="card hero">
          <HealthRing score={health.score} size={170} thickness={14} />
          <div>
            <div className="head-label">Overall shop health · {MONTHS[monthIdx]}</div>
            <div className="grade-line">Grade {health.grade}</div>
            <div className="status-line">
              <span className={`chip ${health.label === 'GOING GREAT' ? 'good' : health.label === 'TRENDING' ? 'warn' : 'bad'}`}>
                ● {health.label}
              </span>
            </div>
            <div className="blurb">
              Blends Profitability (40%), Sales (25%), Marketing (20%) and Growth (15%) against this shop’s
              goals. A score of 100 means every KPI is at target.
            </div>
          </div>
        </div>

        {/* Pillars */}
        <Pillars health={health} />

        {/* KPI table + actions */}
        <div className="grid-2">
          <div className="card card-pad">
            <div className="section-title">Key metrics — {MONTHS[monthIdx]}</div>
            <KpiTable kpis={health.kpis} />
          </div>
          <div className="card card-pad">
            <div className="section-title">What to do next</div>
            <Actions actions={health.actions} />
          </div>
        </div>

        {/* Trends */}
        <div className="grid-2" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <div className="card card-pad">
            <div className="between" style={{ marginBottom: 8 }}>
              <div className="section-title" style={{ margin: 0 }}>Revenue trend</div>
            </div>
            <TrendChart data={revSeries} color="#2f6df6" format={usd} />
          </div>
          <div className="card card-pad">
            <div className="section-title" style={{ marginBottom: 8 }}>Net profit % trend</div>
            <TrendChart data={netSeries} color={scoreHex(health.pillars.Profitability)} format={pctFmt} />
          </div>
        </div>

        <div className="card card-pad">
          <div className="section-title" style={{ marginBottom: 8 }}>Lead volume trend</div>
          <TrendChart data={leadSeries} color="#7b61ff" format={num} />
        </div>

        <div className="banner">
          Demo data shown. Next step: client logins so each owner enters their own numbers, with everything
          saving to your account and rolling up to this portfolio automatically.
        </div>
      </div>
    </div>
  )
}
