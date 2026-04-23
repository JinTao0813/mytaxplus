import Link from 'next/link'

import { ReceiptMappingInbox } from './_components/receipt-mapping-inbox'
import { ApiError, parseFastApiErrorDetail } from '@/lib/api/client'
import {
  getReliefRules,
  listReceiptReviewItems,
} from '@/lib/api'
import {
  cookieHeaderFromRequest,
  hasBackendSessionCookie,
} from '@/lib/api/server-cookies'
import { DEFAULT_RELIEF_RULE_YEAR } from '@/lib/reliefs/registry'
import type { ReceiptMappingStatus, ReceiptReviewItem } from '@/lib/types'
import type { ReliefRuleApi } from '@/lib/api/reliefs-rules'

const INBOX_STATUSES: ReceiptMappingStatus[] = [
  'in_progress',
  'unmapped',
  'suggested',
  'needs_review',
  'gemini_error',
]

function describeSsrFetchError(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 503) {
      const detail = parseFastApiErrorDetail(err.body)
      if (detail && typeof detail === 'object' && !Array.isArray(detail)) {
        if (typeof detail.message === 'string') return detail.message
      }
      if (typeof detail === 'string') return detail
      return 'Service temporarily unavailable. Retry shortly.'
    }
    return `${err.message}${err.status === 401 ? ' Try signing in again.' : ''}`
  }
  if (err instanceof Error) return err.message
  return 'Failed to load receipt review queue.'
}

export default async function ReceiptsReviewPage() {
  const cookieHeader = await cookieHeaderFromRequest()
  const ctx = { cookieHeader }
  let items: ReceiptReviewItem[] = []
  let rules: ReliefRuleApi[] = []
  let initialLoadError: string | null = null

  if (hasBackendSessionCookie(cookieHeader)) {
    try {
      ;[items, rules] = await Promise.all([
        listReceiptReviewItems(ctx, { statuses: INBOX_STATUSES }),
        getReliefRules(ctx, { year: DEFAULT_RELIEF_RULE_YEAR }),
      ])
    } catch (err) {
      console.error('Receipts review SSR fetch failed', err)
      initialLoadError = describeSsrFetchError(err)
    }
  }

  return (
    <div className="min-h-screen bg-surface px-6 pb-24 pt-8 md:px-12 md:pb-12 md:pt-12">
      <header className="mb-10">
        <p className="mb-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-secondary">
          Receipt mapping
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-on-surface">
          Review queue
        </h1>
        <p className="mt-2 max-w-2xl text-base leading-relaxed text-on-surface-variant">
          Confirm each receipt&apos;s relief category from the Year of Assessment
          catalog. Claims are created only after you confirm — Gemini suggestions
          are advisory until then.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/upload"
            className="inline-flex items-center rounded-lg border border-outline-variant/40 bg-surface px-4 py-2 text-sm font-semibold text-on-surface hover:bg-surface-container-high transition-colors"
          >
            Tax Files
          </Link>
          <Link
            href="/reliefs"
            className="inline-flex items-center rounded-lg border border-outline-variant/40 bg-surface px-4 py-2 text-sm font-semibold text-on-surface hover:bg-surface-container-high transition-colors"
          >
            Relief planner
          </Link>
        </div>
      </header>

      <ReceiptMappingInbox
        initialItems={items}
        initialRules={rules}
        filingYear={DEFAULT_RELIEF_RULE_YEAR}
        initialLoadError={initialLoadError}
      />
    </div>
  )
}
