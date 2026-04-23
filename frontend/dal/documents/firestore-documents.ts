import 'server-only'

import { FieldValue } from 'firebase-admin/firestore'

import { adminDb } from '@/lib/server/firebase-admin'
import {
  documentExtractionPath,
  documentExtractionsCollectionPath,
  userDocumentPath,
  userDocumentsCollectionPath,
} from '@/lib/server/firestore-paths'

import type {
  UpsertDocumentInput,
  UpsertExtractionInput,
} from '@/dal/documents/types'

export async function upsertDocument(params: UpsertDocumentInput): Promise<void> {
  const path = userDocumentPath({ uid: params.uid, documentId: params.documentId })
  const ref = adminDb.doc(path)
  const snap = await ref.get()

  const update: Record<string, unknown> = {
    uid: params.uid,
    storagePath: params.storagePath,
    originalFilename: params.originalFilename,
    sizeKb: params.sizeKb,
    contentType: params.contentType,
    documentType: params.documentType,
    status: params.status,
    category: params.category,
    error: params.error,
    processor: params.processor,
    rawExtractionRef: params.rawExtractionRef,
    updatedAt: FieldValue.serverTimestamp(),
  }

  if (params.extractedMetadata !== undefined) {
    update.extractedMetadata = params.extractedMetadata
  }
  if (params.mappingStatusSummary !== undefined) {
    update.mappingStatusSummary = params.mappingStatusSummary
  }

  Object.keys(update).forEach((key) => {
    if (update[key] == null) delete update[key]
  })

  if (!snap.exists) update.createdAt = FieldValue.serverTimestamp()
  await ref.set(update, { merge: true })
}

export async function listDocuments(params: {
  uid: string
  limit?: number
}): Promise<Array<Record<string, unknown>>> {
  const col = adminDb.collection(userDocumentsCollectionPath({ uid: params.uid }))
  const qs = col.orderBy('updatedAt', 'desc').limit(params.limit ?? 100)
  const snap = await qs.get()
  return snap.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Record<string, unknown>),
  }))
}

export async function getDocument(params: {
  uid: string
  documentId: string
}): Promise<Record<string, unknown> | null> {
  const ref = adminDb.doc(userDocumentPath({ uid: params.uid, documentId: params.documentId }))
  const snap = await ref.get()
  if (!snap.exists) return null
  return { id: snap.id, ...(snap.data() as Record<string, unknown>) }
}

export async function deleteDocument(params: {
  uid: string
  documentId: string
}): Promise<void> {
  const ref = adminDb.doc(userDocumentPath({ uid: params.uid, documentId: params.documentId }))
  await ref.delete()
}

export async function deleteExtractions(params: {
  uid: string
  documentId: string
}): Promise<void> {
  const col = adminDb.collection(
    documentExtractionsCollectionPath({ uid: params.uid, documentId: params.documentId })
  )
  const snap = await col.get()
  await Promise.all(snap.docs.map((doc) => doc.ref.delete()))
}

export async function upsertExtraction(
  params: UpsertExtractionInput
): Promise<void> {
  const path = documentExtractionPath({
    uid: params.uid,
    documentId: params.documentId,
    extractionId: params.extractionId,
  })
  const ref = adminDb.doc(path)
  const snap = await ref.get()

  await ref.set(
    {
      ...params.payload,
      documentId: params.documentId,
      updatedAt: FieldValue.serverTimestamp(),
      ...(snap.exists ? {} : { createdAt: FieldValue.serverTimestamp() }),
    },
    { merge: true }
  )
}

export async function listExtractions(params: {
  uid: string
  documentId?: string
  limit?: number
}): Promise<Array<Record<string, unknown>>> {
  const limit = params.limit ?? 200
  if (params.documentId) {
    const col = adminDb.collection(
      documentExtractionsCollectionPath({ uid: params.uid, documentId: params.documentId })
    )
    const qs = col.orderBy('createdAt', 'desc').limit(limit)
    const snap = await qs.get()
    return snap.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Record<string, unknown>),
    }))
  }

  const documents = await listDocuments({ uid: params.uid, limit: 50 })
  const extractions: Array<Record<string, unknown>> = []
  for (const doc of documents) {
    const documentId = typeof doc.id === 'string' ? doc.id : ''
    if (!documentId) continue
    const rows = await listExtractions({
      uid: params.uid,
      documentId,
      limit,
    })
    extractions.push(...rows)
    if (extractions.length >= limit) break
  }

  return extractions.slice(0, limit)
}
