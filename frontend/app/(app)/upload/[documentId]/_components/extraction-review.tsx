'use client'

import { useMemo, useState } from 'react'
import type { AiExtractionWithId } from '@/lib/types'
import { patchDocumentExtraction } from '@/lib/api/documents'

interface Props {
  documentId: string
  initialRows: AiExtractionWithId[]
}

export function ExtractionReview({ documentId, initialRows }: Props) {
  const [rows, setRows] = useState<AiExtractionWithId[]>(initialRows)
  const [savingId, setSavingId] = useState<string | null>(null)

  const total = useMemo(
    () => rows.reduce((sum, r) => sum + (Number.isFinite(r.amount) ? r.amount : 0), 0),
    [rows]
  )

  async function updateRow(
    id: string,
    patch: Partial<Pick<AiExtractionWithId, 'label' | 'amount' | 'taxSection' | 'category'>>
  ) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)))
    setSavingId(id)
    try {
      await patchDocumentExtraction({
        documentId,
        extractionId: id,
        label: patch.label,
        amount: patch.amount,
        taxSection: patch.taxSection,
        category: patch.category,
      })
    } finally {
      setSavingId((cur) => (cur === id ? null : cur))
    }
  }

  return (
    <div className="rounded-xl bg-surface-container-low p-7">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-on-surface">
            Extracted rows
          </h2>
          <p className="mt-1 text-sm text-on-surface-variant">
            Total (for this document): RM {total.toFixed(2)}
          </p>
        </div>
        {savingId ? (
          <span className="text-xs font-semibold text-secondary">Saving…</span>
        ) : null}
      </div>

      <div className="flex flex-col gap-3">
        {rows.map((r) => (
          <div
            key={r.id}
            className="rounded-xl bg-surface-container-lowest p-5"
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-on-surface-variant">
                  Label
                </label>
                <input
                  className="mt-1 w-full rounded-lg bg-surface px-3 py-2 text-sm text-on-surface ghost-border"
                  value={r.label}
                  onChange={(e) => updateRow(r.id, { label: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant">
                  Amount (RM)
                </label>
                <input
                  className="mt-1 w-full rounded-lg bg-surface px-3 py-2 text-sm text-on-surface ghost-border"
                  inputMode="decimal"
                  value={String(r.amount)}
                  onChange={(e) =>
                    updateRow(r.id, { amount: Number(e.target.value) })
                  }
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant">
                  Tax section
                </label>
                <input
                  className="mt-1 w-full rounded-lg bg-surface px-3 py-2 text-sm text-on-surface ghost-border"
                  value={r.taxSection}
                  onChange={(e) =>
                    updateRow(r.id, { taxSection: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
        ))}
        {rows.length === 0 ? (
          <p className="text-sm text-on-surface-variant">
            No extraction rows found for this document yet.
          </p>
        ) : null}
      </div>
    </div>
  )
}

