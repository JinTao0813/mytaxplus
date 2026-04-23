import { NextRequest, NextResponse } from 'next/server'

import { adminAuth } from '@/lib/server/firebase-admin'
import { sessionCookieConfig } from '@/lib/server/auth'
import { handleRouteError } from '@/lib/server/route'
import { HttpError } from '@/lib/server/http'
import { ensureUserRecordFromClaims } from '@/services/users/ensure-user-record'

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { idToken?: string }
    const idToken = (body.idToken || '').trim()
    if (!idToken) throw new HttpError(400, 'idToken is required')

    let claims
    try {
      claims = await adminAuth.verifyIdToken(idToken, true)
    } catch {
      throw new HttpError(401, 'Invalid ID token')
    }

    try {
      await ensureUserRecordFromClaims(claims)
    } catch {
      throw new HttpError(503, 'Could not initialize user record')
    }

    let sessionCookie = ''
    try {
      const { maxAge } = sessionCookieConfig()
      sessionCookie = await adminAuth.createSessionCookie(idToken, {
        expiresIn: maxAge * 1000,
      })
    } catch {
      throw new HttpError(401, 'Could not create session cookie')
    }

    const res = new NextResponse(null, { status: 204 })
    const cookie = sessionCookieConfig()
    res.cookies.set(cookie.name, sessionCookie, {
      maxAge: cookie.maxAge,
      path: '/',
      httpOnly: true,
      secure: cookie.secure,
      sameSite: 'lax',
    })
    return res
  } catch (err) {
    return handleRouteError(err)
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const cookie = sessionCookieConfig()
    const raw = req.cookies.get(cookie.name)?.value

    if (raw) {
      try {
        const decoded = await adminAuth.verifySessionCookie(raw, true)
        if (decoded.uid) await adminAuth.revokeRefreshTokens(decoded.uid)
      } catch (err) {
        console.warn('[auth/session] revokeRefreshTokens failed', err)
      }
    }

    const res = new NextResponse(null, { status: 204 })
    res.cookies.delete(cookie.name)
    return res
  } catch (err) {
    return handleRouteError(err)
  }
}
