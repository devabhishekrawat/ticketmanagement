import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../config/supabaseConfig'
import { PageHeader } from '../components/PageHeader'
import { StatCard } from '../components/StatCard'
import { FilterBar } from '../components/FilterBar'
import { DataTable } from '../components/DataTable'
import { StatusBadge } from '../components/StatusBadge'
import { PriorityBadge } from '../components/PriorityBadge'
import { AvatarStack } from '../components/Avatar'
import { TicketReviewModal } from '../components/TicketReviewModal'
import { AssigneeSelectModal } from '../components/AssigneeSelectModal'
import { notify } from '../utils/toast'
import {
  Ticket,
  Clock,
  UserX,
  Activity,
  CheckCircle2,
  Inbox,
  RefreshCw,
  SlidersHorizontal,
  AlertTriangle,
} from 'lucide-react'

const ADMIN_MOCK_TICKETS = [
  {
    id: 't-101',
    ticket_number: 'TIK-1001',
    title: 'VPN gateway timeout for London branch employees',
    category: 'Network',
    impact: 'Critical',
    user_priority: 'HIGH',
    admin_priority: 'URGENT',
    status: 'IN_PROGRESS',
    approval_status: 'APPROVED',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    created_by_profile: { full_name: 'John Miller', department: 'Sales' },
    assignee: { id: 'staff-1', full_name: 'David Support', email: 'david@company.internal' },
    collaborators: [{ id: 'staff-3', full_name: 'Michael Lin' }],
  },
  {
    id: 't-102',
    ticket_number: 'TIK-1002',
    title: 'Request upgrade to Figma professional seat for design sprint',
    category: 'Software',
    impact: 'High',
    user_priority: 'MEDIUM',
    admin_priority: 'MEDIUM',
    status: 'RESOLVED',
    approval_status: 'APPROVED',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    created_by_profile: { full_name: 'Alex Employee', department: 'Product Design' },
    assignee: { id: 'staff-2', full_name: 'Sarah Admin', email: 'sarah@company.internal' },
    collaborators: [],
  },
  {
    id: 't-103',
    ticket_number: 'TIK-1003',
    title: 'Monitor flickering and HDMI signal drop on Dell dock',
    category: 'Hardware',
    impact: 'Low',
    user_priority: 'LOW',
    admin_priority: 'LOW',
    status: 'NEW',
    approval_status: 'PENDING',
    created_at: new Date(Date.now() - 86400000 * 1.5).toISOString(),
    created_by_profile: { full_name: 'Clara Oswald', department: 'Marketing' },
    assignee: null,
    collaborators: [],
  },
  {
    id: 't-104',
    ticket_number: 'TIK-1004',
    title: 'Reset Multi-Factor Authentication token for staging AWS',
    category: 'Access & Security',
    impact: 'High',
    user_priority: 'HIGH',
    admin_priority: 'HIGH',
    status: 'ASSIGNED',
    approval_status: 'APPROVED',
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    created_by_profile: { full_name: 'Devon Miles', department: 'Engineering' },
    assignee: { id: 'staff-1', full_name: 'David Support', email: 'david@company.internal' },
    collaborators: [],
  },
  {
    id: 't-105',
    ticket_number: 'TIK-1005',
    title: 'Outlook calendar sync failing across mobile iOS devices',
    category: 'Email & Accounts',
    impact: 'Medium',
    user_priority: 'MEDIUM',
    admin_priority: 'MEDIUM',
    status: 'REOPENED',
    approval_status: 'APPROVED',
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
    created_by_profile: { full_name: 'Rachel Zane', department: 'Legal' },
    assignee: { id: 'staff-4', full_name: 'Emma Watson', email: 'emma@company.internal' },
    collaborators: [],
  },
]

export function AdminDashboardPage() {
  const navigate = useNavigate()
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [priorityFilter, setPriorityFilter] = useState('ALL')
  const [categoryFilter, setCategoryFilter] = useState('ALL')

  const [reviewingTicket, setReviewingTicket] = useState(null)
  const [assigningTicket, setAssigningTicket] = useState(null)

  const fetchAllTickets = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select(`
          *,
          created_by_profile:created_by ( full_name, email, department ),
          assignee:assigned_to ( id, full_name, email, avatar_url ),
          collaborators:ticket_collaborators ( user:user_id ( id, full_name, avatar_url ) )
        `)
        .order('created_at', { ascending: false })

      if (error || !data || data.length === 0) {
        setTickets(ADMIN_MOCK_TICKETS)
      } else {
        const formatted = data.map((t) => ({
          ...t,
          collaborators: t.collaborators ? t.collaborators.map((c) => c.user) : [],
        }))
        setTickets(formatted)
      }
    } catch (err) {
      setTickets(ADMIN_MOCK_TICKETS)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAllTickets()

    const channel = supabase
      .channel(`admin-dashboard-${Date.now()}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'tickets' },
        async (payload) => {
          if (!payload.new?.id) return

          let item = null
          try {
            const { data } = await supabase
              .from('tickets')
              .select(`
                *,
                created_by_profile:created_by ( full_name, email, department ),
                assignee:assigned_to ( id, full_name, email, avatar_url ),
                collaborators:ticket_collaborators ( user:user_id ( id, full_name, avatar_url ) )
              `)
              .eq('id', payload.new.id)
              .maybeSingle()

            if (data) {
              item = {
                ...data,
                collaborators: data.collaborators ? data.collaborators.map((c) => c.user) : [],
              }
            }
          } catch (e) {}

          const finalTicket = item || payload.new
          setTickets((prev) => [finalTicket, ...prev.filter((t) => t.id !== finalTicket.id)])
          notify.info(`New ticket ${finalTicket.ticket_number || ''} received!`)
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'tickets' },
        async (payload) => {
          if (!payload.new?.id) return

          let item = null
          try {
            const { data } = await supabase
              .from('tickets')
              .select(`
                *,
                created_by_profile:created_by ( full_name, email, department ),
                assignee:assigned_to ( id, full_name, email, avatar_url ),
                collaborators:ticket_collaborators ( user:user_id ( id, full_name, avatar_url ) )
              `)
              .eq('id', payload.new.id)
              .maybeSingle()

            if (data) {
              item = {
                ...data,
                collaborators: data.collaborators ? data.collaborators.map((c) => c.user) : [],
              }
            }
          } catch (e) {}

          const finalTicket = item || payload.new
          setTickets((prev) => prev.map((t) => (t.id === finalTicket.id ? { ...t, ...finalTicket } : t)))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const totalTickets = tickets.length
  const pendingReview = tickets.filter((t) => t.approval_status === 'PENDING' || t.status === 'NEW').length
  const inProgress = tickets.filter((t) => t.status === 'IN_PROGRESS' || t.status === 'ASSIGNED').length
  const resolvedCount = tickets.filter((t) => t.status === 'RESOLVED' || t.status === 'CLOSED').length
  const urgentCount = tickets.filter((t) => (t.admin_priority || t.user_priority) === 'URGENT').length

  const filteredTickets = tickets.filter((t) => {
    const matchesSearch =
      !search ||
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.ticket_number.toLowerCase().includes(search.toLowerCase()) ||
      (t.created_by_profile?.full_name || '').toLowerCase().includes(search.toLowerCase())

    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter
    const matchesPriority =
      priorityFilter === 'ALL' || (t.admin_priority || t.user_priority) === priorityFilter
    const matchesCategory = categoryFilter === 'ALL' || t.category === categoryFilter

    return matchesSearch && matchesStatus && matchesPriority && matchesCategory
  })

  const handleApproveTicket = async ({ ticketId, adminPriority, category }) => {
    try {
      await supabase
        .from('tickets')
        .update({
          admin_priority: adminPriority,
          category,
          approval_status: 'APPROVED',
          status: 'ASSIGNED',
        })
        .eq('id', ticketId)

      await supabase.from('ticket_history').insert({
        ticket_id: ticketId,
        action: 'APPROVED_BY_ADMIN',
        new_value: adminPriority,
        notes: `Triage confirmed with operational priority ${adminPriority}`,
      })
    } catch (e) {}

    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              admin_priority: adminPriority,
              category,
              approval_status: 'APPROVED',
              status: 'ASSIGNED',
            }
          : t
      )
    )
    notify.success('Ticket reviewed and approved!')
  }

  const handleRejectTicket = async ({ ticketId, rejectionReason }) => {
    try {
      await supabase
        .from('tickets')
        .update({
          approval_status: 'REJECTED',
          status: 'REJECTED',
          rejection_reason: rejectionReason,
        })
        .eq('id', ticketId)

      await supabase.from('ticket_history').insert({
        ticket_id: ticketId,
        action: 'REJECTED_BY_ADMIN',
        new_value: 'REJECTED',
        notes: `Rejected: ${rejectionReason}`,
      })
    } catch (e) {}

    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              approval_status: 'REJECTED',
              status: 'REJECTED',
              rejection_reason: rejectionReason,
            }
          : t
      )
    )
    notify.warn('Ticket rejected.')
  }

  const handleAssignTicket = async ({ ticketId, assigneeId, assigneeName }) => {
    try {
      await supabase
        .from('tickets')
        .update({
          assigned_to: assigneeId,
          status: 'ASSIGNED',
        })
        .eq('id', ticketId)

      await supabase.from('ticket_history').insert({
        ticket_id: ticketId,
        action: 'ASSIGNED',
        new_value: assigneeName,
        notes: `Assigned to ${assigneeName}`,
      })
    } catch (e) {}

    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              assigned_to: assigneeId,
              assignee: { id: assigneeId, full_name: assigneeName },
              status: t.status === 'NEW' ? 'ASSIGNED' : t.status,
            }
          : t
      )
    )
    notify.ticketAssigned(assigneeName)
  }

  const columns = [
    {
      header: 'Ticket ID',
      key: 'ticket_number',
      cellClassName: 'font-semibold text-blue-600',
    },
    {
      header: 'Subject & Category',
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
      header: 'Admin Priority',
      key: 'admin_priority',
      render: (row) => <PriorityBadge priority={row.admin_priority || row.user_priority} />,
    },
    {
      header: 'Assignees',
      key: 'assignee',
      render: (row) => {
        const team = []
        if (row.assignee) team.push(row.assignee)
        if (row.collaborators) team.push(...row.collaborators)
        return <AvatarStack users={team} />
      },
    },
    {
      header: 'Requester / Dept',
      key: 'requester',
      render: (row) => (
        <div>
          <div className="text-xs font-semibold text-slate-800">
            {row.created_by_profile?.full_name || 'Requester'}
          </div>
          <div className="text-[11px] text-slate-400">
            {row.created_by_profile?.department || 'Staff'}
          </div>
        </div>
      ),
    },
    {
      header: 'Actions',
      key: 'actions',
      render: (row) => (
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          {row.approval_status === 'PENDING' ? (
            <button
              onClick={() => setReviewingTicket(row)}
              className="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition"
            >
              Review
            </button>
          ) : (
            <button
              onClick={() => setAssigningTicket(row)}
              className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
            >
              {row.assignee ? 'Reassign' : 'Assign'}
            </button>
          )}
          <button
            onClick={() => navigate(`/admin/tickets/${row.id}`)}
            className="rounded-md px-2 py-1 text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
          >
            Manage
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        title="IT Support Overview"
        subtitle="Operations dashboard, triage tickets, manage assignees, and track resolution health."
        actions={
          <div className="flex items-center gap-2">
            <Link
              to="/admin/review"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition"
            >
              <Inbox className="h-4 w-4 text-blue-600" />
              Review Queue ({pendingReview})
            </Link>
            <Link
              to="/admin/reassignments"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition"
            >
              <RefreshCw className="h-4 w-4 text-purple-600" />
              Reassignments
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 mb-8">
        <StatCard
          title="Total Workload"
          value={totalTickets}
          icon={Ticket}
          subtitle="All-time volume"
          color="blue"
          onClick={() => {
            setStatusFilter('ALL')
            setPriorityFilter('ALL')
            setCategoryFilter('ALL')
            setSearch('')
          }}
        />
        <StatCard
          title="Pending Triage"
          value={pendingReview}
          icon={Clock}
          subtitle="Needs priority approval"
          color="amber"
          onClick={() => navigate('/admin/review')}
        />
        <StatCard
          title="In Progress"
          value={inProgress}
          icon={Activity}
          subtitle="Actively resolving"
          color="purple"
          onClick={() => {
            setStatusFilter('IN_PROGRESS')
          }}
        />
        <StatCard
          title="Resolved & Closed"
          value={resolvedCount}
          icon={CheckCircle2}
          subtitle="Successfully completed"
          color="emerald"
          onClick={() => {
            setStatusFilter('RESOLVED')
          }}
        />
        <StatCard
          title="Critical & Urgent"
          value={urgentCount}
          icon={AlertTriangle}
          subtitle="Immediate action required"
          color="rose"
          onClick={() => {
            setPriorityFilter('URGENT')
          }}
        />
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
          onReset={() => {
            setSearch('')
            setStatusFilter('ALL')
            setPriorityFilter('ALL')
            setCategoryFilter('ALL')
          }}
        />
      </div>

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500 card-shadow">
          Loading operations data...
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filteredTickets}
          onRowClick={(row) => navigate(`/admin/tickets/${row.id}`)}
          emptyMessage="No tickets matching the current operational filters."
        />
      )}

      <TicketReviewModal
        ticket={reviewingTicket}
        isOpen={Boolean(reviewingTicket)}
        onClose={() => setReviewingTicket(null)}
        onApprove={handleApproveTicket}
        onReject={handleRejectTicket}
      />

      <AssigneeSelectModal
        ticket={assigningTicket}
        isOpen={Boolean(assigningTicket)}
        onClose={() => setAssigningTicket(null)}
        onAssign={handleAssignTicket}
      />
    </div>
  )
}

export default AdminDashboardPage
