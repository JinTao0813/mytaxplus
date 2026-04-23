'use client'

import { apiFetch } from '@/lib/api/client'

/**
 * Exchange a Firebase ID token for an httpOnly session cookie on the API backend.
 */
export async function syncBackendSession(idToken: string): Promise<void> {
  await apiFetch<unknown>('/api/v1/auth/session', {
    method: 'POST',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ idToken }),
  })
}

/**
 * Revoke refresh tokens, clear the session cookie, then call Firebase signOut on the client.
 */
export async function deleteBackendSession(): Promise<void> {
  await apiFetch<unknown>('/api/v1/auth/session', {
    method: 'DELETE',
    credentials: 'include',
  })
}
