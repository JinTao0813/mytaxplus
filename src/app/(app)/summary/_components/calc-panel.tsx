import type { TaxCalculation } from '@/lib/types'

interface Props {
  baseline: TaxCalculation
  optimized: TaxCalculation
}

function formatRM(n: number) {
  return `RM ${n.toLocaleString('en-MY', { minimumFractionDigits: 2 })}`
}

function CalcRow({
  label,
  value,
  highlight = false,
  total = false,
}: {
  label: string
  value: string
  highlight?: boolean
  total?: boolean
}) {
  return (
    <div
      className={`flex items-center justify-between ${
        total
          ? 'border-t border-outline-variant/30 pt-4'
          : 'border-b border-outline-variant/15 pb-4'
      }`}
    >
      <span
        className={`text-sm ${total ? 'font-semibold text-on-surface' : 'text-on-surface-variant'}`}
      >
        {label}
      </span>
      <span
        className={`text-base ${
          total
            ? 'font-bold text-on-surface text-xl'
            : highlight
              ? 'font-semibold text-on-tertiary-container bg-tertiary-container/8 px-2 py-0.5 rounded'
              : 'font-semibold text-secondary'
        }`}
      >
        {value}
      </span>
    </div>
  )
}

export function CalcPanel({ baseline, optimized }: Props) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {/* Baseline */}
      <div className="rounded-xl bg-surface-container-low p-7">
        <div className="mb-7 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-on-surface">
            Current Calculation
          </h3>
          <span className="rounded-full bg-surface-container-highest px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
            Standard
          </span>
        </div>
        <div className="flex flex-col gap-4">
          <CalcRow
            label="Total Income"
            value={formatRM(baseline.totalIncome)}
          />
          <CalcRow
            label="Standard Deductions"
            value={`– ${formatRM(baseline.totalDeductions)}`}
          />
          <CalcRow
            label="Chargeable Income"
            value={formatRM(baseline.chargeableIncome)}
            total
          />
          <div className="mt-3 flex items-center justify-between rounded-lg bg-surface-container-lowest p-4">
            <span className="text-sm font-semibold text-on-surface">
              Estimated Tax
            </span>
            <span className="text-2xl font-bold text-on-error-container">
              {formatRM(baseline.taxPayable)}
            </span>
          </div>
        </div>
      </div>

      {/* Optimised */}
      <div className="relative overflow-hidden rounded-xl bg-surface-container-lowest p-7 ambient-shadow">
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-surface-container-high opacity-50 blur-3xl" />
        <div className="relative z-10 mb-7 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-on-surface">
              Optimised Calculation
            </h3>
            <span className="ai-pulse inline-block h-2 w-2 rounded-full bg-tertiary-fixed" />
          </div>
          <span className="rounded-full bg-surface-container-high px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-secondary">
            AI Adjusted
          </span>
        </div>
        <div className="relative z-10 flex flex-col gap-4">
          <CalcRow
            label="Total Income"
            value={formatRM(optimized.totalIncome)}
          />
          <CalcRow
            label="Optimised Deductions"
            value={`– ${formatRM(optimized.totalDeductions)}`}
            highlight
          />
          <CalcRow
            label="Chargeable Income"
            value={formatRM(optimized.chargeableIncome)}
            total
          />
          <div className="mt-3 flex items-center justify-between rounded-lg bg-surface-container-low p-4">
            <span className="text-sm font-semibold text-on-surface">
              Optimised Tax
            </span>
            <span className="text-2xl font-bold text-on-tertiary-container">
              {formatRM(optimized.taxPayable)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
