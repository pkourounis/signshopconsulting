import type { KpiResult } from '../types'
import { formatGoal, formatValue, scoreColor, statusClass } from '../lib/format'
import { Sparkline } from './Charts'

export default function KpiTable({ kpis }: { kpis: KpiResult[] }) {
  return (
    <table className="kpi-table">
      <thead>
        <tr>
          <th>KPI</th>
          <th>This Month</th>
          <th>Goal</th>
          <th>Industry</th>
          <th>Status</th>
          <th>12-Month Trend</th>
        </tr>
      </thead>
      <tbody>
        {kpis.map((k) => (
          <tr key={k.def.key}>
            <td>
              <div className="name">{k.def.label}</div>
              <div className="pillar-tag">{k.def.pillar}</div>
            </td>
            <td className="val">{formatValue(k)}</td>
            <td className="muted">{formatGoal(k)}</td>
            <td className="muted">{k.def.benchmark}</td>
            <td><span className={`chip ${statusClass(k.status)}`}>{k.status}</span></td>
            <td className="spark"><Sparkline data={k.trend} color={scoreColor(k.score)} /></td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
