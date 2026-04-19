import Link from 'next/link'
import { MatIcon } from '@/components/ui/mat-icon'
import type { DashboardStatus } from '@/lib/types'

type PendingAction = NonNullable<DashboardStatus['pendingAction']>

export function PendingActionCard({ action }: { action: PendingAction }) {
  return (
    <div className="rounded-xl border-l-4 border-on-primary-container bg-gradient-to-br from-surface-container-lowest to-surface-container-low p-7 ambient-shadow">
      <div className="flex flex-col items-center gap-6 md:flex-row">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-surface-container-high">
          <MatIcon name="upload_file" className="text-3xl text-secondary" />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h3 className="mb-1 text-base font-semibold text-on-surface">
            {action.title}
          </h3>
          <p className="text-sm leading-relaxed text-on-surface-variant">
            {action.description}
          </p>
        </div>
        <Link
          href={action.actionHref}
          className="whitespace-nowrap rounded-lg bg-on-primary-container px-7 py-3 text-sm font-semibold text-on-primary-fixed shadow-lg shadow-on-primary-container/20 hover:opacity-90 transition-opacity"
        >
          {action.actionLabel}
        </Link>
      </div>
    </div>
  )
}
