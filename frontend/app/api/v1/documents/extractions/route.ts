import { NextRequest, NextResponse } from 'next/server'

import { requireFirebaseUser } from '@/lib/server/auth'
import { handleRouteError } from '@/lib/server/route'
import { listExtractions } from '@/dal/documents'

export async function GET(req: NextRequest) {
  try {
    const user = await requireFirebaseUser(req)
    const documentId = req.nextUrl.searchParams.get('documentId') || undefined
    const rows = await listExtractions({
      uid: user.uid,
      documentId,
      limit: 200,
    })

    return NextResponse.json(
      rows.map((r) => {
        const row = r as Record<string, unknown>
        return {
          documentId: String(row.documentId || ''),
          label: String(row.label || ''),
          category: String(row.category || 'other'),
          amount: Number(row.amount || 0),
          confidence: Number(row.confidence || 0),
          taxSection: String(row.taxSection || ''),
          status: String(row.status || 'complete'),
          ...(typeof row.vendor === 'string' ? { vendor: row.vendor } : {}),
          ...(typeof row.date === 'string' ? { date: row.date } : {}),
          ...(typeof row.sourceFieldId === 'string'
            ? { sourceFieldId: row.sourceFieldId }
            : {}),
          ...(typeof row.reliefId === 'string'
            ? { reliefId: row.reliefId }
            : {}),
          ...(typeof row.suggestedReliefId === 'string' ||
          row.suggestedReliefId === null
            ? { suggestedReliefId: (row.suggestedReliefId as string | null) ?? null }
            : {}),
          ...(typeof row.suggestionConfidence === 'number' ||
          row.suggestionConfidence === null
            ? {
                suggestionConfidence:
                  (row.suggestionConfidence as number | null) ?? null,
              }
            : {}),
          ...(typeof row.suggestionRationale === 'string' ||
          row.suggestionRationale === null
            ? {
                suggestionRationale:
                  (row.suggestionRationale as string | null) ?? null,
              }
            : {}),
          ...(Array.isArray(row.suggestionAlternatives)
            ? { suggestionAlternatives: row.suggestionAlternatives }
            : {}),
          ...(typeof row.mappingStatus === 'string'
            ? { mappingStatus: row.mappingStatus }
            : {}),
          ...(typeof row.mappingErrorCode === 'string' ||
          row.mappingErrorCode === null
            ? { mappingErrorCode: (row.mappingErrorCode as string | null) ?? null }
            : {}),
          ...(typeof row.reliefBucket === 'string'
            ? { reliefBucket: row.reliefBucket }
            : {}),
          ...(typeof row.subcapId === 'string'
            ? { subcapId: row.subcapId }
            : {}),
        }
      })
    )
  } catch (err) {
    return handleRouteError(err)
  }
}
