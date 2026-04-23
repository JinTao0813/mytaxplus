import 'server-only'

import type { TaxProfile } from '@/lib/types'
import { saveProfile } from '@/dal/profile'
import { normalizeProfile } from '@/services/profile/get-profile'

export async function updateProfile(
  uid: string,
  payload: Record<string, unknown>
): Promise<TaxProfile> {
  const normalized = normalizeProfile(payload)
  await saveProfile(uid, normalized)
  return normalized
}
