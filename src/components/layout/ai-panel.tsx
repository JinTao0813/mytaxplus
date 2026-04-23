'use client'

import { useState } from 'react'
import { MatIcon } from '@/components/ui/mat-icon'
import { cn } from '@/lib/utils'

interface AiChip {
  label: string
  onClick?: () => void
}

interface AiPanelProps {
  title?: string
  statusLabel?: string
  message: string
  chips?: AiChip[]
  inputPlaceholder?: string
  onSend?: (message: string) => void
  className?: string
  /** Additional AI analysis items rendered below the main message */
  analysisItems?: AiAnalysisItem[]
}

export interface AiAnalysisItem {
  id: string
  category: string
  label: string
  amount?: number
  confidence?: number
  taxSection?: string
  status: 'complete' | 'parsing'
}

export function AiPanel({
  title = 'Ledger AI',
  statusLabel = 'Analysing Profile',
  message,
  chips = [],
  inputPlaceholder = 'Ask about your tax situation...',
  onSend,
  className,
  analysisItems,
}: AiPanelProps) {
  const [input, setInput] = useState('')

  function handleSend() {
    if (!input.trim()) return
    onSend?.(input.trim())
    setInput('')
  }

  function handleKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') handleSend()
  }

  return (
    <div
      className={cn(
        'flex flex-col rounded-xl ghost-border bg-surface-container-lowest/70 backdrop-blur-xl ambient-shadow overflow-hidden',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-outline-variant/10 bg-surface-container-low/50 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-container-high">
            <MatIcon name="auto_awesome" className="text-sm text-secondary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-on-surface">{title}</p>
            <div className="flex items-center gap-1.5">
              <span className="ai-pulse inline-block h-1.5 w-1.5 rounded-full bg-tertiary-fixed" />
              <span className="text-[10px] font-medium uppercase tracking-widest text-on-surface-variant">
                {statusLabel}
              </span>
            </div>
          </div>
        </div>
        <button className="text-on-surface-variant hover:text-on-surface transition-colors">
          <MatIcon name="more_vert" className="text-xl" />
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto bg-surface/50 p-5">
        {/* AI message */}
        <div className="flex gap-3">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-container-high">
            <MatIcon name="smart_toy" className="text-sm text-secondary" />
          </div>
          <div className="rounded-xl rounded-tl-none bg-surface-container-highest px-4 py-3 ambient-shadow">
            <p className="text-sm leading-relaxed text-on-surface">{message}</p>
          </div>
        </div>

        {/* Suggestion chips */}
        {chips.length > 0 && (
          <div className="flex flex-wrap gap-2 pl-11">
            {chips.map((chip, i) => (
              <button
                key={i}
                onClick={chip.onClick}
                className="rounded-full ghost-border bg-surface-container-high px-3 py-1.5 text-xs font-medium text-secondary hover:bg-surface-container-highest transition-colors"
              >
                {chip.label}
              </button>
            ))}
          </div>
        )}

        {/* Analysis items */}
        {analysisItems && analysisItems.length > 0 && (
          <div className="flex flex-col gap-3 mt-1">
            {analysisItems.map((item) =>
              item.status === 'complete' ? (
                <div
                  key={item.id}
                  className="rounded-lg border-l-4 border-tertiary-container bg-surface-container-low p-4"
                >
                  <div className="mb-1 flex items-center justify-between">
                    <span className="rounded-full bg-tertiary-container px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-on-tertiary-container">
                      {item.category}
                    </span>
                    {item.confidence !== undefined && (
                      <span className="text-[10px] text-on-surface-variant">
                        Confidence: {item.confidence}%
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-secondary">
                    {item.label}
                  </p>
                  {item.amount !== undefined && item.amount > 0 && (
                    <p className="text-base font-semibold text-on-surface">
                      RM{' '}
                      {item.amount.toLocaleString('en-MY', {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                  )}
                  {item.taxSection && (
                    <p className="mt-1 line-clamp-2 text-[11px] text-on-surface-variant">
                      {item.taxSection}
                    </p>
                  )}
                </div>
              ) : (
                <div
                  key={item.id}
                  className="relative overflow-hidden rounded-lg ghost-border bg-surface p-4"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-surface-container-highest/30 to-transparent" />
                  <div className="relative z-10">
                    <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                      <MatIcon
                        name="sync"
                        className="text-xs animate-spin text-on-surface-variant"
                      />
                      Parsing
                    </span>
                    <p className="mt-1 text-sm text-on-surface-variant truncate">
                      {item.label}
                    </p>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-container-high">
                      <div className="h-full w-2/3 rounded-full bg-secondary" />
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-outline-variant/10 bg-surface-container-lowest p-4">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder={inputPlaceholder}
            className="w-full rounded-xl ghost-border bg-surface-container-lowest py-3 pl-4 pr-12 text-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all"
          />
          <button
            onClick={handleSend}
            className="absolute right-2 flex h-8 w-8 items-center justify-center rounded-full text-secondary hover:bg-surface-container-low transition-colors"
          >
            <MatIcon name="send" className="text-xl" />
          </button>
        </div>
        <p className="mt-2 text-center text-[9px] font-medium uppercase tracking-widest text-on-surface-variant/40">
          Confidential AI Analysis
        </p>
      </div>
    </div>
  )
}
