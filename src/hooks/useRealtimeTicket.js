import { useEffect } from 'react'
import { supabase } from '../config/supabaseConfig'

export function useRealtimeTicket(ticketId, onTicketUpdate, onCommentAdded) {
  useEffect(() => {
    if (!ticketId || ticketId.startsWith('sample-') || ticketId.startsWith('t-')) {
      return
    }

    const ticketChannel = supabase
      .channel(`ticket-realtime-${ticketId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'tickets',
          filter: `id=eq.${ticketId}`,
        },
        (payload) => {
          if (onTicketUpdate && payload.new) {
            onTicketUpdate(payload.new)
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ticket_comments',
          filter: `ticket_id=eq.${ticketId}`,
        },
        (payload) => {
          if (onCommentAdded && payload.new) {
            onCommentAdded(payload.new)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(ticketChannel)
    }
  }, [ticketId, onTicketUpdate, onCommentAdded])
}
