import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../config/supabaseConfig'
import { PageHeader } from '../components/PageHeader'
import { FilterBar } from '../components/FilterBar'
import { DataTable } from '../components/DataTable'
import { StatusBadge } from '../components/StatusBadge'
import { PriorityBadge } from '../components/PriorityBadge'
import { PlusCircle } from 'lucide-react'

const MOCK_MY_TICKETS = [
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
  {
    id: 'sample-4',
    ticket_number: 'TIK-1004',
    title: 'Password reset for Staging AWS account',
    category: 'Access & Security',
    status: 'CLOSED',
    user_priority: 'MEDIUM',
    admin_priority: 'MEDIUM',
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    assignee: { full_name: 'David Support' },
  },
]

export function MyTicketsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [priorityFilter, setPriorityFilter] = useState('ALL')
  const [categoryFilter, setCategoryFilter] = useState('ALL')

  useEffect(() => {
    const fetchTickets = async () => {
      setLoading(true)
      try {
        if (!user || user.id?.startsWith('demo-')) {
          setTickets(MOCK_MY_TICKETS)
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
            assignee:assigned_to ( full_name, email, avatar_url )
          `)
          .or(`created_by.eq.${user.id},assigned_to.eq.${user.id}`)
          .order('created_at', { ascending: false })

        if (error) {
          setTickets(MOCK_MY_TICKETS)
        } else {
          setTickets(data && data.length > 0 ? data : MOCK_MY_TICKETS)
        }
      } catch (err) {
        setTickets(MOCK_MY_TICKETS)
      } finally {
        setLoading(false)
      }
    }

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

  const filteredTickets = tickets.filter((t) => {
    const matchesSearch =
      !search ||
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.ticket_number.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase())

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
    {
      header: 'Assignee',
      key: 'assignee',
      render: (row) => (
        <span className="text-xs text-slate-600">
          {row.assignee?.full_name || 'Unassigned'}
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
        title="My IT Tickets"
        subtitle="Manage and check the progress of all your service requests."
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
          emptyMessage="No tickets match your filter criteria."
        />
      )}
    </div>
  )
}

export default MyTicketsPage
