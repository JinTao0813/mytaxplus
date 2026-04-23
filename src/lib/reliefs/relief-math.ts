import type { Relief, ReliefStatus } from '@/lib/types'

/** Sum of claim rows, capped by category max when a numeric max exists. */
export function sumReliefClaimed(relief: Relief): number {
  if (!relief.claims?.length) return relief.claimedAmount
  const raw = relief.claims.reduce((s, c) => s + c.amount, 0)
  if (relief.maxAmount <= 0) return raw
  return Math.min(relief.maxAmount, raw)
}

export function totalReliefsClaimed(reliefs: Relief[]): number {
  return reliefs.reduce((s, r) => s + sumReliefClaimed(r), 0)
}

export function syncReliefAggregates(relief: Relief): Relief {
  const claimedAmount = sumReliefClaimed(relief)
  let status: ReliefStatus = relief.status
  if (claimedAmount <= 0) {
    status = 'missed'
  } else if (relief.maxAmount > 0 && claimedAmount >= relief.maxAmount) {
    status = 'claimed'
  } else if (relief.maxAmount > 0) {
    status = 'partial'
  } else {
    status = claimedAmount > 0 ? 'partial' : 'missed'
  }
  return { ...relief, claimedAmount, status }
}

const LIFE_INSURANCE_EPF_RELIEF_ID = 'life_insurance_epf'
const SOCSO_CONTRIBUTION_RELIEF_ID = 'socso_contribution'

/** Sum of §17 EPF pool claims (`reliefBucket === 'epf'`). */
export function sumReliefClaimsEpfPool(reliefs: Relief[]): number {
  const r = reliefs.find((x) => x.id === LIFE_INSURANCE_EPF_RELIEF_ID)
  if (!r?.claims?.length) return 0
  return r.claims
    .filter((c) => (c as { reliefBucket?: string }).reliefBucket === 'epf')
    .reduce((s, c) => s + c.amount, 0)
}

/** Sum of §20 SOCSO contribution relief claims. */
export function sumReliefClaimsSocso(reliefs: Relief[]): number {
  const r = reliefs.find((x) => x.id === SOCSO_CONTRIBUTION_RELIEF_ID)
  if (!r?.claims?.length) return 0
  return r.claims.reduce((s, c) => s + c.amount, 0)
}

/** Chargeable income preview: total income minus all capped relief totals (includes EPF/SOCSO only via relief claims). */
export function computeChargeableIncomePreview(
  totalIncome: number,
  reliefs: Relief[]
): number {
  const totalClaimed = totalReliefsClaimed(reliefs)
  const raw = totalIncome - totalClaimed
  return Math.max(0, Math.round(raw * 100) / 100)
}
