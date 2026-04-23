import type { Relief } from '@/lib/types'
import { apiFetch } from '@/lib/api/client'
import type { ClientApiContext, ServerApiContext } from '@/lib/api/config'
import {
  createReliefClaimResponseSchema,
  okResponseSchema,
  reliefListSchema,
} from '@/lib/validations/api-schemas'

/** GET /api/v1/reliefs */
export async function getReliefs(ctx?: ServerApiContext): Promise<Relief[]> {
  return apiFetch('/api/v1/reliefs', {
    responseSchema: reliefListSchema,
    cookieHeader: ctx?.cookieHeader,
  })
}

/** POST /api/v1/reliefs/analyze */
export async function analyzeReliefs(
  ctx?: ServerApiContext,
  body?: unknown
): Promise<Relief[]> {
  return apiFetch('/api/v1/reliefs/analyze', {
    method: 'POST',
    responseSchema: reliefListSchema,
    cookieHeader: ctx?.cookieHeader,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    headers:
      body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
  })
}

/** POST /api/v1/reliefs/{reliefId}/claims */
export async function createReliefClaim(
  reliefId: string,
  body: {
    year?: number
    date: string
    vendor: string
    amount: number
    documentId?: string
    previewUrl?: string
    highlights?: Record<string, unknown>
    reliefBucket?: string
    subcapId?: string
    extractionId?: string
  },
  ctx?: ClientApiContext
): Promise<{ claimId: string }> {
  return apiFetch(`/api/v1/reliefs/${encodeURIComponent(reliefId)}/claims`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    responseSchema: createReliefClaimResponseSchema,
    cookieHeader: ctx?.cookieHeader,
    token: ctx?.token,
  })
}

/** PUT /api/v1/reliefs/{reliefId}/claims/{claimId} */
export async function updateReliefClaim(
  reliefId: string,
  claimId: string,
  body: Partial<{
    year: number
    date: string
    vendor: string
    amount: number
    documentId: string | null
    previewUrl: string | null
    highlights: Record<string, unknown>
    reliefBucket: string | null
    subcapId: string | null
    extractionId: string | null
  }>,
  ctx?: ClientApiContext
): Promise<{ ok: boolean }> {
  return apiFetch(
    `/api/v1/reliefs/${encodeURIComponent(reliefId)}/claims/${encodeURIComponent(claimId)}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      responseSchema: okResponseSchema,
      cookieHeader: ctx?.cookieHeader,
      token: ctx?.token,
    }
  )
}

/** DELETE /api/v1/reliefs/{reliefId}/claims/{claimId} */
export async function deleteReliefClaim(
  reliefId: string,
  claimId: string,
  ctx?: ClientApiContext
): Promise<{ ok: boolean }> {
  return apiFetch(
    `/api/v1/reliefs/${encodeURIComponent(reliefId)}/claims/${encodeURIComponent(claimId)}`,
    {
      method: 'DELETE',
      responseSchema: okResponseSchema,
      cookieHeader: ctx?.cookieHeader,
      token: ctx?.token,
    }
  )
}
