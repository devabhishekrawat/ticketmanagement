import { ArrowDown, ArrowRight, ArrowUp, Flame } from 'lucide-react'

export function PriorityBadge({ priority, size = 'sm' }) {
  const pKey = (priority || 'medium').toLowerCase()
  const sizeClass = size === 'xs' ? 'size-xs' : ''

  const renderIcon = () => {
    switch (pKey) {
      case 'low':
        return <ArrowDown className="h-3 w-3" />
      case 'high':
        return <ArrowUp className="h-3 w-3" />
      case 'urgent':
        return <Flame className="h-3 w-3" />
      default:
        return <ArrowRight className="h-3 w-3" />
    }
  }

  const label = priority ? priority.charAt(0).toUpperCase() + priority.slice(1).toLowerCase() : 'Medium'

  return (
    <span className={`badge-pill priority-${pKey} ${sizeClass}`}>
      {renderIcon()}
      {label}
    </span>
  )
}
