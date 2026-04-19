import { MatIcon } from '@/components/ui/mat-icon'

interface Props {
  totalMissed: number
}

export function SavingsBanner({ totalMissed }: Props) {
  function formatRM(n: number) {
    return `RM ${n.toLocaleString('en-MY', { minimumFractionDigits: 2 })}`
  }

  if (totalMissed > 0) {
    return (
      <div className="mb-10 flex items-center justify-between rounded-xl bg-tertiary-container p-7 ambient-shadow-md">
        <div className="flex items-center gap-5">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-surface-container-lowest/20">
            <MatIcon
              name="tips_and_updates"
              filled
              className="text-3xl text-on-tertiary-container"
            />
          </div>
          <div>
            <h3 className="text-base font-semibold text-tertiary-fixed">
              Optimisation Opportunities Found
            </h3>
            <p className="text-sm text-tertiary-fixed-dim">
              By accepting the newly detected reliefs, you lower your taxable
              bracket.
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs font-semibold uppercase tracking-widest text-tertiary-fixed-dim">
            Potential savings
          </p>
          <p className="text-5xl font-bold tracking-[-0.02em] leading-none text-tertiary-fixed">
            {formatRM(totalMissed)}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="mb-10 flex items-center gap-5 rounded-xl bg-tertiary-container p-7">
      <MatIcon
        name="verified"
        filled
        className="text-4xl text-on-tertiary-container"
      />
      <div>
        <h3 className="text-base font-semibold text-tertiary-fixed">
          Optimisation Complete
        </h3>
        <p className="text-sm text-tertiary-fixed-dim">
          All reliefs have been applied. Your returns are fully optimised.
        </p>
      </div>
    </div>
  )
}
