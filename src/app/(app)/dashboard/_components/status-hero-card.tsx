import { MatIcon } from '@/components/ui/mat-icon'

interface Props {
  filingYear: number
  completionPercent: number
  estimatedRefund: number
}

export function StatusHeroCard({
  filingYear,
  completionPercent,
  estimatedRefund,
}: Props) {
  const completionLabel =
    completionPercent < 30
      ? 'Just getting started'
      : completionPercent < 70
        ? 'Draft in Progress'
        : 'Almost Complete'

  return (
    <div className="relative overflow-hidden rounded-xl bg-surface-container-lowest p-8 ambient-shadow">
      <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-surface-container-high opacity-50 blur-3xl" />
      <div className="relative z-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <MatIcon
              name="pending_actions"
              filled
              className="text-xl text-secondary"
            />
            <span className="text-xs font-semibold uppercase tracking-[0.08em] text-secondary">
              Current Status
            </span>
          </div>
          <h2 className="mb-2 text-4xl font-bold tracking-[-0.02em] text-on-surface leading-none">
            {completionLabel}
          </h2>
          <p className="max-w-md text-base leading-relaxed text-on-surface-variant">
            Your {filingYear} return is {completionPercent}% complete. Awaiting
            final documentation to maximise your authorised deductions.
          </p>
          <div className="mt-4 h-1.5 w-48 overflow-hidden rounded-full bg-surface-container">
            <div
              className="h-full rounded-full bg-secondary transition-all"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
        </div>

        <div className="min-w-[180px] rounded-xl ghost-border bg-surface-container-low p-5 flex flex-col items-end">
          <span className="mb-1 text-xs font-semibold uppercase tracking-[0.08em] text-secondary">
            Est. Refund
          </span>
          <span className="flex items-center gap-1 text-xl font-semibold text-tertiary-container">
            <MatIcon
              name="arrow_upward"
              className="text-sm text-on-tertiary-container"
            />
            RM{' '}
            {estimatedRefund.toLocaleString('en-MY', {
              minimumFractionDigits: 2,
            })}
          </span>
        </div>
      </div>
    </div>
  )
}
