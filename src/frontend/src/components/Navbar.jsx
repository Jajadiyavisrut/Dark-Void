import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Zap,
  Truck,
  Thermometer,
  LogOut,
} from 'lucide-react'

const links = [
  { to: '/',            icon: <LayoutDashboard size={16} />, label: 'Dashboard'   },
  { to: '/disruptions', icon: <Zap           size={16} />, label: 'Disruptions' },
  { to: '/fleet',       icon: <Truck         size={16} />, label: 'Fleet'       },
  { to: '/cold-chain',  icon: <Thermometer   size={16} />, label: 'Cold Chain'  },
]

export default function Navbar() {
  const navigate = useNavigate()

  function logout() {
    localStorage.removeItem('token')
    navigate('/login')
  }

  return (
    <nav className="navbar">
      <div className="navbar-logo">SupplyFlow <span>AI</span></div>
      {links.map(({ to, icon, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
        >
          {icon} {label}
        </NavLink>
      ))}
      <div style={{ flex: 1 }} />
      <button
        onClick={logout}
        className="nav-link"
        style={{ border: 'none', cursor: 'pointer', background: 'transparent', width: '100%' }}
        onMouseOver={e => e.currentTarget.style.color = 'var(--danger)'}
        onMouseOut={e  => e.currentTarget.style.color = ''}
      >
        <LogOut size={16} /> Sign Out
      </button>
    </nav>
  )
}
