import { Link } from 'react-router-dom'
import type { Shop } from '../types'
import { computeHealth } from '../lib/metrics'
import { scoreColor } from '../lib/format'
import HealthRing from './HealthRing'
import { Sparkline } from './Charts'

export default function ShopCard({ shop }: { shop: Shop }) {
  const last = shop.entries.length - 1
  const health = computeHealth(shop, last)
  const revTrend = shop.entries.map((e) => e.revenue)
  const topAction = health.actions[0]
  return (
    <Link to={`/shop/${shop.id}`} className="card shop-card">
      <div className="head">
        <HealthRing score={health.score} size={64} thickness={7} showGrade={false} />
        <div>
          <div className="name">{shop.name}</div>
          <div className="loc">{shop.location}</div>
          <div style={{ marginTop: 6 }}>
            <span className={`chip ${health.label === 'GOING GREAT' ? 'good' : health.label === 'TRENDING' ? 'warn' : 'bad'}`}>
              {health.label}
            </span>
          </div>
        </div>
      </div>

      <Sparkline data={revTrend} color={scoreColor(health.score)} width={244} height={36} />

      <div className="alert">
        {topAction
          ? <><strong>Top priority:</strong> {topAction}</>
          : <><strong>On track:</strong> all key metrics at or above target.</>}
      </div>

      <div className="foot">
        <span>{shop.owner}</span>
        <span>Open dashboard →</span>
      </div>
    </Link>
  )
}
