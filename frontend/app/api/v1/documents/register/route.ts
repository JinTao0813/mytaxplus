import { NextRequest, NextResponse } from 'next/server'

import { requireFirebaseUser } from '@/lib/server/auth'
import { handleRouteError } from '@/lib/server/route'
import { HttpError } from '@/lib/server/http'
import { registerAndProcessDocument } from '@/services/documents/process-document'

type RegisterBody = {
  documentId?: string
  storagePath?: string
  originalFilename?: string
  sizeKb?: number
  documentType?: 'EA_FORM' | 'RECEIPT'
}

function docResponse(input: {
  id: string
  name: string
  sizeKb: number
  status: 'uploading' | 'processing' | 'processed' | 'error'
  category: string | null
  processingError: string | null
  documentType: 'EA_FORM' | 'RECEIPT'
}) {
  return {
    id: input.id,
    name: input.name,
    sizeKb: input.sizeKb,
    uploadedAt: new Date().toISOString(),
    status: input.status,
    category: input.category,
    processingError: input.processingError,
    documentType: input.documentType,
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireFirebaseUser(req)
    const body = (await req.json()) as RegisterBody

    const documentId = (body.documentId || '').trim() || crypto.randomUUID()
    const storagePath = (body.storagePath || '').trim()
    const originalFilename = (body.originalFilename || '').trim()
    const sizeKb = Number(body.sizeKb || 0)
    const documentType = body.documentType

    if (!storagePath) throw new HttpError(400, 'storagePath is required')
    if (!originalFilename) throw new HttpError(400, 'originalFilename is required')
    if (!documentType || (documentType !== 'EA_FORM' && documentType !== 'RECEIPT')) {
      throw new HttpError(400, 'documentType must be EA_FORM or RECEIPT')
    }

    const prefix = `users/${user.uid}/`
    if (storagePath.includes('..') || !storagePath.startsWith(prefix)) {
      throw new HttpError(403, 'storagePath must belong to the signed-in user')
    }

    const result = await registerAndProcessDocument({
      uid: user.uid,
      documentId,
      storagePath,
      originalFilename,
      sizeKb,
      contentType: null,
      documentType,
    })

    if (result.status === 'FAILED') {
      return NextResponse.json(
        docResponse({
          id: documentId,
          name: originalFilename,
          sizeKb,
          status: 'error',
          category: null,
          processingError: result.errorMessage,
          documentType,
        })
      )
    }

    return NextResponse.json(
      docResponse({
        id: documentId,
        name: originalFilename,
        sizeKb,
        status: 'processed',
        category: result.category || 'other',
        processingError: null,
        documentType,
      })
    )
  } catch (err) {
    return handleRouteError(err)
  }
}
