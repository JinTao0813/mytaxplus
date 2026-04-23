import { NextRequest, NextResponse } from 'next/server'

import { requireFirebaseUser } from '@/lib/server/auth'
import { handleRouteError } from '@/lib/server/route'
import { getDashboardStatus } from '@/services/dashboard/get-dashboard-status'

export async function GET(req: NextRequest) {
  try {
    await requireFirebaseUser(req)
    return NextResponse.json(getDashboardStatus())
  } catch (err) {
    return handleRouteError(err)
  }
}
