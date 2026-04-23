import type { ExpenseCategory } from '@/lib/types'

/** Sub-limit within a capped-sum category (e.g. complete medical exam within parents medical). */
export interface ReliefSubcap {
  id: string
  label: string
  capRm: number
}

/**
 * How a category’s relief amount is capped.
 * Mirrors YA2025 markdown; used for display + enforcement.
 */
export type ReliefLimit =
  | { kind: 'fixed'; amountRm: number }
  | {
      kind: 'cappedSum'
      capRm: number
      /** Optional lines that only count toward a sub-cap (remainder shares overall capRm). */
      subcaps: ReliefSubcap[]
    }
  | {
      kind: 'splitPool'
      /** E.g. EPF max + life max with a combined ceiling. */
      totalCapRm: number
      pools: { id: string; label: string; capRm: number }[]
    }
  | { kind: 'perUnit'; amountRm: number; unitLabel: string }
  | {
      kind: 'tieredProperty'
      /** Property price (RM) upper bound per tier → relief cap (first matching tier). */
      tiers: { maxPriceRm: number; capRm: number }[]
      spaNote?: string
    }

export interface ReliefCategoryRule {
  id: string
  year: number
  /** Human reference, e.g. "§2" from markdown section numbering. */
  docSection: string
  name: string
  description: string
  limit: ReliefLimit
  /** UI grouping (coarse; many statutory reliefs map to `other`). */
  category: ExpenseCategory
  icon: string
  taxSectionHint: string
}

export type ClaimLine = { amount: number; bucketId?: string; subcapId?: string }

export interface EnforceResult {
  cappedTotal: number
  /** Per bucket/subcap after caps (for future UI / audit). */
  breakdown: Record<string, number>
}
