import Link from 'next/link'
import { MatIcon } from '@/components/ui/mat-icon'

export function ExportActions() {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-surface-container-lowest p-6 ambient-shadow">
      <div>
        <p className="text-sm font-semibold text-on-surface">
          Ready to export?
        </p>
        <p className="text-xs text-on-surface-variant">
          Download a PDF summary or proceed to LHDN e-Filing.
        </p>
      </div>
      <div className="flex gap-3">
        <button className="flex items-center gap-2 rounded-lg ghost-border bg-surface-container-low px-5 py-3 text-sm font-semibold text-secondary hover:bg-surface-container-high transition-colors">
          <MatIcon name="download" className="text-base" />
          Export PDF
        </button>
        <Link
          href="/chat"
          className="flex items-center gap-2 rounded-lg bg-on-primary-container px-5 py-3 text-sm font-semibold text-on-primary-fixed shadow-lg shadow-on-primary-container/20 hover:opacity-90 transition-opacity"
        >
          Submit to LHDN
          <MatIcon name="open_in_new" className="text-base" />
        </Link>
      </div>
    </div>
  )
}
