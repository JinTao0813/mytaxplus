'use client'

import { useMemo } from 'react'
import type { Relief, TaxContext, TaxProfile } from '@/lib/types'
import {
  computeChargeableIncomePreview,
  sumReliefClaimsEpfPool,
  sumReliefClaimsSocso,
} from '../_lib/relief-math'

function formatRM(n: number) {
  return `RM ${n.toLocaleString('en-MY', { minimumFractionDigits: 2 })}`
}

interface Props {
  reliefs: Relief[]
  profile: TaxProfile
  taxContext: TaxContext | null
}

export function TaxTopSummary({ reliefs, profile, taxContext }: Props) {
  const totalIncome = taxContext?.totalIncome ?? profile.totalIncome
  const { epf: eaEpf, socso: eaSocso, mtd } =
    taxContext?.statutory ?? profile.statutory
  const epfFromReliefs = useMemo(
    () => sumReliefClaimsEpfPool(reliefs),
    [reliefs]
  )
  const socsoFromReliefs = useMemo(
    () => sumReliefClaimsSocso(reliefs),
    [reliefs]
  )
  const chargeable = useMemo(
    () => computeChargeableIncomePreview(totalIncome, reliefs),
    [totalIncome, reliefs]
  )

  const items = [
    { label: 'Total income', value: formatRM(totalIncome), accent: false },
    {
      label: 'EPF relief (§17 pool)',
      value: formatRM(epfFromReliefs),
      accent: false,
    },
    {
      label: 'SOCSO relief (§20)',
      value: formatRM(socsoFromReliefs),
      accent: false,
    },
    {
      label: 'Monthly tax deductions (MTD/PCB)',
      value: formatRM(mtd),
      accent: false,
    },
    {
      label: 'Total chargeable / taxable income',
      value: formatRM(chargeable),
      accent: true,
    },
  ] as const

  return (
    <div
      className="sticky top-16 z-30 -mx-6 mb-8 border-y border-outline-variant/15 bg-surface-container-lowest/95 px-4 py-4 backdrop-blur-md ambient-shadow md:top-0 md:-mx-0 md:rounded-xl md:border md:px-6"
      aria-label="Income and chargeable summary"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5 lg:gap-5">
        {items.map((item) => (
          <div key={item.label}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-on-surface-variant">
              {item.label}
            </p>
            <p
              className={
                item.accent
                  ? 'mt-1 font-mono text-2xl font-bold tabular-nums tracking-tight text-secondary'
                  : 'mt-1 font-mono text-xl font-semibold tabular-nums tracking-tight text-on-surface'
              }
            >
              {item.value}
            </p>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[10px] leading-relaxed text-on-surface-variant/80">
        Chargeable income is total income (EA Section B+C) minus all relief
        claims shown on this page (including EPF §17 and SOCSO §20 when entered
        as relief records). EA / tax context EPF/SOCSO for reference:{' '}
        <span className="tabular-nums">
          EPF {formatRM(eaEpf)}, SOCSO {formatRM(eaSocso)}
        </span>
        . MTD/PCB is shown for reference only.
        {taxContext ? (
          <span className="mt-1 block text-on-surface-variant/70">
            Income totals from normalized tax context (YA {taxContext.year},
            updated {new Date(taxContext.updatedAt).toLocaleString()}).
          </span>
        ) : null}
      </p>
    </div>
  )
}
