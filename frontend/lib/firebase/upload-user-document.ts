'use client'

import { ref, uploadBytes } from 'firebase/storage'
import type { User } from 'firebase/auth'

import { getFirebaseStorage } from '@/lib/firebase/client'

function safeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]+/g, '_')
}

/**
 * Uploads a file to `users/{uid}/documents/{objectId}_{filename}`.
 * Returns the Storage object path (not a gs:// URL).
 */
export async function uploadUserDocument(
  user: User,
  file: File,
  objectId: string
): Promise<{ storagePath: string }> {
  const storage = getFirebaseStorage()
  if (!storage) {
    throw new Error(
      'Firebase Storage is not configured. Set NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET.'
    )
  }
  const objectName = `${objectId}_${safeFileName(file.name)}`
  const path = `users/${user.uid}/documents/${objectName}`
  const storageRef = ref(storage, path)
  await uploadBytes(storageRef, file, {
    contentType: file.type || undefined,
  })
  return { storagePath: path }
}
