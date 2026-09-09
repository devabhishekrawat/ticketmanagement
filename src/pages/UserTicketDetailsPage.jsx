import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../config/supabaseConfig'
import { PageHeader } from '../components/PageHeader'
import { StatusBadge } from '../components/StatusBadge'
import { PriorityBadge } from '../components/PriorityBadge'
import { Avatar } from '../components/Avatar'
import { ArrowLeft, CheckCircle2, Clock } from 'lucide-react'
import { notify } from '../utils/toast'

import { CommentBox } from '../components/CommentBox'
import { AttachmentWidget } from '../components/AttachmentWidget'
import { TicketHistoryTimeline } from '../components/TicketHistoryTimeline'
import { ResolutionVerifyBox } from '../components/ResolutionVerifyBox'
import { useRealtimeTicket } from '../hooks/useRealtimeTicket'

const MOCK_DETAIL = {
  id: 'sample-2',
  ticket_number: 'TIK-1002',
  title: 'Request upgrade to Figma professional seat',
  description: 'Our team is onboarding two new UI contractors this sprint and we need to share team libraries and view version histories without export restrictions. Existing starter plan is currently blocking work.',
  category: 'Software',
  impact: 'High',
  user_priority: 'MEDIUM',
  admin_priority: 'MEDIUM',
  status: 'RESOLVED',
  approval_status: 'APPROVED',
  reopen_count: 0,
  created_at: new Date(Date.now() - 86400000).toISOString(),
  resolved_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  created_by_profile: { full_name: 'Alex Employee', email: 'alex@company.internal', department: 'Product Design' },
  assignee: { full_name: 'Sarah Admin', email: 'sarah@company.internal', department: 'IT Operations' },
}

export function UserTicketDetailsPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [ticket, setTicket] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchTicket = async () => {
    try {
      if (!user || user.id?.startsWith('demo-') || id?.startsWith('sample-')) {
        setTicket({ ...MOCK_DETAIL, id: id || 'sample-2' })
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('tickets')
        .select(`
          *,
          created_by_profile:created_by ( full_name, email, department ),
          assignee:assigned_to ( full_name, email, department, avatar_url )
        `)
        .eq('id', id)
        .maybeSingle()

      if (error || !data) {
        setTicket({ ...MOCK_DETAIL, id })
      } else {
        setTicket(data)
      }
    } catch (err) {
      setTicket({ ...MOCK_DETAIL, id })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTicket()
  }, [id, user])

  useRealtimeTicket(id, (updatedPayload) => {
    setTicket((prev) => (prev ? { ...prev, ...updatedPayload } : prev))
  })

  const [updatingStatus, setUpdatingStatus] = useState(false)

  const handleStatusChange = (newStatus) => {
    setTicket((prev) => (prev ? { ...prev, status: newStatus } : prev))
  }

  const handleAssigneeStatusUpdate = async (newStatus) => {
    setUpdatingStatus(true)
    try {
      if (ticket.id && !ticket.id.startsWith('sample-') && !ticket.id.startsWith('t-')) {
        await supabase
          .from('tickets')
          .update({
            status: newStatus,
            resolved_at: newStatus === 'RESOLVED' ? new Date().toISOString() : null,
          })
          .eq('id', ticket.id)

        await supabase.from('ticket_history').insert({
          ticket_id: ticket.id,
          actor_id: user?.id && !user.id.startsWith('demo-') ? user.id : null,
          action: 'STATUS_CHANGE',
          old_value: ticket.status,
          new_value: newStatus,
          notes:
            newStatus === 'RESOLVED'
              ? 'Assigned specialist marked ticket as resolved.'
              : 'Assigned specialist started working on ticket.',
        })
      }

      setTicket((prev) => (prev ? { ...prev, status: newStatus } : prev))
      if (newStatus === 'RESOLVED') notify.ticketResolved()
      else notify.success(`Status updated to ${newStatus}`)
    } catch (err) {
      console.warn('Assignee status update error:', err.message)
      setTicket((prev) => (prev ? { ...prev, status: newStatus } : prev))
    } finally {
      setUpdatingStatus(false)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12 text-center text-sm text-slate-500">
        Loading ticket information...
      </div>
    )
  }

  if (!ticket) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12 text-center">
        <h2 className="text-lg font-bold text-slate-900">Ticket not found</h2>
        <Link to="/dashboard" className="mt-2 text-sm text-blue-600 hover:underline">
          Return to Dashboard
        </Link>
      </div>
    )
  }

  const isResolved = ticket.status === 'RESOLVED'
  const isAssignee = user?.id === ticket.assigned_to
  const isRequester = user?.id === ticket.created_by

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        breadcrumb={
          <Link
            to="/my-tickets"
            className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-800"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to My Tickets
          </Link>
        }
        title={ticket.title}
        subtitle={`Submitted on ${new Date(ticket.created_at).toLocaleDateString()} • Ticket ${ticket.ticket_number}`}
        actions={
          <div className="flex items-center gap-2">
            <StatusBadge status={ticket.status} />
            <PriorityBadge priority={ticket.admin_priority || ticket.user_priority} />
          </div>
        }
      />

      {isAssignee && ticket.status !== 'RESOLVED' && ticket.status !== 'CLOSED' && (
        <div className="mb-6 rounded-2xl border border-blue-200 bg-blue-50/70 p-5 card-shadow flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">You are the Assigned Specialist</h4>
              <p className="text-xs text-slate-600 mt-0.5">
                {ticket.status === 'IN_PROGRESS'
                  ? 'When you have resolved the issue, click Mark as Resolved to notify the requester for verification.'
                  : 'Acknowledge this ticket and start working on the resolution.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {ticket.status !== 'IN_PROGRESS' && (
              <button
                onClick={() => handleAssigneeStatusUpdate('IN_PROGRESS')}
                disabled={updatingStatus}
                className="inline-flex items-center gap-1.5 rounded-lg border border-blue-300 bg-white px-3.5 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition shadow-xs disabled:opacity-50"
              >
                <Clock className="h-3.5 w-3.5" />
                {updatingStatus ? 'Updating...' : 'Mark In Progress'}
              </button>
            )}

            <button
              onClick={() => handleAssigneeStatusUpdate('RESOLVED')}
              disabled={updatingStatus}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition shadow-xs disabled:opacity-50"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              {updatingStatus ? 'Updating...' : 'Mark as Resolved'}
            </button>
          </div>
        </div>
      )}

      {isResolved && isRequester && (
        <div className="mb-6">
          <ResolutionVerifyBox
            ticket={ticket}
            onVerified={() => handleStatusChange('CLOSED')}
            onReopened={() => handleStatusChange('REOPENED')}
          />
        </div>
      )}

      {isResolved && !isRequester && (
        <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 card-shadow flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <p className="text-xs text-emerald-900">
            This ticket is marked as <strong>Resolved</strong>. Waiting for the requester ({ticket.created_by_profile?.full_name || 'Requester'}) to test and confirm closure.
          </p>
        </div>
      )}

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                    <div className="rounded-xl border border-slate-200 bg-white p-6 card-shadow">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
              Description & Details
            </h3>
            <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
              {ticket.description}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-6 pt-4 border-t border-slate-100 text-xs text-slate-500">
              <div>
                <span className="font-medium text-slate-700">Category:</span> {ticket.category}
              </div>
              <div>
                <span className="font-medium text-slate-700">Reported Impact:</span> {ticket.impact}
              </div>
              <div>
                <span className="font-medium text-slate-700">Your Priority Pick:</span> {ticket.user_priority}
              </div>
              {ticket.reopen_count > 0 && (
                <div className="text-rose-600 font-semibold">
                  Reopened: {ticket.reopen_count} time(s)
                </div>
              )}
            </div>
          </div>

                    <AttachmentWidget ticketId={ticket.id} />

                    <CommentBox ticketId={ticket.id} />
        </div>

                <div className="space-y-6">
                    <div className="rounded-xl border border-slate-200 bg-white p-5 card-shadow space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Ticket Details
            </h3>

                        <div>
              <p className="text-xs text-slate-400 mb-1">Assigned Specialist</p>
              {ticket.assignee ? (
                <div className="flex items-center gap-2.5">
                  <Avatar name={ticket.assignee.full_name} size="sm" />
                  <div>
                    <div className="text-xs font-semibold text-slate-800">
                      {ticket.assignee.full_name}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {ticket.assignee.department || 'IT Support'}
                    </div>
                  </div>
                </div>
              ) : (
                <span className="text-xs text-slate-500 italic">Pending assignment</span>
              )}
            </div>

                        <div>
              <p className="text-xs text-slate-400 mb-1">Review Status</p>
              <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ${
                ticket.approval_status === 'APPROVED'
                  ? 'bg-emerald-50 text-emerald-700'
                  : ticket.approval_status === 'REJECTED'
                  ? 'bg-rose-50 text-rose-700'
                  : 'bg-amber-50 text-amber-700'
              }`}>
                {ticket.approval_status || 'PENDING'}
              </span>
              {ticket.rejection_reason && (
                <p className="mt-1 text-xs text-rose-600 italic">
                  Reason: {ticket.rejection_reason}
                </p>
              )}
            </div>

                        <div>
              <p className="text-xs text-slate-400 mb-1">Requester</p>
              <div className="text-xs font-semibold text-slate-800">
                {ticket.created_by_profile?.full_name || 'You'}
              </div>
              <div className="text-[11px] text-slate-400">
                {ticket.created_by_profile?.department || 'Employee'}
              </div>
            </div>
          </div>

                    <TicketHistoryTimeline ticketId={ticket.id} />
        </div>
      </div>
    </div>
  )
}

export default UserTicketDetailsPage
