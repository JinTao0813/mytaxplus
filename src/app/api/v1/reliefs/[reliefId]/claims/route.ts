import { NextRequest, NextResponse } from 'next/server'

import { requireFirebaseUser } from '@/lib/server/auth'
import { handleRouteError } from '@/lib/server/route'
import { createReliefClaimRecord } from '@/services/reliefs/mutate-relief-claims'

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ reliefId: string }> }
) {
  try {
    const user = await requireFirebaseUser(req)
    const { reliefId } = await ctx.params
    const raw: unknown = await req.json().catch(() => ({}))
    const result = await createReliefClaimRecord({
      uid: user.uid,
      reliefId,
      body: raw,
    })
    return NextResponse.json(result)
  } catch (err) {
    return handleRouteError(err)
  }
}
