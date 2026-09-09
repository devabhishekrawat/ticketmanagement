import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../config/supabaseConfig'
import { PageHeader } from '../components/PageHeader'
import { StatCard } from '../components/StatCard'
import { DataTable } from '../components/DataTable'
import { StatusBadge } from '../components/StatusBadge'
import { PriorityBadge } from '../components/PriorityBadge'
import { PlusCircle, Ticket, Clock, CheckCircle2, AlertCircle, ArrowUpRight, UserCheck, Search, X } from 'lucide-react'

export function UserDashboardPage() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [dbError, setDbError] = useState(null)
  const [activeTab, setActiveTab] = useState('RAISED')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const fetchUserTickets = async () => {
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
            approval_status,
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
          console.warn('Supabase fetch returned error:', error.message)
          setDbError(error.message)
          setTickets([])
        } else {
          setTickets(data || [])
        }
      } catch (err) {
        console.warn('Network error fetching tickets:', err)
        setTickets([])
      } finally {
        setLoading(false)
      }
    }

    fetchUserTickets()
  }, [user])

  const raisedCount = tickets.filter((t) => t.created_by === user?.id).length
  const assignedCount = tickets.filter((t) => t.assigned_to === user?.id).length
  const pendingCount = tickets.filter((t) => t.status === 'NEW' || t.approval_status === 'PENDING').length
  const inProgressCount = tickets.filter((t) => t.status === 'IN_PROGRESS' || t.status === 'ASSIGNED').length
  const resolvedCount = tickets.filter((t) => t.status === 'RESOLVED').length

  const cleanSearch = search.trim().toLowerCase()
  const displayTickets = tickets.filter((t) => {
    const matchesTab = activeTab === 'RAISED' ? t.created_by === user?.id : t.assigned_to === user?.id
    if (!matchesTab) return false
    if (!cleanSearch) return true
    return (
      t.title.toLowerCase().includes(cleanSearch) ||
      t.ticket_number.toLowerCase().includes(cleanSearch) ||
      t.category.toLowerCase().includes(cleanSearch)
    )
  })

  const columns = [
    {
      header: 'Ticket ID',
      key: 'ticket_number',
      cellClassName: 'font-semibold text-blue-600',
    },
    {
      header: 'Title & Summary',
      key: 'title',
      render: (row) => (
        <div className="max-w-md">
          <div className="font-medium text-slate-900 line-clamp-1">{row.title}</div>
          <div className="text-xs text-slate-400 mt-0.5">{row.category}</div>
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
      key: 'user_priority',
      render: (row) => <PriorityBadge priority={row.admin_priority || row.user_priority} />,
    },
    activeTab === 'RAISED'
      ? {
          header: 'Assigned To',
          key: 'assignee',
          render: (row) => (
            <span className="text-xs text-slate-600">
              {row.assignee?.full_name || 'Unassigned (In queue)'}
            </span>
          ),
        }
      : {
          header: 'Requester',
          key: 'requester',
          render: (row) => (
            <span className="text-xs text-slate-600">
              {row.created_by_profile?.full_name || 'Requester'}
            </span>
          ),
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
        title={`Welcome, ${profile?.full_name || 'there'}`}
        subtitle="Track your reported issues and tasks assigned to you."
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

      {dbError && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Notice: Database connection notice</p>
            <p className="mt-0.5 text-amber-700">{dbError}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 mb-8">
        <StatCard
          title="Raised by You"
          value={raisedCount}
          icon={Ticket}
          subtitle="Tickets you created"
          color="blue"
        />
        <StatCard
          title="Assigned to You"
          value={assignedCount}
          icon={UserCheck}
          subtitle="Assigned to solve"
          color="purple"
        />
        <StatCard
          title="Pending Review"
          value={pendingCount}
          icon={Clock}
          subtitle="Waiting for IT approval"
          color="amber"
        />
        <StatCard
          title="In Progress"
          value={inProgressCount}
          icon={ArrowUpRight}
          subtitle="Actively being worked"
          color="blue"
        />
        <StatCard
          title="Resolved"
          value={resolvedCount}
          icon={CheckCircle2}
          subtitle="Awaiting verification"
          color="emerald"
        />
      </div>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('RAISED')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 ${
                activeTab === 'RAISED'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Ticket className="h-3.5 w-3.5" />
              <span>Raised by Me</span>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                  activeTab === 'RAISED' ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {raisedCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('ASSIGNED')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 ${
                activeTab === 'ASSIGNED'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <UserCheck className="h-3.5 w-3.5" />
              <span>Assigned to Me</span>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                  activeTab === 'ASSIGNED' ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {assignedCount}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value.trimStart())}
                placeholder="Search tickets..."
                className="form-input !py-1.5 !pl-8 !pr-7 text-xs w-44 sm:w-56"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>

            <Link
              to="/my-tickets"
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition whitespace-nowrap"
            >
              View All in My Tickets &rarr;
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500 card-shadow">
            Loading tickets...
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={displayTickets}
            onRowClick={(row) => navigate(`/tickets/${row.id}`)}
            emptyMessage={
              search.trim()
                ? 'No tickets found matching your search.'
                : activeTab === 'RAISED'
                ? 'You haven’t raised any IT tickets yet.'
                : 'No tickets are currently assigned to you.'
            }
          />
        )}
      </div>
    </div>
  )
}

export default UserDashboardPage
