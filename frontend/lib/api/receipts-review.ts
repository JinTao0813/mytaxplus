import type { ReceiptMappingStatus, ReceiptReviewItem } from '@/lib/types'
import { apiFetch } from '@/lib/api/client'
import type { ClientApiContext, ServerApiContext } from '@/lib/api/config'
import {
  okResponseSchema,
  receiptReviewItemSchema,
  receiptReviewListSchema,
} from '@/lib/validations/api-schemas'

function buildStatusQuery(statuses?: ReceiptMappingStatus[]): string {
  if (!statuses?.length) return ''
  return `?status=${statuses.map((s) => encodeURIComponent(s)).join(',')}`
}

/** GET /api/v1/receipts/review */
export async function listReceiptReviewItems(
  ctx?: ServerApiContext | ClientApiContext,
  options?: { statuses?: ReceiptMappingStatus[] }
): Promise<ReceiptReviewItem[]> {
  const token = ctx && 'token' in ctx ? ctx.token : undefined
  return apiFetch(
    `/api/v1/receipts/review${buildStatusQuery(options?.statuses)}`,
    {
      responseSchema: receiptReviewListSchema,
      cookieHeader: ctx?.cookieHeader,
      token,
    }
  )
}

export type ConfirmReceiptMappingBody = {
  year?: number
  reliefId: string
  reliefBucket?: string
  subcapId?: string
}

/** POST /api/v1/receipts/review/{extractionId}/confirm */
export async function confirmReceiptMapping(
  extractionId: string,
  body: ConfirmReceiptMappingBody,
  ctx?: ClientApiContext
): Promise<{ ok: boolean }> {
  return apiFetch(
    `/api/v1/receipts/review/${encodeURIComponent(extractionId)}/confirm`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      responseSchema: okResponseSchema,
      cookieHeader: ctx?.cookieHeader,
      token: ctx?.token,
    }
  )
}

/** POST /api/v1/receipts/review/{extractionId}/clear */
export async function clearReceiptMapping(
  extractionId: string,
  ctx?: ClientApiContext
): Promise<{ ok: boolean }> {
  return apiFetch(
    `/api/v1/receipts/review/${encodeURIComponent(extractionId)}/clear`,
    {
      method: 'POST',
      responseSchema: okResponseSchema,
      cookieHeader: ctx?.cookieHeader,
      token: ctx?.token,
    }
  )
}

/** POST /api/v1/receipts/review/{extractionId}/suggest — re-run Gemini suggestion. */
export async function retryReceiptSuggestion(
  extractionId: string,
  ctx?: ClientApiContext
): Promise<ReceiptReviewItem> {
  return apiFetch(
    `/api/v1/receipts/review/${encodeURIComponent(extractionId)}/suggest`,
    {
      method: 'POST',
      responseSchema: receiptReviewItemSchema,
      cookieHeader: ctx?.cookieHeader,
      token: ctx?.token,
    }
  )
}
