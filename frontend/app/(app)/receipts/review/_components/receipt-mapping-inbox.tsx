'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { MatIcon } from '@/components/ui/mat-icon'
import {
  clearReceiptMapping,
  confirmReceiptMapping,
  retryReceiptSuggestion,
} from '@/lib/api/receipts-review'
import type { ReliefRuleApi } from '@/lib/api/reliefs-rules'
import { ApiError, getTokenForApi } from '@/lib/api/client'
import { useAuth } from '@/hooks/useAuth'
import type { ReceiptMappingStatus, ReceiptReviewItem } from '@/lib/types'
import { cn } from '@/lib/utils'

function statusLabel(status: ReceiptMappingStatus): string {
  switch (status) {
    case 'in_progress':
      return 'Classifying'
    case 'unmapped':
      return 'Unmapped'
    case 'suggested':
      return 'Suggested'
    case 'needs_review':
      return 'Needs review'
    case 'confirmed':
      return 'Confirmed'
    case 'gemini_error':
      return 'Gemini error'
    default:
      return status
  }
}

function statusChipClass(status: ReceiptMappingStatus): string {
  switch (status) {
    case 'confirmed':
      return 'bg-tertiary-container text-on-tertiary-container'
    case 'gemini_error':
      return 'bg-error-container text-on-error-container'
    case 'needs_review':
    case 'unmapped':
      return 'bg-on-primary-container/15 text-on-primary-fixed-variant'
    case 'suggested':
      return 'bg-secondary/20 text-secondary'
    case 'in_progress':
    default:
      return 'bg-surface-container-high text-on-surface-variant'
  }
}

function describeErr(err: unknown): string {
  if (err instanceof ApiError) return err.message
  if (err instanceof Error) return err.message
  return 'Something went wrong.'
}

interface Props {
  initialItems: ReceiptReviewItem[]
  initialRules: ReliefRuleApi[]
  filingYear: number
  initialLoadError?: string | null
}

export function ReceiptMappingInbox({
  initialItems,
  initialRules,
  filingYear,
  initialLoadError = null,
}: Props) {
  const router = useRouter()
  const { user } = useAuth()
  const [rowError, setRowError] = useState<Record<string, string | null>>({})
  const [busyId, setBusyId] = useState<string | null>(null)
  const [selectedRelief, setSelectedRelief] = useState<Record<string, string>>(
    {}
  )

  const rulesSorted = useMemo(
    () => [...initialRules].sort((a, b) => a.name.localeCompare(b.name)),
    [initialRules]
  )

  const refresh = useCallback(() => {
    router.refresh()
  }, [router])

  async function withToken<T>(fn: (token: string | undefined) => Promise<T>) {
    const token = user ? await getTokenForApi(user) : undefined
    return fn(token)
  }

  async function handleConfirm(item: ReceiptReviewItem) {
    const reliefId =
      selectedRelief[item.extractionId] ??
      item.suggestedReliefId ??
      item.reliefId
    if (!reliefId) {
      setRowError((e) => ({
        ...e,
        [item.extractionId]: 'Pick a relief category before confirming.',
      }))
      return
    }
    setBusyId(item.extractionId)
    setRowError((e) => ({ ...e, [item.extractionId]: null }))
    try {
      await withToken((token) =>
        confirmReceiptMapping(
          item.extractionId,
          { year: filingYear, reliefId },
          { token }
        )
      )
      refresh()
    } catch (err) {
      setRowError((e) => ({
        ...e,
        [item.extractionId]: describeErr(err),
      }))
    } finally {
      setBusyId(null)
    }
  }

  async function handleClear(item: ReceiptReviewItem) {
    setBusyId(item.extractionId)
    setRowError((e) => ({ ...e, [item.extractionId]: null }))
    try {
      await withToken((token) =>
        clearReceiptMapping(item.extractionId, { token })
      )
      refresh()
    } catch (err) {
      setRowError((e) => ({
        ...e,
        [item.extractionId]: describeErr(err),
      }))
    } finally {
      setBusyId(null)
    }
  }

  async function handleRetry(item: ReceiptReviewItem) {
    setBusyId(item.extractionId)
    setRowError((e) => ({ ...e, [item.extractionId]: null }))
    try {
      await withToken((token) =>
        retryReceiptSuggestion(item.extractionId, { token })
      )
      refresh()
    } catch (err) {
      setRowError((e) => ({
        ...e,
        [item.extractionId]: describeErr(err),
      }))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {initialLoadError ? (
        <div
          className="rounded-xl border border-outline-variant/30 bg-error-container/30 p-4 text-sm text-on-error-container"
          role="alert"
        >
          {initialLoadError}
        </div>
      ) : null}

      {initialItems.length === 0 && !initialLoadError ? (
        <div className="rounded-xl bg-surface-container-low p-8 text-center">
          <MatIcon
            name="task_alt"
            className="mx-auto mb-3 text-4xl text-tertiary-container"
          />
          <p className="text-sm font-semibold text-on-surface">
            No receipts in the review queue
          </p>
          <p className="mt-2 text-sm text-on-surface-variant">
            Upload receipts from Tax Files. After extraction and Gemini
            suggestion, items that need your confirmation appear here.
          </p>
          <Link
            href="/upload"
            className="mt-6 inline-flex items-center justify-center rounded-lg bg-secondary px-6 py-3 text-sm font-semibold text-secondary-foreground hover:opacity-90 transition-opacity"
          >
            Go to Tax Files
          </Link>
        </div>
      ) : null}

      <div className="flex flex-col gap-4">
        {initialItems.map((item) => {
          const busy = busyId === item.extractionId
          const err = rowError[item.extractionId]
          const defaultSelect =
            selectedRelief[item.extractionId] ??
            item.suggestedReliefId ??
            item.reliefId ??
            ''

          return (
            <article
              key={item.extractionId}
              className="rounded-xl bg-surface-container-low p-5 ghost-border"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base font-semibold text-on-surface">
                      {item.label}
                    </h2>
                    <span
                      className={cn(
                        'rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider',
                        statusChipClass(item.mappingStatus)
                      )}
                    >
                      {statusLabel(item.mappingStatus)}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-on-surface-variant">
                    <Link
                      href={`/upload/${item.documentId}`}
                      className="font-semibold text-secondary hover:underline"
                    >
                      Open document
                    </Link>
                    {' · '}
                    {item.vendor ?? '—'} · {item.date ?? '—'} · RM{' '}
                    {Number.isFinite(item.amount)
                      ? item.amount.toFixed(2)
                      : '0.00'}
                  </p>
                  {item.mappingErrorCode ? (
                    <p className="mt-2 text-xs font-medium text-on-error-container">
                      Error: {item.mappingErrorCode}
                    </p>
                  ) : null}
                </div>
              </div>

              {(item.suggestedReliefId != null ||
                item.suggestionRationale ||
                (item.suggestionAlternatives?.length ?? 0) > 0) && (
                <div className="mt-4 rounded-lg bg-surface-container-lowest p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                    Gemini suggestion
                  </p>
                  {item.suggestedReliefId != null ? (
                    <p className="mt-1 text-sm text-on-surface">
                      <span className="font-mono text-secondary">
                        {item.suggestedReliefId}
                      </span>
                      {item.suggestionConfidence != null ? (
                        <span className="ml-2 text-on-surface-variant">
                          ({Math.round(item.suggestionConfidence * 100)}%
                          confidence)
                        </span>
                      ) : null}
                    </p>
                  ) : (
                    <p className="mt-1 text-sm text-on-surface-variant">
                      No single best match — pick from the catalog below.
                    </p>
                  )}
                  {item.suggestionRationale ? (
                    <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
                      {item.suggestionRationale}
                    </p>
                  ) : null}
                  {item.suggestionAlternatives &&
                  item.suggestionAlternatives.length > 0 ? (
                    <ul className="mt-3 list-inside list-disc text-xs text-on-surface-variant">
                      {item.suggestionAlternatives.map((alt) => (
                        <li key={alt.reliefId}>
                          <span className="font-mono text-on-surface">
                            {alt.reliefId}
                          </span>{' '}
                          ({Math.round(alt.confidence * 100)}%){' '}
                          {alt.rationale ? `— ${alt.rationale}` : null}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              )}

              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
                <div className="min-w-[220px] flex-1">
                  <label
                    htmlFor={`relief-${item.extractionId}`}
                    className="text-xs font-semibold text-on-surface-variant"
                  >
                    Relief (YA {filingYear} catalog)
                  </label>
                  <select
                    id={`relief-${item.extractionId}`}
                    className="mt-1 w-full rounded-lg border border-outline-variant/30 bg-surface px-3 py-2 text-sm text-on-surface"
                    value={defaultSelect}
                    onChange={(e) =>
                      setSelectedRelief((prev) => ({
                        ...prev,
                        [item.extractionId]: e.target.value,
                      }))
                    }
                  >
                    <option value="">Select relief…</option>
                    {rulesSorted.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    disabled={busy}
                    onClick={() => void handleConfirm(item)}
                  >
                    {busy ? '…' : 'Confirm'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={busy}
                    onClick={() => void handleClear(item)}
                  >
                    Clear
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={busy}
                    onClick={() => void handleRetry(item)}
                  >
                    Retry Gemini
                  </Button>
                </div>
              </div>

              {err ? (
                <p
                  className="mt-3 text-sm font-medium text-on-error-container"
                  role="alert"
                >
                  {err}
                </p>
              ) : null}
            </article>
          )
        })}
      </div>
    </div>
  )
}
