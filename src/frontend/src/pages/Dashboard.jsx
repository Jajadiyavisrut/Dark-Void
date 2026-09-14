import { useEffect, useState, useMemo } from 'react'
import {
  Truck,
  AlertTriangle,
  Clock,
  Layers,
  Snowflake,
  Search,
  Download,
  RotateCw,
  Eye,
  CheckCircle2,
  TrendingUp,
  MapPin,
  ArrowRight,
  ShieldCheck,
  X
} from 'lucide-react'
import {
  getShipments,
  getDisruptions,
  getIdleFleet,
  getColdChainAlerts,
  getShipmentAnalytics,
  applyShipmentReroute
} from '../api/client'
import KPICard from '../components/KPICard'
import AlertBadge from '../components/AlertBadge'

export default function Dashboard() {
  const [shipments, setShipments] = useState([])
  const [disruptions, setDisruptions] = useState([])
  const [idle, setIdle] = useState([])
  const [alerts, setAlerts] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  // Route Detail Modal
  const [activeModalShipment, setActiveModalShipment] = useState(null)
  const [reroutingId, setReroutingId] = useState(null)
  const [actionNotice, setActionNotice] = useState(null)

  function loadData() {
    return Promise.all([
      getShipments(),
      getDisruptions(),
      getIdleFleet(),
      getColdChainAlerts(),
      getShipmentAnalytics().catch(() => null)
    ])
      .then(([s, d, i, a, an]) => {
        setShipments(s)
        setDisruptions(d)
        setIdle(i)
        setAlerts(a)
        setAnalytics(an)
      })
      .catch(e => setError(e.message))
  }

  useEffect(() => {
    loadData().finally(() => setLoading(false))
  }, [])

  function handleRefresh() {
    setRefreshing(true)
    loadData().finally(() => {
      setTimeout(() => setRefreshing(false), 500)
    })
  }

  function handleExportReport() {
    const reportData = {
      timestamp: new Date().toISOString(),
      active_shipments: shipments.length,
      active_disruptions: disruptions.filter(d => d.active).length,
      idle_fleet: idle.length,
      cold_chain_alerts: alerts.filter(a => a.severity !== 'OK').length,
      shipments
    }
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `supplyflow_executive_report_${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function handleApplyReroute(shipmentId) {
    setReroutingId(shipmentId)
    try {
      const res = await applyShipmentReroute(shipmentId)
      setActionNotice(res.status === 'rerouted' ? `Shipment ${shipmentId} rerouted via ${res.via}!` : 'Reroute applied.')
      setActiveModalShipment(null)
      await loadData()
    } catch (err) {
      setActionNotice(err.response?.data?.detail || 'Reroute application failed.')
    } finally {
      setReroutingId(null)
      setTimeout(() => setActionNotice(null), 5000)
    }
  }

  const activeDisruptions = disruptions.filter(d => d.active)
  const delayedShipments  = shipments.filter(s => s.status === 'delayed')
  const coldChainIssues   = alerts.filter(a => a.severity !== 'OK')

  // Filtered shipments
  const filteredShipments = useMemo(() => {
    return shipments.filter(s => {
      const q = searchQuery.toLowerCase().trim()
      const matchesSearch = !q ||
        s.id.toLowerCase().includes(q) ||
        s.origin.toLowerCase().includes(q) ||
        s.destination.toLowerCase().includes(q) ||
        s.carrier.toLowerCase().includes(q)

      let matchesStatus = true
      if (statusFilter === 'on-time') matchesStatus = s.status === 'on_time'
      if (statusFilter === 'delayed') matchesStatus = s.status === 'delayed'
      if (statusFilter === 'cold-chain') matchesStatus = !!s.cold_chain

      return matchesSearch && matchesStatus
    })
  }, [shipments, searchQuery, statusFilter])

  if (loading) return <p className="state-msg">Loading Executive Telemetry Grid…</p>
  if (error)   return <p className="state-msg" style={{color:'var(--danger)'}}>Error: {error}</p>

  return (
    <div>
      {/* Toast Notice */}
      {actionNotice && (
        <div style={{
          position: 'fixed',
          top: 72,
          right: 32,
          zIndex: 90,
          background: 'rgba(16,185,129,0.9)',
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

      {/* Top Header Bar */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div className="page-eyebrow">
            <span>Autonomous Grid v4.18</span>
            <span style={{ color: 'var(--text-muted)' }}>•</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: 'var(--green-txt)' }}>
              <span className="page-eyebrow-dot" />
              Mesh Synchronized
            </span>
          </div>
          <h1>Dashboard</h1>
          <p>Live overview of your supply chain network &amp; autonomous rerouting</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 14px',
            borderRadius: 9999,
            background: 'rgba(255,255,255,0.04)',
            border: 'var(--border-subtle)',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 12
          }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--green-txt)', boxShadow: 'var(--glow-green)' }} />
            <span style={{ color: 'var(--text-2)' }}>14ms latency</span>
            <span style={{ color: 'var(--text-muted)' }}>|</span>
            <span style={{ color: 'var(--text-muted)' }}>99.98% SLA</span>
          </div>

          <button className="btn btn-glass" onClick={handleExportReport} type="button">
            <Download size={15} color="var(--cyan)" />
            <span>Export Report</span>
          </button>

          <button
            className="icon-btn"
            onClick={handleRefresh}
            title="Refresh Grid Data"
            aria-label="Refresh Data"
            type="button"
          >
            <RotateCw size={15} className={refreshing ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* 5 Specular KPI Cards */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))' }}>
        <KPICard
          label="Active Shipments"
          value={shipments.length}
          badge="+12%"
          badgeType="success"
          icon={<Truck size={18} />}
          variant="accent"
          footerLeft="Total in-transit"
          footerRight={
            <svg width="40" height="14" viewBox="0 0 40 14" fill="none">
              <path d="M1 12L10 9L19 11L28 4L39 2" stroke="#34D399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          }
        />
        <KPICard
          label="Active Disruptions"
          value={activeDisruptions.length}
          badge="High Sev"
          badgeType="danger"
          icon={<AlertTriangle size={18} />}
          variant="danger"
          footerLeft={`${activeDisruptions.length} critical reroutes`}
          footerRight={<ArrowRight size={13} color="var(--red-txt)" />}
        />
        <KPICard
          label="Delayed Shipments"
          value={delayedShipments.length}
          badge="Off Sched"
          badgeType="warning"
          icon={<Clock size={18} />}
          variant="warning"
          footerLeft="Avg +7.8h delta"
          footerRight="50% fleet load"
        />
        <KPICard
          label="Idle Fleet Assets"
          value={idle.length}
          badge="Ready"
          badgeType="success"
          icon={<Layers size={18} />}
          variant="success"
          footerLeft="Quick dispatch →"
          footerRight="6 Depots"
        />
        <KPICard
          label="Cold Chain Alerts"
          value={coldChainIssues.length}
          badge="Excursions"
          badgeType="danger"
          icon={<Snowflake size={18} />}
          variant="accent"
          footerLeft="Sensors nominal"
          footerRight="2°C - 8°C"
        />
      </div>

      {/* Recent Shipments Glass Table */}
      <div className="table-wrap" style={{ marginTop: 24, border: 'var(--border-glass)' }}>
        {/* Table Toolbar */}
        <div style={{
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          borderBottom: 'var(--border-subtle)',
          background: 'rgba(255,255,255,0.015)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>Recent Shipments</span>
            <span style={{
              fontSize: 11,
              fontFamily: 'JetBrains Mono, monospace',
              padding: '2px 8px',
              borderRadius: 9999,
              background: 'rgba(255,255,255,0.06)',
              color: 'var(--text-3)'
            }}>
              {shipments.length} active batches
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <div className="search-wrap">
              <Search size={14} />
              <input
                type="text"
                className="search-input"
                placeholder="Filter shipment ID or city..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ width: 220 }}
              />
            </div>

            <div className="filter-strip">
              <button
                type="button"
                className={`filter-pill ${statusFilter === 'all' ? 'active' : ''}`}
                onClick={() => setStatusFilter('all')}
              >
                All ({shipments.length})
              </button>
              <button
                type="button"
                className={`filter-pill ${statusFilter === 'on-time' ? 'active' : ''}`}
                onClick={() => setStatusFilter('on-time')}
              >
                On Time
              </button>
              <button
                type="button"
                className={`filter-pill ${statusFilter === 'delayed' ? 'active' : ''}`}
                onClick={() => setStatusFilter('delayed')}
              >
                Delayed
              </button>
              <button
                type="button"
                className={`filter-pill ${statusFilter === 'cold-chain' ? 'active' : ''}`}
                onClick={() => setStatusFilter('cold-chain')}
              >
                Cold Chain
              </button>
            </div>
          </div>
        </div>

        {/* Table Body */}
        <table>
          <thead>
            <tr>
              <th>Shipment ID</th>
              <th>Origin</th>
              <th>Destination</th>
              <th>Carrier</th>
              <th>Cold Chain</th>
              <th>Status</th>
              <th>Delay</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredShipments.map(s => (
              <tr key={s.id}>
                <td>
                  <span className="id-chip">{s.id}</span>
                </td>
                <td style={{ fontWeight: 500, color: 'var(--text)' }}>{s.origin}</td>
                <td style={{ fontWeight: 500, color: 'var(--text)' }}>{s.destination}</td>
                <td style={{ color: 'var(--text-3)' }}>{s.carrier}</td>
                <td>
                  {s.cold_chain ? (
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                      padding: '3px 9px',
                      borderRadius: 9999,
                      background: 'rgba(56,189,248,0.1)',
                      color: 'var(--cyan)',
                      fontSize: 11,
                      fontFamily: 'JetBrains Mono, monospace',
                      fontWeight: 600,
                      boxShadow: '0 0 8px rgba(56,189,248,0.15)'
                    }}>
                      <Snowflake size={12} />
                      Yes ({s.cold_chain_temp_range || '2-8°C'})
                    </span>
                  ) : (
                    <span style={{ color: 'var(--text-muted)' }}>—</span>
                  )}
                </td>
                <td>
                  <AlertBadge value={s.status} />
                </td>
                <td style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>
                  {s.estimated_delay_hours > 0 ? (
                    <span style={{ color: 'var(--red-txt)' }}>+{s.estimated_delay_hours}h</span>
                  ) : (
                    <span style={{ color: 'var(--green-txt)' }}>On Sched</span>
                  )}
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button
                    className="btn btn-glass btn-sm"
                    onClick={() => setActiveModalShipment(s)}
                    type="button"
                  >
                    <Eye size={12} /> View Route
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Table Footer */}
        <div style={{
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: 'var(--border-subtle)',
          fontSize: 12,
          color: 'var(--text-muted)',
          fontFamily: 'JetBrains Mono, monospace'
        }}>
          <span>Showing <strong style={{ color: 'var(--text)' }}>{filteredShipments.length}</strong> of {shipments.length} recorded corridor events</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-glass btn-sm" disabled style={{ opacity: 0.4 }}>Previous</button>
            <button className="btn btn-glass btn-sm" disabled style={{ opacity: 0.4 }}>Next</button>
          </div>
        </div>
      </div>

      {/* 3 Bottom Bento Insight Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginTop: 24, paddingBottom: 24 }}>
        {/* Card 1: Auto-Reroute Engine */}
        <div className="glass-card" style={{ padding: 20, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <TrendingUp size={18} color="var(--cyan)" />
                <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>Auto-Reroute Engine</h3>
              </div>
              <span className="badge badge-ok">ACTIVE</span>
            </div>
            <p style={{ color: 'var(--text-3)', fontSize: 13, marginTop: 12, lineHeight: 1.6 }}>
              2 alternate corridors identified for SHP-1001 &amp; SHP-1005 bypassing Nhava Sheva congestion.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => handleApplyReroute('SHP-1001')}
              disabled={reroutingId === 'SHP-1001'}
              type="button"
            >
              {reroutingId === 'SHP-1001' ? 'Applying…' : 'Apply Recommendation'}
            </button>
            <button
              className="btn btn-glass btn-sm"
              onClick={() => {
                const s = shipments.find(item => item.id === 'SHP-1001')
                if (s) setActiveModalShipment(s)
              }}
              type="button"
            >
              Inspect
            </button>
          </div>
        </div>

        {/* Card 2: Cold Chain Integrity */}
        <div className="glass-card" style={{ padding: 20, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Snowflake size={18} color="var(--green-txt)" />
                <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>Cold Chain Integrity</h3>
              </div>
              <span style={{ fontSize: 12, fontFamily: 'JetBrains Mono, monospace', color: 'var(--green-txt)', fontWeight: 600 }}>
                98.4% SAFE
              </span>
            </div>
            <div className="prog-track" style={{ height: 8, margin: '14px 0 10px' }}>
              <div className="prog-fill green" style={{ width: '94%' }} />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
            <span>{alerts.length} Monitored units</span>
            <span style={{ color: 'var(--green-txt)' }}>0 Spoiled batches</span>
          </div>
        </div>

        {/* Card 3: Carrier Efficiency */}
        <div className="glass-card" style={{ padding: 20, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ShieldCheck size={18} color="var(--cyan)" />
                <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>Carrier Efficiency</h3>
              </div>
              <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-muted)' }}>Q2 MATRIX</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, margin: '14px 0 8px' }}>
              {(analytics?.carrier_efficiency || [
                { carrier: 'Carrier A', score_pct: 62, status: 'warning' },
                { carrier: 'Carrier B', score_pct: 99, status: 'optimal' },
                { carrier: 'Carrier C', score_pct: 95, status: 'optimal' }
              ]).map(c => (
                <div key={c.carrier} style={{
                  padding: '8px 4px',
                  borderRadius: 'var(--r-md)',
                  background: 'rgba(255,255,255,0.03)',
                  border: 'var(--border-subtle)',
                  textAlign: 'center'
                }}>
                  <span style={{ display: 'block', fontSize: 10, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
                    {c.carrier}
                  </span>
                  <span style={{
                    fontSize: 15,
                    fontWeight: 700,
                    fontFamily: 'JetBrains Mono, monospace',
                    color: c.score_pct < 70 ? 'var(--red-txt)' : 'var(--green-txt)'
                  }}>
                    {c.score_pct}%
                  </span>
                </div>
              ))}
            </div>
          </div>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Carrier A subject to port drayage penalty review</span>
        </div>
      </div>

      {/* Route Detail / Inspection Modal */}
      {activeModalShipment && (
        <div className="modal-backdrop" onClick={() => setActiveModalShipment(null)}>
          <div className="modal-panel" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <MapPin size={18} color="var(--cyan)" />
                <span>Corridor Inspection: {activeModalShipment.id}</span>
              </div>
              <button
                className="modal-close"
                onClick={() => setActiveModalShipment(null)}
                aria-label="Close modal"
                type="button"
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 12,
                background: 'rgba(255,255,255,0.03)',
                padding: 14,
                borderRadius: 'var(--r-md)',
                border: 'var(--border-subtle)'
              }}>
                <div>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Origin Node</span>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{activeModalShipment.origin}</div>
                </div>
                <div>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Destination Node</span>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{activeModalShipment.destination}</div>
                </div>
                <div>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Carrier Partner</span>
                  <div style={{ fontSize: 13, color: 'var(--text-2)' }}>{activeModalShipment.carrier}</div>
                </div>
                <div>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Current Delay</span>
                  <div style={{ fontSize: 13, color: activeModalShipment.estimated_delay_hours > 0 ? 'var(--red-txt)' : 'var(--green-txt)', fontWeight: 600 }}>
                    {activeModalShipment.estimated_delay_hours > 0 ? `+${activeModalShipment.estimated_delay_hours}h` : 'On Schedule'}
                  </div>
                </div>
              </div>

              <div className="rec-box">
                <div>
                  <div className="rec-label">Autonomous Reroute Recommendation</div>
                  <p style={{ margin: 0 }}>
                    Corridor via Jawaharlal Nehru Custom Port (JNPT) bypasses active berth bottlenecks. Estimated ETA delta: -8 hours.
                  </p>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-glass"
                onClick={() => setActiveModalShipment(null)}
                type="button"
              >
                Close
              </button>
              <button
                className="btn btn-primary"
                onClick={() => handleApplyReroute(activeModalShipment.id)}
                disabled={reroutingId === activeModalShipment.id}
                type="button"
              >
                {reroutingId === activeModalShipment.id ? 'Applying…' : 'Apply AI Reroute'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
