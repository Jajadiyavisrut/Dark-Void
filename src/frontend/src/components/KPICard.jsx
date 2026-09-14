export default function KPICard({
  label,
  value,
  badge,
  badgeType = 'default',
  icon,
  footerLeft,
  footerRight,
  variant = 'accent',
  onClick
}) {
  return (
    <div
      className={`kpi-card ${variant} ${onClick ? 'clickable' : ''}`}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className="kpi-top-row" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <span className="kpi-label">{label}</span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
            <span className="kpi-value">{value ?? '—'}</span>
            {badge && (
              <span className={`kpi-tag-badge ${badgeType}`}>
                {badge}
              </span>
            )}
          </div>
        </div>
        {icon && (
          <div className={`kpi-icon-box ${variant}`}>
            {icon}
          </div>
        )}
      </div>

      {(footerLeft || footerRight) && (
        <div className="kpi-footer-row" style={{
          marginTop: 14,
          paddingTop: 8,
          borderTop: '1px solid rgba(255,255,255,0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: 11,
          fontFamily: 'JetBrains Mono, monospace',
          color: 'var(--text-muted)'
        }}>
          <span>{footerLeft}</span>
          <span>{footerRight}</span>
        </div>
      )}
    </div>
  )
}
