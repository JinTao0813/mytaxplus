import { NextRequest, NextResponse } from 'next/server'

import { requireFirebaseUser } from '@/lib/server/auth'
import { handleRouteError } from '@/lib/server/route'
import { getFilingData } from '@/services/filing/get-filing-data'

export async function GET(req: NextRequest) {
  try {
    await requireFirebaseUser(req)
    return NextResponse.json(getFilingData())
  } catch (err) {
    return handleRouteError(err)
  }
}
