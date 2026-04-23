import type { ReliefCategoryRule, ReliefLimit } from './types'

function fmtRm(n: number): string {
  return `RM ${n.toLocaleString('en-MY', { maximumFractionDigits: 0 })}`
}

function displayForLimit(limit: ReliefLimit): string {
  switch (limit.kind) {
    case 'fixed':
      return `Up to ${fmtRm(limit.amountRm)}`
    case 'perUnit':
      return `${fmtRm(limit.amountRm)} per ${limit.unitLabel}`
    case 'tieredProperty': {
      const parts = limit.tiers
        .slice()
        .sort((a, b) => a.maxPriceRm - b.maxPriceRm)
        .map((t) => `${fmtRm(t.capRm)} (property ≤ ${fmtRm(t.maxPriceRm)})`)
      const spa = limit.spaNote ? ` ${limit.spaNote}` : ''
      return `${parts.join('; ')}${spa}`
    }
    case 'splitPool': {
      const poolBits = limit.pools.map((p) => `${p.label} ${fmtRm(p.capRm)}`)
      return `Total ${fmtRm(limit.totalCapRm)} (${poolBits.join('; ')})`
    }
    case 'cappedSum': {
      const sub =
        limit.subcaps.length > 0
          ? ` — ${limit.subcaps.map((s) => `${s.label} ${fmtRm(s.capRm)}`).join('; ')}`
          : ''
      return `Up to ${fmtRm(limit.capRm)}${sub}`
    }
    default: {
      const _exhaustive: never = limit
      return String(_exhaustive)
    }
  }
}

/** Human-readable limit line for cards and tooltips. */
export function formatLimitDisplay(rule: ReliefCategoryRule): string {
  return displayForLimit(rule.limit)
}
