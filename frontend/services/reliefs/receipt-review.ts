import 'server-only'

import { z } from 'zod'

import {
  getDocument,
  listDocuments,
  listExtractions,
  upsertDocument,
  upsertExtraction,
} from '@/dal/documents'
import { getReliefRulesByYear } from '@/lib/reliefs/registry'
import { HttpError } from '@/lib/server/http'
import type {
  ReceiptMappingStatus,
  ReceiptReviewItem,
} from '@/lib/types'
import {
  removeClaimForReceiptExtraction,
  upsertClaimFromReceiptExtraction,
} from '@/services/reliefs/receipt-relief-sync'
import {
  suggestReceiptReliefMappings,
  summarizeDocumentMappingStatus,
} from '@/services/reliefs/suggest-receipt-mappings'

const confirmReceiptMappingBodySchema = z.object({
  year: z.number().int().optional(),
  reliefId: z.string(),
  reliefBucket: z.string().optional(),
  subcapId: z.string().optional(),
})

function isReceiptReviewItem(value: Record<string, unknown>): boolean {
  return String(value.taxSection || '') === 'Receipt'
}

async function findReceiptExtraction(params: {
  uid: string
  extractionId: string
}): Promise<{ documentId: string; row: Record<string, unknown> }> {
  const documents = await listDocuments({ uid: params.uid, limit: 80 })
  for (const document of documents) {
    if (String(document.documentType || '') !== 'RECEIPT') continue
    const documentId = String(document.id || '')
    if (!documentId) continue
    const rows = await listExtractions({
      uid: params.uid,
      documentId,
      limit: 50,
    })
    const match = rows.find((row) => String(row.id || '') === params.extractionId)
    if (match) return { documentId, row: match }
  }
  throw new HttpError(404, 'Receipt extraction not found')
}

async function refreshDocumentMappingSummary(params: {
  uid: string
  documentId: string
}): Promise<void> {
  const document = await getDocument(params)
  if (!document) return
  const rows = await listExtractions({
    uid: params.uid,
    documentId: params.documentId,
    limit: 50,
  })
  const summary = summarizeDocumentMappingStatus(
    rows.map((row) => ({
      mappingStatus:
        typeof row.mappingStatus === 'string'
          ? (row.mappingStatus as ReceiptMappingStatus)
          : undefined,
    }))
  )
  await upsertDocument({
    uid: params.uid,
    documentId: params.documentId,
    storagePath: String(document.storagePath || ''),
    originalFilename: String(document.originalFilename || 'Document'),
    sizeKb: Number(document.sizeKb || 0),
    contentType:
      typeof document.contentType === 'string' ? document.contentType : null,
    documentType:
      document.documentType === 'EA_FORM' ||
      document.documentType === 'RECEIPT' ||
      document.documentType === 'UNKNOWN'
        ? document.documentType
        : 'UNKNOWN',
    status:
      document.status === 'UPLOADED' ||
      document.status === 'PROCESSING' ||
      document.status === 'PROCESSED' ||
      document.status === 'FAILED'
        ? document.status
        : 'PROCESSED',
    category: typeof document.category === 'string' ? document.category : null,
    error:
      document.error && typeof document.error === 'object'
        ? (document.error as Record<string, unknown>)
        : null,
    processor:
      document.processor && typeof document.processor === 'object'
        ? (document.processor as Record<string, unknown>)
        : null,
    rawExtractionRef:
      typeof document.rawExtractionRef === 'string'
        ? document.rawExtractionRef
        : null,
    extractedMetadata:
      document.extractedMetadata &&
      typeof document.extractedMetadata === 'object' &&
      !Array.isArray(document.extractedMetadata)
        ? (document.extractedMetadata as Record<string, string>)
        : undefined,
    mappingStatusSummary: summary,
  })
}

export async function listReceiptReviewItems(params: {
  uid: string
  year?: number
  statuses?: ReceiptMappingStatus[]
}): Promise<ReceiptReviewItem[]> {
  const documents = await listDocuments({ uid: params.uid, limit: 80 })
  const out: ReceiptReviewItem[] = []

  for (const document of documents) {
    if (String(document.documentType || '') !== 'RECEIPT') continue
    const documentId = String(document.id || '')
    if (!documentId) continue
    const rows = await listExtractions({ uid: params.uid, documentId, limit: 50 })
    for (const raw of rows) {
      const row = raw as Record<string, unknown>
      if (!isReceiptReviewItem(row)) continue
      const mappingStatus =
        typeof row.mappingStatus === 'string'
          ? (row.mappingStatus as ReceiptMappingStatus)
          : 'unmapped'
      if (params.statuses && !params.statuses.includes(mappingStatus)) continue
      out.push({
        extractionId: String(row.id || ''),
        documentId,
        label: String(row.label || 'Receipt'),
        ...(typeof row.vendor === 'string' ? { vendor: row.vendor } : {}),
        ...(typeof row.date === 'string' ? { date: row.date } : {}),
        amount: Number(row.amount || 0),
        confidence: Number(row.confidence || 0),
        mappingStatus,
        ...(typeof row.mappingErrorCode === 'string'
          ? { mappingErrorCode: row.mappingErrorCode }
          : {}),
        ...(typeof row.suggestedReliefId === 'string' || row.suggestedReliefId === null
          ? { suggestedReliefId: (row.suggestedReliefId as string | null) ?? null }
          : {}),
        ...(typeof row.suggestionConfidence === 'number' || row.suggestionConfidence === null
          ? { suggestionConfidence: (row.suggestionConfidence as number | null) ?? null }
          : {}),
        ...(typeof row.suggestionRationale === 'string' || row.suggestionRationale === null
          ? { suggestionRationale: (row.suggestionRationale as string | null) ?? null }
          : {}),
        ...(Array.isArray(row.suggestionAlternatives)
          ? {
              suggestionAlternatives: row.suggestionAlternatives as ReceiptReviewItem['suggestionAlternatives'],
            }
          : {}),
        ...(typeof row.reliefId === 'string' ? { reliefId: row.reliefId } : {}),
        ...(typeof row.reliefBucket === 'string'
          ? { reliefBucket: row.reliefBucket }
          : {}),
        ...(typeof row.subcapId === 'string' ? { subcapId: row.subcapId } : {}),
      })
    }
  }

  return out
}

export async function retryReceiptSuggestion(params: {
  uid: string
  extractionId: string
  year?: number
}): Promise<ReceiptReviewItem> {
  const found = await findReceiptExtraction(params)
  const row = found.row
  if (!isReceiptReviewItem(row)) {
    throw new HttpError(400, 'Extraction is not a receipt row')
  }

  const [updated] = await suggestReceiptReliefMappings({
    uid: params.uid,
    documentId: found.documentId,
    year: params.year,
    rows: [
      {
        id: String(row.id || params.extractionId),
        label: String(row.label || 'Receipt'),
        amount: Number(row.amount || 0),
        confidence: Number(row.confidence || 0),
        ...(typeof row.vendor === 'string' ? { vendor: row.vendor } : {}),
        ...(typeof row.date === 'string' ? { date: row.date } : {}),
      },
    ],
  })
  await refreshDocumentMappingSummary({
    uid: params.uid,
    documentId: found.documentId,
  })

  return {
    extractionId: updated.id,
    documentId: found.documentId,
    label: updated.label,
    ...(updated.vendor ? { vendor: updated.vendor } : {}),
    ...(updated.date ? { date: updated.date } : {}),
    amount: updated.amount,
    confidence: Number(updated.confidence || 0),
    mappingStatus: updated.mappingStatus,
    mappingErrorCode: updated.mappingErrorCode,
    suggestedReliefId: updated.suggestedReliefId,
    suggestionConfidence: updated.suggestionConfidence,
    suggestionRationale: updated.suggestionRationale,
    suggestionAlternatives: updated.suggestionAlternatives,
    ...(updated.reliefBucket ? { reliefBucket: updated.reliefBucket } : {}),
    ...(updated.subcapId ? { subcapId: updated.subcapId } : {}),
  }
}

export async function confirmReceiptMapping(params: {
  uid: string
  extractionId: string
  body: unknown
}): Promise<{ ok: true }> {
  const parsed = confirmReceiptMappingBodySchema.safeParse(params.body)
  if (!parsed.success) {
    throw new HttpError(400, parsed.error.flatten())
  }
  const year = parsed.data.year ?? 2025
  const rule = getReliefRulesByYear(year).find((item) => item.id === parsed.data.reliefId)
  if (!rule) throw new HttpError(404, 'Unknown relief category')

  const found = await findReceiptExtraction(params)
  const row = found.row
  if (!isReceiptReviewItem(row)) {
    throw new HttpError(400, 'Extraction is not a receipt row')
  }

  await upsertExtraction({
    uid: params.uid,
    documentId: found.documentId,
    extractionId: params.extractionId,
    payload: {
      category: rule.category === 'parental' ? 'other' : rule.category,
      reliefId: parsed.data.reliefId,
      mappingStatus: 'confirmed',
      mappingErrorCode: null,
      reliefBucket: parsed.data.reliefBucket ?? null,
      subcapId: parsed.data.subcapId ?? null,
    },
  })

  await upsertClaimFromReceiptExtraction({
    uid: params.uid,
    documentId: found.documentId,
    extractionId: params.extractionId,
    reliefId: parsed.data.reliefId,
    vendor: String(row.vendor || row.label || 'Receipt'),
    amount: Number(row.amount || 0),
    ...(typeof row.date === 'string' ? { date: row.date } : {}),
    ...(parsed.data.reliefBucket ? { reliefBucket: parsed.data.reliefBucket } : {}),
    ...(parsed.data.subcapId ? { subcapId: parsed.data.subcapId } : {}),
  })

  await refreshDocumentMappingSummary({
    uid: params.uid,
    documentId: found.documentId,
  })

  return { ok: true }
}

export async function clearReceiptMapping(params: {
  uid: string
  extractionId: string
}): Promise<{ ok: true }> {
  const found = await findReceiptExtraction(params)

  await upsertExtraction({
    uid: params.uid,
    documentId: found.documentId,
    extractionId: params.extractionId,
    payload: {
      reliefId: null,
      suggestedReliefId: null,
      suggestionConfidence: null,
      suggestionRationale: null,
      suggestionAlternatives: [],
      mappingStatus: 'unmapped',
      mappingErrorCode: null,
      reliefBucket: null,
      subcapId: null,
      category: 'other',
    },
  })

  await removeClaimForReceiptExtraction({
    uid: params.uid,
    documentId: found.documentId,
    extractionId: params.extractionId,
  })

  await refreshDocumentMappingSummary({
    uid: params.uid,
    documentId: found.documentId,
  })

  return { ok: true }
}
