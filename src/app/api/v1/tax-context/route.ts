import { NextRequest, NextResponse } from 'next/server'

import { requireFirebaseUser } from '@/lib/server/auth'
import { handleRouteError } from '@/lib/server/route'
import { getTaxContext } from '@/services/tax-context/get-tax-context'

export async function GET(req: NextRequest) {
  try {
    const user = await requireFirebaseUser(req)
    const rawYear = req.nextUrl.searchParams.get('year')
    const rawPropertyPriceRm = req.nextUrl.searchParams.get('propertyPriceRm')
    const year =
      rawYear && rawYear.trim().length > 0 ? Number(rawYear.trim()) : undefined
    const propertyPriceRm =
      rawPropertyPriceRm && rawPropertyPriceRm.trim().length > 0
        ? Number(rawPropertyPriceRm.trim())
        : undefined

    return NextResponse.json(
      await getTaxContext({
        uid: user.uid,
        ...(Number.isFinite(year) ? { year } : {}),
        ...(Number.isFinite(propertyPriceRm) ? { propertyPriceRm } : {}),
      })
    )
  } catch (err) {
    return handleRouteError(err)
  }
}
