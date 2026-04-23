import { NextRequest, NextResponse } from 'next/server'

import { requireFirebaseUser } from '@/lib/server/auth'
import { handleRouteError } from '@/lib/server/route'
import { HttpError } from '@/lib/server/http'
import { sendChatMessage } from '@/services/chat/send-chat-message'

export async function POST(req: NextRequest) {
  try {
    await requireFirebaseUser(req)
    const body = (await req.json()) as { message?: string }
    const message = (body.message || '').trim()
    if (!message) throw new HttpError(400, 'message is required')
    return NextResponse.json(sendChatMessage(message))
  } catch (err) {
    return handleRouteError(err)
  }
}
