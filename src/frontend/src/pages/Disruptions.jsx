import { useEffect, useState } from 'react'
import {
  AlertTriangle,
  Anchor,
  ShieldCheck,
  TrendingUp,
  MapPin,
  Send,
  Zap,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Clock,
  Navigation,
  Wind,
  Truck,
  RotateCw
} from 'lucide-react'
import {
  getDisruptions,
  getAffected,
  approveDisruptionReroute,
  dispatchDisruptionDrivers,
  archiveDisruption
} from '../api/client'
import AlertBadge from '../components/AlertBadge'

export default function Disruptions() {
  const [disruptions, setDisruptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all')
  const [expandedCards, setExpandedCards] = useState({ 'DIST-001': true, 'DIST-002': true })
  const [affectedDetails, setAffectedDetails] = useState({})
  const [loadingAffected, setLoadingAffected] = useState({})
  const [actionNotice, setActionNotice] = useState(null)
  const [submittingAction, setSubmittingAction] = useState({})

  function loadDisruptions() {
    return getDisruptions()
      .then(setDisruptions)
      .catch(e => setError(e.message))
  }

  useEffect(() => {
    loadDisruptions().finally(() => setLoading(false))
  }, [])

  function toggleCard(id) {
    setExpandedCards(prev => {
      const nextState = !prev[id]
      if (nextState && !affectedDetails[id] && !loadingAffected[id]) {
        setLoadingAffected(l => ({ ...l, [id]: true }))
        getAffected(id)
          .then(data => setAffectedDetails(a => ({ ...a, [id]: data })))
          .catch(() => {})
          .finally(() => setLoadingAffected(l => ({ ...l, [id]: false })))
      }
      return { ...prev, [id]: nextState }
    })
  }

  async function handleApproveReroute(disruptionId) {
    setSubmittingAction(s => ({ ...s, [disruptionId]: 'approving' }))
    try {
      const res = await approveDisruptionReroute(disruptionId)
      setActionNotice(res.message || 'AI Reroute approved successfully.')
      await loadDisruptions()
    } catch (err) {
      setActionNotice(err.response?.data?.detail || 'Failed to approve reroute.')
    } finally {
      setSubmittingAction(s => ({ ...s, [disruptionId]: null }))
      setTimeout(() => setActionNotice(null), 5000)
    }
  }

  async function handleDispatchDrivers(disruptionId) {
    setSubmittingAction(s => ({ ...s, [disruptionId]: 'dispatching' }))
    try {
      const res = await dispatchDisruptionDrivers(disruptionId)
      setActionNotice(res.message || 'Driver telemetry instructions dispatched.')
    } catch (err) {
      setActionNotice(err.response?.data?.detail || 'Failed to dispatch drivers.')
    } finally {
      setSubmittingAction(s => ({ ...s, [disruptionId]: null }))
      setTimeout(() => setActionNotice(null), 5000)
    }
  }

  async function handleArchive(disruptionId) {
    setSubmittingAction(s => ({ ...s, [disruptionId]: 'archiving' }))
    try {
      await archiveDisruption(disruptionId)
      setActionNotice(`Incident ${disruptionId} archived.`)
      await loadDisruptions()
    } catch (err) {
      setActionNotice(err.response?.data?.detail || 'Failed to archive incident.')
    } finally {
      setSubmittingAction(s => ({ ...s, [disruptionId]: null }))
      setTimeout(() => setActionNotice(null), 5000)
    }
  }

  const activeCount = disruptions.filter(d => d.active).length
  const resolvedCount = disruptions.filter(d => !d.active).length

  // Filtered cards
  const filteredDisruptions = disruptions.filter(d => {
    if (filter === 'all') return true
    if (filter === 'active') return d.active
    if (filter === 'resolved') return !d.active
    if (filter === 'weather') return d.type?.toLowerCase().includes('weather')
    if (filter === 'port') return d.type?.toLowerCase().includes('port')
    return true
  })

  // Dynamic analytics strip aggregates
  const totalCostAvoidance = disruptions.reduce((acc, d) => acc + (d.cost_avoidance_usd || 0), 0)

  if (loading) return <p className="state-msg">Loading Disruption Command Center…</p>
  if (error)   return <p className="state-msg" style={{color:'var(--danger)'}}>Error: {error}</p>

  return (
    <div>
      {/* Toast Notification */}
      {actionNotice && (
        <div style={{
          position: 'fixed',
          top: 72,
          right: 32,
          zIndex: 90,
          background: 'rgba(16,185,129,0.92)',
          backdropFilter: 'blur(16px)',
          color: '#08090C',
          padding: '10px 18px',
          borderRadius: 'var(--r-md)',
          fontWeight: 600,
          fontSize: 13,
          boxShadow: 'var(--glow-green)',
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
          <CheckCircle2 size={16} />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Header Bar with Metrics & Control */}
      <div className="page-header" style={{
        background: 'rgba(255,255,255,0.02)',
        border: 'var(--border-glass)',
        padding: '24px 28px',
        borderRadius: 'var(--r-xl)',
        display: 'flex',
        flexDirection: 'column',
        gap: 16
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
              <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>Disruptions</h1>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '3px 10px',
                borderRadius: 9999,
                background: 'rgba(244,63,94,0.15)',
                border: '1px solid rgba(244,63,94,0.3)',
                color: 'var(--red-txt)',
                fontSize: 11,
                fontFamily: 'JetBrains Mono, monospace',
                fontWeight: 700
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--red-txt)', boxShadow: 'var(--glow-red)' }} />
                {activeCount} Active Critical
              </span>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: '3px 10px',
                borderRadius: 9999,
                background: 'rgba(16,185,129,0.1)',
                border: '1px solid rgba(52,211,153,0.25)',
                color: 'var(--green-txt)',
                fontSize: 11,
                fontFamily: 'JetBrains Mono, monospace'
              }}>
                <CheckCircle2 size={12} />
                AI ENGINE SYNCHRONIZED
              </span>
            </div>
            <p style={{ color: 'var(--text-3)', fontSize: 13, margin: 0, maxWidth: 640 }}>
              Real-time supply chain bottlenecks, climate incidents, and autonomous reroute recommendations.
            </p>
          </div>

          {/* Segmented Filters */}
          <div className="filter-strip" style={{ alignSelf: 'flex-end' }}>
            <button
              type="button"
              className={`filter-pill ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All ({disruptions.length})
            </button>
            <button
              type="button"
              className={`filter-pill ${filter === 'active' ? 'active' : ''}`}
              onClick={() => setFilter('active')}
            >
              Active ({activeCount})
            </button>
            <button
              type="button"
              className={`filter-pill ${filter === 'resolved' ? 'active' : ''}`}
              onClick={() => setFilter('resolved')}
            >
              Resolved ({resolvedCount})
            </button>
            <button
              type="button"
              className={`filter-pill ${filter === 'weather' ? 'active' : ''}`}
              onClick={() => setFilter('weather')}
            >
              Weather
            </button>
            <button
              type="button"
              className={`filter-pill ${filter === 'port' ? 'active' : ''}`}
              onClick={() => setFilter('port')}
            >
              Port Logistics
            </button>
          </div>
        </div>
      </div>

      {/* Quick Analytics Bento Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, margin: '20px 0' }}>
        <div className="glass-card" style={{ padding: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 42,
              height: 42,
              borderRadius: 'var(--r-md)',
              background: 'rgba(244,63,94,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--red-txt)'
            }}>
              <Anchor size={20} />
            </div>
            <div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'JetBrains Mono, monospace' }}>
                Port Impedance
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', fontFamily: 'JetBrains Mono, monospace' }}>
                {disruptions.find(d => d.type === 'port_closure')?.est_clearance || '36h Avg Hold'}
              </div>
            </div>
          </div>
          <span style={{ fontSize: 12, color: 'var(--red-txt)', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>
            +14.2%
          </span>
        </div>

        <div className="glass-card" style={{ padding: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 42,
              height: 42,
              borderRadius: 'var(--r-md)',
              background: 'rgba(245,158,11,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--amber-txt)'
            }}>
              <Navigation size={20} />
            </div>
            <div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'JetBrains Mono, monospace' }}>
                Autopilot Reroutes
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', fontFamily: 'JetBrains Mono, monospace' }}>
                {activeCount} Corridors Active
              </div>
            </div>
          </div>
          <span style={{ fontSize: 12, color: 'var(--green-txt)', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>
            88% Ready
          </span>
        </div>

        <div className="glass-card" style={{ padding: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 42,
              height: 42,
              borderRadius: 'var(--r-md)',
              background: 'rgba(56,189,248,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--cyan)'
            }}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'JetBrains Mono, monospace' }}>
                Estimated Demurrage Saved
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', fontFamily: 'JetBrains Mono, monospace' }}>
                ${(totalCostAvoidance / 1000).toFixed(1)}k Value
              </div>
            </div>
          </div>
          <span style={{ fontSize: 12, color: 'var(--cyan)', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>
            Validated
          </span>
        </div>
      </div>

      {/* Disruption Accordion Stack */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {filteredDisruptions.map(d => {
          const isOpen = !!expandedCards[d.id]
          const isHigh = d.severity === 'high'
          const isResolved = !d.active

          return (
            <article
              key={d.id}
              className={`disruption-card ${isHigh ? 'severity-high' : 'severity-medium'}`}
              style={{ opacity: isResolved ? 0.8 : 1 }}
            >
              {/* Summary Header */}
              <div className="disruption-header" onClick={() => toggleCard(d.id)}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  <div style={{
                    width: 42,
                    height: 42,
                    borderRadius: 'var(--r-md)',
                    background: isHigh ? 'rgba(244,63,94,0.15)' : 'rgba(245,158,11,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isHigh ? 'var(--red-txt)' : 'var(--amber-txt)',
                    flexShrink: 0
                  }}>
                    {d.type?.includes('port') ? <Anchor size={20} /> : d.type?.includes('weather') ? <Wind size={20} /> : <AlertTriangle size={20} />}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>{d.title}</h3>
                      <AlertBadge value={d.severity} />
                      <AlertBadge value={d.active ? 'active' : 'inactive'} />
                    </div>
                    <div className="disruption-meta" style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginTop: 4 }}>
                      <span style={{ color: 'var(--cyan)' }}>Node: <strong>{d.affected_node}</strong></span>
                      <span>•</span>
                      <span>Started: {new Date(d.started_at).toLocaleString()}</span>
                      <span>•</span>
                      <span style={{ color: isHigh ? 'var(--red-txt)' : 'var(--amber-txt)' }}>
                        Est. Clearance: {d.est_clearance || 'Calculated'}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'JetBrains Mono, monospace' }}>
                      Direct Impact
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: isHigh ? 'var(--red-txt)' : 'var(--amber-txt)', fontFamily: 'JetBrains Mono, monospace' }}>
                      {d.direct_impact || 'Impacted'}
                    </div>
                  </div>
                  <div className="icon-btn" style={{ border: 'none', background: 'rgba(255,255,255,0.05)' }}>
                    {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>
                </div>
              </div>

              {/* Expanded Details Body */}
              {isOpen && (
                <div className="disruption-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                    {/* Situation Report */}
                    <div style={{
                      padding: 16,
                      borderRadius: 'var(--r-md)',
                      background: 'rgba(255,255,255,0.02)',
                      border: 'var(--border-subtle)'
                    }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>
                        Situation Assessment
                      </div>
                      <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6, margin: 0 }}>
                        {d.description}
                      </p>
                      {d.impacted_units && d.impacted_units.length > 0 && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 8, marginTop: 12 }}>
                          {d.impacted_units.map((unit, i) => (
                            <div key={i} style={{ padding: '6px 8px', borderRadius: 'var(--r-sm)', background: 'rgba(255,255,255,0.03)', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}>
                              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: 9 }}>ASSET / UNIT</span>
                              <span style={{ color: isHigh ? 'var(--red-txt)' : 'var(--amber-txt)', fontWeight: 600 }}>{unit}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Spatial Telemetry Node */}
                    <div style={{
                      padding: 16,
                      borderRadius: 'var(--r-md)',
                      background: 'rgba(255,255,255,0.02)',
                      border: 'var(--border-subtle)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: 'var(--cyan)' }}>
                          {d.coordinates ? `NODE: ${d.coordinates}` : `CORRIDOR: ${d.affected_node}`}
                        </span>
                        <span style={{ width: 7, height: 7, borderRadius: '50%', background: isHigh ? 'var(--red-txt)' : 'var(--green-txt)' }} />
                      </div>
                      <div style={{ marginTop: 12 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
                          {d.alternative_node || 'Optimal Alternative Route'}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--green-txt)', marginTop: 2 }}>
                          {d.active ? 'Active Corridor Divert Ready' : 'Corridors normalized'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* AI Recommended Action Panel */}
                  <div className="rec-box" style={{ padding: 18, marginTop: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flex: 1, minWidth: 260 }}>
                      <div style={{
                        width: 34,
                        height: 34,
                        borderRadius: 'var(--r-sm)',
                        background: 'rgba(56,189,248,0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--cyan)',
                        flexShrink: 0
                      }}>
                        <Zap size={18} />
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span className="rec-label">AI Recommended Action</span>
                          {d.confidence_score && (
                            <span style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', color: 'var(--cyan)' }}>
                              Confidence: {d.confidence_score}%
                            </span>
                          )}
                        </div>
                        <p style={{ margin: '4px 0 0', color: 'var(--text)', fontSize: 13, fontWeight: 500 }}>
                          {d.recommendation_summary || 'Autonomous alternative available.'}
                        </p>
                        {d.cost_avoidance_usd > 0 && (
                          <span style={{ display: 'block', marginTop: 4, fontSize: 11, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
                            Cost Delta: -${d.cost_avoidance_usd.toLocaleString()} demurrage penalty avoidance
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Triggers */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      {d.action_type === 'approve_reroute' && d.active && (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleApproveReroute(d.id)}
                          disabled={submittingAction[d.id] === 'approving'}
                          type="button"
                        >
                          <Zap size={14} />
                          <span>{submittingAction[d.id] === 'approving' ? 'Approving…' : (d.action_label || 'Approve AI Reroute')}</span>
                        </button>
                      )}
                      {d.action_type === 'dispatch_drivers' && d.active && (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleDispatchDrivers(d.id)}
                          disabled={submittingAction[d.id] === 'dispatching'}
                          type="button"
                        >
                          <Send size={14} />
                          <span>{submittingAction[d.id] === 'dispatching' ? 'Dispatching…' : (d.action_label || 'Dispatch Route Change to Drivers')}</span>
                        </button>
                      )}
                      {!d.active && (
                        <button
                          className="btn btn-glass btn-sm"
                          onClick={() => handleArchive(d.id)}
                          disabled={submittingAction[d.id] === 'archiving'}
                          type="button"
                        >
                          {submittingAction[d.id] === 'archiving' ? 'Archiving…' : (d.action_label || 'Archive Incident Log')}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </article>
          )
        })}
      </div>

      {/* Telemetry Status Ribbon Footer */}
      <div style={{
        marginTop: 24,
        padding: '14px 20px',
        borderRadius: 'var(--r-md)',
        background: 'rgba(255,255,255,0.02)',
        border: 'var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
        fontSize: 11,
        fontFamily: 'JetBrains Mono, monospace',
        color: 'var(--text-muted)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--cyan)', boxShadow: 'var(--glow-cyan)' }} />
          <span>GLOBAL INCIDENT MONITOR: 44 ACTIVE BUOYS · 12 WEATHER SATELLITES FEEDING INFERENCE</span>
        </div>
        <span>LATENCY: 12ms</span>
      </div>
    </div>
  )
}
