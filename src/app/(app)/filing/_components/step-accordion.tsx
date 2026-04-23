'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { MatIcon } from '@/components/ui/mat-icon'
import type { FilingStep, FilingField } from '@/lib/types'

function FieldRow({ field }: { field: FilingField }) {
  return (
    <div
      className={cn(
        'flex items-center justify-between rounded-lg px-4 py-3',
        field.isMissing
          ? 'bg-error-container border border-on-error-container/20'
          : 'bg-surface-container-low'
      )}
    >
      <span className="text-xs font-semibold text-on-surface-variant">
        {field.label}
      </span>
      <div className="flex items-center gap-2">
        {field.isMissing ? (
          <>
            <span className="text-xs font-semibold text-on-error-container">
              Missing
            </span>
            <MatIcon
              name="warning"
              filled
              className="text-sm text-on-error-container"
            />
          </>
        ) : (
          <span className="text-sm font-semibold text-on-surface">
            {field.value}
          </span>
        )}
      </div>
    </div>
  )
}

export function StepAccordion({ steps }: { steps: FilingStep[] }) {
  const [expandedStep, setExpandedStep] = useState<string | null>('step-003')

  return (
    <div className="flex flex-col gap-4">
      {steps.map((step) => {
        const isOpen = expandedStep === step.id
        return (
          <div
            key={step.id}
            className={cn(
              'rounded-xl bg-surface-container-lowest ambient-shadow overflow-hidden transition-all',
              step.status === 'in_progress' && 'ring-2 ring-secondary/30'
            )}
          >
            {/* Step header */}
            <button
              onClick={() => setExpandedStep(isOpen ? null : step.id)}
              className="flex w-full items-center gap-4 px-6 py-5 text-left"
            >
              <div
                className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold',
                  step.status === 'complete' &&
                    'bg-tertiary-container text-on-tertiary-container',
                  step.status === 'in_progress' &&
                    'bg-secondary text-secondary-foreground',
                  step.status === 'pending' &&
                    'bg-surface-container text-secondary',
                  step.status === 'missing' &&
                    'bg-error-container text-on-error-container'
                )}
              >
                {step.status === 'complete' ? (
                  <MatIcon name="check" filled className="text-base" />
                ) : step.status === 'in_progress' ? (
                  <MatIcon name="edit" filled className="text-base" />
                ) : (
                  step.step
                )}
              </div>

              <div className="flex-1">
                <p className="text-sm font-semibold text-on-surface">
                  {step.title}
                </p>
                <p className="text-xs text-on-surface-variant">
                  {step.description}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {step.status === 'complete' && (
                  <span className="rounded-full bg-tertiary-container px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-on-tertiary-container">
                    Complete
                  </span>
                )}
                {step.status === 'in_progress' && (
                  <span className="rounded-full bg-surface-container-high px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-secondary">
                    In Progress
                  </span>
                )}
                {step.status === 'pending' && (
                  <span className="rounded-full bg-surface-container px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                    Pending
                  </span>
                )}
                <MatIcon
                  name={isOpen ? 'expand_less' : 'expand_more'}
                  className="text-xl text-on-surface-variant"
                />
              </div>
            </button>

            {/* Expanded fields */}
            {isOpen && step.fields && step.fields.length > 0 && (
              <div className="border-t border-outline-variant/15 px-6 pb-5 pt-4">
                <div className="flex flex-col gap-2">
                  {step.fields.map((field) => (
                    <FieldRow key={field.id} field={field} />
                  ))}
                </div>
              </div>
            )}

            {isOpen && (!step.fields || step.fields.length === 0) && (
              <div className="border-t border-outline-variant/15 px-6 pb-5 pt-4">
                <p className="text-sm text-on-surface-variant">
                  This step will be enabled once all previous steps are
                  complete.
                </p>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
