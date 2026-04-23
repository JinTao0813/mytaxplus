'use client'

import type { ReliefPendingNudge } from '@/lib/types'
import { MatIcon } from '@/components/ui/mat-icon'

function formatRM(n: number) {
  return `RM ${n.toLocaleString('en-MY', { minimumFractionDigits: 2 })}`
}

interface Props {
  nudge: ReliefPendingNudge
  onAccept: () => void
  onIgnore: () => void
}

export function AiReliefNudge({ nudge, onAccept, onIgnore }: Props) {
  return (
    <div
      className="relative overflow-hidden rounded-xl border-l-4 border-secondary bg-surface-container-low px-4 py-3 shadow-sm"
      role="status"
      aria-live="polite"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 0%, var(--secondary-fixed) 0%, transparent 45%),
            radial-gradient(circle at 80% 100%, var(--tertiary-fixed) 0%, transparent 40%)`,
        }}
      />
      <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3 min-w-0">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-container-high text-secondary">
            <MatIcon name="auto_awesome" className="text-lg" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold leading-snug text-on-surface">
              {nudge.headline}
            </p>
            <p className="mt-1 text-xs text-on-surface-variant">
              {nudge.vendor ? `${nudge.vendor} · ` : null}
              {formatRM(nudge.amount)}
              {nudge.documentId ? (
                <span className="text-on-surface-variant/70">
                  {' '}
                  · doc {nudge.documentId}
                </span>
              ) : null}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 gap-2 sm:pl-2">
          <button
            type="button"
            onClick={onAccept}
            className="rounded-lg bg-on-primary-container px-4 py-2 text-xs font-semibold text-on-primary-fixed transition-opacity hover:opacity-90"
          >
            Accept
          </button>
          <button
            type="button"
            onClick={onIgnore}
            className="rounded-lg bg-surface-container-high px-4 py-2 text-xs font-semibold text-on-surface-variant transition-colors hover:bg-surface-container-highest"
          >
            Ignore
          </button>
        </div>
      </div>
    </div>
  )
}
