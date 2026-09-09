import { useState, useEffect } from 'react'
import { supabase } from '../config/supabaseConfig'
import { History, CheckCircle2, ArrowRight, Shield, User, AlertCircle, RefreshCw } from 'lucide-react'
 
const MOCK_HISTORY = [
  {
    id: 'h-1',
    action: 'TICKET_CREATED',
    old_value: null,
    new_value: 'NEW',
    notes: 'Ticket submitted with priority HIGH',
    created_at: new Date(Date.now() - 3600000 * 6).toISOString(),
    actor: { full_name: 'Alex Employee' },
  },
  {
    id: 'h-2',
    action: 'APPROVED_BY_ADMIN',
    old_value: 'PENDING',
    new_value: 'APPROVED',
    notes: 'Triage approved. Priority confirmed as HIGH',
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    actor: { full_name: 'Sarah Admin' },
  },
  {
    id: 'h-3',
    action: 'ASSIGNED',
    old_value: null,
    new_value: 'David Support',
    notes: 'Assigned to David Support',
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    actor: { full_name: 'Sarah Admin' },
  },
  {
    id: 'h-4',
    action: 'STATUS_CHANGE',
    old_value: 'ASSIGNED',
    new_value: 'IN_PROGRESS',
    notes: 'Investigating network gateway logs',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    actor: { full_name: 'David Support' },
  },
]
 
export function TicketHistoryTimeline({ ticketId }) {
  const [history, setHistory] = useState([])
 
  const fetchHistory = async () => {
    if (!ticketId || ticketId.startsWith('sample-') || ticketId.startsWith('t-')) {
      setHistory(MOCK_HISTORY)
      return
    }
 
    try {
      const { data, error } = await supabase
        .from('ticket_history')
        .select(`
          id,
          action,
          old_value,
          new_value,
          notes,
          created_at,
          actor:actor_id ( full_name, email, role )
        `)
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: false })
      if (error) {
        setHistory([])
      } else {
        setHistory(data || [])
      }
    } catch (err) {
      setHistory([])
    }
  }
 
  useEffect(() => {
    fetchHistory()
  }, [ticketId])
 
  const formatActionTitle = (action, item) => {
    switch (action) {
      case 'TICKET_CREATED':
        return 'Ticket Raised'
      case 'APPROVED_BY_ADMIN':
        return 'Triage Approved by Admin'
      case 'REJECTED_BY_ADMIN':
        return 'Ticket Declined by Admin'
      case 'ASSIGNED':
        return `Assigned to ${item.new_value || 'Specialist'}`
      case 'STATUS_CHANGE':
        return `Status changed to ${item.new_value}`
      case 'PRIORITY_OVERRIDE':
        return `Priority adjusted to ${item.new_value}`
      case 'REOPENED_BY_USER':
        return 'Requester Reopened Ticket'
      case 'VERIFIED_AND_CLOSED':
        return 'Requester Confirmed Fix & Closed'
      case 'REASSIGNED_BY_ADMIN':
        return `Reassigned to ${item.new_value}`
      default:
        return action.replace(/_/g, ' ')
    }
  }
 
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 card-shadow space-y-4">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
        <History className="h-4 w-4 text-blue-600" />
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Activity History
        </h3>
      </div>
      {history.length === 0 ? (
        <p className="text-xs text-slate-400 py-2">No activity recorded yet.</p>
      ) : (
        <div className="relative pl-4">
          <div className="absolute left-[21px] top-2 bottom-2 w-0.5 bg-slate-200" />
        <div className="space-y-4">
          {history.map((item, idx) => (
            <div key={item.id || idx} className="relative flex items-start gap-3">
              {}
              <div className="relative z-10 mt-1 h-3 w-3 rounded-full border-2 border-white bg-blue-600 shadow-xs" />
 
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-800 leading-tight">
                  {formatActionTitle(item.action, item)}
                </p>
 
                {item.notes && (
                  <p className="mt-0.5 text-[11px] text-slate-500 line-clamp-2">
                    {item.notes}
                  </p>
                )}
 
                <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-400">
                  <span>{item.actor?.full_name || 'System / Staff'}</span>
                  <span>•</span>
                  <span>{new Date(item.created_at).toLocaleDateString()} {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      )}
    </div>
  )
}