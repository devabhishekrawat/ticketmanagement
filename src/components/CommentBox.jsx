import { useState, useEffect } from 'react'
import { supabase } from '../config/supabaseConfig'
import { useAuth } from '../context/AuthContext'
import { Avatar } from './Avatar'
import { notify } from '../utils/toast'
import { Send, Lock, MessageSquare } from 'lucide-react'

const MOCK_COMMENTS = [
  {
    id: 'c-1',
    user_id: 'staff-2',
    content: 'License request has been processed and submitted to procurement for billing approval.',
    is_internal: false,
    created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
    user: { full_name: 'Sarah Admin', email: 'sarah@company.internal', role: 'ADMIN' },
  },
  {
    id: 'c-2',
    user_id: 'staff-1',
    content: 'Internal note: Staging VPN edge certificates renewed yesterday. Checking handshake keys.',
    is_internal: true,
    created_at: new Date(Date.now() - 3600000 * 1.5).toISOString(),
    user: { full_name: 'David Support', email: 'david@company.internal', role: 'USER' },
  },
]

export function CommentBox({ ticketId, isStaff = false }) {
  const { user, profile, isAdmin } = useAuth()
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [isInternal, setIsInternal] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const fetchComments = async () => {
    if (!ticketId || ticketId.startsWith('sample-') || ticketId.startsWith('t-')) {
      setComments(MOCK_COMMENTS)
      return
    }

    try {
      const { data, error } = await supabase
        .from('ticket_comments')
        .select(`
          id,
          content,
          is_internal,
          created_at,
          user:user_id ( full_name, email, role, avatar_url )
        `)
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true })

      if (error) {
        setComments([])
      } else {
        setComments(data || [])
      }
    } catch (err) {
      setComments([])
    }
  }

  useEffect(() => {
    fetchComments()

    if (!ticketId || ticketId.startsWith('sample-') || ticketId.startsWith('t-')) return

    const channel = supabase
      .channel(`comments-realtime-${ticketId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ticket_comments',
          filter: `ticket_id=eq.${ticketId}`,
        },
        async (payload) => {
          if (!payload.new?.id) return

          const { data: fullComment } = await supabase
            .from('ticket_comments')
            .select(`
              id,
              content,
              is_internal,
              created_at,
              user:user_id ( full_name, email, role, avatar_url )
            `)
            .eq('id', payload.new.id)
            .maybeSingle()

          if (fullComment) {
            setComments((prev) => {
              if (prev.some((c) => c.id === fullComment.id)) return prev
              return [...prev, fullComment]
            })
            if (payload.new.user_id !== user?.id) {
              notify.newComment(fullComment.user?.full_name || 'Teammate')
            }
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [ticketId, user?.id])

  const handleAddComment = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) return

    setSubmitting(true)
    const content = newComment.trim()
    const authorName = profile?.full_name || user?.email?.split('@')[0] || 'You'

    const localItem = {
      id: `c-${Date.now()}`,
      content,
      is_internal: isInternal,
      created_at: new Date().toISOString(),
      user: {
        full_name: authorName,
        email: user?.email,
        role: profile?.role || 'USER',
      },
    }

    try {
      if (user?.id && !user.id.startsWith('demo-')) {
        await supabase.from('ticket_comments').insert({
          ticket_id: ticketId,
          user_id: user.id,
          content,
          is_internal: isInternal,
        })
      }
    } catch (e) {
      console.warn('Comment upload fallback')
    } finally {
      setComments((prev) => [...prev, localItem])
      setNewComment('')
      setSubmitting(false)
      notify.newComment(authorName)
    }
  }

  const canSeeInternal = isAdmin || isStaff
  const visibleComments = comments.filter((c) => !c.is_internal || canSeeInternal)

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 card-shadow space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900">Discussion & Updates</h3>
        </div>
        <span className="text-xs text-slate-400 font-medium">
          {visibleComments.length} {visibleComments.length === 1 ? 'message' : 'messages'}
        </span>
      </div>

      {}
      <div className="space-y-4">
        {visibleComments.length === 0 ? (
          <p className="text-center text-xs text-slate-400 py-4 italic">
            No comments yet. Start the conversation below.
          </p>
        ) : (
          visibleComments.map((c) => (
            <div
              key={c.id}
              className={`rounded-xl p-4 transition ${
                c.is_internal
                  ? 'bg-amber-50/75 border border-amber-200'
                  : 'bg-slate-50/75 border border-slate-100'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Avatar name={c.user?.full_name || c.user?.email} size="xs" />
                  <span className="text-xs font-semibold text-slate-800">
                    {c.user?.full_name || c.user?.email || 'User'}
                  </span>
                  {c.user?.role === 'ADMIN' && (
                    <span className="rounded bg-purple-100 px-1.5 py-0.2 text-[10px] font-semibold text-purple-700">
                      IT Staff
                    </span>
                  )}
                  {c.is_internal && (
                    <span className="inline-flex items-center gap-1 rounded bg-amber-100 px-1.5 py-0.2 text-[10px] font-semibold text-amber-800">
                      <Lock className="h-2.5 w-2.5" /> Internal Note
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-slate-400">
                  {new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap pl-8">
                {c.content}
              </p>
            </div>
          ))
        )}
      </div>

      {}
      <form onSubmit={handleAddComment} className="pt-2">
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
          <textarea
            rows={3}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Type a response or question..."
            className="w-full resize-none p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />

          <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/75 px-3 py-2">
            {canSeeInternal ? (
              <label className="flex items-center gap-1.5 cursor-pointer text-xs text-slate-600 select-none">
                <input
                  type="checkbox"
                  checked={isInternal}
                  onChange={(e) => setIsInternal(e.target.checked)}
                  className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 h-3.5 w-3.5"
                />
                <span className="flex items-center gap-1 font-medium text-[11px] text-amber-900">
                  <Lock className="h-3 w-3 text-amber-600" /> Internal note (staff only)
                </span>
              </label>
            ) : (
              <span className="text-[11px] text-slate-400">Press send to notify support team</span>
            )}

            <button
              type="submit"
              disabled={!newComment.trim() || submitting}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 disabled:opacity-50 transition"
            >
              <Send className="h-3 w-3" />
              {submitting ? 'Sending...' : 'Send'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
