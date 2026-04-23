import type { TaxContext } from '@/lib/types'
import { apiFetch } from '@/lib/api/client'
import type { ClientApiContext, ServerApiContext } from '@/lib/api/config'
import { taxContextSchema } from '@/lib/validations/api-schemas'

type TaxContextQuery = {
  year?: number
  propertyPriceRm?: number
}

function buildTaxContextSearch(params?: TaxContextQuery): string {
  if (!params) return ''
  const q = new URLSearchParams()
  if (params.year != null && Number.isFinite(params.year)) {
    q.set('year', String(params.year))
  }
  if (
    params.propertyPriceRm != null &&
    Number.isFinite(params.propertyPriceRm)
  ) {
    q.set('propertyPriceRm', String(params.propertyPriceRm))
  }
  const s = q.toString()
  return s ? `?${s}` : ''
}

/** GET /api/v1/tax-context */
export async function getTaxContext(
  ctx?: ServerApiContext | ClientApiContext,
  query?: TaxContextQuery
): Promise<TaxContext> {
  const token = ctx && 'token' in ctx ? ctx.token : undefined
  return apiFetch(`/api/v1/tax-context${buildTaxContextSearch(query)}`, {
    responseSchema: taxContextSchema,
    cookieHeader: ctx?.cookieHeader,
    token,
  })
}
