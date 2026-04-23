import 'server-only'

import { gzipSync } from 'node:zlib'

import {
  deleteExtractions,
  processDocumentWithAi,
  type DocumentStatusDb,
  type DocumentTypeDb,
  upsertDocument,
  upsertExtraction,
  downloadBytes,
  uploadBytes,
} from '@/dal/documents'
import { extractDocument } from '@/services/documents/extractors/registry'
import { loggableGoogleClientError } from '@/lib/server/google-client-error'
import {
  suggestReceiptReliefMappings,
  summarizeDocumentMappingStatus,
} from '@/services/reliefs/suggest-receipt-mappings'

export type DocumentType = 'EA_FORM' | 'RECEIPT'

export type RegisterResult = {
  documentId: string
  category: string | null
  status: DocumentStatusDb
  errorMessage: string | null
}

export async function registerAndProcessDocument(params: {
  uid: string
  documentId: string
  storagePath: string
  originalFilename: string
  sizeKb: number
  contentType: string | null
  documentType: DocumentType
}): Promise<RegisterResult> {
  const docType: DocumentTypeDb = params.documentType

  await upsertDocument({
    uid: params.uid,
    documentId: params.documentId,
    storagePath: params.storagePath,
    originalFilename: params.originalFilename,
    sizeKb: params.sizeKb,
    contentType: params.contentType,
    documentType: docType,
    status: 'PROCESSING',
    category: null,
    error: null,
    processor: null,
    rawExtractionRef: null,
    extractedMetadata: {},
  })

  try {
    const raw = await downloadBytes({ storagePath: params.storagePath })
    const mime = guessMimeType(params.originalFilename, params.contentType)
    const processorId =
      docType === 'EA_FORM'
        ? process.env.DOCAI_EA_PROCESSOR_ID || ''
        : process.env.DOCAI_RECEIPT_PROCESSOR_ID || ''
    if (!processorId) throw new Error('Document AI processor id not configured')

    console.debug('[document-processing] before_doc_ai', {
      documentId: params.documentId,
      originalFilename: params.originalFilename,
      declaredContentType: params.contentType,
      resolvedMime: mime,
      byteLength: raw.length,
      headHex: bufferHeadHex(raw, 12),
    })

    const ai = await processDocumentWithAi({
      processorId,
      content: raw,
      mimeType: mime,
    })

    const rawRef = `users/${params.uid}/documents_raw/${params.documentId}.docai.json.gz`
    await uploadBytes({
      storagePath: rawRef,
      payload: gzipSync(Buffer.from(JSON.stringify(ai.rawJson), 'utf-8')),
      contentType: 'application/gzip',
    })

    const result = extractDocument(docType, params.documentId, ai.rawJson)
    const category = result.documentCategory
    const extractions = result.rows.map((row) => ({
      ...row,
      documentId: params.documentId,
    }))

    await deleteExtractions({
      uid: params.uid,
      documentId: params.documentId,
    })

    await Promise.all(
      extractions.map((row) =>
        upsertExtraction({
          uid: params.uid,
          documentId: params.documentId,
          extractionId: String(row.id),
          payload: Object.fromEntries(
            Object.entries(row).filter(([key]) => key !== 'id')
          ),
        })
      )
    )

    const suggestedExtractions =
      docType === 'RECEIPT'
        ? await suggestReceiptReliefMappings({
            uid: params.uid,
            documentId: params.documentId,
            rows: extractions.map((row) => ({
              id: String(row.id),
              label: String(row.label),
              amount: Number(row.amount),
              confidence: Number(row.confidence ?? 0),
              ...(typeof row.vendor === 'string' ? { vendor: row.vendor } : {}),
              ...(typeof row.date === 'string' ? { date: row.date } : {}),
            })),
          })
        : []

    await upsertDocument({
      uid: params.uid,
      documentId: params.documentId,
      storagePath: params.storagePath,
      originalFilename: params.originalFilename,
      sizeKb: params.sizeKb,
      contentType: params.contentType,
      documentType: docType,
      status: 'PROCESSED',
      category,
      error: null,
      processor: {
        provider: 'document_ai',
        processorName: ai.processorName,
      },
      rawExtractionRef: rawRef,
      extractedMetadata:
        docType === 'EA_FORM' ? (result.extractedMetadata ?? {}) : {},
      ...(docType === 'RECEIPT'
        ? {
            mappingStatusSummary: summarizeDocumentMappingStatus(
              suggestedExtractions
            ),
          }
        : {}),
    })

    return {
      documentId: params.documentId,
      category,
      status: 'PROCESSED',
      errorMessage: null,
    }
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Failed to process document'
    const processorIdForLog =
      docType === 'EA_FORM'
        ? process.env.DOCAI_EA_PROCESSOR_ID || ''
        : process.env.DOCAI_RECEIPT_PROCESSOR_ID || ''
    console.error('[document-processing] process_failed', {
      documentId: params.documentId,
      uidSuffix:
        params.uid.length > 8 ? `…${params.uid.slice(-8)}` : params.uid,
      documentType: docType,
      docaiProjectId: process.env.DOCAI_PROJECT_ID ? '(set)' : '(missing)',
      docaiLocation: process.env.DOCAI_LOCATION || 'us',
      processorIdConfigured: Boolean(processorIdForLog),
      error: loggableGoogleClientError(err),
    })

    await upsertDocument({
      uid: params.uid,
      documentId: params.documentId,
      storagePath: params.storagePath,
      originalFilename: params.originalFilename,
      sizeKb: params.sizeKb,
      contentType: params.contentType,
      documentType: docType,
      status: 'FAILED',
      category: null,
      error: { message },
      processor: { provider: 'document_ai' },
      rawExtractionRef: null,
      extractedMetadata: {},
    })

    return {
      documentId: params.documentId,
      category: null,
      status: 'FAILED',
      errorMessage: message,
    }
  }
}

function guessMimeType(filename: string, contentType: string | null): string {
  if (contentType) return contentType
  const normalized = filename.toLowerCase()
  if (normalized.endsWith('.pdf')) return 'application/pdf'
  if (normalized.endsWith('.png')) return 'image/png'
  return 'image/jpeg'
}

function bufferHeadHex(buf: Buffer, maxBytes: number): string {
  if (buf.length === 0) return ''
  return buf.subarray(0, Math.min(maxBytes, buf.length)).toString('hex')
}
