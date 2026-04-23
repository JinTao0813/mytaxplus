import 'server-only'

import type { Relief, ReliefClaimRecord } from '@/lib/types'

import { buildReliefCatalog } from '@/lib/reliefs/catalog'
import { listReliefClaims } from '@/dal/reliefs'
import {
  DEFAULT_RELIEF_RULE_YEAR,
  getReliefRulesByYear,
} from '@/lib/reliefs/registry'
import { analyzeReliefs } from '@/services/reliefs/analyze-reliefs'
import { storedClaimToReliefClaim } from '@/services/reliefs/relief-claim-map'

/** Static catalog only (empty claims). */
export function listReliefCatalogOnly(opts?: { year?: number }): Relief[] {
  const year = opts?.year ?? DEFAULT_RELIEF_RULE_YEAR
  const rules = getReliefRulesByYear(year)
  return buildReliefCatalog(rules)
}

/** Catalog merged with persisted claims and engine caps applied. */
export async function listReliefsForUser(opts: {
  uid: string
  year?: number
  propertyPriceRm?: number
}): Promise<Relief[]> {
  const year = opts.year ?? DEFAULT_RELIEF_RULE_YEAR
  const rows = await listReliefClaims({ uid: opts.uid, year })
  const byRelief = new Map<string, ReliefClaimRecord[]>()
  for (const row of rows) {
    const list = byRelief.get(row.reliefId) ?? []
    list.push(storedClaimToReliefClaim(row))
    byRelief.set(row.reliefId, list)
  }
  const reliefs = [...byRelief.entries()].map(([id, claims]) => ({
    id,
    claims,
  }))
  return analyzeReliefs({
    year,
    propertyPriceRm: opts.propertyPriceRm,
    reliefs,
  })
}
