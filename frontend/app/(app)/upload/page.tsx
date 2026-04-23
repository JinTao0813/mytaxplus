import type { UploadedDocument } from '@/lib/types'
import { getDocuments, listReceiptReviewItems } from '@/lib/api'
import { ApiError, parseFastApiErrorDetail } from '@/lib/api/client'
import {
  cookieHeaderFromRequest,
  hasBackendSessionCookie,
} from '@/lib/api/server-cookies'
import type { ReceiptMappingStatus } from '@/lib/types'
import { UploadDropZone } from './_components/upload-drop-zone'
import { CategoryGuide } from './_components/category-guide'
import { ReceiptMappingStatusCard } from './_components/receipt-mapping-status-card'

function describeSsrFetchError(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 503) {
      const detail = parseFastApiErrorDetail(err.body)
      if (detail && typeof detail === 'object' && !Array.isArray(detail)) {
        if (detail.code === 'FIRESTORE_DATABASE_MISSING') {
          const msg =
            typeof detail.message === 'string'
              ? detail.message
              : 'Create a Firestore database, then reload.'
          const url =
            typeof detail.setupUrl === 'string' ? detail.setupUrl : ''
          return url ? `${msg} ${url}` : msg
        }
        if (typeof detail.message === 'string') return detail.message
      }
      if (typeof detail === 'string') return detail
      return 'Documents service temporarily unavailable. Retry shortly.'
    }
    return `${err.message}${err.status === 401 ? ' Try signing in again.' : ''}`
  }
  if (err instanceof Error) return err.message
  return 'Failed to load documents.'
}

const INBOX_STATUSES: ReceiptMappingStatus[] = [
  'in_progress',
  'unmapped',
  'suggested',
  'needs_review',
  'gemini_error',
]

export default async function UploadPage() {
  const cookieHeader = await cookieHeaderFromRequest()
  const ctx = { cookieHeader }
  let docs: UploadedDocument[] = []
  let receiptReviewItems: Awaited<
    ReturnType<typeof listReceiptReviewItems>
  > = []
  let initialLoadError: string | null = null

  if (hasBackendSessionCookie(cookieHeader)) {
    try {
      ;[docs, receiptReviewItems] = await Promise.all([
        getDocuments(ctx),
        listReceiptReviewItems(ctx, { statuses: INBOX_STATUSES }),
      ])
    } catch (err) {
      console.error('Upload page SSR: documents/receipt review fetch failed', err)
      initialLoadError = describeSsrFetchError(err)
    }
  }

  return (
    <div className="min-h-screen bg-surface px-6 pb-24 pt-8 md:px-12 md:pb-12 md:pt-12">
      {/* Header */}
      <header className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight text-on-surface">
          Document Ingestion
        </h1>
        <p className="mt-2 max-w-2xl text-base leading-relaxed text-on-surface-variant">
          Securely upload your EA forms, receipts, and supporting documents. We
          extract structured fields, then Gemini suggests relief mappings for
          you to confirm.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-12">
        {/* Left: Upload + Recent */}
        <div className="flex flex-col gap-6 xl:col-span-8">
          <UploadDropZone
            key={docs.map((d) => d.id).join()}
            initialDocs={docs}
            initialLoadError={initialLoadError}
          />
          <CategoryGuide />
        </div>

        {/* Right: receipt mapping summary */}
        <div className="xl:col-span-4">
          <div className="sticky top-8 space-y-4">
            <ReceiptMappingStatusCard items={receiptReviewItems} />
            <p className="text-center text-xs text-on-surface-variant">
              Need help? Use{' '}
              <a href="/chat" className="font-semibold text-secondary underline">
                AI Assistant
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
