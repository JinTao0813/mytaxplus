import { NextRequest, NextResponse } from 'next/server'

import { requireFirebaseUser } from '@/lib/server/auth'
import { handleRouteError } from '@/lib/server/route'
import { confirmReceiptMapping } from '@/services/reliefs/receipt-review'

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ extractionId: string }> }
) {
  try {
    const user = await requireFirebaseUser(req)
    const { extractionId } = await ctx.params
    const body: unknown = await req.json().catch(() => ({}))
    return NextResponse.json(
      await confirmReceiptMapping({
        uid: user.uid,
        extractionId,
        body,
      })
    )
  } catch (err) {
    return handleRouteError(err)
  }
}
