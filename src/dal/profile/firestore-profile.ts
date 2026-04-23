import 'server-only'

import { adminDb } from '@/lib/server/firebase-admin'

import type { UserProfileRecord } from '@/dal/profile/types'

function profileRef(uid: string) {
  return adminDb.collection('users').doc(uid).collection('meta').doc('profile')
}

export async function getStoredProfile(
  uid: string
): Promise<UserProfileRecord | null> {
  const snap = await profileRef(uid).get()
  if (!snap.exists) return null
  return snap.data() as UserProfileRecord
}

export async function saveProfile(
  uid: string,
  profile: object
): Promise<void> {
  await profileRef(uid).set(
    {
      ...profile,
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  )
}
