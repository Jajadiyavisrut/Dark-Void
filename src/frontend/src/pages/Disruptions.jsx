import { useEffect, useState } from 'react'
import { getDisruptions, getAffected } from '../api/client'
import AlertBadge from '../components/AlertBadge'

function DisruptionCard({ disruption }) {
  const [open,     setOpen]     = useState(false)
  const [data,     setData]     = useState(null)
  const [loading,  setLoading]  = useState(false)

  function toggle() {
    setOpen(o => !o)
    if (!data && !loading) {
      setLoading(true)
      getAffected(disruption.id)
        .then(setData)
        .finally(() => setLoading(false))
    }
  }

  return (
    <div className="disruption-card">
      <div className="disruption-header" onClick={toggle}>
        <div>
          <h3>{disruption.title}</h3>
          <div className="disruption-meta">
            Node: <strong>{disruption.affected_node}</strong> &nbsp;·&nbsp;
            Started: {new Date(disruption.started_at).toLocaleString()}
          </div>
        </div>
        <div style={{display:'flex', gap:8, alignItems:'center'}}>
          <AlertBadge value={disruption.severity} />
          <AlertBadge value={disruption.active ? 'active' : 'inactive'} />
          <span style={{color:'var(--muted)', fontSize:18}}>{open ? '▲' : '▼'}</span>
        </div>
      </div>

      {open && (
        <div className="disruption-body">
          <p className="disruption-desc">{disruption.description}</p>
          {loading && <p style={{color:'var(--muted)'}}>Loading affected shipments…</p>}
          {data && (
            <>
              <p style={{marginBottom:12, fontWeight:600}}>
                {data.affected_count} affected shipment{data.affected_count !== 1 ? 's' : ''}
              </p>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr><th>ID</th><th>Origin</th><th>Destination</th><th>Status</th><th>Delay</th><th>Reroute</th></tr>
                  </thead>
                  <tbody>
                    {data.shipments.map(s => (
                      <tr key={s.id}>
                        <td><strong>{s.id}</strong></td>
                        <td>{s.origin}</td>
                        <td>{s.destination}</td>
                        <td><AlertBadge value={s.status} /></td>
                        <td>{s.estimated_delay_hours > 0 ? `+${s.estimated_delay_hours}h` : '—'}</td>
                        <td>
                          {s.reroute
                            ? <div className="reroute-box">
                                <strong>Via {s.reroute.via}</strong> — {s.reroute.description}{' '}
                                (+{s.reroute.extra_delay_hours}h)
                              </div>
                            : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default function Disruptions() {
  const [disruptions, setDisruptions] = useState([])
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState(null)

  useEffect(() => {
    getDisruptions()
      .then(setDisruptions)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="state-msg">Loading…</p>
  if (error)   return <p className="state-msg" style={{color:'var(--danger)'}}>Error: {error}</p>

  return (
    <div>
      <div className="page-header">
        <h1>Disruptions</h1>
        <p>Click a disruption to see affected shipments and reroute recommendations</p>
      </div>
      <div className="disruption-list">
        {disruptions.map(d => <DisruptionCard key={d.id} disruption={d} />)}
      </div>
    </div>
  )
}
