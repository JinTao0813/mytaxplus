import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json(
    { detail: 'Use client Storage upload + POST /api/v1/documents/register.' },
    { status: 501 }
  )
}
