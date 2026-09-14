import { useEffect, useState } from 'react'
import { getColdChainAlerts } from '../api/client'
import KPICard from '../components/KPICard'
import AlertBadge from '../components/AlertBadge'

export default function ColdChain() {
  const [alerts,  setAlerts]  = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    getColdChainAlerts()
      .then(setAlerts)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="state-msg">Loading…</p>
  if (error)   return <p className="state-msg" style={{color:'var(--danger)'}}>Error: {error}</p>

  const critical = alerts.filter(a => a.severity === 'CRITICAL')
  const warnings  = alerts.filter(a => a.severity === 'WARNING')
  const ok        = alerts.filter(a => a.severity === 'OK')

  const rowBg = { CRITICAL: 'rgba(239,68,68,0.05)', WARNING: 'rgba(245,158,11,0.05)', OK: '' }

  return (
    <div>
      <div className="page-header">
        <h1>Cold Chain Monitoring</h1>
        <p>IoT sensor readings for temperature-sensitive shipments</p>
      </div>

      <div className="kpi-grid">
        <KPICard label="Critical"  value={critical.length} variant="danger"  sub="≥2h breach" />
        <KPICard label="Warning"   value={warnings.length} variant="warning" sub="<2h breach" />
        <KPICard label="OK"        value={ok.length}       variant="success" sub="within range" />
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Shipment</th>
              <th>Required (°C)</th>
              <th>Current (°C)</th>
              <th>Breach Duration</th>
              <th>Severity</th>
            </tr>
          </thead>
          <tbody>
            {alerts.map(a => (
              <tr key={a.shipment_id} style={{background: rowBg[a.severity]}}>
                <td><strong>{a.shipment_id}</strong></td>
                <td>{a.required_min_c} – {a.required_max_c}</td>
                <td style={{
                  fontWeight: a.severity !== 'OK' ? 700 : 400,
                  color: a.severity === 'CRITICAL' ? 'var(--danger)' : a.severity === 'WARNING' ? 'var(--warning)' : 'inherit'
                }}>
                  {a.current_temp_c}°C
                </td>
                <td>{a.breach_duration_hours > 0 ? `${a.breach_duration_hours}h` : '—'}</td>
                <td><AlertBadge value={a.severity} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
