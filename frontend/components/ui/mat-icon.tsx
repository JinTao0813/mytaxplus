import { cn } from '@/lib/utils'

interface MatIconProps {
  name: string
  filled?: boolean
  className?: string
}

/**
 * Renders a Material Symbols Outlined icon.
 * Server component — no 'use client' needed.
 * Import from @/components/ui/mat-icon; never redefine inline.
 */
export function MatIcon({ name, filled = false, className }: MatIconProps) {
  return (
    <span
      className={cn('material-symbols-outlined select-none', className)}
      style={
        filled
          ? { fontVariationSettings: "'FILL' 1" }
          : { fontVariationSettings: "'FILL' 0" }
      }
    >
      {name}
    </span>
  )
}
