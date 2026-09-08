import { useState } from 'react'
import { supabase } from '../config/supabaseConfig'
import { useAuth } from '../context/AuthContext'
import { notify } from '../utils/toast'
import { CheckCircle2, RotateCcw, AlertCircle, Send } from 'lucide-react'

export function ResolutionVerifyBox({ ticket, onVerified, onReopened }) {
  const { user } = useAuth()
  const [showReopenInput, setShowReopenInput] = useState(false)
  const [reopenReason, setReopenReason] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleConfirmResolution = async () => {
    setSubmitting(true)
    try {
      if (ticket.id && !ticket.id.startsWith('sample-') && !ticket.id.startsWith('t-')) {
        await supabase
          .from('tickets')
          .update({
            status: 'CLOSED',
            closed_at: new Date().toISOString(),
          })
          .eq('id', ticket.id)

        await supabase.from('ticket_history').insert({
          ticket_id: ticket.id,
          actor_id: user?.id && !user.id.startsWith('demo-') ? user.id : null,
          action: 'VERIFIED_AND_CLOSED',
          new_value: 'CLOSED',
          notes: 'Requester confirmed solution worked and closed ticket.',
        })
      }

      notify.success('Thank you! Ticket has been closed.')
      if (onVerified) onVerified()
    } catch (err) {
      console.warn('Resolution verify error:', err.message)
      if (onVerified) onVerified()
    } finally {
      setSubmitting(false)
    }
  }

  const handleReopenSubmit = async (e) => {
    e.preventDefault()
    if (!reopenReason.trim()) {
      notify.warn('Please describe what is still not working.')
      return
    }

    setSubmitting(true)
    const newReopenCount = (ticket.reopen_count || 0) + 1

    try {
      if (ticket.id && !ticket.id.startsWith('sample-') && !ticket.id.startsWith('t-')) {
        await supabase
          .from('tickets')
          .update({
            status: 'REOPENED',
            reopen_count: newReopenCount,
            resolved_at: null,
          })
          .eq('id', ticket.id)

        await supabase.from('ticket_comments').insert({
          ticket_id: ticket.id,
          user_id: user?.id,
          content: `[REOPENED TICKET]: ${reopenReason.trim()}`,
          is_internal: false,
        })

        await supabase.from('ticket_history').insert({
          ticket_id: ticket.id,
          actor_id: user?.id && !user.id.startsWith('demo-') ? user.id : null,
          action: 'REOPENED_BY_USER',
          old_value: 'RESOLVED',
          new_value: 'REOPENED',
          notes: `Reopen #${newReopenCount}: ${reopenReason.trim()}`,
        })
      }

      notify.ticketReopened()
      if (onReopened) onReopened()
    } catch (err) {
      console.warn('Reopen error:', err.message)
      if (onReopened) onReopened()
    } finally {
      setSubmitting(false)
      setShowReopenInput(false)
    }
  }

  return (
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-6 card-shadow">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
          <CheckCircle2 className="h-5 w-5" />
        </div>

        <div className="flex-1">
          <h4 className="text-base font-bold text-emerald-950">
            Specialist marked this ticket as Resolved
          </h4>
          <p className="mt-1 text-xs text-emerald-800 leading-relaxed">
            Please verify if the issue has been completely fixed on your end. Confirming resolution will archive and close this ticket.
          </p>

          {!showReopenInput ? (
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                disabled={submitting}
                onClick={handleConfirmResolution}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 disabled:opacity-50 transition"
              >
                <CheckCircle2 className="h-4 w-4" />
                Yes, Issue is Resolved (Close Ticket)
              </button>

              <button
                type="button"
                disabled={submitting}
                onClick={() => setShowReopenInput(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-white px-3.5 py-2 text-xs font-semibold text-emerald-900 hover:bg-emerald-50 transition shadow-xs"
              >
                <RotateCcw className="h-3.5 w-3.5 text-rose-600" />
                No, Still Having Trouble (Reopen)
              </button>
            </div>
          ) : (
            <form onSubmit={handleReopenSubmit} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  What is still not working properly?
                </label>
                <textarea
                  rows={2}
                  required
                  value={reopenReason}
                  onChange={(e) => setReopenReason(e.target.value)}
                  placeholder="Explain what steps still fail so the support specialist can investigate..."
                  className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-rose-700 transition shadow-xs"
                >
                  <Send className="h-3 w-3" />
                  {submitting ? 'Reopening...' : 'Confirm Reopen'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowReopenInput(false)}
                  className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-white/80"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
