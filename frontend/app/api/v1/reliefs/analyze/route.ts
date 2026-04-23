import { NextRequest, NextResponse } from 'next/server'

import { requireFirebaseUser } from '@/lib/server/auth'
import { HttpError } from '@/lib/server/http'
import { handleRouteError } from '@/lib/server/route'
import {
  analyzeReliefs,
  analyzeReliefsBodySchema,
} from '@/services/reliefs/analyze-reliefs'

export async function POST(req: NextRequest) {
  try {
    await requireFirebaseUser(req)
    const raw: unknown = await req.json().catch(() => ({}))
    const parsed = analyzeReliefsBodySchema.safeParse(raw)
    if (!parsed.success) {
      throw new HttpError(400, parsed.error.flatten())
    }
    return NextResponse.json(analyzeReliefs(parsed.data))
  } catch (err) {
    return handleRouteError(err)
  }
}
