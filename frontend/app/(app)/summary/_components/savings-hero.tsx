import { MatIcon } from '@/components/ui/mat-icon'

interface Props {
  savings: number
}

function formatRM(n: number) {
  return `RM ${n.toLocaleString('en-MY', { minimumFractionDigits: 2 })}`
}

export function SavingsHero({ savings }: Props) {
  return (
    <div className="mb-10 flex items-center justify-between rounded-xl bg-tertiary-container p-8 ambient-shadow-md">
      <div className="flex items-center gap-6">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-surface-container-lowest/20">
          <MatIcon
            name="verified"
            filled
            className="text-4xl text-tertiary-fixed"
          />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-tertiary-fixed">
            Optimisation Complete
          </h3>
          <p className="text-sm text-tertiary-fixed-dim">
            By applying the AI-detected reliefs, you lower your taxable bracket.
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-xs font-semibold uppercase tracking-widest text-tertiary-fixed-dim">
          You&apos;ve saved
        </p>
        <p className="text-6xl font-bold tracking-[-0.02em] leading-none text-on-primary-container">
          {formatRM(savings)}
        </p>
      </div>
    </div>
  )
}
