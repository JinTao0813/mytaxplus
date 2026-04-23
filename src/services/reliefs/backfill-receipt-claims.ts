import 'server-only'

import { listDocuments, listExtractions } from '@/dal/documents'
import { DEFAULT_RELIEF_RULE_YEAR } from '@/lib/reliefs/registry'
import { upsertClaimFromReceiptExtraction } from '@/services/reliefs/receipt-relief-sync'

/**
 * Creates missing Firestore relief claims from confirmed receipt extraction rows.
 * Idempotent via `documentId` + `extractionId`. Capped per request for safety.
 */
export async function runReceiptClaimBackfill(opts: {
  uid: string
  year: number
}): Promise<void> {
  if (opts.year !== DEFAULT_RELIEF_RULE_YEAR) return

  const documents = await listDocuments({ uid: opts.uid, limit: 60 })
  let upserts = 0
  const maxUpserts = 100

  for (const doc of documents) {
    if (upserts >= maxUpserts) break
    const documentId = String(doc.id || '')
    if (!documentId) continue
    if (String(doc.documentType || '') !== 'RECEIPT') continue
    if (String(doc.status || '') !== 'PROCESSED') continue

    const rows = await listExtractions({
      uid: opts.uid,
      documentId,
      limit: 20,
    })

    for (const raw of rows) {
      if (upserts >= maxUpserts) break
      const row = raw as Record<string, unknown>
      const reliefId = typeof row.reliefId === 'string' ? row.reliefId : ''
      if (!reliefId) continue
      if (row.mappingStatus !== 'confirmed') continue
      const extractionId = String(row.id || '')
      if (!extractionId) continue
      const amount = Number(row.amount ?? 0)
      if (!Number.isFinite(amount) || amount <= 0) continue

      await upsertClaimFromReceiptExtraction({
        uid: opts.uid,
        documentId,
        extractionId,
        reliefId,
        vendor: String(row.label || 'Receipt'),
        amount,
        ...(typeof row.date === 'string' ? { date: row.date } : {}),
        ...(typeof row.reliefBucket === 'string'
          ? { reliefBucket: row.reliefBucket }
          : {}),
        ...(typeof row.subcapId === 'string' ? { subcapId: row.subcapId } : {}),
      })
      upserts += 1
    }
  }
}
