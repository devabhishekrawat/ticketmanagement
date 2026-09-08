export const TICKET_STATUS = {
  NEW: 'NEW',
  ASSIGNED: 'ASSIGNED',
  IN_PROGRESS: 'IN_PROGRESS',
  RESOLVED: 'RESOLVED',
  REOPENED: 'REOPENED',
  CLOSED: 'CLOSED',
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED',
}

export const TICKET_PRIORITY = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  URGENT: 'URGENT',
}

export const CATEGORIES = [
  'Hardware',
  'Software',
  'Network',
  'Access & Security',
  'Email & Accounts',
  'Other',
]

export const IMPACT_LEVELS = [
  { value: 'Low', label: 'Low - Minor inconvenience', suggestedPriority: 'LOW' },
  { value: 'Medium', label: 'Medium - Affects some daily tasks', suggestedPriority: 'MEDIUM' },
  { value: 'High', label: 'High - Major blocker for my work', suggestedPriority: 'HIGH' },
  { value: 'Critical', label: 'Critical - System down or team cannot work', suggestedPriority: 'URGENT' },
]

export const getSuggestedPriority = (impact) => {
  const match = IMPACT_LEVELS.find((i) => i.value === impact)
  return match ? match.suggestedPriority : 'MEDIUM'
}
