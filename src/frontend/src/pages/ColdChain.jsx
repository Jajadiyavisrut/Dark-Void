import { useEffect, useState, useMemo } from 'react'
import {
  Snowflake,
  AlertTriangle,
  CheckCircle2,
  Download,
  RotateCw,
  Zap,
  TrendingUp,
  Cpu,
  Battery,
  FileCheck,
  X,
  Radio
} from 'lucide-react'
import {
  getColdChainAlerts,
  triggerEmergencyRefrigeration,
  getColdChainComplianceLogs
} from '../api/client'
import AlertBadge from '../components/AlertBadge'

export default function ColdChain() {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)
  const [severityFilter, setSeverityFilter] = useState('ALL')
  const [triggeringId, setTriggeringId] = useState(null)
  const [actionNotice, setActionNotice] = useState(null)

  // Compliance modal
  const [complianceModalData, setComplianceModalData] = useState(null)
  const [loadingCompliance, setLoadingCompliance] = useState(false)

  function loadAlerts() {
    return getColdChainAlerts()
      .then(setAlerts)
      .catch(e => setError(e.message))
  }

  useEffect(() => {
    loadAlerts().finally(() => setLoading(false))
  }, [])

  function handleRefresh() {
    setRefreshing(true)
    loadAlerts().finally(() => {
      setTimeout(() => setRefreshing(false), 500)
    })
  }

  async function handleEmergencyRefrigeration(shipmentId) {
    setTriggeringId(shipmentId)
    try {
      const res = await triggerEmergencyRefrigeration(shipmentId)
      setActionNotice(`Refrigeration unit activated for ${shipmentId}. Temp lowered to ${res.normalized_temp_c}°C.`)
      await loadAlerts()
    } catch (err) {
      setActionNotice(err.response?.data?.detail || 'Emergency cooling failed.')
    } finally {
      setTriggeringId(null)
      setTimeout(() => setActionNotice(null), 5000)
    }
  }

  async function handleOpenComplianceLogs() {
    setLoadingCompliance(true)
    try {
      const logs = await getColdChainComplianceLogs()
      setComplianceModalData(logs)
    } catch (err) {
      setActionNotice('Could not load compliance logs.')
    } finally {
      setLoadingCompliance(false)
    }
  }

  function handleDownloadComplianceFile() {
    if (!complianceModalData) return
    const blob = new Blob([JSON.stringify(complianceModalData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `cold_chain_compliance_audit_${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const critical = alerts.filter(a => a.severity === 'CRITICAL')
  const warnings  = alerts.filter(a => a.severity === 'WARNING')
  const ok        = alerts.filter(a => a.severity === 'OK')

  const filteredAlerts = useMemo(() => {
    if (severityFilter === 'CRITICAL') return critical
    if (severityFilter === 'WARNING')  return warnings
    if (severityFilter === 'OK')       return ok
    return alerts
  }, [alerts, severityFilter, critical, warnings, ok])

  const payloadTypes = {
    'SHP-1001': 'Pharma Vaccines (mRNA)',
    'SHP-1004': 'Insulin Cartridges',
    'SHP-1005': 'Cryogenic Blood Plasma',
    'SHP-1008': 'Biologic Reagents',
    'SHP-1010': 'Oncology Infusions',
    'SHP-1015': 'Enzyme Therapeutics'
  }

  const sensorBatteries = {
    'SHP-1001': 94,
    'SHP-1004': 98,
    'SHP-1005': 88,
    'SHP-1008': 95,
    'SHP-1010': 91,
    'SHP-1015': 99
  }

  if (loading) return <p className="state-msg">Streaming Cold Chain Sensor Telemetry…</p>
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

      {/* Hero / Header Action Ribbon */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div className="page-eyebrow">
            <span>Telemetry Live Stream</span>
            <span style={{ color: 'var(--text-muted)' }}>•</span>
            <span style={{ color: 'var(--green-txt)' }}>SENSOR SYNC: 1s RATE</span>
          </div>
          <h1>Cold Chain Monitoring</h1>
          <p>IoT sensor telemetry, thermal excursions, and temperature-sensitive pharmaceutical &amp; perishable shipments.</p>
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
            <span style={{ color: 'var(--text-2)' }}>All {alerts.length} IoT Nodes Online</span>
          </div>

          <button
            className="btn btn-glass"
            onClick={handleOpenComplianceLogs}
            disabled={loadingCompliance}
            type="button"
          >
            <Download size={15} color="var(--cyan)" />
            <span>Download Compliance Logs</span>
          </button>

          <button
            className="icon-btn"
            onClick={handleRefresh}
            title="Refresh Sensor Feeds"
            aria-label="Refresh Feeds"
            type="button"
          >
            <RotateCw size={15} className={refreshing ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Metric Specular Glass Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 20 }}>
        {/* Critical Card */}
        <div className="glass-card" style={{ padding: 20, borderColor: 'rgba(244,63,94,0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--red-txt)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--red-txt)', boxShadow: 'var(--glow-red)' }} />
              Critical Breaches
            </span>
            <span style={{
              fontSize: 10,
              fontFamily: 'JetBrains Mono, monospace',
              padding: '2px 7px',
              borderRadius: 9999,
              background: 'rgba(244,63,94,0.15)',
              border: '1px solid rgba(244,63,94,0.3)',
              color: 'var(--red-txt)',
              fontWeight: 700
            }}>
              Action Required
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontSize: 36, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', color: 'var(--red-txt)', textShadow: '0 0 16px rgba(244,63,94,0.3)' }}>
              {critical.length}
            </span>
            <span style={{ fontSize: 12, color: 'var(--text-3)' }}>active thermal spikes</span>
          </div>
          <div style={{
            marginTop: 14,
            paddingTop: 8,
            borderTop: '1px solid rgba(255,255,255,0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 11,
            color: 'var(--text-muted)',
            fontFamily: 'JetBrains Mono, monospace'
          }}>
            <span>≥ 2h breach excursion</span>
            <span style={{ color: 'var(--red-txt)' }}>Requires Reroute</span>
          </div>
        </div>

        {/* Warning Card */}
        <div className="glass-card" style={{ padding: 20, borderColor: 'rgba(245,158,11,0.25)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--amber-txt)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--amber)' }} />
              Warning Alert
            </span>
            <span style={{
              fontSize: 10,
              fontFamily: 'JetBrains Mono, monospace',
              padding: '2px 7px',
              borderRadius: 9999,
              background: 'rgba(245,158,11,0.15)',
              color: 'var(--amber-txt)'
            }}>
              Monitoring Threshold
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontSize: 36, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', color: 'var(--amber-txt)' }}>
              {warnings.length}
            </span>
            <span style={{ fontSize: 12, color: 'var(--text-3)' }}>drift detected</span>
          </div>
          <div style={{
            marginTop: 14,
            paddingTop: 8,
            borderTop: '1px solid rgba(255,255,255,0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 11,
            color: 'var(--text-muted)',
            fontFamily: 'JetBrains Mono, monospace'
          }}>
            <span>&lt; 2h breach excursion</span>
            <span style={{ color: 'var(--amber-txt)' }}>Carrier Alerted</span>
          </div>
        </div>

        {/* Optimal Stability Card */}
        <div className="glass-card" style={{ padding: 20, borderColor: 'rgba(16,185,129,0.25)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--green-txt)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green-txt)', boxShadow: 'var(--glow-green)' }} />
              Optimal Stability
            </span>
            <span style={{
              fontSize: 10,
              fontFamily: 'JetBrains Mono, monospace',
              padding: '2px 7px',
              borderRadius: 9999,
              background: 'rgba(16,185,129,0.15)',
              color: 'var(--green-txt)',
              fontWeight: 700
            }}>
              100% In Spec
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontSize: 36, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', color: 'var(--green-txt)' }}>
              {ok.length}
            </span>
            <span style={{ fontSize: 12, color: 'var(--text-3)' }}>shipments secure</span>
          </div>
          <div style={{
            marginTop: 14,
            paddingTop: 8,
            borderTop: '1px solid rgba(255,255,255,0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 11,
            color: 'var(--text-muted)',
            fontFamily: 'JetBrains Mono, monospace'
          }}>
            <span>within regulated range</span>
            <span style={{ color: 'var(--green-txt)' }}>Active Chilling</span>
          </div>
        </div>
      </div>

      {/* Diagnostics Grid: Sparkline Wave + Automated Protocol */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16, marginBottom: 24 }}>
        {/* Aggregate Excursion Trajectory */}
        <div className="glass-card" style={{ padding: 22, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: 'var(--r-md)',
                  background: 'rgba(56,189,248,0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--cyan)'
                }}>
                  <TrendingUp size={18} />
                </div>
                <div>
                  <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Aggregate Excursion Trajectory</h2>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', margin: 0 }}>
                    Real-time delta against calibrated bio-pharmaceutical limits
                  </p>
                </div>
              </div>

              <div style={{
                display: 'flex',
                background: 'rgba(255,255,255,0.03)',
                padding: 2,
                borderRadius: 'var(--r-sm)',
                fontSize: 11,
                fontFamily: 'JetBrains Mono, monospace'
              }}>
                <span style={{ padding: '3px 9px', borderRadius: 'var(--r-sm)', background: 'rgba(255,255,255,0.1)', color: 'var(--text)' }}>
                  Realtime Wave
                </span>
                <span style={{ padding: '3px 9px', color: 'var(--text-muted)' }}>4h Delta</span>
              </div>
            </div>

            {/* Live SVG Thermal Wave */}
            <div style={{
              position: 'relative',
              width: '100%',
              height: 120,
              background: 'rgba(0,0,0,0.3)',
              borderRadius: 'var(--r-md)',
              border: 'var(--border-subtle)',
              margin: '16px 0 12px',
              overflow: 'hidden'
            }}>
              <div style={{ position: 'absolute', left: 12, top: 8, fontSize: 10, fontFamily: 'JetBrains Mono, monospace', color: 'var(--red-txt)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 8, height: 2, background: 'var(--red-txt)' }} /> Max Threshold: +8.0°C
              </div>
              <div style={{ position: 'absolute', left: 12, bottom: 8, fontSize: 10, fontFamily: 'JetBrains Mono, monospace', color: 'var(--cyan)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 8, height: 2, background: 'var(--cyan)' }} /> Min Threshold: +2.0°C
              </div>

              <svg width="100%" height="100%" viewBox="0 0 800 120" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="curveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#ffb4ab" stopOpacity="0.35" />
                    <stop offset="60%" stopColor="#38bdf8" stopOpacity="0.08" />
                    <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="strokeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#4edea3" />
                    <stop offset="35%" stopColor="#4edea3" />
                    <stop offset="50%" stopColor="#ffbcbf" />
                    <stop offset="75%" stopColor="#ffb4ab" />
                    <stop offset="95%" stopColor="#ffb4ab" />
                  </linearGradient>
                </defs>
                <rect x="0" y="38" width="800" height="44" fill="rgba(78,222,163,0.04)" />
                <line x1="0" y1="38" x2="800" y2="38" stroke="rgba(255,180,171,0.25)" strokeDasharray="4 4" strokeWidth="1" />
                <line x1="0" y1="82" x2="800" y2="82" stroke="rgba(142,213,255,0.25)" strokeDasharray="4 4" strokeWidth="1" />
                <path d="M0,64 Q70,60 140,68 T280,62 T420,54 T520,32 T620,18 T720,24 L800,20 L800,120 L0,120 Z" fill="url(#curveGradient)" />
                <path d="M0,64 Q70,60 140,68 T280,62 T420,54 T520,32 T620,18 T720,24 L800,20" stroke="url(#strokeGradient)" strokeLinecap="round" strokeWidth="2.5" fill="none" />
                <circle cx="800" cy="20" r="4" fill="#ffb4ab" />
              </svg>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 8,
            fontSize: 11,
            fontFamily: 'JetBrains Mono, monospace',
            color: 'var(--text-muted)',
            paddingTop: 8,
            borderTop: 'var(--border-subtle)'
          }}>
            <div>Mean Delta: <strong style={{ color: 'var(--text)' }}>+1.9°C</strong></div>
            <div>Total Excursions: <strong style={{ color: 'var(--red-txt)' }}>{critical.length + warnings.length} Active</strong></div>
            <div>Protocol: <strong style={{ color: 'var(--green-txt)' }}>Cryo-Air Dual</strong></div>
            <div>Uptime: <strong style={{ color: 'var(--cyan)' }}>99.98%</strong></div>
          </div>
        </div>

        {/* Automated Protocol Pod */}
        <div className="glass-card" style={{ padding: 22, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--cyan)' }}>
                Automated Protocol
              </span>
              <Cpu size={18} color="var(--cyan)" />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ padding: 12, borderRadius: 'var(--r-md)', background: 'rgba(255,255,255,0.03)', border: 'var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 500, marginBottom: 6 }}>
                  <span>Auxiliary Cold Compressors</span>
                  <span style={{ color: 'var(--green-txt)', fontFamily: 'JetBrains Mono, monospace' }}>Online (2/2)</span>
                </div>
                <div className="prog-track" style={{ height: 5, margin: 0 }}>
                  <div className="prog-fill green" style={{ width: '80%' }} />
                </div>
              </div>

              <div style={{ padding: 12, borderRadius: 'var(--r-md)', background: 'rgba(255,255,255,0.03)', border: 'var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 500, marginBottom: 6 }}>
                  <span>Cellular Beacon Sync</span>
                  <span style={{ color: 'var(--cyan)', fontFamily: 'JetBrains Mono, monospace' }}>4G L-Band OK</span>
                </div>
                <div className="prog-track" style={{ height: 5, margin: 0 }}>
                  <div className="prog-fill" style={{ width: '100%', background: 'var(--cyan)' }} />
                </div>
              </div>
            </div>
          </div>

          <div style={{
            marginTop: 14,
            padding: 12,
            borderRadius: 'var(--r-sm)',
            background: 'rgba(244,63,94,0.1)',
            border: '1px solid rgba(244,63,94,0.25)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10
          }}>
            <AlertTriangle size={16} color="var(--red-txt)" style={{ marginTop: 2, flexShrink: 0 }} />
            <div style={{ fontSize: 11, color: 'var(--red-txt)', lineHeight: 1.5 }}>
              <strong>SHP-1005 Emergency Channel:</strong> Temperature breach detected. Active cooling protocol available below.
            </div>
          </div>
        </div>
      </div>

      {/* Live Sensor Telemetry Table */}
      <div className="table-wrap" style={{ border: 'var(--border-glass)' }}>
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
            <Radio size={18} color="var(--cyan)" />
            <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>Active Shipment Telemetry</span>
            <span style={{
              fontSize: 11,
              fontFamily: 'JetBrains Mono, monospace',
              padding: '2px 8px',
              borderRadius: 9999,
              background: 'rgba(255,255,255,0.06)',
              color: 'var(--cyan)'
            }}>
              {alerts.length} Tracked Payloads
            </span>
          </div>

          {/* Severity filter toggles */}
          <div className="filter-strip">
            <button
              type="button"
              className={`filter-pill ${severityFilter === 'ALL' ? 'active' : ''}`}
              onClick={() => setSeverityFilter('ALL')}
            >
              All Nodes ({alerts.length})
            </button>
            <button
              type="button"
              className={`filter-pill ${severityFilter === 'CRITICAL' ? 'active' : ''}`}
              onClick={() => setSeverityFilter('CRITICAL')}
              style={{ color: severityFilter === 'CRITICAL' ? '#fff' : 'var(--red-txt)' }}
            >
              Critical ({critical.length})
            </button>
            <button
              type="button"
              className={`filter-pill ${severityFilter === 'WARNING' ? 'active' : ''}`}
              onClick={() => setSeverityFilter('WARNING')}
              style={{ color: severityFilter === 'WARNING' ? '#fff' : 'var(--amber-txt)' }}
            >
              Warning ({warnings.length})
            </button>
            <button
              type="button"
              className={`filter-pill ${severityFilter === 'OK' ? 'active' : ''}`}
              onClick={() => setSeverityFilter('OK')}
              style={{ color: severityFilter === 'OK' ? '#fff' : 'var(--green-txt)' }}
            >
              OK ({ok.length})
            </button>
          </div>
        </div>

        {/* Telemetry Table Canvas */}
        <table>
          <thead>
            <tr>
              <th>Shipment ID</th>
              <th>Required Temp</th>
              <th>Current Temp</th>
              <th>Breach Duration</th>
              <th>Severity</th>
              <th>Sensor Health</th>
              <th style={{ textAlign: 'right' }}>Intervention / Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredAlerts.map(a => {
              const isCrit = a.severity === 'CRITICAL'
              const isWarn = a.severity === 'WARNING'
              const battery = sensorBatteries[a.shipment_id] || 94
              const payload = payloadTypes[a.shipment_id] || 'Regulated Biologics'

              return (
                <tr key={a.shipment_id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: isCrit ? 'var(--red-txt)' : isWarn ? 'var(--amber)' : 'var(--green-txt)',
                        boxShadow: isCrit ? 'var(--glow-red)' : isWarn ? '0 0 6px var(--amber)' : 'var(--glow-green)'
                      }} />
                      <span className="id-chip">{a.shipment_id}</span>
                    </div>
                    <span style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                      {payload}
                    </span>
                  </td>
                  <td style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-2)' }}>
                    {a.required_min_c}°C to {a.required_max_c}°C
                  </td>
                  <td>
                    <span style={{
                      fontSize: 16,
                      fontWeight: 700,
                      fontFamily: 'JetBrains Mono, monospace',
                      color: isCrit ? 'var(--red-txt)' : isWarn ? 'var(--amber-txt)' : 'var(--green-txt)'
                    }}>
                      {a.current_temp_c}°C
                    </span>
                    <span style={{ display: 'block', fontSize: 10, fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-muted)' }}>
                      {isCrit ? 'Excursion Exceeded' : isWarn ? 'Threshold Drift' : 'Within Envelope'}
                    </span>
                  </td>
                  <td style={{ fontFamily: 'JetBrains Mono, monospace', color: isCrit ? 'var(--red-txt)' : isWarn ? 'var(--amber-txt)' : 'var(--text-muted)', fontWeight: 600 }}>
                    {a.breach_duration_hours > 0 ? `${a.breach_duration_hours}h` : '—'}
                  </td>
                  <td>
                    <AlertBadge value={a.severity} />
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-2)' }}>
                      <Battery size={15} color="var(--green-txt)" />
                      <span>{battery}%</span>
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {a.severity !== 'OK' ? (
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleEmergencyRefrigeration(a.shipment_id)}
                        disabled={triggeringId === a.shipment_id}
                        type="button"
                      >
                        <Zap size={12} />
                        <span>{triggeringId === a.shipment_id ? 'Cooling…' : 'Trigger Emergency Refrigeration'}</span>
                      </button>
                    ) : (
                      <span style={{ fontSize: 12, color: 'var(--green-txt)', fontFamily: 'JetBrains Mono, monospace' }}>
                        Nominal Stream
                      </span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Compliance Logs Modal */}
      {complianceModalData && (
        <div className="modal-backdrop" onClick={() => setComplianceModalData(null)}>
          <div className="modal-panel" style={{ maxWidth: 640 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <FileCheck size={18} color="var(--cyan)" />
                <span>Regulatory Compliance Audit Trail</span>
              </div>
              <button
                className="modal-close"
                onClick={() => setComplianceModalData(null)}
                aria-label="Close"
                type="button"
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <div style={{
                padding: 12,
                borderRadius: 'var(--r-sm)',
                background: 'rgba(56,189,248,0.08)',
                border: '1px solid rgba(56,189,248,0.2)',
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 12,
                fontFamily: 'JetBrains Mono, monospace'
              }}>
                <span>Protocol: {complianceModalData.protocol}</span>
                <span style={{ color: 'var(--green-txt)', fontWeight: 700 }}>
                  Rating: {complianceModalData.compliance_rating}
                </span>
              </div>

              <div style={{ maxHeight: 320, overflowY: 'auto' }}>
                <table style={{ fontSize: 12 }}>
                  <thead>
                    <tr>
                      <th>Shipment</th>
                      <th>Temp Band</th>
                      <th>Current</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {complianceModalData.logs?.map(l => (
                      <tr key={l.shipment_id}>
                        <td><strong>{l.shipment_id}</strong></td>
                        <td>{l.required_band}</td>
                        <td style={{ color: l.status === 'CRITICAL' ? 'var(--red-txt)' : 'var(--green-txt)' }}>
                          {l.current_temp}
                        </td>
                        <td><AlertBadge value={l.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>
                Certified under FDA 21 CFR Part 11 electronic records and EU GDP Annex 15 cold chain distribution validation.
              </p>
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-glass"
                onClick={() => setComplianceModalData(null)}
                type="button"
              >
                Close
              </button>
              <button
                className="btn btn-primary"
                onClick={handleDownloadComplianceFile}
                type="button"
              >
                <Download size={14} /> Download Certified JSON
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
