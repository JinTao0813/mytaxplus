import 'server-only'

import { FieldValue } from 'firebase-admin/firestore'

import { adminDb } from '@/lib/server/firebase-admin'
import type { UpsertUserInput } from '@/dal/users/types'

export async function upsertUser(params: UpsertUserInput): Promise<void> {
  const ref = adminDb.collection('users').doc(params.uid)
  const snap = await ref.get()

  const update: Record<string, unknown> = {
    uid: params.uid,
    lastLoginAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  }
  if (params.email) update.email = params.email
  if (params.displayName) update.displayName = params.displayName
  if (params.photoUrl) update.photoURL = params.photoUrl
  if (!snap.exists) update.createdAt = FieldValue.serverTimestamp()

  await ref.set(update, { merge: true })
}
