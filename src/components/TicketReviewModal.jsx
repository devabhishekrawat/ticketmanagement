import { useState } from 'react'
import { TICKET_PRIORITY, CATEGORIES } from '../constants/tickets'
import { PriorityBadge } from './PriorityBadge'
import { X, CheckCircle, XCircle } from 'lucide-react'

export function TicketReviewModal({ ticket, isOpen, onClose, onApprove, onReject }) {
  if (!isOpen || !ticket) return null

  const [adminPriority, setAdminPriority] = useState(ticket.admin_priority || ticket.user_priority || 'MEDIUM')
  const [category, setCategory] = useState(ticket.category || CATEGORIES[0])
  const [rejectionReason, setRejectionReason] = useState('')
  const [isRejecting, setIsRejecting] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleApproveSubmit = async () => {
    setSubmitting(true)
    try {
      await onApprove({
        ticketId: ticket.id,
        adminPriority,
        category,
      })
      onClose()
    } finally {
      setSubmitting(false)
    }
  }

  const handleRejectSubmit = async () => {
    if (!rejectionReason.trim()) {
      alert('Please specify a rejection reason.')
      return
    }
    setSubmitting(true)
    try {
      await onReject({
        ticketId: ticket.id,
        rejectionReason: rejectionReason.trim(),
      })
      onClose()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <span className="text-xs font-semibold text-blue-600 uppercase">
              {ticket.ticket_number}
            </span>
            <h3 className="text-base font-bold text-slate-900">Review & Triage Ticket</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-slate-800">{ticket.title}</h4>
            <p className="mt-1 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 max-h-32 overflow-y-auto">
              {ticket.description}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg text-xs">
            <div>
              <span className="text-slate-500 block mb-0.5">Reported Impact:</span>
              <span className="font-semibold text-slate-800">{ticket.impact}</span>
            </div>
            <div>
              <span className="text-slate-500 block mb-0.5">User Priority:</span>
              <PriorityBadge priority={ticket.user_priority} size="xs" />
            </div>
          </div>

          {!isRejecting ? (
            <>
              <div>
                <label className="form-label">Confirmed Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="form-select"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">Operational Admin Priority</label>
                <select
                  value={adminPriority}
                  onChange={(e) => setAdminPriority(e.target.value)}
                  className="form-select font-semibold"
                >
                  {Object.values(TICKET_PRIORITY).map((p) => (
                    <option key={p} value={p}>{p} Priority</option>
                  ))}
                </select>
                <p className="mt-1 text-[11px] text-slate-500">
                  The user's original priority selection will be preserved in the audit log.
                </p>
              </div>
            </>
          ) : (
            <div>
              <label className="form-label text-rose-700">Rejection Reason</label>
              <textarea
                rows={3}
                required
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explain why this request cannot be fulfilled..."
                className="form-textarea border-rose-300"
              />
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
          {!isRejecting ? (
            <>
              <button
                type="button"
                onClick={() => setIsRejecting(true)}
                className="btn btn-sm btn-outline text-rose-600 border-rose-200 hover:bg-rose-50"
              >
                <XCircle className="h-4 w-4 text-rose-600" />
                Reject Ticket
              </button>

              <div className="flex items-center gap-2">
                <button type="button" onClick={onClose} className="btn btn-sm btn-secondary">
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleApproveSubmit}
                  className="btn btn-sm btn-success"
                >
                  <CheckCircle className="h-4 w-4" />
                  {submitting ? 'Approving...' : 'Approve & Triage'}
                </button>
              </div>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setIsRejecting(false)}
                className="btn btn-sm btn-secondary"
              >
                Back
              </button>

              <div className="flex items-center gap-2">
                <button type="button" onClick={onClose} className="btn btn-sm btn-secondary">
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleRejectSubmit}
                  className="btn btn-sm btn-danger"
                >
                  <XCircle className="h-4 w-4" />
                  {submitting ? 'Rejecting...' : 'Confirm Rejection'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
