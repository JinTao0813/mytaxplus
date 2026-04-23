import 'server-only'

import { randomUUID } from 'node:crypto'

import { z } from 'zod'

import { HttpError } from '@/lib/server/http'
import { reliefClaimHighlightsSchema } from '@/lib/validations/api-schemas'
import {
  deleteReliefClaim,
  getReliefClaim,
  upsertReliefClaim,
  type ReliefClaimStored,
} from '@/dal/reliefs'
import {
  DEFAULT_RELIEF_RULE_YEAR,
  getReliefRulesByYear,
} from '@/lib/reliefs/registry'

function assertKnownReliefId(reliefId: string, year: number) {
  const rules = getReliefRulesByYear(year)
  if (!rules.some((r) => r.id === reliefId)) {
    throw new HttpError(404, `Unknown relief category: ${reliefId}`)
  }
}

export const createReliefClaimBodySchema = z.object({
  year: z.number().int().optional(),
  date: z.string().min(1),
  vendor: z.string(),
  amount: z.number(),
  documentId: z.string().optional(),
  previewUrl: z.string().optional(),
  highlights: reliefClaimHighlightsSchema.optional(),
  reliefBucket: z.string().optional(),
  subcapId: z.string().optional(),
  extractionId: z.string().optional(),
})

export type CreateReliefClaimBody = z.infer<typeof createReliefClaimBodySchema>

export const patchReliefClaimBodySchema = createReliefClaimBodySchema.partial()

export async function createReliefClaimRecord(params: {
  uid: string
  reliefId: string
  body: unknown
}): Promise<{ claimId: string }> {
  const parsed = createReliefClaimBodySchema.safeParse(params.body)
  if (!parsed.success) {
    throw new HttpError(400, parsed.error.flatten())
  }
  const year = parsed.data.year ?? DEFAULT_RELIEF_RULE_YEAR
  assertKnownReliefId(params.reliefId, year)

  const claimId = randomUUID()
  const data: Omit<ReliefClaimStored, 'id'> = {
    year,
    reliefId: params.reliefId,
    date: parsed.data.date,
    vendor: parsed.data.vendor,
    amount: parsed.data.amount,
    ...(parsed.data.documentId != null
      ? { documentId: parsed.data.documentId }
      : {}),
    ...(parsed.data.previewUrl != null
      ? { previewUrl: parsed.data.previewUrl }
      : {}),
    ...(parsed.data.highlights != null
      ? {
          highlights: parsed.data.highlights as unknown as Record<
            string,
            unknown
          >,
        }
      : {}),
    ...(parsed.data.reliefBucket != null
      ? { reliefBucket: parsed.data.reliefBucket }
      : {}),
    ...(parsed.data.subcapId != null ? { subcapId: parsed.data.subcapId } : {}),
    ...(parsed.data.extractionId != null
      ? { extractionId: parsed.data.extractionId }
      : {}),
  }

  await upsertReliefClaim({
    uid: params.uid,
    claimId,
    data,
  })

  return { claimId }
}

export async function patchReliefClaimRecord(params: {
  uid: string
  reliefId: string
  claimId: string
  body: unknown
}): Promise<void> {
  const parsed = patchReliefClaimBodySchema.safeParse(params.body)
  if (!parsed.success) {
    throw new HttpError(400, parsed.error.flatten())
  }

  const existing = await getReliefClaim({
    uid: params.uid,
    claimId: params.claimId,
  })
  if (!existing) {
    throw new HttpError(404, 'Claim not found')
  }
  if (existing.reliefId !== params.reliefId) {
    throw new HttpError(400, 'Claim does not belong to this relief')
  }

  const nextYear = parsed.data.year ?? existing.year
  assertKnownReliefId(params.reliefId, nextYear)

  const merged: Omit<ReliefClaimStored, 'id'> = {
    year: nextYear,
    reliefId: params.reliefId,
    date: parsed.data.date ?? existing.date,
    vendor: parsed.data.vendor ?? existing.vendor,
    amount: parsed.data.amount ?? existing.amount,
    documentId:
      parsed.data.documentId !== undefined
        ? parsed.data.documentId
        : existing.documentId,
    previewUrl:
      parsed.data.previewUrl !== undefined
        ? parsed.data.previewUrl
        : existing.previewUrl,
    highlights:
      parsed.data.highlights !== undefined
        ? (parsed.data.highlights as unknown as Record<string, unknown>)
        : existing.highlights,
    reliefBucket:
      parsed.data.reliefBucket !== undefined
        ? parsed.data.reliefBucket
        : existing.reliefBucket,
    subcapId:
      parsed.data.subcapId !== undefined
        ? parsed.data.subcapId
        : existing.subcapId,
    extractionId:
      parsed.data.extractionId !== undefined
        ? parsed.data.extractionId
        : existing.extractionId,
  }

  await upsertReliefClaim({
    uid: params.uid,
    claimId: params.claimId,
    data: merged,
  })
}

export async function removeReliefClaimRecord(params: {
  uid: string
  reliefId: string
  claimId: string
}): Promise<void> {
  const existing = await getReliefClaim({
    uid: params.uid,
    claimId: params.claimId,
  })
  if (!existing) {
    throw new HttpError(404, 'Claim not found')
  }
  if (existing.reliefId !== params.reliefId) {
    throw new HttpError(400, 'Claim does not belong to this relief')
  }
  await deleteReliefClaim({ uid: params.uid, claimId: params.claimId })
}
