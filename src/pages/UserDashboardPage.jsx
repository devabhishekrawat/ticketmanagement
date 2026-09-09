import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../config/supabaseConfig'
import { PageHeader } from '../components/PageHeader'
import { StatCard } from '../components/StatCard'
import { DataTable } from '../components/DataTable'
import { StatusBadge } from '../components/StatusBadge'
import { PriorityBadge } from '../components/PriorityBadge'
import { PlusCircle, Ticket, Clock, CheckCircle2, AlertCircle, ArrowUpRight } from 'lucide-react'

const SAMPLE_TICKETS = [
  {
    id: 'sample-1',
    ticket_number: 'TIK-1001',
    title: 'Cannot access internal Git repository via VPN',
    category: 'Network',
    status: 'IN_PROGRESS',
    user_priority: 'HIGH',
    admin_priority: 'HIGH',
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    assignee: { full_name: 'David Support' },
  },
  {
    id: 'sample-2',
    ticket_number: 'TIK-1002',
    title: 'Request upgrade to Figma professional seat',
    category: 'Software',
    status: 'RESOLVED',
    user_priority: 'MEDIUM',
    admin_priority: 'MEDIUM',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    assignee: { full_name: 'IT Admin' },
  },
  {
    id: 'sample-3',
    ticket_number: 'TIK-1003',
    title: 'Monitor flickering when connecting via HDMI dock',
    category: 'Hardware',
    status: 'NEW',
    user_priority: 'LOW',
    admin_priority: 'LOW',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    assignee: null,
  },
]

export function UserDashboardPage() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [dbError, setDbError] = useState(null)

  useEffect(() => {
    const fetchUserTickets = async () => {
      setLoading(true)
      try {
        if (!user || user.id?.startsWith('demo-')) {
          setTickets(SAMPLE_TICKETS)
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
            assignee:assigned_to ( full_name, email, avatar_url )
          `)
          .or(`created_by.eq.${user.id},assigned_to.eq.${user.id}`)
          .order('created_at', { ascending: false })

        if (error) {
          console.warn('Supabase fetch returned error (using demo fallback):', error.message)
          setDbError(error.message)
          setTickets(SAMPLE_TICKETS)
        } else {
          setTickets(data && data.length > 0 ? data : SAMPLE_TICKETS)
        }
      } catch (err) {
        console.warn('Network error fetching tickets:', err)
        setTickets(SAMPLE_TICKETS)
      } finally {
        setLoading(false)
      }
    }

    fetchUserTickets()
  }, [user])

  const totalCount = tickets.length
  const pendingCount = tickets.filter((t) => t.status === 'NEW' || t.approval_status === 'PENDING').length
  const inProgressCount = tickets.filter((t) => t.status === 'IN_PROGRESS' || t.status === 'ASSIGNED').length
  const resolvedCount = tickets.filter((t) => t.status === 'RESOLVED').length
  const closedCount = tickets.filter((t) => t.status === 'CLOSED').length

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
    {
      header: 'Assigned To',
      key: 'assignee',
      render: (row) => (
        <span className="text-xs text-slate-600">
          {row.assignee?.full_name || 'Unassigned (In queue)'}
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
        subtitle="Track your IT tickets, check ongoing service requests, or report an issue."
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
            <p className="font-semibold">Notice: Supabase tables have not been migrated yet.</p>
            <p className="mt-0.5 text-amber-700">
              Showing interactive demo tickets below. To connect your live Supabase database, run the scripts in{' '}
              <code className="bg-amber-100 px-1 py-0.5 rounded text-amber-900 font-mono">supabase/schema.sql</code>.
            </p>
          </div>
        </div>
      )}

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 mb-8">
        <StatCard
          title="Total Tickets"
          value={totalCount}
          icon={Ticket}
          subtitle="All created by you"
          color="blue"
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
          color="purple"
        />
        <StatCard
          title="Resolved"
          value={resolvedCount}
          icon={CheckCircle2}
          subtitle="Awaiting your verification"
          color="emerald"
        />
        <StatCard
          title="Closed"
          value={closedCount}
          icon={CheckCircle2}
          subtitle="Completed tickets"
          color="blue"
        />
      </div>

            <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recent Service Requests</h2>
            <p className="text-xs text-slate-500">Click any row to open the conversation & check status</p>
          </div>
          <Link
            to="/my-tickets"
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition"
          >
            View All Tickets &rarr;
          </Link>
        </div>

        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500 card-shadow">
            Loading tickets...
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={tickets}
            onRowClick={(row) => navigate(`/tickets/${row.id}`)}
            emptyMessage="You haven't raised any IT tickets yet."
          />
        )}
      </div>
    </div>
  )
}

export default UserDashboardPage
