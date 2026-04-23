import Link from 'next/link'

import { MatIcon } from '@/components/ui/mat-icon'
import type { ReceiptMappingStatus, ReceiptReviewItem } from '@/lib/types'

const STATUS_ORDER: ReceiptMappingStatus[] = [
  'in_progress',
  'unmapped',
  'suggested',
  'needs_review',
  'gemini_error',
]

function labelFor(status: ReceiptMappingStatus): string {
  switch (status) {
    case 'in_progress':
      return 'Classifying'
    case 'unmapped':
      return 'Unmapped'
    case 'suggested':
      return 'Suggested'
    case 'needs_review':
      return 'Needs review'
    case 'gemini_error':
      return 'Gemini error'
    default:
      return status
  }
}

function countByStatus(items: ReceiptReviewItem[]) {
  const map = new Map<ReceiptMappingStatus, number>()
  for (const s of STATUS_ORDER) map.set(s, 0)
  for (const row of items) {
    map.set(row.mappingStatus, (map.get(row.mappingStatus) ?? 0) + 1)
  }
  return map
}

interface Props {
  items: ReceiptReviewItem[]
}

export function ReceiptMappingStatusCard({ items }: Props) {
  const reviewCount = items.length
  const byStatus = countByStatus(items)

  return (
    <aside className="rounded-xl bg-surface-container-low p-6 ghost-border">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-container-highest">
          <MatIcon name="receipt_long" className="text-xl text-secondary" />
        </div>
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-on-surface">
            Receipt mapping status
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-on-surface-variant">
            Gemini suggests a relief per receipt; you confirm before claims are
            created. No automatic keyword fallback.
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-2">
        {STATUS_ORDER.map((status) => {
          const n = byStatus.get(status) ?? 0
          if (n === 0) return null
          return (
            <div
              key={status}
              className="flex items-center justify-between rounded-lg bg-surface-container-lowest px-3 py-2 text-xs"
            >
              <span className="text-on-surface-variant">
                {labelFor(status)}
              </span>
              <span className="font-mono font-semibold tabular-nums text-on-surface">
                {n}
              </span>
            </div>
          )
        })}
        {reviewCount === 0 ? (
          <p className="rounded-lg bg-surface-container-lowest px-3 py-2 text-xs text-on-surface-variant">
            Nothing needs review right now. New receipts appear here after
            extraction and suggestion.
          </p>
        ) : null}
      </div>

      <Link
        href="/receipts/review"
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-secondary px-4 py-3 text-sm font-semibold text-secondary-foreground hover:opacity-90 transition-opacity"
      >
        Review receipts
        {reviewCount > 0 ? (
          <span className="rounded-full bg-secondary-foreground/15 px-2 py-0.5 text-xs font-bold tabular-nums">
            {reviewCount}
          </span>
        ) : null}
      </Link>
    </aside>
  )
}
