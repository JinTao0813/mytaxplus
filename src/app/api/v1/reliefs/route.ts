import { NextRequest, NextResponse } from 'next/server'

import { requireFirebaseUser } from '@/lib/server/auth'
import { handleRouteError } from '@/lib/server/route'
import { resolveReliefRuleYearParam } from '@/lib/reliefs/registry'
import { listReliefsForUser } from '@/services/reliefs/list-reliefs'
import { runReceiptClaimBackfill } from '@/services/reliefs/backfill-receipt-claims'

export async function GET(req: NextRequest) {
  try {
    const user = await requireFirebaseUser(req)
    const year = resolveReliefRuleYearParam(
      req.nextUrl.searchParams.get('year')
    )
    await runReceiptClaimBackfill({ uid: user.uid, year })
    const reliefs = await listReliefsForUser({ uid: user.uid, year })
    return NextResponse.json(reliefs)
  } catch (err) {
    return handleRouteError(err)
  }
}
