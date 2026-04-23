import { NextRequest, NextResponse } from 'next/server'

import { requireFirebaseUser } from '@/lib/server/auth'
import { handleRouteError } from '@/lib/server/route'
import { getTaxSummary } from '@/services/tax/get-tax-summary'

export async function GET(req: NextRequest) {
  try {
    await requireFirebaseUser(req)
    return NextResponse.json(getTaxSummary())
  } catch (err) {
    return handleRouteError(err)
  }
}
