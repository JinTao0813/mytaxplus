'use client'

import { useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { MatIcon } from '@/components/ui/mat-icon'
import type { Relief } from '@/lib/types'

function formatRM(n: number) {
  return `RM ${n.toLocaleString('en-MY', { minimumFractionDigits: 2 })}`
}

function ReliefStatusBadge({ status }: { status: Relief['status'] }) {
  if (status === 'claimed')
    return (
      <span className="rounded-full bg-tertiary-container px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-on-tertiary-container">
        Claimed
      </span>
    )
  if (status === 'missed')
    return (
      <span className="rounded-full bg-error-container px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-on-error-container">
        Missed
      </span>
    )
  return (
    <span className="rounded-full bg-primary-fixed/25 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-on-primary-fixed-variant">
      Partial
    </span>
  )
}

function ReliefCard({
  relief,
  onApply,
  onIgnore,
}: {
  relief: Relief
  onApply: (id: string) => void
  onIgnore: (id: string) => void
}) {
  const fillPct = Math.min(100, (relief.claimedAmount / relief.maxAmount) * 100)

  return (
    <div className="group rounded-xl bg-surface-container-lowest p-6 ambient-shadow transition-colors hover:bg-surface-container-low">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-surface-container-high text-secondary">
          <MatIcon name={relief.icon} className="text-2xl" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <h4 className="text-base font-semibold text-on-surface">
              {relief.name}
            </h4>
            <ReliefStatusBadge status={relief.status} />
            <span className="ml-auto text-xs text-on-surface-variant">
              {relief.taxSection}
            </span>
          </div>
          <p className="mb-3 text-sm leading-relaxed text-on-surface-variant">
            {relief.description}
          </p>

          {/* Progress bar */}
          <div className="mb-1 flex items-center justify-between text-xs text-on-surface-variant">
            <span>{formatRM(relief.claimedAmount)} claimed</span>
            <span>Max {formatRM(relief.maxAmount)}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-surface-container">
            <div
              className={cn(
                'h-full rounded-full transition-all',
                relief.status === 'claimed'
                  ? 'bg-on-tertiary-container'
                  : relief.status === 'partial'
                    ? 'bg-on-primary-container'
                    : 'bg-outline-variant'
              )}
              style={{ width: `${fillPct}%` }}
            />
          </div>

          {(relief.status === 'missed' || relief.status === 'partial') &&
            relief.suggestion && (
              <div className="mt-4 rounded-lg bg-surface-container-low p-3">
                <p className="mb-3 text-xs leading-relaxed text-on-surface-variant">
                  <span className="font-semibold text-secondary">
                    AI suggestion:{' '}
                  </span>
                  {relief.suggestion}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => onApply(relief.id)}
                    className="rounded-lg bg-on-primary-container px-4 py-2 text-xs font-semibold text-on-primary-fixed hover:opacity-90 transition-opacity"
                  >
                    Apply Relief
                  </button>
                  <button
                    onClick={() => onIgnore(relief.id)}
                    className="rounded-lg bg-surface-container-high px-4 py-2 text-xs font-semibold text-on-surface-variant hover:bg-surface-container-highest transition-colors"
                  >
                    Ignore
                  </button>
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  )
}

export function ReliefCardList({
  initialReliefs,
}: {
  initialReliefs: Relief[]
}) {
  const [reliefs, setReliefs] = useState<Relief[]>(initialReliefs)

  const claimed = reliefs.filter((r) => r.status === 'claimed')
  const actionable = reliefs.filter((r) => r.status !== 'claimed')

  function handleApply(id: string) {
    setReliefs((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, status: 'claimed', claimedAmount: r.maxAmount }
          : r
      )
    )
  }
  function handleIgnore(id: string) {
    setReliefs((prev) => prev.filter((r) => r.id !== id))
  }

  return (
    <>
      {claimed.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-on-surface">
            Claimed Reliefs
          </h2>
          <div className="flex flex-col gap-4">
            {claimed.map((r) => (
              <ReliefCard
                key={r.id}
                relief={r}
                onApply={handleApply}
                onIgnore={handleIgnore}
              />
            ))}
          </div>
        </div>
      )}

      {actionable.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-on-surface">
            Newly Detected Reliefs
          </h2>
          <div className="flex flex-col gap-4">
            {actionable.map((r) => (
              <ReliefCard
                key={r.id}
                relief={r}
                onApply={handleApply}
                onIgnore={handleIgnore}
              />
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end pb-4">
        <Link
          href="/summary"
          className="flex items-center gap-3 rounded-lg bg-on-primary-container px-9 py-4 text-lg font-semibold text-on-primary-fixed shadow-lg shadow-on-primary-container/20 hover:opacity-90 transition-opacity"
        >
          View Tax Summary
          <MatIcon name="arrow_forward" className="text-xl" />
        </Link>
      </div>
    </>
  )
}
