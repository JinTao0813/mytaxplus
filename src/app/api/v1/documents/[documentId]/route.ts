import { NextRequest, NextResponse } from 'next/server'

import { requireFirebaseUser } from '@/lib/server/auth'
import { handleRouteError } from '@/lib/server/route'
import { HttpError } from '@/lib/server/http'
import {
  deleteDocument,
  deleteExtractions,
  deleteObject,
  getDocument,
} from '@/dal/documents'

type DocumentStatus = 'uploading' | 'processing' | 'processed' | 'error'

function toDocumentStatus(status: unknown): DocumentStatus {
  if (status === 'PROCESSED') return 'processed'
  if (status === 'FAILED') return 'error'
  if (status === 'PROCESSING') return 'processing'
  return 'uploading'
}

function processingErrorFromDoc(data: Record<string, unknown>): string | null {
  const err = data.error
  if (!err || typeof err !== 'object') return null
  const message = (err as { message?: unknown }).message
  return typeof message === 'string' ? message : null
}

function uploadedAtFromDoc(row: Record<string, unknown>): string {
  const u = row.updatedAt ?? row.createdAt
  if (
    u &&
    typeof u === 'object' &&
    'toDate' in u &&
    typeof (u as { toDate: () => Date }).toDate === 'function'
  ) {
    return (u as { toDate: () => Date }).toDate().toISOString()
  }
  return new Date().toISOString()
}

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ documentId: string }> }
) {
  try {
    const user = await requireFirebaseUser(req)
    const { documentId } = await ctx.params
    const doc = await getDocument({ uid: user.uid, documentId })
    if (!doc) throw new HttpError(404, 'Document not found')

    const row = doc as Record<string, unknown>
    const status = toDocumentStatus(row.status)
    const meta = row.extractedMetadata
    const extractedMetadata =
      meta && typeof meta === 'object' && !Array.isArray(meta)
        ? (meta as Record<string, string>)
        : undefined

    return NextResponse.json({
      id: String(row.id || documentId),
      name: String(row.originalFilename || row.name || 'Document'),
      sizeKb: Number(row.sizeKb || 0),
      uploadedAt: uploadedAtFromDoc(row),
      status,
      category: typeof row.category === 'string' ? row.category : null,
      processingError:
        status === 'error' ? processingErrorFromDoc(row) : null,
      ...(typeof row.mappingStatusSummary === 'string'
        ? { mappingStatusSummary: row.mappingStatusSummary }
        : {}),
      documentType:
        row.documentType === 'EA_FORM' ||
        row.documentType === 'RECEIPT' ||
        row.documentType === 'UNKNOWN'
          ? row.documentType
          : undefined,
      ...(extractedMetadata && Object.keys(extractedMetadata).length > 0
        ? { extractedMetadata }
        : {}),
    })
  } catch (err) {
    return handleRouteError(err)
  }
}

export async function DELETE(
  req: NextRequest,
  ctx: { params: Promise<{ documentId: string }> }
) {
  try {
    const user = await requireFirebaseUser(req)
    const { documentId } = await ctx.params
    const doc = await getDocument({ uid: user.uid, documentId })
    if (!doc) throw new HttpError(404, 'Document not found')

    const storagePath = String(doc.storagePath || '').trim()
    const prefix = `users/${user.uid}/`
    if (!storagePath || storagePath.includes('..') || !storagePath.startsWith(prefix)) {
      throw new HttpError(403, 'Document does not belong to the signed-in user')
    }

    const rawRef = String(doc.rawExtractionRef || '').trim()
    await deleteExtractions({ uid: user.uid, documentId })
    await deleteDocument({ uid: user.uid, documentId })
    await deleteObject({ storagePath })
    if (rawRef) await deleteObject({ storagePath: rawRef })

    return NextResponse.json({ ok: true })
  } catch (err) {
    return handleRouteError(err)
  }
}
