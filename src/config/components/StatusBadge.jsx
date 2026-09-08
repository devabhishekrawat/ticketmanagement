export function StatusBadge({ status, size = 'sm' }) {
  const statusKey = (status || 'new').toLowerCase().replace(/_/g, '-')
  const sizeClass = size === 'xs' ? 'size-xs' : ''

  const labelMap = {
    'new': 'New',
    'assigned': 'Assigned',
    'in-progress': 'In Progress',
    'resolved': 'Resolved',
    'reopened': 'Reopened',
    'closed': 'Closed',
    'rejected': 'Rejected',
    'cancelled': 'Cancelled',
  }

  return (
    <span className={`badge-pill status-${statusKey} ${sizeClass}`}>
      <span className="dot" />
      {labelMap[statusKey] || status}
    </span>
  )
}
