import type { FilingData } from '@/lib/types'
import { MOCK_FILING_DATA } from '@/lib/mock-data'
import { apiFetch } from '@/lib/api/client'
import { USE_API_MOCK, type ServerApiContext } from '@/lib/api/config'
import { filingDataSchema } from '@/lib/validations/api-schemas'

/** GET /api/v1/filing */
export async function getFilingData(
  ctx?: ServerApiContext
): Promise<FilingData> {
  if (!USE_API_MOCK) {
    return apiFetch('/api/v1/filing', {
      responseSchema: filingDataSchema,
      cookieHeader: ctx?.cookieHeader,
    })
  }
  return filingDataSchema.parse(MOCK_FILING_DATA)
}
