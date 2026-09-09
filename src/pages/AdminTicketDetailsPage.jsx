import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../config/supabaseConfig'
import { TICKET_STATUS, TICKET_PRIORITY } from '../constants/tickets'
import { PageHeader } from '../components/PageHeader'
import { StatusBadge } from '../components/StatusBadge'
import { PriorityBadge } from '../components/PriorityBadge'
import { Avatar } from '../components/Avatar'
import { AssigneeSelectModal } from '../components/AssigneeSelectModal'
import { notify } from '../utils/toast'
import { ArrowLeft, ShieldAlert, CheckCircle2, UserCheck, RefreshCw } from 'lucide-react'

import { CommentBox } from '../components/CommentBox'
import { AttachmentWidget } from '../components/AttachmentWidget'
import { TicketHistoryTimeline } from '../components/TicketHistoryTimeline'
import { useRealtimeTicket } from '../hooks/useRealtimeTicket'

const MOCK_ADMIN_DETAIL = {
  id: 't-101',
  ticket_number: 'TIK-1001',
  title: 'VPN gateway timeout for London branch employees',
  description: 'Employees attempting to authenticate through the EU-West Gateway report handshakes stalling after MFA validation. Network traceroute shows high packet loss at edge proxy. Approximately 25 staff affected.',
  category: 'Network',
  impact: 'Critical',
  user_priority: 'HIGH',
  admin_priority: 'URGENT',
  status: 'IN_PROGRESS',
  approval_status: 'APPROVED',
  reopen_count: 1,
  created_at: new Date(Date.now() - 3600000 * 6).toISOString(),
  created_by_profile: { full_name: 'John Miller', email: 'john@company.internal', department: 'Sales' },
  assignee: { id: 'staff-1', full_name: 'David Support', email: 'david@company.internal', department: 'IT Helpdesk' },
}

export function AdminTicketDetailsPage() {
  const { id } = useParams()
  const [ticket, setTicket] = useState(null)
  const [loading, setLoading] = useState(true)
  const [assignModalOpen, setAssignModalOpen] = useState(false)
  const [updating, setUpdating] = useState(false)

  const fetchTicket = async () => {
    try {
      if (id?.startsWith('t-') || id?.startsWith('sample-')) {
        setTicket({ ...MOCK_ADMIN_DETAIL, id })
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('tickets')
        .select(`
          *,
          created_by_profile:created_by ( full_name, email, department ),
          assignee:assigned_to ( id, full_name, email, department, avatar_url )
        `)
        .eq('id', id)
        .maybeSingle()

      if (error || !data) {
        setTicket({ ...MOCK_ADMIN_DETAIL, id })
      } else {
        setTicket(data)
      }
    } catch (err) {
      setTicket({ ...MOCK_ADMIN_DETAIL, id })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTicket()
  }, [id])

  useRealtimeTicket(id, (updatedPayload) => {
    setTicket((prev) => (prev ? { ...prev, ...updatedPayload } : prev))
  })

  const handleStatusChange = async (newStatus) => {
    setUpdating(true)
    try {
      await supabase
        .from('tickets')
        .update({
          status: newStatus,
          resolved_at: newStatus === 'RESOLVED' ? new Date().toISOString() : null,
          closed_at: newStatus === 'CLOSED' ? new Date().toISOString() : null,
        })
        .eq('id', ticket.id)

      await supabase.from('ticket_history').insert({
        ticket_id: ticket.id,
        action: 'STATUS_CHANGE',
        old_value: ticket.status,
        new_value: newStatus,
        notes: `Admin changed status to ${newStatus}`,
      })
    } catch (e) {
    } finally {
      setUpdating(false)
    }

    setTicket((prev) => ({ ...prev, status: newStatus }))

    if (newStatus === 'RESOLVED') notify.ticketResolved()
    else if (newStatus === 'REOPENED') notify.ticketReopened()
    else notify.success(`Status updated to ${newStatus}`)
  }

  const handlePriorityChange = async (newPriority) => {
    try {
      await supabase
        .from('tickets')
        .update({ admin_priority: newPriority })
        .eq('id', ticket.id)

      await supabase.from('ticket_history').insert({
        ticket_id: ticket.id,
        action: 'PRIORITY_OVERRIDE',
        old_value: ticket.admin_priority,
        new_value: newPriority,
        notes: `Admin set operational priority to ${newPriority}`,
      })
    } catch (e) {}

    setTicket((prev) => ({ ...prev, admin_priority: newPriority }))
    notify.success(`Operational priority adjusted to ${newPriority}`)
  }

  const handleAssign = async ({ assigneeId, assigneeName }) => {
    try {
      await supabase
        .from('tickets')
        .update({ assigned_to: assigneeId, status: ticket.status === 'NEW' ? 'ASSIGNED' : ticket.status })
        .eq('id', ticket.id)

      await supabase.from('ticket_history').insert({
        ticket_id: ticket.id,
        action: 'ASSIGNED',
        new_value: assigneeName,
        notes: `Ticket assigned to ${assigneeName}`,
      })
    } catch (e) {}

    setTicket((prev) => ({
      ...prev,
      assigned_to: assigneeId,
      assignee: { id: assigneeId, full_name: assigneeName },
      status: prev.status === 'NEW' ? 'ASSIGNED' : prev.status,
    }))
    notify.ticketAssigned(assigneeName)
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12 text-center text-sm text-slate-500">
        Loading admin ticket view...
      </div>
    )
  }

  if (!ticket) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12 text-center">
        <h2 className="text-lg font-bold text-slate-900">Ticket not found</h2>
        <Link to="/admin" className="mt-2 text-sm text-blue-600 hover:underline">
          Return to Admin Dashboard
        </Link>
      </div>
    )
  }

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
        title={ticket.title}
        subtitle={`Ticket ${ticket.ticket_number} • Category: ${ticket.category} • Created ${new Date(ticket.created_at).toLocaleString()}`}
        actions={
          <div className="flex items-center gap-2">
            <StatusBadge status={ticket.status} />
            <PriorityBadge priority={ticket.admin_priority || ticket.user_priority} />
          </div>
        }
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-purple-200 bg-purple-50/50 p-4 card-shadow">
        <div className="flex items-center gap-2 text-xs font-semibold text-purple-900">
          <ShieldAlert className="h-4 w-4 text-purple-600" />
          <span>Admin Operations Bar</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
            <span>Status:</span>
            <select
              disabled={updating}
              value={ticket.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:border-purple-500 focus:outline-none"
            >
              {Object.values(TICKET_STATUS).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
            <span>Operational Priority:</span>
            <select
              value={ticket.admin_priority || ticket.user_priority}
              onChange={(e) => handlePriorityChange(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:border-purple-500 focus:outline-none"
            >
              {Object.values(TICKET_PRIORITY).map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setAssignModalOpen(true)}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-xs"
          >
            <RefreshCw className="h-3.5 w-3.5 text-blue-600" />
            Reassign Lead
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 card-shadow">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
              Incident Summary & Context
            </h3>
            <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
              {ticket.description}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-6 pt-4 border-t border-slate-100 text-xs text-slate-500">
              <div>
                <span className="font-semibold text-slate-700">Category:</span> {ticket.category}
              </div>
              <div>
                <span className="font-semibold text-slate-700">User Impact:</span> {ticket.impact}
              </div>
              <div>
                <span className="font-semibold text-slate-700">User Requested Priority:</span> {ticket.user_priority}
              </div>
              <div>
                <span className="font-semibold text-purple-700">Admin Operational Priority:</span> {ticket.admin_priority}
              </div>
              {ticket.reopen_count > 0 && (
                <div className="text-rose-600 font-semibold">
                  Reopened: {ticket.reopen_count} times
                </div>
              )}
            </div>
          </div>

          <AttachmentWidget ticketId={ticket.id} />

          <CommentBox ticketId={ticket.id} isStaff={true} />
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-5 card-shadow space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Assigned Specialist
            </h3>

            <div>
              <p className="text-xs text-slate-400 mb-1">Assignee</p>
              {ticket.assignee ? (
                <div className="flex items-center gap-2.5">
                  <Avatar name={ticket.assignee.full_name} size="sm" />
                  <div>
                    <div className="text-xs font-semibold text-slate-800">
                      {ticket.assignee.full_name}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {ticket.assignee.department || 'Support Specialist'}
                    </div>
                  </div>
                </div>
              ) : (
                <span className="text-xs text-rose-500 font-medium italic">Unassigned (Action required)</span>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100">
              <p className="text-xs text-slate-400 mb-1">Requester</p>
              <div className="text-xs font-semibold text-slate-800">
                {ticket.created_by_profile?.full_name || 'Employee'}
              </div>
              <div className="text-[11px] text-slate-400">
                {ticket.created_by_profile?.department} • {ticket.created_by_profile?.email}
              </div>
            </div>
          </div>

          <TicketHistoryTimeline ticketId={ticket.id} />
        </div>
      </div>

      <AssigneeSelectModal
        ticket={ticket}
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        onAssign={handleAssign}
      />
    </div>
  )
}

export default AdminTicketDetailsPage
