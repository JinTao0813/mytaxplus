import type { User } from 'firebase/auth'

import { uploadUserDocument } from '@/lib/firebase/upload-user-document'
import { registerUploadedDocument } from '@/lib/api/documents'

export async function uploadAndRegisterUserDocument(
  user: User,
  payload: {
    file: File
    documentId: string
    documentType: 'EA_FORM' | 'RECEIPT'
    token?: string
  }
) {
  const sizeKb = Math.max(1, Math.round(payload.file.size / 1024))
  const { storagePath } = await uploadUserDocument(user, payload.file, payload.documentId)
  return registerUploadedDocument(
    {
      documentId: payload.documentId,
      storagePath,
      originalFilename: payload.file.name,
      sizeKb,
      documentType: payload.documentType,
    },
    { token: payload.token }
  )
}
