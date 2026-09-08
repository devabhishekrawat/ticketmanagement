export function StatCard({ title, value, icon: Icon, subtitle, active = false, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`stat-card ${onClick ? 'is-clickable' : ''} ${active ? 'is-active' : ''}`}
    >
      <div className="stat-header">
        <span className="stat-title">{title}</span>
        {Icon && (
          <div className="stat-icon">
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>

      <div className="stat-value">{value}</div>
      {subtitle && <div className="stat-subtitle">{subtitle}</div>}
    </div>
  )
}
