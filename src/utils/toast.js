import { toast } from 'react-toastify'

const defaultOptions = {
  position: 'top-right',
  autoClose: 3500,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
}

export const notify = {
  success: (msg) => toast.success(msg, defaultOptions),
  error: (msg) => toast.error(msg, defaultOptions),
  info: (msg) => toast.info(msg, defaultOptions),
  warn: (msg) => toast.warning(msg, defaultOptions),

  ticketCreated: (ticketNumber) =>
    toast.success(`Ticket ${ticketNumber || ''} created successfully!`, defaultOptions),
  ticketAssigned: (assigneeName) =>
    toast.info(`Ticket assigned to ${assigneeName || 'user'}`, defaultOptions),
  ticketResolved: () =>
    toast.success('Ticket marked as resolved. Pending requester verification.', defaultOptions),
  ticketReopened: () =>
    toast.warn('Ticket reopened. Moved back to In Progress.', defaultOptions),
  newComment: (authorName) =>
    toast.info(`New comment from ${authorName || 'teammate'}`, defaultOptions),
}
