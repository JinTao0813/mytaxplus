import type { ReliefCategoryRule } from './types'

/**
 * Single numeric ceiling when it does not depend on user profile.
 * `null` when the cap needs external inputs (per-child count, property price, etc.).
 */
export function computeNumericCap(rule: ReliefCategoryRule): number | null {
  switch (rule.limit.kind) {
    case 'fixed':
      return rule.limit.amountRm
    case 'cappedSum':
      return rule.limit.capRm
    case 'splitPool':
      return rule.limit.totalCapRm
    case 'perUnit':
      return null
    case 'tieredProperty':
      return null
    default:
      return null
  }
}
