import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../shared/context/AuthContext'
import { supabase } from '../../shared/services/supabase'
import { ROUTES } from '../../shared/constants/routes'
import { PageHeader } from '../../shared/components/PageHeader'
import { StatusBadge } from '../../shared/components/StatusBadge'
import { PriorityBadge } from '../../shared/components/PriorityBadge'
import { Avatar } from '../../shared/components/Avatar'
import { ArrowLeft, Clock, Calendar, Shield, AlertCircle } from 'lucide-react'

import { CommentBox } from '../../src3/components/CommentBox'
import { AttachmentWidget } from '../../src3/components/AttachmentWidget'
import { TicketHistoryTimeline } from '../../src3/components/TicketHistoryTimeline'
import { ResolutionVerifyBox } from '../../src3/components/ResolutionVerifyBox'
import { useRealtimeTicket } from '../../src3/hooks/useRealtimeTicket'

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

  const handleStatusChange = (newStatus) => {
    setTicket((prev) => (prev ? { ...prev, status: newStatus } : prev))
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
        <Link to={ROUTES.DASHBOARD} className="mt-2 text-sm text-blue-600 hover:underline">
          Return to Dashboard
        </Link>
      </div>
    )
  }

  const isResolved = ticket.status === 'RESOLVED'

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        breadcrumb={
          <Link
            to={ROUTES.MY_TICKETS}
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

      {}
      {isResolved && (
        <div className="mb-6">
          <ResolutionVerifyBox
            ticket={ticket}
            onVerified={() => handleStatusChange('CLOSED')}
            onReopened={() => handleStatusChange('REOPENED')}
          />
        </div>
      )}

      {}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {}
        <div className="lg:col-span-2 space-y-6">
          {}
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

          {}
          <AttachmentWidget ticketId={ticket.id} />

          {}
          <CommentBox ticketId={ticket.id} />
        </div>

        {}
        <div className="space-y-6">
          {}
          <div className="rounded-xl border border-slate-200 bg-white p-5 card-shadow space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Ticket Details
            </h3>

            {}
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

            {}
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

            {}
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

          {}
          <TicketHistoryTimeline ticketId={ticket.id} />
        </div>
      </div>
    </div>
  )
}
