import { NextRequest, NextResponse } from 'next/server'

import { requireFirebaseUser } from '@/lib/server/auth'
import { handleRouteError } from '@/lib/server/route'
import type { ReceiptMappingStatus } from '@/lib/types'
import { listReceiptReviewItems } from '@/services/reliefs/receipt-review'

const VALID_STATUSES: ReceiptMappingStatus[] = [
  'in_progress',
  'unmapped',
  'suggested',
  'needs_review',
  'confirmed',
  'gemini_error',
]

export async function GET(req: NextRequest) {
  try {
    const user = await requireFirebaseUser(req)
    const rawStatuses = req.nextUrl.searchParams.get('status')
    const statuses = rawStatuses
      ? rawStatuses
          .split(',')
          .map((value) => value.trim())
          .filter((value): value is ReceiptMappingStatus =>
            VALID_STATUSES.includes(value as ReceiptMappingStatus)
          )
      : undefined

    return NextResponse.json(
      await listReceiptReviewItems({
        uid: user.uid,
        ...(statuses && statuses.length > 0 ? { statuses } : {}),
      })
    )
  } catch (err) {
    return handleRouteError(err)
  }
}
