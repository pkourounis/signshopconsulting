import { gradeOf } from '../lib/metrics'
import { scoreColor } from '../lib/format'

interface Props { score: number; size?: number; showGrade?: boolean; thickness?: number }

export default function HealthRing({ score, size = 92, showGrade = true, thickness = 9 }: Props) {
  const r = (size - thickness) / 2
  const c = 2 * Math.PI * r
  const pct = Math.max(0, Math.min(100, score)) / 100
  const color = scoreColor(score)
  return (
    <div className="ring-wrap" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-2)" strokeWidth={thickness} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={thickness}
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="num">
        <div className="score" style={{ fontSize: size * 0.34, color }}>{score}</div>
        {showGrade && <div className="grade">GRADE {gradeOf(score)}</div>}
      </div>
    </div>
  )
}
