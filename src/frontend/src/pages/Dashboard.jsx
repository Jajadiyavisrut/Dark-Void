import { useEffect, useState } from 'react'
import { Snowflake } from 'lucide-react'
import { getShipments, getDisruptions, getIdleFleet, getColdChainAlerts } from '../api/client'
import KPICard from '../components/KPICard'
import AlertBadge from '../components/AlertBadge'

export default function Dashboard() {
  const [shipments,   setShipments]   = useState([])
  const [disruptions, setDisruptions] = useState([])
  const [idle,        setIdle]        = useState([])
  const [alerts,      setAlerts]      = useState([])
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState(null)

  useEffect(() => {
    Promise.all([getShipments(), getDisruptions(), getIdleFleet(), getColdChainAlerts()])
      .then(([s, d, i, a]) => { setShipments(s); setDisruptions(d); setIdle(i); setAlerts(a) })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="state-msg">Loading…</p>
  if (error)   return <p className="state-msg" style={{color:'var(--danger)'}}>Error: {error}</p>

  const activeDisruptions = disruptions.filter(d => d.active)
  const delayedShipments  = shipments.filter(s => s.status === 'delayed')
  const coldChainIssues   = alerts.filter(a => a.severity !== 'OK')

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Live overview of your supply chain network</p>
      </div>

      <div className="kpi-grid">
        <KPICard label="Active Shipments"   value={shipments.length}         sub="total tracked"    variant="accent"  />
        <KPICard label="Active Disruptions" value={activeDisruptions.length} sub="requiring action" variant="danger"  />
        <KPICard label="Delayed Shipments"  value={delayedShipments.length}  sub="off schedule"     variant="warning" />
        <KPICard label="Idle Fleet Assets"  value={idle.length}              sub="available now"    variant="success" />
        <KPICard label="Cold Chain Alerts"  value={coldChainIssues.length}   sub="temp excursions"  variant="danger"  />
      </div>

      <h2 style={{marginBottom:14, fontSize:15, fontWeight:600}}>Recent Shipments</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th><th>Origin</th><th>Destination</th>
              <th>Carrier</th><th>Cold Chain</th><th>Status</th><th>Delay</th>
            </tr>
          </thead>
          <tbody>
            {shipments.map(s => (
              <tr key={s.id}>
                <td><strong>{s.id}</strong></td>
                <td>{s.origin}</td>
                <td>{s.destination}</td>
                <td>{s.carrier}</td>
                <td>
                  {s.cold_chain
                    ? <span style={{display:'inline-flex', alignItems:'center', gap:4, color:'var(--accent)'}}>
                        <Snowflake size={13} /> Yes
                      </span>
                    : '—'}
                </td>
                <td><AlertBadge value={s.status} /></td>
                <td>{s.estimated_delay_hours > 0 ? `+${s.estimated_delay_hours}h` : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
