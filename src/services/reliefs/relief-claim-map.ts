import type { ReliefClaimRecord } from '@/lib/types'

import type { ReliefClaimStored } from '@/dal/reliefs'

export function storedClaimToReliefClaim(
  s: ReliefClaimStored
): ReliefClaimRecord {
  const highlights = s.highlights as ReliefClaimRecord['highlights'] | undefined
  return {
    id: s.id,
    date: s.date,
    vendor: s.vendor,
    amount: s.amount,
    ...(s.documentId != null ? { documentId: s.documentId } : {}),
    ...(s.previewUrl != null ? { previewUrl: s.previewUrl } : {}),
    ...(highlights != null ? { highlights } : {}),
    ...(s.reliefBucket != null ? { reliefBucket: s.reliefBucket } : {}),
    ...(s.subcapId != null ? { subcapId: s.subcapId } : {}),
  }
}
