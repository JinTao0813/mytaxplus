import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

type AuthPanelProps = {
  eyebrow: string
  title: string
  description: string
  icon?: ReactNode
  children: ReactNode
  footer?: ReactNode
  className?: string
}

export function AuthPanel({
  eyebrow,
  title,
  description,
  icon,
  children,
  footer,
  className,
}: AuthPanelProps) {
  return (
    <div
      className={cn(
        'rounded-xl ghost-border bg-surface-container-low p-8 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.12)]',
        className
      )}
    >
      <div className="mb-6 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-secondary">
          {eyebrow}
        </p>
        <div className="flex items-start gap-3">
          {icon ? (
            <span className="mt-0.5 inline-flex shrink-0 rounded-full bg-surface-container-high p-2">
              {icon}
            </span>
          ) : null}
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight text-on-surface md:text-[1.65rem]">
              {title}
            </h1>
            <p className="text-sm leading-relaxed text-on-surface-variant">
              {description}
            </p>
          </div>
        </div>
      </div>
      <div className="space-y-4">{children}</div>
      {footer ? (
        <div className="mt-8 border-t border-outline-variant/40 pt-6">
          {footer}
        </div>
      ) : null}
    </div>
  )
}
