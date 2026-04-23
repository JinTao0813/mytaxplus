import 'server-only'

import { adminDb } from '@/lib/server/firebase-admin'
import { userTaxContextPath } from '@/lib/server/firestore-paths'
import type {
  SaveTaxContextSnapshotInput,
  TaxContextSnapshotStored,
} from '@/dal/tax-context/types'

export async function getTaxContextSnapshot(params: {
  uid: string
  year: number
}): Promise<TaxContextSnapshotStored | null> {
  const snap = await adminDb.doc(userTaxContextPath(params)).get()
  if (!snap.exists) return null
  return snap.data() as TaxContextSnapshotStored
}

export async function saveTaxContextSnapshot(
  params: SaveTaxContextSnapshotInput
): Promise<void> {
  await adminDb.doc(userTaxContextPath(params)).set(params, { merge: true })
}
