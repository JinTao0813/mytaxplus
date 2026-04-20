'use client'

import { getApiBase } from '@/lib/api'

/** When mock services are on, skip session calls so local dev does not require the API. */
export function isRealApiMode(): boolean {
  return process.env.NEXT_PUBLIC_USE_MOCK === 'false'
}

/**
 * Exchange a Firebase ID token for an httpOnly session cookie on the FastAPI backend.
 */
export async function syncBackendSession(idToken: string): Promise<void> {
  if (!isRealApiMode()) return
  const url = `${getApiBase()}/api/v1/auth/session`
  const res = await fetch(url, {
    method: 'POST',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ idToken }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(
      text.length > 0 ? text : `Could not create session (HTTP ${res.status})`
    )
  }
}

/**
 * Revoke refresh tokens, clear the session cookie, then call Firebase signOut on the client.
 */
export async function deleteBackendSession(): Promise<void> {
  if (!isRealApiMode()) return
  const url = `${getApiBase()}/api/v1/auth/session`
  await fetch(url, { method: 'DELETE', credentials: 'include' })
}
