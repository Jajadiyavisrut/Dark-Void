import { useEffect, useState, useMemo } from 'react'
import {
  Truck,
  Box,
  Ship,
  Layers,
  Clock,
  RotateCw,
  Search,
  Download,
  Zap,
  CheckCircle2,
  Navigation,
  MapPin,
  X,
  Compass,
  BatteryCharging
} from 'lucide-react'
import {
  getFleet,
  redeployFleet,
  autoDispatchFleet,
  assignFleetRoute,
  getFleetGps
} from '../api/client'
import AlertBadge from '../components/AlertBadge'

export default function Fleet() {
  const [fleet, setFleet] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Filtering & Selection
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [selectedAssetIds, setSelectedAssetIds] = useState([])

  // Feedback & Action state
  const [actionNotice, setActionNotice] = useState(null)
  const [processingAction, setProcessingAction] = useState(false)

  // Modals
  const [assignModalAsset, setAssignModalAsset] = useState(null)
  const [routeInput, setRouteInput] = useState('Corridor West-104')
  const [destInput, setDestInput] = useState('Mumbai Port Container Terminal')

  const [gpsModalData, setGpsModalData] = useState(null)
  const [loadingGps, setLoadingGps] = useState(false)

  function loadFleet() {
    return getFleet()
      .then(setFleet)
      .catch(e => setError(e.message))
  }

  useEffect(() => {
    loadFleet().finally(() => setLoading(false))
  }, [])

  const idleAssets = fleet.filter(a => a.status === 'idle')
  const inUseAssets = fleet.filter(a => a.status === 'in_use')
  const idleTonnage = idleAssets.reduce((sum, a) => sum + (Number(a.capacity_tonnes) || 0), 0)
  const activeLoadPct = fleet.length > 0 ? Math.round((inUseAssets.length / fleet.length) * 100) : 0
  const truckCount = fleet.filter(a => a.type?.toLowerCase() === 'truck').length
  const containerCount = fleet.filter(a => a.type?.toLowerCase() === 'container').length
  const uniqueHubs = Array.from(new Set(fleet.map(a => a.location).filter(Boolean)))

  // Filtered rows
  const filteredFleet = useMemo(() => {
    return fleet.filter(a => {
      const q = searchQuery.toLowerCase().trim()
      const matchesQuery = !q ||
        a.id.toLowerCase().includes(q) ||
        a.location?.toLowerCase().includes(q) ||
        a.type?.toLowerCase().includes(q) ||
        String(a.capacity_tonnes).includes(q)

      let matchesType = true
      if (typeFilter === 'Truck') matchesType = a.type?.toLowerCase() === 'truck'
      if (typeFilter === 'Container') matchesType = a.type?.toLowerCase() === 'container'

      let matchesStatus = true
      if (statusFilter === 'IDLE') matchesStatus = a.status === 'idle'
      if (statusFilter === 'IN_USE') matchesStatus = a.status === 'in_use'

      return matchesQuery && matchesType && matchesStatus
    })
  }, [fleet, searchQuery, typeFilter, statusFilter])

  function handleSelectAll(e) {
    if (e.target.checked) {
      setSelectedAssetIds(filteredFleet.map(a => a.id))
    } else {
      setSelectedAssetIds([])
    }
  }

  function handleToggleRow(id) {
    setSelectedAssetIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

  async function handleRedeploySelected() {
    if (selectedAssetIds.length === 0) return
    setProcessingAction(true)
    try {
      const res = await redeployFleet({ asset_ids: selectedAssetIds, target_hub: 'Decan Inland Nexus' })
      setActionNotice(res.message || `Redeployed ${selectedAssetIds.length} assets.`)
      setSelectedAssetIds([])
      await loadFleet()
    } catch (err) {
      setActionNotice(err.response?.data?.detail || 'Redeployment failed.')
    } finally {
      setProcessingAction(false)
      setTimeout(() => setActionNotice(null), 5000)
    }
  }

  async function handleAutoDispatch() {
    setProcessingAction(true)
    try {
      const res = await autoDispatchFleet()
      setActionNotice(res.message || 'Auto-dispatch initiated.')
      await loadFleet()
    } catch (err) {
      setActionNotice(err.response?.data?.detail || 'Auto-dispatch failed.')
    } finally {
      setProcessingAction(false)
      setTimeout(() => setActionNotice(null), 5000)
    }
  }

  async function handleAssignRouteSubmit(e) {
    e.preventDefault()
    if (!assignModalAsset) return
    setProcessingAction(true)
    try {
      const res = await assignFleetRoute(assignModalAsset.id, {
        route: routeInput,
        destination: destInput
      })
      setActionNotice(res.message || `Dispatched ${assignModalAsset.id}.`)
      setAssignModalAsset(null)
      await loadFleet()
    } catch (err) {
      setActionNotice(err.response?.data?.detail || 'Route assignment failed.')
    } finally {
      setProcessingAction(false)
      setTimeout(() => setActionNotice(null), 5000)
    }
  }

  async function handleOpenGpsModal(asset) {
    setLoadingGps(true)
    setGpsModalData({ asset_id: asset.id, loading: true })
    try {
      const data = await getFleetGps(asset.id)
      setGpsModalData(data)
    } catch (err) {
      setGpsModalData({ asset_id: asset.id, error: 'Could not fetch GPS telematics' })
    } finally {
      setLoadingGps(false)
    }
  }

  function handleExportTelematics() {
    const blob = new Blob([JSON.stringify(fleet, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `fleet_telematics_${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function renderAssetIcon(type) {
    if (type === 'container') return <Box size={16} />
    if (type === 'vessel') return <Ship size={16} />
    return <Truck size={16} />
  }

  if (loading) return <p className="state-msg">Loading Fleet &amp; Capacity Matrix…</p>
  if (error)   return <p className="state-msg" style={{color:'var(--danger)'}}>Error: {error}</p>

  const isAllSelected = filteredFleet.length > 0 && selectedAssetIds.length === filteredFleet.length

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

      {/* Top Heading & Tactical Command Bar */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div className="page-eyebrow">
            <span>Autonomous Dispatch Core</span>
            <span style={{ color: 'var(--text-muted)' }}>/</span>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-muted)' }}>LOC-GRID-IND-400</span>
          </div>
          <h1>Fleet &amp; Capacity</h1>
          <p>Track distributed assets, telemetry feeds, and immediately redeploy idle logistics tonnage across continental hubs.</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn btn-glass" onClick={handleExportTelematics} type="button">
            <Download size={15} color="var(--text-3)" />
            <span>Export Telematics</span>
          </button>
          <button
            className="btn btn-primary"
            onClick={handleRedeploySelected}
            disabled={selectedAssetIds.length === 0 || processingAction}
            type="button"
          >
            <Zap size={16} />
            <span>Redeploy Selected</span>
            <span style={{
              padding: '1px 7px',
              borderRadius: 9999,
              background: 'rgba(8,9,12,0.85)',
              color: 'var(--cyan)',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 10,
              fontWeight: 700
            }}>
              {selectedAssetIds.length}
            </span>
          </button>
        </div>
      </div>

      {/* Metric Glass Instrumentation Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 20 }}>
        {/* Total Assets */}
        <div className="glass-card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
              Total Fleet Assets
            </span>
            <div className="kpi-icon-box accent">
              <Truck size={18} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontSize: 36, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', color: 'var(--text)' }}>
              {fleet.length}
            </span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Units active</span>
          </div>
          <div style={{
            marginTop: 14,
            padding: '8px 12px',
            borderRadius: 'var(--r-sm)',
            background: 'rgba(255,255,255,0.02)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 11,
            fontFamily: 'JetBrains Mono, monospace'
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--green-txt)' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green-txt)', boxShadow: 'var(--glow-green)' }} />
              100% telemetry synced
            </span>
            <span style={{ color: 'var(--text-muted)' }}>LATENCY 14ms</span>
          </div>
        </div>

        {/* Idle Capacity */}
        <div className="glass-card" style={{ padding: 20, borderColor: 'rgba(245,158,11,0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--amber-txt)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--amber)' }} />
              Idle Capacity Available
            </span>
            <div className="kpi-icon-box warning">
              <Clock size={18} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontSize: 36, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', color: 'var(--amber-txt)' }}>
              {idleAssets.length}
            </span>
            <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{idleTonnage} Tonnage ready</span>
          </div>
          <div style={{
            marginTop: 14,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Immediate redeployment pool</span>
            <button
              className="btn btn-glass btn-sm"
              style={{ color: 'var(--amber-txt)', borderColor: 'rgba(245,158,11,0.3)', padding: '4px 10px' }}
              onClick={handleAutoDispatch}
              disabled={processingAction || idleAssets.length === 0}
              type="button"
            >
              Auto-Dispatch
            </button>
          </div>
        </div>

        {/* Active In Use */}
        <div className="glass-card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--green-txt)' }}>
              In Transit / Operational
            </span>
            <div className="kpi-icon-box success">
              <Navigation size={18} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontSize: 36, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', color: 'var(--green-txt)' }}>
              {inUseAssets.length}
            </span>
            <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{activeLoadPct}% active load</span>
          </div>
          <div style={{
            marginTop: 14,
            padding: '8px 12px',
            borderRadius: 'var(--r-sm)',
            background: 'rgba(255,255,255,0.02)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 11,
            fontFamily: 'JetBrains Mono, monospace'
          }}>
            <span style={{ color: 'var(--text-3)' }}>Operating on schedule</span>
            <span style={{ color: 'var(--text-muted)' }}>0 CRITICAL FAULTS</span>
          </div>
        </div>
      </div>

      {/* Operational Banner */}
      <div className="glass-card" style={{
        padding: '16px 22px',
        marginBottom: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 'var(--r-md)',
            background: 'rgba(56,189,248,0.12)',
            color: 'var(--cyan)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Layers size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>
                Regional Node Density: {uniqueHubs.slice(0, 3).join(', ')}{uniqueHubs.length > 3 ? ' & More' : ''}
              </span>
              <span style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', padding: '2px 7px', borderRadius: 9999, background: 'rgba(56,189,248,0.15)', color: 'var(--cyan)' }}>
                {uniqueHubs.length} Hubs Active
              </span>
            </div>
            <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-3)' }}>
              {idleAssets.length} idle units ({idleTonnage}T capacity) available across {uniqueHubs.length} logistics hubs for multi-stop re-routing.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 12px',
            borderRadius: 'var(--r-sm)',
            background: 'rgba(255,255,255,0.04)',
            fontSize: 11,
            fontFamily: 'JetBrains Mono, monospace',
            color: 'var(--text-3)'
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--cyan)', animation: 'pulse-dot 1.5s infinite' }} />
            <span>REALTIME AUTO-OPTIMIZATION</span>
          </div>
          <button className="btn btn-glass btn-sm" onClick={handleAutoDispatch} type="button">
            Simulate Re-balance
          </button>
        </div>
      </div>

      {/* Main Table Cockpit */}
      <div className="table-wrap" style={{ border: 'var(--border-glass)' }}>
        {/* Cockpit Controls */}
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
          <div className="search-wrap" style={{ flex: 1, maxWidth: 360 }}>
            <Search size={14} />
            <input
              type="text"
              className="search-input"
              placeholder="Search by Asset ID, hub, city, or cargo tonnage..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            {/* Type Filters */}
            <div className="filter-strip">
              <button
                type="button"
                className={`filter-pill ${typeFilter === 'ALL' ? 'active' : ''}`}
                onClick={() => setTypeFilter('ALL')}
              >
                All Types
              </button>
              <button
                type="button"
                className={`filter-pill ${typeFilter === 'Truck' ? 'active' : ''}`}
                onClick={() => setTypeFilter('Truck')}
              >
                Trucks ({truckCount})
              </button>
              <button
                type="button"
                className={`filter-pill ${typeFilter === 'Container' ? 'active' : ''}`}
                onClick={() => setTypeFilter('Container')}
              >
                Containers ({containerCount})
              </button>
            </div>

            {/* Status Filters */}
            <div className="filter-strip">
              <button
                type="button"
                className={`filter-pill ${statusFilter === 'ALL' ? 'active' : ''}`}
                onClick={() => setStatusFilter('ALL')}
              >
                All Statuses
              </button>
              <button
                type="button"
                className={`filter-pill ${statusFilter === 'IDLE' ? 'active' : ''}`}
                onClick={() => setStatusFilter('IDLE')}
              >
                Idle ({idleAssets.length})
              </button>
              <button
                type="button"
                className={`filter-pill ${statusFilter === 'IN_USE' ? 'active' : ''}`}
                onClick={() => setStatusFilter('IN_USE')}
              >
                In Use ({inUseAssets.length})
              </button>
            </div>
          </div>
        </div>

        {/* Table Canvas */}
        <table>
          <thead>
            <tr>
              <th style={{ width: 44, textAlign: 'center' }}>
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={handleSelectAll}
                  style={{ accentColor: 'var(--cyan)', cursor: 'pointer' }}
                />
              </th>
              <th>Asset ID</th>
              <th>Type</th>
              <th>Current Location / Node</th>
              <th style={{ textAlign: 'right' }}>Capacity (T)</th>
              <th style={{ textAlign: 'center' }}>Status</th>
              <th>Telematics &amp; Assignment</th>
              <th style={{ textAlign: 'right' }}>Quick Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredFleet.map(a => {
              const isSelected = selectedAssetIds.includes(a.id)
              const isIdle = a.status === 'idle'

              return (
                <tr
                  key={a.id}
                  style={{ background: isSelected ? 'rgba(56,189,248,0.05)' : '' }}
                >
                  <td style={{ textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleRow(a.id)}
                      style={{ accentColor: 'var(--cyan)', cursor: 'pointer' }}
                    />
                  </td>
                  <td>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      fontFamily: 'JetBrains Mono, monospace',
                      fontWeight: 600,
                      color: 'var(--cyan)'
                    }}>
                      {renderAssetIcon(a.type)}
                      {a.id}
                    </span>
                  </td>
                  <td style={{ textTransform: 'capitalize', color: 'var(--text-2)' }}>{a.type}</td>
                  <td>
                    <div>
                      <span style={{ fontWeight: 600, color: 'var(--text)' }}>{a.location}</span>
                      <span style={{ display: 'block', fontSize: 10, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
                        Distribution Node
                      </span>
                    </div>
                  </td>
                  <td style={{ textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>
                    {a.capacity_tonnes} T
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <AlertBadge value={a.status} />
                  </td>
                  <td>
                    {isIdle ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--amber-txt)', fontSize: 12 }}>
                        <RotateCw size={12} className="animate-spin" style={{ animationDuration: '8s' }} />
                        Available for redeployment
                      </span>
                    ) : (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-2)', fontSize: 12 }}>
                        <Navigation size={12} color="var(--green-txt)" />
                        {a.destination ? `En route to ${a.destination}` : 'En route (On Schedule)'}
                      </span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {isIdle ? (
                      <button
                        className="btn btn-glass btn-sm"
                        onClick={() => setAssignModalAsset(a)}
                        type="button"
                      >
                        Assign Route
                      </button>
                    ) : (
                      <button
                        className="btn btn-glass btn-sm"
                        onClick={() => handleOpenGpsModal(a)}
                        type="button"
                      >
                        <Compass size={12} /> Track GPS
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Assign Route Modal */}
      {assignModalAsset && (
        <div className="modal-backdrop" onClick={() => setAssignModalAsset(null)}>
          <div className="modal-panel" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <Truck size={18} color="var(--cyan)" />
                <span>Assign Corridor: {assignModalAsset.id}</span>
              </div>
              <button
                className="modal-close"
                onClick={() => setAssignModalAsset(null)}
                aria-label="Close"
                type="button"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAssignRouteSubmit}>
              <div className="modal-body">
                <div>
                  <label style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>
                    Corridor Code
                  </label>
                  <input
                    type="text"
                    className="search-input"
                    value={routeInput}
                    onChange={e => setRouteInput(e.target.value)}
                    required
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>
                    Target Destination
                  </label>
                  <input
                    type="text"
                    className="search-input"
                    value={destInput}
                    onChange={e => setDestInput(e.target.value)}
                    required
                    style={{ width: '100%' }}
                  />
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-3)', background: 'rgba(255,255,255,0.02)', padding: 10, borderRadius: 'var(--r-sm)' }}>
                  Payload capacity: <strong>{assignModalAsset.capacity_tonnes} Tonnes</strong>. Current hub: <strong>{assignModalAsset.location}</strong>.
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-glass"
                  onClick={() => setAssignModalAsset(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={processingAction}
                >
                  {processingAction ? 'Dispatching…' : 'Confirm Dispatch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GPS Tracking Modal */}
      {gpsModalData && (
        <div className="modal-backdrop" onClick={() => setGpsModalData(null)}>
          <div className="modal-panel" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <Compass size={18} color="var(--cyan)" />
                <span>Live GPS Telematics: {gpsModalData.asset_id}</span>
              </div>
              <button
                className="modal-close"
                onClick={() => setGpsModalData(null)}
                aria-label="Close"
                type="button"
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              {loadingGps ? (
                <p className="state-msg">Syncing telemetry satellite channel…</p>
              ) : (
                <>
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
                      <span style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Operator Driver</span>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{gpsModalData.driver || 'Autonomous'}</div>
                    </div>
                    <div>
                      <span style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Ground Velocity</span>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--cyan)', fontFamily: 'JetBrains Mono, monospace' }}>
                        {gpsModalData.speed_kmh} km/h
                      </div>
                    </div>
                    <div>
                      <span style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Current Coordinates</span>
                      <div style={{ fontSize: 12, color: 'var(--text-2)', fontFamily: 'JetBrains Mono, monospace' }}>
                        {gpsModalData.lat}° N, {gpsModalData.lng}° E
                      </div>
                    </div>
                    <div>
                      <span style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Battery / Power</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--green-txt)', fontFamily: 'JetBrains Mono, monospace' }}>
                        <BatteryCharging size={14} />
                        {gpsModalData.battery_pct}% Nominal
                      </div>
                    </div>
                  </div>

                  <div style={{
                    padding: 12,
                    borderRadius: 'var(--r-sm)',
                    background: 'rgba(16,185,129,0.08)',
                    border: '1px solid rgba(52,211,153,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: 12,
                    color: 'var(--green-txt)'
                  }}>
                    <CheckCircle2 size={16} />
                    <span>L-Band satellite telematics active · 14ms latency · Route clear</span>
                  </div>
                </>
              )}
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-glass"
                onClick={() => setGpsModalData(null)}
                type="button"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
