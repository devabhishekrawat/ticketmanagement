import { useState, useEffect } from 'react'
import { supabase } from '../config/supabaseConfig'
import { Avatar } from './Avatar'
import { X, UserCheck, Search } from 'lucide-react'

const DEMO_STAFF = [
  { id: 'staff-1', full_name: 'David Support', email: 'david@company.internal', department: 'IT Helpdesk', role: 'USER' },
  { id: 'staff-2', full_name: 'Sarah Admin', email: 'sarah@company.internal', department: 'IT Operations', role: 'ADMIN' },
  { id: 'staff-3', full_name: 'Michael Lin', email: 'michael@company.internal', department: 'Network Infra', role: 'USER' },
  { id: 'staff-4', full_name: 'Emma Watson', email: 'emma@company.internal', department: 'Workplace Tech', role: 'USER' },
]

export function AssigneeSelectModal({ ticket, isOpen, onClose, onAssign }) {
  if (!isOpen || !ticket) return null

  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [selectedUserId, setSelectedUserId] = useState(ticket.assigned_to || '')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, email, department, role, avatar_url')
          .order('full_name')

        if (error || !data || data.length === 0) {
          setUsers(DEMO_STAFF)
        } else {
          setUsers(data)
        }
      } catch (err) {
        setUsers(DEMO_STAFF)
      }
    }

    fetchStaff()
  }, [])

  const filteredUsers = users.filter((u) => {
    const name = (u.full_name || u.email || '').toLowerCase()
    const dept = (u.department || '').toLowerCase()
    const term = search.toLowerCase()
    return name.includes(term) || dept.includes(term)
  })

  const handleConfirm = async () => {
    if (!selectedUserId) return
    const chosenUser = users.find((u) => u.id === selectedUserId)

    setSubmitting(true)
    try {
      await onAssign({
        ticketId: ticket.id,
        assigneeId: selectedUserId,
        assigneeName: chosenUser?.full_name || 'Staff Member',
      })
      onClose()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="modal-backdrop">
      <div className="modal-content !max-w-md">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <span className="text-xs font-semibold text-blue-600 uppercase">
              {ticket.ticket_number}
            </span>
            <h3 className="text-base font-bold text-slate-900">Assign Ticket</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search technician by name or department..."
              className="form-input !pl-9"
            />
          </div>

          <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 rounded-lg border border-slate-200">
            {filteredUsers.map((u) => {
              const isSelected = selectedUserId === u.id
              return (
                <div
                  key={u.id}
                  onClick={() => setSelectedUserId(u.id)}
                  className={`flex items-center justify-between p-3 cursor-pointer transition ${
                    isSelected ? 'bg-blue-50' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Avatar name={u.full_name} avatarUrl={u.avatar_url} size="sm" />
                    <div>
                      <p className="text-xs font-semibold text-slate-900 leading-tight">
                        {u.full_name || u.email}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {u.department} • {u.role}
                      </p>
                    </div>
                  </div>

                  {isSelected && <UserCheck className="h-4 w-4 text-blue-600" />}
                </div>
              )
            })}
          </div>
        </div>

        <div className="mt-5 flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
          <button type="button" onClick={onClose} className="btn btn-sm btn-secondary">
            Cancel
          </button>
          <button
            type="button"
            disabled={!selectedUserId || submitting}
            onClick={handleConfirm}
            className="btn btn-sm btn-primary"
          >
            
            <UserCheck className="h-4 w-4" />
            {submitting ? 'Assigning...' : 'Confirm Assignment'}
          </button>
        </div>
      </div>
    </div>
  )
}
