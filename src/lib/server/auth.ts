import 'server-only'

import type { NextRequest } from 'next/server'

import { adminAuth } from '@/lib/server/firebase-admin'
import { HttpError } from '@/lib/server/http'

export type FirebaseClaims = {
  uid: string
  email?: string
  name?: string
  picture?: string
  exp?: number
}

function sessionCookieName(): string {
  return process.env.SESSION_COOKIE_NAME || '__session'
}

type CachedClaims = { claims: FirebaseClaims; expiresAtMs: number }

function claimsCache(): Map<string, CachedClaims> {
  const g = globalThis as unknown as {
    __mytax_firebase_claims_cache__?: Map<string, CachedClaims>
  }
  if (!g.__mytax_firebase_claims_cache__) {
    g.__mytax_firebase_claims_cache__ = new Map()
  }
  return g.__mytax_firebase_claims_cache__
}

function cacheKey(kind: 'bearer' | 'session', token: string): string {
  return `${kind}:${token}`
}

function ttlMsFromClaims(claims: FirebaseClaims): number {
  // Cache briefly to avoid repeated verification across rapid navigation/prefetch.
  // Keep short to limit revoked-token window.
  const fallback = 15_000
  if (!claims.exp) return fallback
  const untilExpMs = claims.exp * 1000 - Date.now()
  return Math.max(0, Math.min(30_000, untilExpMs))
}

async function verifyWithCache(
  kind: 'bearer' | 'session',
  token: string
): Promise<FirebaseClaims> {
  const key = cacheKey(kind, token)
  const hit = claimsCache().get(key)
  if (hit && hit.expiresAtMs > Date.now()) return hit.claims

  const claims =
    kind === 'bearer'
      ? ((await adminAuth.verifyIdToken(token, true)) as FirebaseClaims)
      : ((await adminAuth.verifySessionCookie(token, true)) as FirebaseClaims)

  const ttlMs = ttlMsFromClaims(claims)
  if (ttlMs > 0) {
    claimsCache().set(key, { claims, expiresAtMs: Date.now() + ttlMs })
  }
  return claims
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
      return await verifyWithCache('bearer', bearer)
    } catch {
      throw new HttpError(401, 'Invalid or expired token')
    }
  }

  const rawSession = req.cookies.get(sessionCookieName())?.value
  if (rawSession) {
    try {
      return await verifyWithCache('session', rawSession)
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
