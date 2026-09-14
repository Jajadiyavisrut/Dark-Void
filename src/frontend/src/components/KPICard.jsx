export default function KPICard({ label, value, sub, variant = 'accent' }) {
  return (
    <div className={`kpi-card ${variant}`}>
      <span className="kpi-label">{label}</span>
      <span className="kpi-value">{value ?? '—'}</span>
      {sub && <span className="kpi-sub">{sub}</span>}
    </div>
  )
}
