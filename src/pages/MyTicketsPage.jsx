import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../config/supabaseConfig'
import { PageHeader } from '../components/PageHeader'
import { FilterBar } from '../components/FilterBar'
import { DataTable } from '../components/DataTable'
import { StatusBadge } from '../components/StatusBadge'
import { PriorityBadge } from '../components/PriorityBadge'
import { PlusCircle, Ticket, UserCheck, Layers } from 'lucide-react'

export function MyTicketsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)

  const [scopeTab, setScopeTab] = useState('RAISED')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [priorityFilter, setPriorityFilter] = useState('ALL')
  const [categoryFilter, setCategoryFilter] = useState('ALL')

  const fetchTickets = async () => {
    setLoading(true)
    try {
      if (!user || user.id?.startsWith('demo-')) {
        setTickets([])
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('tickets')
        .select(`
          id,
          ticket_number,
          title,
          category,
          status,
          user_priority,
          admin_priority,
          created_at,
          created_by,
          assigned_to,
          assignee:assigned_to ( full_name, email, avatar_url ),
          created_by_profile:created_by ( full_name, email )
        `)
        .or(`created_by.eq.${user.id},assigned_to.eq.${user.id}`)
        .order('created_at', { ascending: false })

      if (error) {
        setTickets([])
      } else {
        setTickets(data || [])
      }
    } catch (err) {
      setTickets([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTickets()

    if (!user?.id || user.id.startsWith('demo-')) return

    const channel = supabase
      .channel(`user-tickets-${user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tickets' },
        () => {
          fetchTickets()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  const raisedCount = tickets.filter((t) => t.created_by === user?.id).length
  const assignedCount = tickets.filter((t) => t.assigned_to === user?.id).length

  const scopedTickets = tickets.filter((t) => {
    if (scopeTab === 'RAISED') return t.created_by === user?.id
    if (scopeTab === 'ASSIGNED') return t.assigned_to === user?.id
    return true
  })

  const filteredTickets = scopedTickets.filter((t) => {
    const cleanSearch = search.trim().toLowerCase()
    const matchesSearch =
      !cleanSearch ||
      t.title.toLowerCase().includes(cleanSearch) ||
      t.ticket_number.toLowerCase().includes(cleanSearch) ||
      t.category.toLowerCase().includes(cleanSearch)

    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter
    const matchesPriority =
      priorityFilter === 'ALL' ||
      (t.admin_priority || t.user_priority) === priorityFilter
    const matchesCategory = categoryFilter === 'ALL' || t.category === categoryFilter

    return matchesSearch && matchesStatus && matchesPriority && matchesCategory
  })

  const resetFilters = () => {
    setSearch('')
    setStatusFilter('ALL')
    setPriorityFilter('ALL')
    setCategoryFilter('ALL')
  }

  const columns = [
    {
      header: 'Ticket #',
      key: 'ticket_number',
      cellClassName: 'font-semibold text-blue-600',
    },
    {
      header: 'Title & Category',
      key: 'title',
      render: (row) => (
        <div className="max-w-md">
          <div className="font-medium text-slate-900 line-clamp-1">{row.title}</div>
          <span className="text-xs text-slate-400">{row.category}</span>
        </div>
      ),
    },
    {
      header: 'Status',
      key: 'status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Priority',
      key: 'priority',
      render: (row) => <PriorityBadge priority={row.admin_priority || row.user_priority} />,
    },
    scopeTab === 'ASSIGNED'
      ? {
          header: 'Requester',
          key: 'requester',
          render: (row) => (
            <span className="text-xs text-slate-600">
              {row.created_by_profile?.full_name || 'Requester'}
            </span>
          ),
        }
      : scopeTab === 'RAISED'
      ? {
          header: 'Assigned Specialist',
          key: 'assignee',
          render: (row) => (
            <span className="text-xs text-slate-600">
              {row.assignee?.full_name || 'Unassigned (In triage)'}
            </span>
          ),
        }
      : {
          header: 'Role / Involvement',
          key: 'role',
          render: (row) => {
            const isOwner = row.created_by === user?.id
            const isWorker = row.assigned_to === user?.id
            if (isOwner && isWorker) {
              return (
                <span className="inline-flex rounded-md bg-purple-50 px-2 py-0.5 text-[11px] font-medium text-purple-700">
                  Requester & Specialist
                </span>
              )
            }
            if (isWorker) {
              return (
                <span className="inline-flex rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700">
                  Assigned to You
                </span>
              )
            }
            return (
              <span className="inline-flex rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                Raised by You
              </span>
            )
          },
        },
    {
      header: 'Submitted',
      key: 'created_at',
      render: (row) => (
        <span className="text-xs text-slate-500">
          {new Date(row.created_at).toLocaleDateString()}
        </span>
      ),
    },
  ]

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        title="My IT Tickets"
        subtitle="Manage tickets you requested as well as tasks assigned to you."
        actions={
          <Link
            to="/tickets/new"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-blue-700 transition"
          >
            <PlusCircle className="h-4 w-4" />
            Raise New Ticket
          </Link>
        }
      />

      <div className="flex items-center gap-2 mb-6 border-b border-slate-200 pb-3">
        <button
          onClick={() => setScopeTab('RAISED')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 ${
            scopeTab === 'RAISED'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Ticket className="h-4 w-4" />
          <span>Raised by Me</span>
          <span
            className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
              scopeTab === 'RAISED' ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-700'
            }`}
          >
            {raisedCount}
          </span>
        </button>

        <button
          onClick={() => setScopeTab('ASSIGNED')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 ${
            scopeTab === 'ASSIGNED'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <UserCheck className="h-4 w-4" />
          <span>Assigned to Me</span>
          <span
            className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
              scopeTab === 'ASSIGNED' ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-700'
            }`}
          >
            {assignedCount}
          </span>
        </button>

        <button
          onClick={() => setScopeTab('ALL')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 ${
            scopeTab === 'ALL'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>All Tickets</span>
          <span
            className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
              scopeTab === 'ALL' ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-700'
            }`}
          >
            {tickets.length}
          </span>
        </button>
      </div>

      <div className="mb-6">
        <FilterBar
          searchQuery={search}
          onSearchChange={setSearch}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          priorityFilter={priorityFilter}
          onPriorityChange={setPriorityFilter}
          categoryFilter={categoryFilter}
          onCategoryChange={setCategoryFilter}
          onReset={resetFilters}
        />
      </div>

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500 card-shadow">
          Loading tickets...
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filteredTickets}
          onRowClick={(row) => navigate(`/tickets/${row.id}`)}
          emptyMessage={
            scopeTab === 'RAISED'
              ? 'You have not raised any IT tickets yet.'
              : scopeTab === 'ASSIGNED'
              ? 'No tickets are currently assigned to you.'
              : 'No tickets match your filter criteria.'
          }
        />
      )}
    </div>
  )
}

export default MyTicketsPage
