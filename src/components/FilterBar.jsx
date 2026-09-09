import { useState } from 'react'
import { Search, X, SlidersHorizontal, ChevronDown, RotateCcw } from 'lucide-react'
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
  const [isOpen, setIsOpen] = useState(false)

  const activeCount = [
    statusFilter && statusFilter !== 'ALL',
    priorityFilter && priorityFilter !== 'ALL',
    categoryFilter && categoryFilter !== 'ALL',
  ].filter(Boolean).length

  const hasAnyFilter = Boolean(searchQuery || activeCount > 0)

  return (
    <div className="card !p-3 space-y-3">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search tickets by ID, title, or requester..."
            className="form-input !pl-9 !pr-8"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition border ${
            isOpen || activeCount > 0
              ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-xs'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <SlidersHorizontal className="h-3.5 w-3.5 text-blue-600" />
          <span>Filters</span>
          {activeCount > 0 && (
            <span className="flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-bold text-white leading-none">
              {activeCount}
            </span>
          )}
          <ChevronDown className={`h-3 w-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {hasAnyFilter && onReset && (
          <button
            type="button"
            onClick={onReset}
            className="hidden sm:inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-800 px-2 py-1.5 rounded-md hover:bg-slate-100 transition"
            title="Reset all filters"
          >
            <RotateCcw className="h-3 w-3" />
            Reset
          </button>
        )}
      </div>

      {isOpen && (
        <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {onStatusChange && (
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">Status</label>
              <select
                value={statusFilter || 'ALL'}
                onChange={(e) => onStatusChange(e.target.value)}
                className="form-select text-xs py-1.5"
              >
                <option value="ALL">All Statuses</option>
                <option value="IN_PROGRESS_AND_ASSIGNED">In Progress & Assigned</option>
                <option value="RESOLVED_AND_CLOSED">Resolved & Closed</option>
                {Object.values(TICKET_STATUS).map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          )}

          {onPriorityChange && (
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">Priority</label>
              <select
                value={priorityFilter || 'ALL'}
                onChange={(e) => onPriorityChange(e.target.value)}
                className="form-select text-xs py-1.5"
              >
                <option value="ALL">All Priorities</option>
                {Object.values(TICKET_PRIORITY).map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          )}

          {onCategoryChange && (
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">Category</label>
              <select
                value={categoryFilter || 'ALL'}
                onChange={(e) => onCategoryChange(e.target.value)}
                className="form-select text-xs py-1.5"
              >
                <option value="ALL">All Categories</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          )}

          {extraFilters}
        </div>
      )}

      {activeCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <span className="text-[11px] font-medium text-slate-400">Active filters:</span>

          {statusFilter && statusFilter !== 'ALL' && (
            <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
              Status:{' '}
              {statusFilter === 'IN_PROGRESS_AND_ASSIGNED'
                ? 'In Progress & Assigned'
                : statusFilter === 'RESOLVED_AND_CLOSED'
                ? 'Resolved & Closed'
                : statusFilter}
              <button
                type="button"
                onClick={() => onStatusChange('ALL')}
                className="hover:text-blue-900"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {priorityFilter && priorityFilter !== 'ALL' && (
            <span className="inline-flex items-center gap-1 rounded-md bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-700">
              Priority: {priorityFilter}
              <button
                type="button"
                onClick={() => onPriorityChange('ALL')}
                className="hover:text-purple-900"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {categoryFilter && categoryFilter !== 'ALL' && (
            <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
              Category: {categoryFilter}
              <button
                type="button"
                onClick={() => onCategoryChange('ALL')}
                className="hover:text-amber-900"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {onReset && (
            <button
              type="button"
              onClick={onReset}
              className="text-[11px] text-slate-500 hover:text-red-600 underline ml-1"
            >
              Clear all
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default FilterBar
