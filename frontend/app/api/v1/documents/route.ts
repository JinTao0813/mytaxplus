import { NextRequest, NextResponse } from 'next/server'

import { requireFirebaseUser } from '@/lib/server/auth'
import { handleRouteError } from '@/lib/server/route'
import { listDocuments } from '@/dal/documents'

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
  const value = row.updatedAt ?? row.createdAt
  if (
    value &&
    typeof value === 'object' &&
    'toDate' in value &&
    typeof (value as { toDate: () => Date }).toDate === 'function'
  ) {
    return (value as { toDate: () => Date }).toDate().toISOString()
  }
  return new Date().toISOString()
}

function docResponse(input: {
  id: string
  name: string
  sizeKb: number
  uploadedAt: string
  status: DocumentStatus
  category: string | null
  processingError: string | null
  documentType?: string
  mappingStatusSummary?: string
}) {
  return {
    id: input.id,
    name: input.name,
    sizeKb: input.sizeKb,
    uploadedAt: input.uploadedAt,
    status: input.status,
    category: input.category,
    processingError: input.processingError,
    ...(input.documentType === 'EA_FORM' ||
    input.documentType === 'RECEIPT' ||
    input.documentType === 'UNKNOWN'
      ? { documentType: input.documentType }
      : {}),
    ...(input.mappingStatusSummary
      ? { mappingStatusSummary: input.mappingStatusSummary }
      : {}),
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await requireFirebaseUser(req)
    const docs = await listDocuments({ uid: user.uid, limit: 100 })

    return NextResponse.json(
      docs.map((d) => {
        const row = d as Record<string, unknown>
        const status = toDocumentStatus(row.status)
        const documentType =
          row.documentType === 'EA_FORM' ||
          row.documentType === 'RECEIPT' ||
          row.documentType === 'UNKNOWN'
            ? row.documentType
            : undefined
        return docResponse({
          id: String(row.id || ''),
          name: String(row.originalFilename || row.name || 'Document'),
          sizeKb: Number(row.sizeKb || 0),
          uploadedAt: uploadedAtFromDoc(row),
          status,
          category: typeof row.category === 'string' ? row.category : null,
          processingError:
            status === 'error' ? processingErrorFromDoc(row) : null,
          ...(documentType ? { documentType } : {}),
          ...(typeof row.mappingStatusSummary === 'string'
            ? { mappingStatusSummary: row.mappingStatusSummary }
            : {}),
        })
      })
    )
  } catch (err) {
    return handleRouteError(err)
  }
}
