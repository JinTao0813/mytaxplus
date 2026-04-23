import type { ClaimLine, EnforceResult, ReliefLimit } from './types'

export type EnforceContext = {
  /** SPA property price (RM) for tiered first-home loan interest relief. */
  propertyPriceRm?: number
}

function sumLines(lines: ClaimLine[]): number {
  return lines.reduce((s, l) => s + Math.max(0, l.amount), 0)
}

/**
 * Applies YA-style caps to raw claim lines.
 * - `splitPool`: amounts with matching `bucketId` go to that pool; lines without bucket split evenly only if single pool — otherwise unbucketed ignored for pool totals (callers should tag).
 * - `cappedSum`: optional `subcapId` on lines; remainder shares overall cap after subcaps.
 */
export function enforceLimit(
  limit: ReliefLimit,
  lines: ClaimLine[],
  ctx?: EnforceContext
): EnforceResult {
  switch (limit.kind) {
    case 'fixed': {
      const raw = sumLines(lines)
      return {
        cappedTotal: Math.min(raw, limit.amountRm),
        breakdown: { total: Math.min(raw, limit.amountRm) },
      }
    }
    case 'perUnit': {
      const raw = sumLines(lines)
      // Without unit count, only hard ceiling we can apply is none — treat as uncapped sum for enforcement (UI should collect count later).
      return { cappedTotal: raw, breakdown: { total: raw } }
    }
    case 'tieredProperty': {
      const raw = sumLines(lines)
      const sorted = limit.tiers
        .slice()
        .sort((a, b) => a.maxPriceRm - b.maxPriceRm)
      const price = ctx?.propertyPriceRm
      let capRm = 0
      if (price != null && Number.isFinite(price)) {
        const tier = sorted.find((t) => price <= t.maxPriceRm)
        capRm = tier?.capRm ?? 0
      } else {
        capRm = sorted.length ? Math.max(...sorted.map((t) => t.capRm)) : 0
      }
      const cappedTotal = Math.min(raw, capRm)
      return { cappedTotal, breakdown: { total: cappedTotal } }
    }
    case 'splitPool': {
      const poolIds = new Set(limit.pools.map((p) => p.id))
      const breakdown: Record<string, number> = {}
      for (const p of limit.pools) {
        breakdown[p.id] = 0
      }
      for (const p of limit.pools) {
        const raw = lines
          .filter((l) => l.bucketId === p.id)
          .reduce((s, l) => s + Math.max(0, l.amount), 0)
        breakdown[p.id] = Math.min(raw, p.capRm)
      }
      const untagged = lines
        .filter((l) => !l.bucketId || !poolIds.has(l.bucketId))
        .reduce((s, l) => s + Math.max(0, l.amount), 0)
      let remainingUntagged = untagged
      for (const p of limit.pools) {
        const room = Math.max(0, p.capRm - breakdown[p.id])
        const add = Math.min(remainingUntagged, room)
        breakdown[p.id] += add
        remainingUntagged -= add
      }
      let poolSum = limit.pools.reduce((s, p) => s + breakdown[p.id], 0)
      poolSum = Math.min(poolSum, limit.totalCapRm)
      breakdown.total = poolSum
      return { cappedTotal: poolSum, breakdown }
    }
    case 'cappedSum': {
      const bySub: Record<string, number> = {}
      let subUsed = 0
      for (const sc of limit.subcaps) {
        const raw = lines
          .filter((l) => l.subcapId === sc.id)
          .reduce((s, l) => s + Math.max(0, l.amount), 0)
        const c = Math.min(raw, sc.capRm)
        bySub[sc.id] = c
        subUsed += c
      }
      const generalRaw = lines
        .filter((l) => !l.subcapId)
        .reduce((s, l) => s + Math.max(0, l.amount), 0)
      const generalRoom = Math.max(0, limit.capRm - subUsed)
      const generalCapped = Math.min(generalRaw, generalRoom)
      bySub.__general = generalCapped
      const cappedTotal = Math.min(subUsed + generalCapped, limit.capRm)
      return { cappedTotal, breakdown: bySub }
    }
    default: {
      const _exhaustive: never = limit
      throw new Error(`Unhandled relief limit: ${JSON.stringify(_exhaustive)}`)
    }
  }
}
