import { NextRequest, NextResponse } from 'next/server'

import { requireFirebaseUser } from '@/lib/server/auth'
import { handleRouteError } from '@/lib/server/route'
import { upsertExtraction } from '@/dal/documents'

export async function PUT(
  req: NextRequest,
  ctx: { params: Promise<{ documentId: string; extractionId: string }> }
) {
  try {
    const user = await requireFirebaseUser(req)
    const { documentId, extractionId } = await ctx.params
    const body = (await req.json()) as Record<string, unknown>
    const payload = Object.fromEntries(
      Object.entries(body).filter(([, v]) => v !== undefined)
    )
    if (Object.keys(payload).length === 0) {
      return NextResponse.json({ ok: true })
    }

    await upsertExtraction({
      uid: user.uid,
      documentId,
      extractionId,
      payload,
    })
    return NextResponse.json({ ok: true })
  } catch (err) {
    return handleRouteError(err)
  }
}
