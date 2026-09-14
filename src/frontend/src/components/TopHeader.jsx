import { useState, useEffect } from 'react'
import { Globe, Clock, Search, Bell, User } from 'lucide-react'

export default function TopHeader({ onSearch, activeFilter = 'Realtime' }) {
  const [time, setTime] = useState('')
  const [timeRange, setTimeRange] = useState('Realtime')
  const [query, setQuery] = useState('')

  useEffect(() => {
    function updateClock() {
      const now = new Date()
      const utcString = now.toUTCString().split(' ')[4]
      setTime(`UTC ${utcString}`)
    }
    updateClock()
    const timer = setInterval(updateClock, 1000)
    return () => clearInterval(timer)
  }, [])

  function handleSearchChange(e) {
    const val = e.target.value
    setQuery(val)
    if (onSearch) onSearch(val)
  }

  return (
    <header className="top-header">
      <div className="header-left">
        <div className="header-crumb">
          <Globe size={15} className="text-cyan" />
          <span className="crumb-tier">GLOBAL GRID</span>
          <span className="crumb-slash">/</span>
          <span className="crumb-focus">OPS-EAST</span>
        </div>
        <span className="header-divider" />
        <div className="header-clock">
          <Clock size={13} />
          <span>{time || 'UTC LIVE'}</span>
        </div>
      </div>

      <div className="header-right">
        <div className="search-wrap">
          <Search size={15} />
          <input
            type="text"
            className="search-input header-search"
            placeholder="Search shipments, routes, or assets... [⌘K]"
            value={query}
            onChange={handleSearchChange}
          />
        </div>

        <div className="time-pills">
          {['Realtime', '24h', '7d'].map(t => (
            <button
              key={t}
              type="button"
              className={`time-pill ${timeRange === t ? 'active' : ''}`}
              onClick={() => setTimeRange(t)}
            >
              {t}
            </button>
          ))}
        </div>

        <button className="icon-btn" aria-label="Notifications" type="button">
          <Bell size={17} />
          <span className="icon-badge-dot" />
        </button>

        <div className="user-badge-avatar" title="Elena Rostova (Lead Controller)">
          <User size={15} />
        </div>
      </div>
    </header>
  )
}
