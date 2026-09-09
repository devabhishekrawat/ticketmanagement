const COLOR_THEMES = {
  blue: {
    iconBg: 'bg-blue-50 text-blue-600 border-blue-100',
    topAccent: 'bg-blue-500',
    hoverBorder: 'hover:border-blue-300',
    activeRing: 'ring-2 ring-blue-400/30 border-blue-400',
  },
  amber: {
    iconBg: 'bg-amber-50 text-amber-600 border-amber-100',
    topAccent: 'bg-amber-500',
    hoverBorder: 'hover:border-amber-300',
    activeRing: 'ring-2 ring-amber-400/30 border-amber-400',
  },
  purple: {
    iconBg: 'bg-purple-50 text-purple-600 border-purple-100',
    topAccent: 'bg-purple-500',
    hoverBorder: 'hover:border-purple-300',
    activeRing: 'ring-2 ring-purple-400/30 border-purple-400',
  },
  emerald: {
    iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    topAccent: 'bg-emerald-500',
    hoverBorder: 'hover:border-emerald-300',
    activeRing: 'ring-2 ring-emerald-400/30 border-emerald-400',
  },
  rose: {
    iconBg: 'bg-rose-50 text-rose-600 border-rose-100',
    topAccent: 'bg-rose-500',
    hoverBorder: 'hover:border-rose-300',
    activeRing: 'ring-2 ring-rose-400/30 border-rose-400',
  },
}

export function StatCard({
  title,
  value,
  icon: Icon,
  subtitle,
  active = false,
  onClick,
  color = 'blue',
}) {
  const theme = COLOR_THEMES[color] || COLOR_THEMES.blue

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-xs transition-all ${
        onClick ? 'cursor-pointer hover:shadow-md ' + theme.hoverBorder : ''
      } ${active ? theme.activeRing : ''}`}
    >
      <div className={`absolute top-0 left-0 right-0 h-1 ${theme.topAccent}`} />

      <div className="flex items-center justify-between mb-2.5">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
          {title}
        </span>
        {Icon && (
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg border ${theme.iconBg}`}>
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>

      <div className="text-2xl font-bold tracking-tight text-slate-900 leading-none mb-1">
        {value}
      </div>

      {subtitle && (
        <div className="text-xs text-slate-400 font-medium">
          {subtitle}
        </div>
      )}
    </div>
  )
}
