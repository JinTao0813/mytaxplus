'use client'

import Link from 'next/link'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { MatIcon } from '@/components/ui/mat-icon'
import type { Relief, ReliefClaimRecord } from '@/lib/types'
import { AiReliefNudge } from './ai-relief-nudge'

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

interface ReliefCardListProps {
  reliefs: Relief[]
  onOpenReceipt: (reliefId: string, claim: ReliefClaimRecord) => void
  onAddClaim: (reliefId: string) => Promise<void>
  onDeleteClaim: (reliefId: string, claimId: string) => Promise<void>
  onAcceptNudge: (reliefId: string) => Promise<void>
  onStripNudge: (reliefId: string) => void
}

export function ReliefCardList({
  reliefs,
  onOpenReceipt,
  onAddClaim,
  onDeleteClaim,
  onAcceptNudge,
  onStripNudge,
}: ReliefCardListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const claimed = reliefs.filter((r) => r.status === 'claimed')
  const actionable = reliefs.filter((r) => r.status !== 'claimed')

  function toggleExpand(id: string) {
    setExpandedId((cur) => (cur === id ? null : id))
  }

  async function handleAcceptNudge(reliefId: string) {
    await onAcceptNudge(reliefId)
  }

  function handleIgnoreNudge(reliefId: string) {
    onStripNudge(reliefId)
  }

  async function handleAddRecord(reliefId: string) {
    await onAddClaim(reliefId)
    setExpandedId(reliefId)
  }

  async function handleDeleteClaim(reliefId: string, claimId: string) {
    await onDeleteClaim(reliefId, claimId)
  }

  function ReliefAccordionCard({ relief }: { relief: Relief }) {
    const isOpen = expandedId === relief.id
    const fillPct =
      relief.maxAmount > 0
        ? Math.min(100, (relief.claimedAmount / relief.maxAmount) * 100)
        : 0
    const panelId = `relief-panel-${relief.id}`
    const headerId = `relief-header-${relief.id}`

    return (
      <div className="rounded-xl bg-surface-container-lowest ambient-shadow transition-colors hover:bg-surface-container-low">
        <h3 className="m-0">
          <button
            type="button"
            id={headerId}
            aria-expanded={isOpen}
            aria-controls={panelId}
            onClick={() => toggleExpand(relief.id)}
            className="flex w-full items-start gap-4 rounded-xl p-6 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-surface-container-high text-secondary">
              <MatIcon name={relief.icon} className="text-2xl" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <span className="text-base font-semibold text-on-surface">
                  {relief.name}
                </span>
                <ReliefStatusBadge status={relief.status} />
                <span className="ml-auto text-xs text-on-surface-variant">
                  {relief.taxSection}
                </span>
              </div>
              <p className="mb-3 line-clamp-2 text-sm leading-relaxed text-on-surface-variant">
                {relief.description}
              </p>
              <div className="mb-1 flex items-center justify-between text-xs text-on-surface-variant">
                <span className="font-medium tabular-nums text-on-surface">
                  {formatRM(relief.claimedAmount)}
                  {' / '}
                  {relief.maxAmount > 0
                    ? `${formatRM(relief.maxAmount)} claimed`
                    : relief.limitDisplay
                      ? `limit: ${relief.limitDisplay}`
                      : '—'}
                </span>
                {relief.maxAmount > 0 ? (
                  <span className="tabular-nums">{Math.round(fillPct)}%</span>
                ) : null}
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-surface-container">
                <div
                  className={cn(
                    'h-full rounded-full',
                    relief.status === 'claimed'
                      ? 'bg-on-tertiary-container'
                      : relief.status === 'partial'
                        ? 'bg-on-primary-container'
                        : 'bg-outline-variant'
                  )}
                  style={{ width: `${fillPct}%` }}
                />
              </div>
            </div>
            <MatIcon
              name="expand_more"
              className={cn(
                'mt-2 shrink-0 text-2xl text-on-surface-variant transition-transform',
                isOpen && 'rotate-180'
              )}
              aria-hidden
            />
          </button>
        </h3>

        {isOpen ? (
          <div
            id={panelId}
            role="region"
            aria-labelledby={headerId}
            className="border-t border-outline-variant/10 px-6 pb-6 pt-2"
          >
            {relief.nudge ? (
              <div className="mb-4">
                <AiReliefNudge
                  nudge={relief.nudge}
                  onAccept={() => handleAcceptNudge(relief.id)}
                  onIgnore={() => handleIgnoreNudge(relief.id)}
                />
              </div>
            ) : null}

            {!relief.nudge &&
            (relief.status === 'missed' || relief.status === 'partial') &&
            relief.suggestion ? (
              <div className="mb-4 rounded-lg bg-surface-container-low p-3">
                <p className="text-xs leading-relaxed text-on-surface-variant">
                  <span className="font-semibold text-secondary">Note: </span>
                  {relief.suggestion}
                </p>
              </div>
            ) : null}

            <div className="flex flex-col gap-2">
              {(relief.claims ?? []).length === 0 ? (
                <p className="py-4 text-center text-sm text-on-surface-variant">
                  No records yet. Add a receipt row or accept an AI suggestion
                  above.
                </p>
              ) : (
                (relief.claims ?? []).map((c) => (
                  <div
                    key={c.id}
                    className="flex flex-col gap-3 rounded-lg bg-surface-container-low px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0 flex-1 font-mono text-sm tabular-nums text-on-surface">
                      <span className="text-on-surface-variant">{c.date}</span>
                      <span className="mx-2 text-on-surface-variant">·</span>
                      <span className="font-medium">{c.vendor}</span>
                      <span className="mx-2 text-on-surface-variant">·</span>
                      <span>{formatRM(c.amount)}</span>
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-1">
                      <button
                        type="button"
                        onClick={() => onOpenReceipt(relief.id, c)}
                        className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold text-secondary hover:bg-surface-container-high"
                      >
                        <MatIcon name="receipt_long" className="text-base" />
                        View receipt
                      </button>
                      <button
                        type="button"
                        onClick={() => onOpenReceipt(relief.id, c)}
                        className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold text-on-surface-variant hover:bg-surface-container-high"
                      >
                        <MatIcon name="edit" className="text-base" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteClaim(relief.id, c.id)}
                        className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold text-error hover:bg-error-container/30"
                      >
                        <MatIcon name="delete" className="text-base" />
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <button
              type="button"
              onClick={() => handleAddRecord(relief.id)}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-outline-variant py-3 text-sm font-semibold text-secondary transition-colors hover:border-secondary hover:bg-surface-container-low"
            >
              <MatIcon name="add" className="text-lg" />+ Add record
            </button>
          </div>
        ) : null}
      </div>
    )
  }

  return (
    <>
      {claimed.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-on-surface">
            Claimed reliefs
          </h2>
          <div className="flex flex-col gap-4">
            {claimed.map((r) => (
              <ReliefAccordionCard key={r.id} relief={r} />
            ))}
          </div>
        </div>
      )}

      {actionable.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-on-surface">
            Needs attention
          </h2>
          <div className="flex flex-col gap-4">
            {actionable.map((r) => (
              <ReliefAccordionCard key={r.id} relief={r} />
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end pb-4">
        <Link
          href="/summary"
          className="flex items-center gap-3 rounded-lg bg-on-primary-container px-9 py-4 text-lg font-semibold text-on-primary-fixed shadow-lg shadow-on-primary-container/20 transition-opacity hover:opacity-90"
        >
          View Tax Summary
          <MatIcon name="arrow_forward" className="text-xl" />
        </Link>
      </div>
    </>
  )
}
