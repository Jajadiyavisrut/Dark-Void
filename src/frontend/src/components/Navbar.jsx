import { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutGrid,
  AlertTriangle,
  Truck,
  Snowflake,
  LogOut,
  Layers,
  User
} from 'lucide-react'
import { getDisruptions } from '../api/client'

const links = [
  { to: '/',            icon: <LayoutGrid size={17} />,    label: 'Dashboard',   badgeKey: null },
  { to: '/disruptions', icon: <AlertTriangle size={17} />,  label: 'Disruptions', badgeKey: 'disruptions' },
  { to: '/fleet',       icon: <Truck size={17} />,          label: 'Fleet',       badgeKey: null },
  { to: '/cold-chain',  icon: <Snowflake size={17} />,      label: 'Cold Chain',  badgeKey: null },
]

export default function Navbar() {
  const navigate = useNavigate()
  const [activeDisruptionsCount, setActiveDisruptionsCount] = useState(2)

  useEffect(() => {
    getDisruptions()
      .then(list => {
        const count = list.filter(d => d.active).length
        setActiveDisruptionsCount(count)
      })
      .catch(() => {})
  }, [])

  function logout() {
    localStorage.removeItem('token')
    navigate('/login')
  }

  return (
    <aside className="navbar">
      {/* Brand Header */}
      <div className="navbar-logo">
        <div className="navbar-logo-icon">
          <Layers size={16} color="#08090C" strokeWidth={2.5} />
        </div>
        <div className="navbar-logo-text">
          SupplyFlow <span>AI</span>
        </div>
      </div>

      <div className="navbar-section-label">Orchestration</div>

      {/* Nav List */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {links.map(({ to, icon, label, badgeKey }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          >
            <span className="nav-icon-wrap">{icon}</span>
            <span className="nav-label-text">{label}</span>
            {badgeKey === 'disruptions' && activeDisruptionsCount > 0 && (
              <span className="nav-badge">{activeDisruptionsCount}</span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="nav-spacer" />

      {/* Telemetry Indicator */}
      <div className="nav-telemetry-box">
        <div className="telemetry-pill">
          <span className="telemetry-pulse-dot" />
          <span className="telemetry-label">TELEMETRY LIVE</span>
        </div>
        <span className="telemetry-metric">99.98%</span>
      </div>

      {/* User Session Footer */}
      <div className="nav-user">
        <div className="nav-user-avatar">
          <User size={15} color="var(--cyan)" />
        </div>
        <div className="nav-user-info">
          <div className="nav-user-name">Elena Rostova</div>
          <div className="nav-user-role">Lead Controller</div>
        </div>
        <button
          onClick={logout}
          className="nav-logout"
          title="Sign Out"
          aria-label="Sign Out"
          type="button"
        >
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  )
}
