import { NextRequest, NextResponse } from 'next/server'

import { requireFirebaseUser } from '@/lib/server/auth'
import { handleRouteError } from '@/lib/server/route'
import {
  patchReliefClaimRecord,
  removeReliefClaimRecord,
} from '@/services/reliefs/mutate-relief-claims'

export async function PUT(
  req: NextRequest,
  ctx: { params: Promise<{ reliefId: string; claimId: string }> }
) {
  try {
    const user = await requireFirebaseUser(req)
    const { reliefId, claimId } = await ctx.params
    const raw: unknown = await req.json().catch(() => ({}))
    await patchReliefClaimRecord({
      uid: user.uid,
      reliefId,
      claimId,
      body: raw,
    })
    return NextResponse.json({ ok: true })
  } catch (err) {
    return handleRouteError(err)
  }
}

export async function DELETE(
  req: NextRequest,
  ctx: { params: Promise<{ reliefId: string; claimId: string }> }
) {
  try {
    const user = await requireFirebaseUser(req)
    const { reliefId, claimId } = await ctx.params
    await removeReliefClaimRecord({
      uid: user.uid,
      reliefId,
      claimId,
    })
    return NextResponse.json({ ok: true })
  } catch (err) {
    return handleRouteError(err)
  }
}
