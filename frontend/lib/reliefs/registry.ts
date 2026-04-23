import { YA2025_RULES } from '@/lib/reliefs/rules/ya2025'
import type { ReliefCategoryRule } from '@/lib/reliefs/types'

const BY_YEAR = new Map<number, ReliefCategoryRule[]>([[2025, YA2025_RULES]])

export const DEFAULT_RELIEF_RULE_YEAR = 2025

/**
 * Resolves `?year=` for relief routes. Missing/empty/invalid/unsupported years
 * fall back to {@link DEFAULT_RELIEF_RULE_YEAR} (avoids `Number(null) === 0`).
 */
export function resolveReliefRuleYearParam(raw: string | null): number {
  if (raw === null || raw.trim() === '') return DEFAULT_RELIEF_RULE_YEAR
  const y = Math.trunc(Number(raw))
  if (!Number.isFinite(y) || y <= 0) return DEFAULT_RELIEF_RULE_YEAR
  if (!BY_YEAR.has(y)) return DEFAULT_RELIEF_RULE_YEAR
  return y
}

export function getReliefRulesByYear(year: number): ReliefCategoryRule[] {
  const rules = BY_YEAR.get(year)
  if (!rules) {
    throw new Error(`No tax relief rules for year of assessment ${year}`)
  }
  return rules
}
