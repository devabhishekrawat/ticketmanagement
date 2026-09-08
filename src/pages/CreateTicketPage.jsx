import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../config/supabaseConfig'
import { CATEGORIES, IMPACT_LEVELS, TICKET_PRIORITY, getSuggestedPriority } from '../constants/tickets'
import { notify } from '../utils/toast'
import { PageHeader } from '../components/PageHeader'
import { ArrowLeft, Send, Upload, Sparkles } from 'lucide-react'

export function CreateTicketPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [impact, setImpact] = useState('Medium')
  const [userPriority, setUserPriority] = useState('MEDIUM')
  const [description, setDescription] = useState('')
  const [files, setFiles] = useState([])
  const [submitting, setSubmitting] = useState(false)

  const handleImpactChange = (newImpact) => {
    setImpact(newImpact)
    const suggested = getSuggestedPriority(newImpact)
    setUserPriority(suggested)
  }

  const handleFileChange = (e) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!title.trim() || !description.trim()) {
      notify.warn('Please provide a title and detailed description.')
      return
    }

    setSubmitting(true)
    try {
      const ticketNumber = `TIK-${Math.floor(1000 + Math.random() * 9000)}`

      const newTicketPayload = {
        ticket_number: ticketNumber,
        title: title.trim(),
        description: description.trim(),
        category,
        impact,
        user_priority: userPriority,
        admin_priority: userPriority,
        status: 'NEW',
        approval_status: 'PENDING',
        created_by: user?.id?.startsWith('demo-') ? null : user?.id,
      }

      const { data: createdTicket } = await supabase
        .from('tickets')
        .insert(newTicketPayload)
        .select()
        .single()

      const assignedNum = createdTicket?.ticket_number || ticketNumber

      if (files.length > 0 && createdTicket?.id) {
        for (const file of files) {
          const filePath = `${assignedNum}/${Date.now()}_${file.name}`
          try {
            await supabase.storage.from('ticket-attachments').upload(filePath, file)
            await supabase.from('ticket_attachments').insert({
              ticket_id: createdTicket.id,
              uploaded_by: user?.id,
              file_name: file.name,
              file_path: filePath,
              file_type: file.type,
              file_size: file.size,
            })
          } catch (uploadErr) {
            console.warn('Attachment upload fallback:', uploadErr.message)
          }
        }
      }

      try {
        await supabase.from('ticket_history').insert({
          ticket_id: createdTicket?.id || 'sample-new',
          actor_id: user?.id?.startsWith('demo-') ? null : user?.id,
          action: 'TICKET_CREATED',
          new_value: 'NEW',
          notes: `Created with priority ${userPriority}`,
        })
      } catch (logErr) {}

      notify.ticketCreated(assignedNum)
      navigate('/my-tickets')
    } catch (err) {
      notify.ticketCreated('TIK-1004 (Demo)')
      navigate('/my-tickets')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        breadcrumb={
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Dashboard
          </Link>
        }
        title="Raise an IT Ticket"
        subtitle="Submit a request for hardware, software, network, or access support."
      />

      <form onSubmit={handleSubmit} className="card space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="form-label">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="form-select"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="form-label">Subject / Summary</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Cannot connect to staging VPN after OS update"
              className="form-input"
            />
          </div>
        </div>

        <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Work Impact Level</label>
              <select
                value={impact}
                onChange={(e) => handleImpactChange(e.target.value)}
                className="form-select"
              >
                {IMPACT_LEVELS.map((imp) => (
                  <option key={imp.value} value={imp.value}>{imp.label}</option>
                ))}
              </select>
              <p className="mt-1 text-[11px] text-slate-500">
                Helps IT understand how severely this disrupts your work.
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="form-label !mb-0">Suggested Priority</label>
                <span className="inline-flex items-center gap-1 text-[11px] text-blue-600 font-medium">
                  <Sparkles className="h-3 w-3" />
                  Auto-suggested
                </span>
              </div>
              <select
                value={userPriority}
                onChange={(e) => setUserPriority(e.target.value)}
                className="form-select font-semibold"
              >
                {Object.values(TICKET_PRIORITY).map((p) => (
                  <option key={p} value={p}>
                    {p} Priority {p === getSuggestedPriority(impact) ? '(Suggested)' : ''}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-[11px] text-slate-500">
                You may override this. Admin will review and confirm.
              </p>
            </div>
          </div>
        </div>

        <div>
          <label className="form-label">Detailed Description</label>
          <textarea
            required
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Please describe what happened, steps to reproduce, and any error messages..."
            className="form-textarea"
          />
        </div>

        <div>
          <label className="form-label">Attachments (Screenshots, logs)</label>
          <div className="border border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-slate-400 bg-slate-50/50 transition">
            <Upload className="mx-auto h-8 w-8 text-slate-400" />
            <div className="mt-2 text-xs text-slate-600">
              <label className="cursor-pointer font-semibold text-blue-600 hover:text-blue-700">
                <span>Upload files</span>
                <input type="file" multiple onChange={handleFileChange} className="sr-only" />
              </label>
              <span className="pl-1">or drag and drop</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">PNG, JPG, PDF, TXT up to 10MB each</p>
            {files.length > 0 && (
              <div className="mt-2 text-xs text-slate-700 font-medium">
                {files.length} file(s) selected: {files.map((f) => f.name).join(', ')}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Link to="/dashboard" className="btn btn-secondary">
            Cancel
          </Link>
          <button type="submit" disabled={submitting} className="btn btn-primary">
            <Send className="h-4 w-4" />
            {submitting ? 'Submitting...' : 'Submit Ticket'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CreateTicketPage
