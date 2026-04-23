import 'server-only'

import { currentUtcYear } from '@/lib/date'

export type DashboardStatus = {
  filingYear: number
  status: 'not_started' | 'draft' | 'in_progress' | 'submitted'
  completionPercent: number
  estimatedRefund: number
  pendingAction: {
    title: string
    description: string
    actionLabel: string
    actionHref: string
  } | null
}

export function getDashboardStatus(): DashboardStatus {
  const filingYear = currentUtcYear()
  return {
    filingYear,
    status: 'draft',
    completionPercent: 10,
    estimatedRefund: 0,
    pendingAction: {
      title: 'Upload your EA form',
      description: 'Add your EA form to start building your tax profile.',
      actionLabel: 'Go to Uploads',
      actionHref: '/upload',
    },
  }
}
