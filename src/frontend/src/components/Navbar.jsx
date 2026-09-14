import { NavLink } from 'react-router-dom'

const links = [
  { to: '/',             icon: '▦', label: 'Dashboard'   },
  { to: '/disruptions',  icon: '⚡', label: 'Disruptions' },
  { to: '/fleet',        icon: '🚚', label: 'Fleet'       },
  { to: '/cold-chain',   icon: '❄', label: 'Cold Chain'  },
]

export default function Navbar() {
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
          <span>{icon}</span> {label}
        </NavLink>
      ))}
    </nav>
  )
}
