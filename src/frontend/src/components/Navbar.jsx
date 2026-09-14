import { NavLink, useNavigate } from 'react-router-dom'

const links = [
  { to: '/',             icon: '▦', label: 'Dashboard'   },
  { to: '/disruptions',  icon: '⚡', label: 'Disruptions' },
  { to: '/fleet',        icon: '🚚', label: 'Fleet'       },
  { to: '/cold-chain',   icon: '❄', label: 'Cold Chain'  },
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
          <span>{icon}</span> {label}
        </NavLink>
      ))}
      <div style={{ flex: 1 }} />
      <button
        onClick={logout}
        style={{
          background: 'transparent',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          color: 'var(--muted)',
          padding: '8px 12px',
          cursor: 'pointer',
          fontSize: 13,
          textAlign: 'left',
          transition: 'color 150ms, border-color 150ms',
        }}
        onMouseOver={e => { e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.borderColor = 'var(--danger)' }}
        onMouseOut={e  => { e.currentTarget.style.color = 'var(--muted)';  e.currentTarget.style.borderColor = 'var(--border)' }}
      >
        ⬡ Sign Out
      </button>
    </nav>
  )
}
