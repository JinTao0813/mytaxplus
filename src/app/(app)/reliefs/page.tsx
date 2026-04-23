import Link from 'next/link'

import {
  getProfile,
  getReliefs,
  getTaxContext,
  listReceiptReviewItems,
} from '@/lib/api'
import {
  cookieHeaderFromRequest,
  hasBackendSessionCookie,
} from '@/lib/api/server-cookies'
import type { ReceiptMappingStatus, TaxContext } from '@/lib/types'
import { ReliefsWorkspace } from './_components/reliefs-workspace'

const INBOX_STATUSES: ReceiptMappingStatus[] = [
  'in_progress',
  'unmapped',
  'suggested',
  'needs_review',
  'gemini_error',
]

export default async function ReliefsPage() {
  const cookieHeader = await cookieHeaderFromRequest()
  const ctx = { cookieHeader }

  const reliefs = await getReliefs(ctx)
  const profile = await getProfile(ctx)
  let receiptReviewCount = 0
  let taxContext: TaxContext | null = null

  if (hasBackendSessionCookie(cookieHeader)) {
    const [queue, ctxSnap] = await Promise.all([
      listReceiptReviewItems(ctx, { statuses: INBOX_STATUSES }),
      getTaxContext(ctx).catch(() => null),
    ])
    receiptReviewCount = queue.length
    taxContext = ctxSnap
  }

  return (
    <div className="min-h-screen bg-surface px-6 pb-24 pt-8 md:px-12 md:pb-12 md:pt-12">
      <header className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight text-on-surface">
          Relief claim planner
        </h1>
        <p className="mt-2 max-w-2xl text-base leading-relaxed text-on-surface-variant">
          Plan evidence-backed relief claims for the current Year of Assessment.
          Caps and pools are enforced deterministically; receipt lines appear
          here after you confirm mappings.
        </p>
      </header>

      {receiptReviewCount > 0 ? (
        <div className="mb-8 rounded-xl border border-outline-variant/30 bg-on-primary-container/10 px-4 py-3 md:px-5">
          <p className="text-sm font-semibold text-on-surface">
            {receiptReviewCount}{' '}
            {receiptReviewCount === 1 ? 'receipt needs' : 'receipts need'}{' '}
            mapping
          </p>
          <p className="mt-1 text-xs text-on-surface-variant">
            Confirm each receipt&apos;s relief in the queue before claims are
            finalised.
          </p>
          <Link
            href="/receipts/review"
            className="mt-2 inline-flex text-sm font-semibold text-secondary underline"
          >
            Review receipt mappings
          </Link>
        </div>
      ) : null}

      <ReliefsWorkspace
        initialReliefs={reliefs}
        profile={profile}
        taxContext={taxContext}
      />
    </div>
  )
}
