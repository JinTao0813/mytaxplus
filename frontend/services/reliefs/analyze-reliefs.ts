import 'server-only'

import { z } from 'zod'

import type { Relief, ReliefClaimRecord } from '@/lib/types'
import { syncReliefAggregates } from '@/lib/reliefs/relief-math'
import { buildReliefCatalog } from '@/lib/reliefs/catalog'
import type {
  ClaimLine,
  ReliefCategoryRule,
} from '@/lib/reliefs/types'
import {
  enforceLimit,
  type EnforceContext,
} from '@/lib/reliefs/enforce'
import {
  DEFAULT_RELIEF_RULE_YEAR,
  getReliefRulesByYear,
} from '@/lib/reliefs/registry'
import { reliefClaimRecordSchema } from '@/lib/validations/api-schemas'

export const analyzeReliefsBodySchema = z.object({
  year: z.number().int().optional(),
  propertyPriceRm: z.number().optional(),
  reliefs: z
    .array(
      z.object({
        id: z.string(),
        claims: z.array(reliefClaimRecordSchema).optional(),
      })
    )
    .optional(),
})

export type AnalyzeReliefsBody = z.infer<typeof analyzeReliefsBodySchema>

function claimsToLines(claims: ReliefClaimRecord[]): ClaimLine[] {
  return claims.map((c) => {
    const ext = c as ReliefClaimRecord & {
      reliefBucket?: string
      subcapId?: string
    }
    return {
      amount: c.amount,
      bucketId: ext.reliefBucket,
      subcapId: ext.subcapId,
    }
  })
}

function applyEngineCap(
  relief: Relief,
  rule: ReliefCategoryRule,
  ctx: EnforceContext | undefined
): Relief {
  const claims = relief.claims ?? []
  if (claims.length === 0) {
    return syncReliefAggregates({ ...relief, claimedAmount: 0, claims: [] })
  }
  const lines = claimsToLines(claims)
  const { cappedTotal } = enforceLimit(rule.limit, lines, ctx)
  const raw = lines.reduce((s, l) => s + Math.max(0, l.amount), 0)
  if (raw <= 0) {
    return syncReliefAggregates({ ...relief, claims })
  }
  const factor = raw > cappedTotal ? cappedTotal / raw : 1
  const scaledClaims = claims.map((c) => ({
    ...c,
    amount: Math.round(c.amount * factor * 100) / 100,
  }))
  return syncReliefAggregates({ ...relief, claims: scaledClaims })
}

export function analyzeReliefs(body?: AnalyzeReliefsBody) {
  const year = body?.year ?? DEFAULT_RELIEF_RULE_YEAR
  const rules = getReliefRulesByYear(year)
  const ruleById = new Map(rules.map((r) => [r.id, r]))
  const base = buildReliefCatalog(rules)
  const patchById = new Map((body?.reliefs ?? []).map((p) => [p.id, p]))

  const ctx: EnforceContext | undefined =
    body?.propertyPriceRm != null
      ? { propertyPriceRm: body.propertyPriceRm }
      : undefined

  return base.map((relief) => {
    const patch = patchById.get(relief.id)
    const merged: Relief = patch?.claims
      ? { ...relief, claims: patch.claims as ReliefClaimRecord[] }
      : relief
    const rule = ruleById.get(relief.id)
    if (!rule) return merged
    return applyEngineCap(merged, rule, ctx)
  })
}
