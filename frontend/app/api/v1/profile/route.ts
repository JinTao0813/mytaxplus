import { NextRequest, NextResponse } from 'next/server'

import { requireFirebaseUser } from '@/lib/server/auth'
import { handleRouteError } from '@/lib/server/route'
import { getProfile } from '@/services/profile/get-profile'
import { updateProfile } from '@/services/profile/update-profile'

export async function GET(req: NextRequest) {
  try {
    const user = await requireFirebaseUser(req)
    return NextResponse.json(await getProfile(user.uid))
  } catch (err) {
    return handleRouteError(err)
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await requireFirebaseUser(req)
    const body = (await req.json()) as Record<string, unknown>
    return NextResponse.json(await updateProfile(user.uid, body))
  } catch (err) {
    return handleRouteError(err)
  }
}
