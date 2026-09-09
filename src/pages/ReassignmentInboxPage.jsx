import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../config/supabaseConfig'
import { PageHeader } from '../components/PageHeader'
import { DataTable } from '../components/DataTable'
import { Avatar } from '../components/Avatar'
import { AssigneeSelectModal } from '../components/AssigneeSelectModal'
import { notify } from '../utils/toast'
import { ArrowLeft, RefreshCw, XCircle, CheckCircle2 } from 'lucide-react'

const MOCK_REASSIGNMENTS = [
  {
    id: 'req-1',
    ticket_id: 't-105',
    reason: 'Requires exchange server administration privileges that my tier-1 role lacks.',
    status: 'PENDING',
    created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
    requester: { full_name: 'Emma Watson', department: 'Workplace Tech' },
    ticket: {
      id: 't-105',
      ticket_number: 'TIK-1005',
      title: 'Outlook calendar sync failing across mobile iOS devices',
      admin_priority: 'MEDIUM',
    },
  },
]

export function ReassignmentInboxPage() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [reassignModalTicket, setReassignModalTicket] = useState(null)
  const [activeRequestId, setActiveRequestId] = useState(null)

  const fetchRequests = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('ticket_reassignment_requests')
        .select(`
          *,
          requester:requested_by ( full_name, email, department ),
          ticket:ticket_id ( id, ticket_number, title, admin_priority, user_priority, assigned_to )
        `)
        .eq('status', 'PENDING')
        .order('created_at', { ascending: false })

      if (error || !data || data.length === 0) {
        setRequests(MOCK_REASSIGNMENTS)
      } else {
        setRequests(data)
      }
    } catch (err) {
      setRequests(MOCK_REASSIGNMENTS)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [])

  const handleReassign = async ({ ticketId, assigneeId, assigneeName }) => {
    try {
      await supabase
        .from('tickets')
        .update({ assigned_to: assigneeId })
        .eq('id', ticketId)

      if (activeRequestId) {
        await supabase
          .from('ticket_reassignment_requests')
          .update({
            status: 'APPROVED',
            admin_notes: `Reassigned to ${assigneeName}`,
            resolved_at: new Date().toISOString(),
          })
          .eq('id', activeRequestId)
      }

      await supabase.from('ticket_history').insert({
        ticket_id: ticketId,
        action: 'REASSIGNED_BY_ADMIN',
        new_value: assigneeName,
        notes: `Reassignment request approved. Reassigned to ${assigneeName}`,
      })
    } catch (e) {}

    setRequests((prev) => prev.filter((r) => r.id !== activeRequestId))
    notify.ticketAssigned(assigneeName)
  }

  const handleRejectRequest = async (request) => {
    const reason = prompt('Specify rejection feedback for the technician:') || 'Please continue diagnostics with standard playbook.'

    try {
      await supabase
        .from('ticket_reassignment_requests')
        .update({
          status: 'REJECTED',
          admin_notes: reason,
          resolved_at: new Date().toISOString(),
        })
        .eq('id', request.id)

      await supabase.from('ticket_history').insert({
        ticket_id: request.ticket_id,
        action: 'REASSIGNMENT_REJECTED',
        new_value: 'REJECTED',
        notes: `Request declined: ${reason}`,
      })
    } catch (e) {}

    setRequests((prev) => prev.filter((r) => r.id !== request.id))
    notify.info('Reassignment request rejected with instructions.')
  }

  const columns = [
    {
      header: 'Ticket #',
      key: 'ticket_number',
      render: (row) => (
        <span className="font-semibold text-blue-600">
          {row.ticket?.ticket_number || 'TIK-####'}
        </span>
      ),
    },
    {
      header: 'Ticket Title',
      key: 'title',
      render: (row) => (
        <div className="max-w-xs font-medium text-slate-900 line-clamp-1">
          {row.ticket?.title}
        </div>
      ),
    },
    {
      header: 'Requested By',
      key: 'requester',
      render: (row) => (
        <div className="flex items-center gap-2">
          <Avatar name={row.requester?.full_name} size="xs" />
          <span className="text-xs text-slate-700 font-medium">
            {row.requester?.full_name || 'Technician'}
          </span>
        </div>
      ),
    },
    {
      header: 'Reason Given',
      key: 'reason',
      render: (row) => (
        <p className="max-w-sm text-xs text-slate-600 line-clamp-2 italic">
          "{row.reason}"
        </p>
      ),
    },
    {
      header: 'Actions',
      key: 'actions',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              setActiveRequestId(row.id)
              setReassignModalTicket(row.ticket)
            }}
            className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-blue-700 transition shadow-xs"
          >
            <RefreshCw className="h-3 w-3" />
            Reassign
          </button>
          <button
            onClick={() => handleRejectRequest(row)}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50 transition"
          >
            <XCircle className="h-3 w-3" />
            Decline
          </button>
        </div>
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
        title="Reassignment Requests"
        subtitle="Review requests from specialists who need ticket reassignment."
      />

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500 card-shadow">
          Loading requests...
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={requests}
          emptyMessage="No pending reassignment requests at this time."
        />
      )}

      <AssigneeSelectModal
        ticket={reassignModalTicket}
        isOpen={Boolean(reassignModalTicket)}
        onClose={() => {
          setReassignModalTicket(null)
          setActiveRequestId(null)
        }}
        onAssign={handleReassign}
      />
    </div>
  )
}

export default ReassignmentInboxPage
