import 'server-only'

import { upsertUser } from '@/dal/users'

type FirebaseClaimsInput = {
  uid?: string
  email?: unknown
  name?: unknown
  picture?: unknown
}

export async function ensureUserRecordFromClaims(
  claims: FirebaseClaimsInput
): Promise<void> {
  const uid = (claims.uid || '').trim()
  if (!uid) throw new Error('Missing uid in Firebase claims')

  const email =
    typeof claims.email === 'string' && claims.email.trim()
      ? claims.email.trim()
      : null
  const displayName =
    typeof claims.name === 'string' && claims.name.trim()
      ? claims.name.trim()
      : null
  const photoUrl =
    typeof claims.picture === 'string' && claims.picture.trim()
      ? claims.picture.trim()
      : null

  await upsertUser({ uid, email, displayName, photoUrl })
}
