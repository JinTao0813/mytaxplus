import 'server-only'

import type { NextRequest } from 'next/server'

import { adminAuth } from '@/lib/server/firebase-admin'
import { HttpError } from '@/lib/server/http'

export type FirebaseClaims = {
  uid: string
  email?: string
  name?: string
  picture?: string
}

function sessionCookieName(): string {
  return process.env.SESSION_COOKIE_NAME || '__session'
}

export async function requireFirebaseUser(
  req: NextRequest
): Promise<FirebaseClaims> {
  const authHeader = req.headers.get('authorization')
  const bearer = authHeader?.startsWith('Bearer ')
    ? authHeader.slice('Bearer '.length).trim()
    : ''

  if (bearer) {
    try {
      return (await adminAuth.verifyIdToken(bearer, true)) as FirebaseClaims
    } catch {
      throw new HttpError(401, 'Invalid or expired token')
    }
  }

  const rawSession = req.cookies.get(sessionCookieName())?.value
  if (rawSession) {
    try {
      return (await adminAuth.verifySessionCookie(
        rawSession,
        true
      )) as FirebaseClaims
    } catch {
      throw new HttpError(401, 'Invalid or expired session')
    }
  }

  throw new HttpError(401, 'Not authenticated')
}

export function sessionMaxAgeSeconds(): number {
  const parsed = Number(
    process.env.SESSION_COOKIE_MAX_AGE_SECONDS || 5 * 24 * 3600
  )
  const max = 14 * 24 * 3600
  if (!Number.isFinite(parsed) || parsed <= 0) return 1
  return Math.min(parsed, max)
}

export function sessionCookieSecure(): boolean {
  const raw = (process.env.SESSION_COOKIE_SECURE || '').toLowerCase()
  return raw === 'true' || raw === '1'
}

export function sessionCookieConfig() {
  return {
    name: sessionCookieName(),
    maxAge: sessionMaxAgeSeconds(),
    secure: sessionCookieSecure(),
  }
}
