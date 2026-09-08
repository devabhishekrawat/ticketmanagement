import { supabase } from '../config/supabaseConfig'

export async function logTicketHistory({ ticketId, actorId, action, oldValue, newValue, notes }) {
  try {
    const { error } = await supabase.from('ticket_history').insert({
      ticket_id: ticketId,
      actor_id: actorId && !actorId.startsWith('demo-') ? actorId : null,
      action,
      old_value: oldValue || null,
      new_value: newValue || null,
      notes: notes || null,
    })
    if (error) console.warn('Could not log history to Supabase:', error.message)
  } catch (err) {
    console.warn('History logging error:', err.message)
  }
}

export async function transitionTicketStatus({ ticketId, newStatus, currentStatus, actorId, notes }) {
  const updates = {
    status: newStatus,
  }

  if (newStatus === 'RESOLVED') {
    updates.resolved_at = new Date().toISOString()
  } else if (newStatus === 'CLOSED') {
    updates.closed_at = new Date().toISOString()
  }

  try {
    const { error } = await supabase
      .from('tickets')
      .update(updates)
      .eq('id', ticketId)

    if (error) throw error

    await logTicketHistory({
      ticketId,
      actorId,
      action: 'STATUS_CHANGE',
      oldValue: currentStatus,
      newValue: newStatus,
      notes: notes || `Status changed from ${currentStatus} to ${newStatus}`,
    })

    return true
  } catch (err) {
    console.warn('Ticket status update error:', err.message)
    return false
  }
}
