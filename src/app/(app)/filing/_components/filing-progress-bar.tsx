import { MatIcon } from '@/components/ui/mat-icon'

interface Props {
  progress: number
  missingCount: number
}

export function FilingProgressBar({ progress, missingCount }: Props) {
  return (
    <div className="rounded-xl bg-surface-container-lowest p-6 ambient-shadow">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-semibold text-on-surface">
          Overall Progress
        </span>
        <span className="text-sm font-bold text-secondary">{progress}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-surface-container">
        <div
          className="h-full rounded-full bg-secondary transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
      {missingCount > 0 && (
        <p className="mt-3 flex items-center gap-1.5 text-xs text-on-error-container">
          <MatIcon name="warning" filled className="text-sm" />
          {missingCount} field{missingCount > 1 ? 's' : ''} require your
          attention before submission.
        </p>
      )}
    </div>
  )
}
