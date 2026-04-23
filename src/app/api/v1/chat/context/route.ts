import { NextRequest, NextResponse } from 'next/server'

import { requireFirebaseUser } from '@/lib/server/auth'
import { handleRouteError } from '@/lib/server/route'
import { getChatContext } from '@/services/chat/get-chat-context'

export async function GET(req: NextRequest) {
  try {
    await requireFirebaseUser(req)
    return NextResponse.json(getChatContext())
  } catch (err) {
    return handleRouteError(err)
  }
}
