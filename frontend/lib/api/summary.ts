import type { TaxSummary } from '@/lib/types'
import { MOCK_TAX_SUMMARY } from '@/lib/mock-data'
import { apiFetch } from '@/lib/api/client'
import { USE_API_MOCK, type ServerApiContext } from '@/lib/api/config'
import { taxSummarySchema } from '@/lib/validations/api-schemas'

/** GET /api/v1/summary */
export async function getTaxSummary(
  ctx?: ServerApiContext
): Promise<TaxSummary> {
  if (!USE_API_MOCK) {
    return apiFetch('/api/v1/summary', {
      responseSchema: taxSummarySchema,
      cookieHeader: ctx?.cookieHeader,
    })
  }
  return taxSummarySchema.parse(MOCK_TAX_SUMMARY)
}
