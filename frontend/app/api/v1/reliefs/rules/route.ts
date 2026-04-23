import { NextRequest, NextResponse } from 'next/server'

import { requireFirebaseUser } from '@/lib/server/auth'
import { handleRouteError } from '@/lib/server/route'
import {
  getReliefRulesByYear,
  resolveReliefRuleYearParam,
} from '@/lib/reliefs/registry'

/** GET /api/v1/reliefs/rules — raw YA rules (structured) for debugging / admin UI. */
export async function GET(req: NextRequest) {
  try {
    await requireFirebaseUser(req)
    const year = resolveReliefRuleYearParam(
      req.nextUrl.searchParams.get('year')
    )
    return NextResponse.json(getReliefRulesByYear(year))
  } catch (err) {
    return handleRouteError(err)
  }
}
