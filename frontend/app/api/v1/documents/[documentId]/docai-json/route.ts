import { gunzipSync } from 'node:zlib'

import { NextRequest, NextResponse } from 'next/server'

import { requireFirebaseUser } from '@/lib/server/auth'
import { handleRouteError } from '@/lib/server/route'
import { HttpError } from '@/lib/server/http'
import { getDocument, downloadBytes } from '@/dal/documents'

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ documentId: string }> }
) {
  try {
    const user = await requireFirebaseUser(_req)
    const { documentId } = await ctx.params
    const doc = await getDocument({ uid: user.uid, documentId })
    if (!doc) throw new HttpError(404, 'Document not found')

    const row = doc as Record<string, unknown>
    const rawRef = String(row.rawExtractionRef || '').trim()
    const prefix = `users/${user.uid}/`
    if (
      !rawRef ||
      rawRef.includes('..') ||
      !rawRef.startsWith(prefix) ||
      !rawRef.endsWith('.docai.json.gz')
    ) {
      throw new HttpError(
        404,
        'No Document AI raw payload for this document (processing may have failed or not completed).'
      )
    }

    const gz = await downloadBytes({ storagePath: rawRef })
    let json: unknown
    try {
      const buf = gunzipSync(gz)
      json = JSON.parse(buf.toString('utf-8')) as unknown
    } catch {
      throw new HttpError(500, 'Failed to decode stored Document AI payload')
    }

    return NextResponse.json(json)
  } catch (err) {
    return handleRouteError(err)
  }
}
