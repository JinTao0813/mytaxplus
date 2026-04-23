import 'server-only'

import { randomUUID } from 'node:crypto'

import {
  findClaimByExtraction,
  upsertReliefClaim,
  type ReliefClaimStored,
  deleteReliefClaim,
} from '@/dal/reliefs'
import { DEFAULT_RELIEF_RULE_YEAR } from '@/lib/reliefs/registry'

export async function upsertClaimFromReceiptExtraction(params: {
  uid: string
  documentId: string
  extractionId: string
  reliefId: string
  vendor: string
  amount: number
  date?: string
  reliefBucket?: string
  subcapId?: string
}): Promise<void> {
  const existing = await findClaimByExtraction({
    uid: params.uid,
    documentId: params.documentId,
    extractionId: params.extractionId,
  })

  const claimId = existing?.id ?? randomUUID()

  const data: Omit<ReliefClaimStored, 'id'> = {
    year: DEFAULT_RELIEF_RULE_YEAR,
    reliefId: params.reliefId,
    date: params.date ?? new Date().toISOString().slice(0, 10),
    vendor: params.vendor,
    amount: params.amount,
    documentId: params.documentId,
    extractionId: params.extractionId,
    ...(params.reliefBucket != null
      ? { reliefBucket: params.reliefBucket }
      : {}),
    ...(params.subcapId != null ? { subcapId: params.subcapId } : {}),
  }

  await upsertReliefClaim({
    uid: params.uid,
    claimId,
    data,
  })
}

export async function removeClaimForReceiptExtraction(params: {
  uid: string
  documentId: string
  extractionId: string
}): Promise<void> {
  const existing = await findClaimByExtraction(params)
  if (!existing) return
  await deleteReliefClaim({ uid: params.uid, claimId: existing.id })
}
