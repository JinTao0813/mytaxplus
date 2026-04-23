import type { TaxProfile } from '@/lib/types'
import { apiFetch } from '@/lib/api/client'
import type { ServerApiContext } from '@/lib/api/config'
import { taxProfileSchema } from '@/lib/validations/api-schemas'

/** GET /api/v1/profile */
export async function getProfile(ctx?: ServerApiContext): Promise<TaxProfile> {
  return apiFetch('/api/v1/profile', {
    responseSchema: taxProfileSchema,
    cookieHeader: ctx?.cookieHeader,
  })
}

/** PUT /api/v1/profile */
export async function updateProfile(
  data: Partial<TaxProfile>,
  ctx?: ServerApiContext
): Promise<TaxProfile> {
  return apiFetch('/api/v1/profile', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    responseSchema: taxProfileSchema,
    cookieHeader: ctx?.cookieHeader,
  })
}
