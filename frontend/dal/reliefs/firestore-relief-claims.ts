import 'server-only'

import { FieldValue } from 'firebase-admin/firestore'

import { adminDb } from '@/lib/server/firebase-admin'
import {
  userReliefClaimPath,
  userReliefClaimsCollectionPath,
} from '@/lib/server/firestore-paths'

/** Persisted relief claim row (Firestore). */
export interface ReliefClaimStored {
  id: string
  year: number
  reliefId: string
  date: string
  vendor: string
  amount: number
  documentId?: string
  previewUrl?: string
  highlights?: Record<string, unknown>
  reliefBucket?: string
  subcapId?: string
  /** Links auto-created claims to an extraction row for idempotency. */
  extractionId?: string
}

export async function listReliefClaims(params: {
  uid: string
  year?: number
  limit?: number
}): Promise<ReliefClaimStored[]> {
  const limit = params.limit ?? 500
  const col = adminDb.collection(
    userReliefClaimsCollectionPath({ uid: params.uid })
  )
  const snap = await col.limit(limit).get()
  let rows = snap.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<ReliefClaimStored, 'id'>),
  }))
  if (params.year != null) {
    rows = rows.filter((r) => r.year === params.year)
  }
  return rows
}

export async function getReliefClaim(params: {
  uid: string
  claimId: string
}): Promise<ReliefClaimStored | null> {
  const ref = adminDb.doc(
    userReliefClaimPath({ uid: params.uid, claimId: params.claimId })
  )
  const snap = await ref.get()
  if (!snap.exists) return null
  return {
    id: snap.id,
    ...(snap.data() as Omit<ReliefClaimStored, 'id'>),
  }
}

export async function upsertReliefClaim(params: {
  uid: string
  claimId: string
  data: Omit<ReliefClaimStored, 'id'>
}): Promise<void> {
  const path = userReliefClaimPath({
    uid: params.uid,
    claimId: params.claimId,
  })
  const ref = adminDb.doc(path)
  const snap = await ref.get()
  await ref.set(
    {
      ...params.data,
      updatedAt: FieldValue.serverTimestamp(),
      ...(snap.exists ? {} : { createdAt: FieldValue.serverTimestamp() }),
    },
    { merge: true }
  )
}

export async function deleteReliefClaim(params: {
  uid: string
  claimId: string
}): Promise<void> {
  await adminDb
    .doc(userReliefClaimPath({ uid: params.uid, claimId: params.claimId }))
    .delete()
}

/** Find existing auto-created claim for idempotent receipt processing (in-memory filter; avoids composite index). */
export async function findClaimByExtraction(params: {
  uid: string
  documentId: string
  extractionId: string
}): Promise<ReliefClaimStored | null> {
  const rows = await listReliefClaims({ uid: params.uid, limit: 500 })
  return (
    rows.find(
      (r) =>
        r.documentId === params.documentId &&
        r.extractionId === params.extractionId
    ) ?? null
  )
}
