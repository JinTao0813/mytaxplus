import type {
  UploadedDocument,
  AiExtraction,
  AiExtractionWithId,
  DocumentDetail,
  ExtractionCategory,
} from '@/lib/types'
import { apiFetch } from '@/lib/api/client'
import type { ClientApiContext, ServerApiContext } from '@/lib/api/config'
import {
  aiExtractionListSchema,
  aiExtractionWithIdListSchema,
  documentDetailSchema,
  documentDocAiJsonSchema,
  uploadedDocumentListSchema,
  uploadedDocumentSchema,
} from '@/lib/validations/api-schemas'

/** GET /api/v1/documents (session cookie and/or Bearer ID token). */
export async function getDocuments(
  ctx?: ServerApiContext | ClientApiContext
): Promise<UploadedDocument[]> {
  const token = ctx && 'token' in ctx ? ctx.token : undefined
  return apiFetch('/api/v1/documents', {
    responseSchema: uploadedDocumentListSchema,
    cookieHeader: ctx?.cookieHeader,
    token,
  })
}

/** GET /api/v1/documents/{documentId} — document detail + extractedMetadata */
export async function getDocument(payload: {
  documentId: string
  ctx?: ServerApiContext | ClientApiContext
}): Promise<DocumentDetail> {
  const token =
    payload.ctx && 'token' in payload.ctx ? payload.ctx.token : undefined
  return apiFetch(`/api/v1/documents/${payload.documentId}`, {
    responseSchema: documentDetailSchema,
    cookieHeader: payload.ctx?.cookieHeader,
    token,
  })
}

/** GET /api/v1/documents/{documentId}/docai-json — gzip JSON from Storage (debug) */
export async function getDocumentDocAiJson(payload: {
  documentId: string
  ctx?: ServerApiContext | ClientApiContext
}): Promise<Record<string, unknown>> {
  const token =
    payload.ctx && 'token' in payload.ctx ? payload.ctx.token : undefined
  return apiFetch(`/api/v1/documents/${payload.documentId}/docai-json`, {
    responseSchema: documentDocAiJsonSchema,
    cookieHeader: payload.ctx?.cookieHeader,
    token,
  })
}

/** GET /api/v1/documents/extractions */
export async function getAiExtractions(
  ctx?: ServerApiContext | ClientApiContext
): Promise<AiExtraction[]> {
  const token = ctx && 'token' in ctx ? ctx.token : undefined
  return apiFetch('/api/v1/documents/extractions', {
    responseSchema: aiExtractionListSchema,
    cookieHeader: ctx?.cookieHeader,
    token,
  })
}

/** Register a document already uploaded to Firebase Storage (preferred flow). */
export async function registerUploadedDocument(
  payload: {
    documentId: string
    storagePath: string
    originalFilename: string
    sizeKb: number
    documentType: 'EA_FORM' | 'RECEIPT'
  },
  auth?: Pick<ClientApiContext, 'token'>
): Promise<UploadedDocument> {
  return apiFetch('/api/v1/documents/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      documentId: payload.documentId,
      storagePath: payload.storagePath,
      originalFilename: payload.originalFilename,
      sizeKb: payload.sizeKb,
      documentType: payload.documentType,
    }),
    responseSchema: uploadedDocumentSchema,
    token: auth?.token,
  })
}

/** GET /api/v1/documents/{documentId}/extractions (includes extraction id for edit UI) */
export async function getDocumentExtractions(payload: {
  documentId: string
  ctx?: ServerApiContext | ClientApiContext
}): Promise<AiExtractionWithId[]> {
  const token =
    payload.ctx && 'token' in payload.ctx ? payload.ctx.token : undefined
  return apiFetch(`/api/v1/documents/${payload.documentId}/extractions`, {
    responseSchema: aiExtractionWithIdListSchema,
    cookieHeader: payload.ctx?.cookieHeader,
    token,
  })
}

/** PUT /api/v1/documents/{documentId}/extractions/{extractionId} */
export async function patchDocumentExtraction(payload: {
  documentId: string
  extractionId: string
  label?: string
  category?: ExtractionCategory
  amount?: number
  taxSection?: string
}): Promise<{ ok: boolean }> {
  return apiFetch(
    `/api/v1/documents/${payload.documentId}/extractions/${payload.extractionId}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        label: payload.label,
        category: payload.category,
        amount: payload.amount,
        taxSection: payload.taxSection,
      }),
    }
  )
}

/** DELETE /api/v1/documents/{documentId} */
export async function deleteDocument(payload: {
  documentId: string
  auth?: Pick<ClientApiContext, 'token'>
}): Promise<{ ok: boolean }> {
  return apiFetch(`/api/v1/documents/${payload.documentId}`, {
    method: 'DELETE',
    token: payload.auth?.token,
  })
}

/** POST /api/v1/documents/upload (multipart fallback; session cookie auth) */
export async function uploadDocument(file: File): Promise<UploadedDocument> {
  const form = new FormData()
  form.append('file', file)
  return apiFetch('/api/v1/documents/upload', {
    method: 'POST',
    body: form,
    responseSchema: uploadedDocumentSchema,
  })
}
