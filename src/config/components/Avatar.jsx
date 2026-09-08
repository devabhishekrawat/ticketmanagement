export function Avatar({ name = 'User', avatarUrl, size = 'md', className = '' }) {
  const initials = (name || 'U')
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const sizeMap = {
    xs: 'h-6 w-6 text-[10px]',
    sm: 'h-7 w-7 text-xs',
    md: 'h-8 w-8 text-xs',
    lg: 'h-10 w-10 text-sm',
  }

  const colors = [
    'bg-blue-100 text-blue-700',
    'bg-emerald-100 text-emerald-700',
    'bg-purple-100 text-purple-700',
    'bg-amber-100 text-amber-800',
    'bg-rose-100 text-rose-700',
    'bg-indigo-100 text-indigo-700',
  ]
  const colorIndex = (name.charCodeAt(0) || 0) % colors.length
  const colorClass = colors[colorIndex]

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        className={`rounded-full object-cover border border-white shadow-xs ${sizeMap[size]} ${className}`}
      />
    )
  }

  return (
    <div
      title={name}
      className={`inline-flex items-center justify-center rounded-full font-medium ring-2 ring-white select-none ${sizeMap[size]} ${colorClass} ${className}`}
    >
      {initials}
    </div>
  )
}

export function AvatarStack({ users = [], max = 3, size = 'sm' }) {
  if (!users || users.length === 0) {
    return <span className="text-xs text-slate-400 italic">Unassigned</span>
  }

  const visible = users.slice(0, max)
  const remaining = users.length - max

  return (
    <div className="flex items-center -space-x-2">
      {visible.map((u, i) => (
        <Avatar
          key={u.id || i}
          name={u.full_name || u.name || u.email || 'Assignee'}
          avatarUrl={u.avatar_url}
          size={size}
        />
      ))}
      {remaining > 0 && (
        <div
          className={`inline-flex items-center justify-center rounded-full bg-slate-100 font-medium text-slate-600 ring-2 ring-white ${
            size === 'sm' ? 'h-7 w-7 text-[10px]' : 'h-8 w-8 text-xs'
          }`}
        >
          +{remaining}
        </div>
      )}
    </div>
  )
}
