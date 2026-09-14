export default function AlertBadge({ value }) {
  const v = String(value).toLowerCase().replace('_', '-')
  const map = {
    ok: 'ok', warning: 'warning', critical: 'critical',
    idle: 'idle', delayed: 'delayed', on_time: 'on-time', 'on-time': 'on-time',
    high: 'high', medium: 'medium', low: 'low',
    active: 'delayed', inactive: 'on-time',
    'in_use': 'info', 'in-use': 'info',
  }
  const cls = map[v] || 'info'
  return <span className={`badge badge-${cls}`}>{value}</span>
}
