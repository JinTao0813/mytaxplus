'use client'

import { MatIcon } from '@/components/ui/mat-icon'

export function HeaderActions() {
  return (
    <div className="hidden items-center gap-3 md:flex">
      <button className="flex h-10 w-10 items-center justify-center rounded-full ghost-border bg-surface-container-low text-secondary hover:bg-surface-container-high transition-colors">
        <MatIcon name="search" className="text-xl" />
      </button>
      <button className="flex h-10 w-10 items-center justify-center rounded-full ghost-border bg-surface-container-low text-secondary hover:bg-surface-container-high transition-colors">
        <MatIcon name="notifications" className="text-xl" />
      </button>
    </div>
  )
}
