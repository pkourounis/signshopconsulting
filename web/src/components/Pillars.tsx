import type { HealthResult } from '../types'
import { PILLARS, PILLAR_WEIGHTS } from '../lib/benchmarks'
import { scoreColor } from '../lib/format'

export default function Pillars({ health }: { health: HealthResult }) {
  return (
    <div className="pillar-grid">
      {PILLARS.map((p) => {
        const s = health.pillars[p]
        return (
          <div key={p} className="card pillar">
            <div className="p-name">
              <span>{p}</span>
              <span>{Math.round(PILLAR_WEIGHTS[p] * 100)}%</span>
            </div>
            <div className="p-score" style={{ color: scoreColor(s) }}>{s}</div>
            <div className="bar"><span style={{ width: `${s}%`, background: scoreColor(s) }} /></div>
          </div>
        )
      })}
    </div>
  )
}
