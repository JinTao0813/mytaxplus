import type { Relief } from '@/lib/types'
import { computeNumericCap } from './compute'
import { formatLimitDisplay } from './limit-display'
import type { ReliefCategoryRule } from './types'

export function ruleToRelief(rule: ReliefCategoryRule): Relief {
  const cap = computeNumericCap(rule)
  return {
    id: rule.id,
    name: rule.name,
    category: rule.category,
    icon: rule.icon,
    description: rule.description,
    claimedAmount: 0,
    maxAmount: cap ?? 0,
    limitDisplay: formatLimitDisplay(rule),
    status: 'missed',
    taxSection: rule.taxSectionHint,
    claims: [],
  }
}

export function buildReliefCatalog(rules: ReliefCategoryRule[]): Relief[] {
  return rules.map(ruleToRelief)
}
