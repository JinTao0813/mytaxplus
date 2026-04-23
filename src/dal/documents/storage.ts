import 'server-only'

import { adminStorage } from '@/lib/server/firebase-admin'

type StorageError = {
  code?: string | number
}

function isNotFoundError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false
  const code = (err as StorageError).code
  return code === 404 || code === '404'
}

export async function downloadBytes(params: {
  storagePath: string
}): Promise<Buffer> {
  const [bytes] = await adminStorage.bucket().file(params.storagePath).download()
  return bytes
}

export async function uploadBytes(params: {
  storagePath: string
  payload: Buffer
  contentType: string
}): Promise<void> {
  await adminStorage.bucket().file(params.storagePath).save(params.payload, {
    contentType: params.contentType,
  })
}

export async function deleteObject(params: { storagePath: string }): Promise<void> {
  try {
    await adminStorage.bucket().file(params.storagePath).delete()
  } catch (err) {
    if (isNotFoundError(err)) return
    throw err
  }
}
