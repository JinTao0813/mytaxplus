import type { z } from 'zod'

import { apiFetch } from '@/lib/api/client'
import type { ClientApiContext, ServerApiContext } from '@/lib/api/config'
import { reliefRulesListSchema } from '@/lib/validations/api-schemas'

export type ReliefRuleApi = z.infer<typeof reliefRulesListSchema>[number]

/** GET /api/v1/reliefs/rules */
export async function getReliefRules(
  ctx?: ServerApiContext | ClientApiContext,
  options?: { year?: number }
): Promise<ReliefRuleApi[]> {
  const token = ctx && 'token' in ctx ? ctx.token : undefined
  const q =
    options?.year != null && Number.isFinite(options.year)
      ? `?year=${encodeURIComponent(String(options.year))}`
      : ''
  return apiFetch(`/api/v1/reliefs/rules${q}`, {
    responseSchema: reliefRulesListSchema,
    cookieHeader: ctx?.cookieHeader,
    token,
  })
}
