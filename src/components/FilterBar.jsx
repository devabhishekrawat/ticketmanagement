import { Search, X } from 'lucide-react'
import { CATEGORIES, TICKET_PRIORITY, TICKET_STATUS } from '../constants/tickets'

export function FilterBar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  priorityFilter,
  onPriorityChange,
  categoryFilter,
  onCategoryChange,
  onReset,
  extraFilters,
}) {
  const hasActiveFilters =
    searchQuery ||
    (statusFilter && statusFilter !== 'ALL') ||
    (priorityFilter && priorityFilter !== 'ALL') ||
    (categoryFilter && categoryFilter !== 'ALL')

  return (
    <div className="card !p-3 flex flex-wrap items-center gap-3">
      {}
      <div className="relative flex-1 min-w-[220px]">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search tickets, titles, requesters..."
          className="form-input !pl-9"
        />
      </div>

      {}
      {onStatusChange && (
        <select
          value={statusFilter || 'ALL'}
          onChange={(e) => onStatusChange(e.target.value)}
          className="form-select w-auto"
        >
          <option value="ALL">All Statuses</option>
          {Object.values(TICKET_STATUS).map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      )}

      {}
      {onPriorityChange && (
        <select
          value={priorityFilter || 'ALL'}
          onChange={(e) => onPriorityChange(e.target.value)}
          className="form-select w-auto"
        >
          <option value="ALL">All Priorities</option>
          {Object.values(TICKET_PRIORITY).map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      )}

      {}
      {onCategoryChange && (
        <select
          value={categoryFilter || 'ALL'}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="form-select w-auto"
        >
          <option value="ALL">All Categories</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      )}

      {extraFilters}

      {}
      {hasActiveFilters && onReset && (
        <button
          onClick={onReset}
          className="btn btn-secondary btn-sm"
          title="Reset filters"
        >
          <X className="h-3.5 w-3.5" />
          Clear
        </button>
      )}
    </div>
  )
}
