import 'server-only'

import { NextResponse } from 'next/server'

import { HttpError, asDetail } from '@/lib/server/http'

export function handleRouteError(err: unknown): NextResponse {
  if (err instanceof HttpError) {
    return NextResponse.json({ detail: err.detail }, { status: err.status })
  }

  const detail = asDetail(err instanceof Error ? err.message : err)
  return NextResponse.json({ detail }, { status: 500 })
}
