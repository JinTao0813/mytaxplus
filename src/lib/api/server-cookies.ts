import { cookies } from 'next/headers'

/**
 * Build a `Cookie` header value for forwarding from a Server Component.
 * This is mainly needed when API base points to a different origin.
 */
export async function cookieHeaderFromRequest(): Promise<string | undefined> {
  const jar = await cookies()
  const all = jar.getAll()
  if (all.length === 0) return undefined
  return all.map((c) => `${c.name}=${c.value}`).join('; ')
}

/** Must match API session cookie default (`__session`). */
const BACKEND_SESSION_COOKIE = '__session'

/**
 * True when the request includes the httpOnly backend session cookie.
 * Used to skip SSR calls to protected API routes (avoids 401 noise when unauthenticated).
 */
export function hasBackendSessionCookie(cookieHeader: string | undefined): boolean {
  if (!cookieHeader) return false
  return cookieHeader.split(';').some((part) => {
    const name = part.trim().split('=')[0]?.trim()
    return name === BACKEND_SESSION_COOKIE
  })
}
