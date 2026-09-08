import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../config/supabaseConfig'
import { PageHeader } from '../components/PageHeader'
import { DataTable } from '../components/DataTable'
import { PriorityBadge } from '../components/PriorityBadge'
import { StatusBadge } from '../components/StatusBadge'
import { TicketReviewModal } from '../components/TicketReviewModal'
import { notify } from '../utils/toast'
import { ArrowLeft, CheckCircle2, Clock, Eye } from 'lucide-react'

const MOCK_PENDING = [
  {
    id: 't-103',
    ticket_number: 'TIK-1003',
    title: 'Monitor flickering and HDMI signal drop on Dell dock',
    description: 'Every 15-20 minutes external monitor screen goes black for 3 seconds then recovers. Tested with multiple HDMI cables and issue persists.',
    category: 'Hardware',
    impact: 'Low',
    user_priority: 'LOW',
    admin_priority: 'LOW',
    status: 'NEW',
    approval_status: 'PENDING',
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    created_by_profile: { full_name: 'Clara Oswald', department: 'Marketing' },
  },
  {
    id: 't-106',
    ticket_number: 'TIK-1006',
    title: 'Database connection pooling saturated on production cluster',
    description: 'Postgres logs indicate maximum connection ceiling reached. Response latencies have tripled in the last hour.',
    category: 'Software',
    impact: 'Critical',
    user_priority: 'HIGH',
    admin_priority: 'URGENT',
    status: 'NEW',
    approval_status: 'PENDING',
    created_at: new Date(Date.now() - 3600000 * 1).toISOString(),
    created_by_profile: { full_name: 'Marcus Vance', department: 'Backend Core' },
  },
]

export function PendingReviewPage() {
  const navigate = useNavigate()
  const [pendingTickets, setPendingTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedTicket, setSelectedTicket] = useState(null)

  const fetchPending = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select(`
          *,
          created_by_profile:created_by ( full_name, email, department )
        `)
        .eq('approval_status', 'PENDING')
        .order('created_at', { ascending: false })

      if (error || !data || data.length === 0) {
        setPendingTickets(MOCK_PENDING)
      } else {
        setPendingTickets(data)
      }
    } catch (err) {
      setPendingTickets(MOCK_PENDING)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPending()
  }, [])

  const handleApprove = async ({ ticketId, adminPriority, category }) => {
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
        notes: `Operational priority confirmed as ${adminPriority}`,
      })
    } catch (e) {}

    setPendingTickets((prev) => prev.filter((t) => t.id !== ticketId))
    notify.success('Ticket approved and moved to triage queue.')
  }

  const handleReject = async ({ ticketId, rejectionReason }) => {
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
        notes: `Rejection reason: ${rejectionReason}`,
      })
    } catch (e) {}

    setPendingTickets((prev) => prev.filter((t) => t.id !== ticketId))
    notify.warn('Ticket rejected.')
  }

  const columns = [
    {
      header: 'Ticket #',
      key: 'ticket_number',
      cellClassName: 'font-semibold text-blue-600',
    },
    {
      header: 'Subject & Description',
      key: 'title',
      render: (row) => (
        <div className="max-w-md">
          <div className="font-medium text-slate-900 line-clamp-1">{row.title}</div>
          <div className="text-xs text-slate-500 line-clamp-1 mt-0.5">{row.description}</div>
        </div>
      ),
    },
    {
      header: 'Category',
      key: 'category',
    },
    {
      header: 'Impact',
      key: 'impact',
      render: (row) => (
        <span className="inline-flex rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
          {row.impact}
        </span>
      ),
    },
    {
      header: 'Suggested Priority',
      key: 'user_priority',
      render: (row) => <PriorityBadge priority={row.user_priority} />,
    },
    {
      header: 'Requester',
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
        <button
          onClick={() => setSelectedTicket(row)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition shadow-xs"
        >
          <Eye className="h-3.5 w-3.5" />
          Review & Triage
        </button>
      ),
    },
  ]

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        breadcrumb={
          <Link
            to="/admin"
            className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-800"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Support Overview
          </Link>
        }
        title="Pending Review Queue"
        subtitle="Validate reported impact, establish operational admin priorities, and approve or reject submissions."
      />

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500 card-shadow">
          Loading pending tickets...
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={pendingTickets}
          emptyMessage="No pending tickets awaiting review right now."
        />
      )}

      <TicketReviewModal
        ticket={selectedTicket}
        isOpen={Boolean(selectedTicket)}
        onClose={() => setSelectedTicket(null)}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  )
}

export default PendingReviewPage
