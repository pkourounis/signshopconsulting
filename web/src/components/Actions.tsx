export default function Actions({ actions }: { actions: string[] }) {
  if (actions.length === 0) {
    return (
      <div className="actions">
        <div className="action win">
          <span className="ic">✓</span>
          <span>Every key metric is at or above target this month — keep doing what you’re doing.</span>
        </div>
      </div>
    )
  }
  return (
    <div className="actions">
      {actions.map((a, i) => (
        <div className="action" key={i}>
          <span className="ic">{i + 1}</span>
          <span>{a}</span>
        </div>
      ))}
    </div>
  )
}
