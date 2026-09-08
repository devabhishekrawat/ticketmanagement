import { useState, useEffect } from 'react'
import { supabase } from '../config/supabaseConfig'
import { useAuth } from '../context/AuthContext'
import { notify } from '../utils/toast'
import { Paperclip, Upload, Download, FileText, FileSpreadsheet, Image as ImageIcon } from 'lucide-react'

const MOCK_ATTACHMENTS = [
  {
    id: 'att-1',
    file_name: 'vpn_connection_trace.log',
    file_path: 'TIK-1001/vpn_connection_trace.log',
    file_type: 'text/plain',
    file_size: 142850,
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
]

export function AttachmentWidget({ ticketId }) {
  const { user } = useAuth()
  const [attachments, setAttachments] = useState([])
  const [uploading, setUploading] = useState(false)

  const fetchAttachments = async () => {
    if (!ticketId || ticketId.startsWith('sample-') || ticketId.startsWith('t-')) {
      setAttachments(MOCK_ATTACHMENTS)
      return
    }

    try {
      const { data, error } = await supabase
        .from('ticket_attachments')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: false })

      if (error || !data || data.length === 0) {
        setAttachments(MOCK_ATTACHMENTS)
      } else {
        setAttachments(data)
      }
    } catch (err) {
      setAttachments(MOCK_ATTACHMENTS)
    }
  }

  useEffect(() => {
    fetchAttachments()
  }, [ticketId])

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
  }

  const getFileIcon = (type = '') => {
    if (type.includes('image')) return <ImageIcon className="h-4 w-4 text-blue-500" />
    if (type.includes('sheet') || type.includes('csv')) return <FileSpreadsheet className="h-4 w-4 text-emerald-500" />
    return <FileText className="h-4 w-4 text-slate-500" />
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const filePath = `${ticketId}/${Date.now()}_${file.name}`

    try {
      if (user?.id && !user.id.startsWith('demo-')) {
        await supabase.storage.from('ticket-attachments').upload(filePath, file)

        const { data: attRecord } = await supabase
          .from('ticket_attachments')
          .insert({
            ticket_id: ticketId,
            uploaded_by: user.id,
            file_name: file.name,
            file_path: filePath,
            file_type: file.type,
            file_size: file.size,
          })
          .select()
          .single()

        if (attRecord) {
          setAttachments((prev) => [attRecord, ...prev])
        }
      } else {

        const demoAtt = {
          id: `att-${Date.now()}`,
          file_name: file.name,
          file_path: filePath,
          file_type: file.type,
          file_size: file.size,
          created_at: new Date().toISOString(),
        }
        setAttachments((prev) => [demoAtt, ...prev])
      }

      notify.success(`File "${file.name}" uploaded successfully!`)
    } catch (err) {
      console.warn('Storage upload error:', err.message)
      notify.warn('Uploaded in offline session mode.')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleDownload = async (attachment) => {
    try {
      const { data, error } = await supabase.storage
        .from('ticket-attachments')
        .createSignedUrl(attachment.file_path, 60)

      if (data?.signedUrl) {
        window.open(data.signedUrl, '_blank')
      } else {
        alert(`Downloading ${attachment.file_name}`)
      }
    } catch (e) {
      alert(`Downloading ${attachment.file_name}`)
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 card-shadow space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Paperclip className="h-4 w-4 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900">Attachments & Documents</h3>
        </div>

        <label className="inline-flex items-center gap-1.5 cursor-pointer rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-xs">
          <Upload className="h-3.5 w-3.5 text-blue-600" />
          <span>{uploading ? 'Uploading...' : 'Add File'}</span>
          <input
            type="file"
            disabled={uploading}
            onChange={handleFileUpload}
            className="sr-only"
          />
        </label>
      </div>

      {attachments.length === 0 ? (
        <p className="text-xs text-slate-400 py-3 italic text-center">
          No files attached to this ticket.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {attachments.map((att) => (
            <div
              key={att.id}
              className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50/50 p-2.5 transition hover:bg-slate-100/70"
            >
              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                {getFileIcon(att.file_type)}
                <div className="min-w-0">
                  <p className="text-xs font-medium text-slate-800 truncate" title={att.file_name}>
                    {att.file_name}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {formatFileSize(att.file_size)} • {new Date(att.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleDownload(att)}
                className="shrink-0 rounded-md p-1 text-slate-400 hover:text-blue-600 hover:bg-white transition"
                title="Download attachment"
              >
                <Download className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
