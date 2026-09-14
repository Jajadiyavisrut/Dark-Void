import { useEffect, useState } from 'react'
import { getFleet } from '../api/client'
import KPICard from '../components/KPICard'
import AlertBadge from '../components/AlertBadge'

export default function Fleet() {
  const [fleet,   setFleet]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    getFleet()
      .then(setFleet)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="state-msg">Loading…</p>
  if (error)   return <p className="state-msg" style={{color:'var(--danger)'}}>Error: {error}</p>

  const idle   = fleet.filter(a => a.status === 'idle')
  const in_use = fleet.filter(a => a.status === 'in_use')

  return (
    <div>
      <div className="page-header">
        <h1>Fleet</h1>
        <p>Track all fleet assets and identify idle capacity for redeployment</p>
      </div>

      <div className="kpi-grid">
        <KPICard label="Total Assets" value={fleet.length}   variant="accent"  />
        <KPICard label="Idle"         value={idle.length}    variant="warning" sub="available for redeployment" />
        <KPICard label="In Use"       value={in_use.length}  variant="success" />
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>ID</th><th>Type</th><th>Location</th><th>Capacity (t)</th><th>Status</th><th>Note</th></tr>
          </thead>
          <tbody>
            {fleet.map(a => (
              <tr key={a.id} style={a.status === 'idle' ? {background:'rgba(245,158,11,0.04)'} : {}}>
                <td><strong>{a.id}</strong></td>
                <td style={{textTransform:'capitalize'}}>{a.type}</td>
                <td>{a.location}</td>
                <td>{a.capacity_tonnes}</td>
                <td><AlertBadge value={a.status} /></td>
                <td>{a.status === 'idle'
                  ? <span style={{color:'var(--warning)', fontSize:12}}>⚡ Available for redeployment</span>
                  : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
