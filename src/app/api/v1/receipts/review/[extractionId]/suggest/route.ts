import { NextRequest, NextResponse } from 'next/server'

import { requireFirebaseUser } from '@/lib/server/auth'
import { handleRouteError } from '@/lib/server/route'
import { retryReceiptSuggestion } from '@/services/reliefs/receipt-review'

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ extractionId: string }> }
) {
  try {
    const user = await requireFirebaseUser(req)
    const { extractionId } = await ctx.params
    return NextResponse.json(
      await retryReceiptSuggestion({
        uid: user.uid,
        extractionId,
      })
    )
  } catch (err) {
    return handleRouteError(err)
  }
}
