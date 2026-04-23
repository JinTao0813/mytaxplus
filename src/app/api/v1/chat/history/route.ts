import { NextRequest, NextResponse } from 'next/server'

import { requireFirebaseUser } from '@/lib/server/auth'
import { handleRouteError } from '@/lib/server/route'
import { getChatHistory } from '@/services/chat/get-chat-history'

export async function GET(req: NextRequest) {
  try {
    await requireFirebaseUser(req)
    return NextResponse.json(getChatHistory())
  } catch (err) {
    return handleRouteError(err)
  }
}
