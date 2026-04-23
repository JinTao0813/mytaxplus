'use client'

import { useState } from 'react'
import type { NormalizedRect, ReliefClaimRecord } from '@/lib/types'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const FALLBACK_PREVIEW = '/globe.svg'

function BboxOverlay({
  rect,
  label,
  className,
}: {
  rect: NormalizedRect
  label: string
  className?: string
}) {
  return (
    <div
      className={cn(
        'pointer-events-none absolute rounded-sm border-2 border-tertiary-fixed bg-tertiary-fixed/10',
        className
      )}
      style={{
        left: `${rect.x * 100}%`,
        top: `${rect.y * 100}%`,
        width: `${rect.w * 100}%`,
        height: `${rect.h * 100}%`,
      }}
      aria-hidden
    >
      <span className="absolute -top-6 left-0 rounded bg-on-surface/85 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-surface">
        {label}
      </span>
    </div>
  )
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  reliefName: string
  claim: ReliefClaimRecord
  onSave: (
    patch: Partial<Pick<ReliefClaimRecord, 'date' | 'vendor' | 'amount'>>
  ) => void
}

export function ReceiptReviewSheet({
  open,
  onOpenChange,
  reliefName,
  claim,
  onSave,
}: Props) {
  const [date, setDate] = useState(claim.date)
  const [vendor, setVendor] = useState(claim.vendor)
  const [amount, setAmount] = useState(() => String(claim.amount))

  const src = claim.previewUrl || FALLBACK_PREVIEW
  const h = claim.highlights

  function handleSave() {
    const n = Number.parseFloat(amount)
    onSave({
      date,
      vendor,
      amount: Number.isFinite(n) ? n : claim.amount,
    })
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton
        className="h-full w-full max-h-[100dvh] overflow-y-auto border-outline-variant/20 bg-surface-container-lowest p-0 sm:max-w-2xl lg:max-w-3xl"
      >
        <SheetHeader className="border-b border-outline-variant/15 px-6 py-4">
          <SheetTitle className="text-on-surface">Receipt</SheetTitle>
          <SheetDescription className="text-on-surface-variant">
            {reliefName} · {claim.vendor}
          </SheetDescription>
        </SheetHeader>

        <div className="grid flex-1 grid-cols-1 gap-6 p-6 lg:grid-cols-2">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
              Scan preview
            </p>
            <div className="relative overflow-hidden rounded-xl bg-surface-container ghost-border">
              {/* eslint-disable-next-line @next/next/no-img-element -- dynamic mock URLs */}
              <img
                src={src}
                alt=""
                className="block h-auto w-full max-h-[min(52vh,520px)] object-contain object-top"
              />
              <div className="pointer-events-none absolute inset-0">
                {h?.date ? <BboxOverlay rect={h.date} label="Date" /> : null}
                {h?.amount ? (
                  <BboxOverlay
                    rect={h.amount}
                    label="Amount"
                    className="border-secondary-fixed"
                  />
                ) : null}
              </div>
            </div>
            <p className="mt-2 text-[11px] text-on-surface-variant">
              Highlighted regions show where extraction found date and amount
              (demo geometry).
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
              Extracted fields
            </p>
            <div>
              <label
                className="text-xs font-semibold text-on-surface-variant"
                htmlFor="receipt-date"
              >
                Date
              </label>
              <input
                id="receipt-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1 w-full rounded-lg bg-surface px-3 py-2 text-sm text-on-surface ghost-border"
              />
            </div>
            <div>
              <label
                className="text-xs font-semibold text-on-surface-variant"
                htmlFor="receipt-vendor"
              >
                Vendor
              </label>
              <input
                id="receipt-vendor"
                type="text"
                value={vendor}
                onChange={(e) => setVendor(e.target.value)}
                className="mt-1 w-full rounded-lg bg-surface px-3 py-2 text-sm text-on-surface ghost-border"
              />
            </div>
            <div>
              <label
                className="text-xs font-semibold text-on-surface-variant"
                htmlFor="receipt-amount"
              >
                Amount (RM)
              </label>
              <input
                id="receipt-amount"
                type="number"
                inputMode="decimal"
                step="0.01"
                min={0}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-1 w-full rounded-lg bg-surface px-3 py-2 text-sm text-on-surface ghost-border"
              />
            </div>
          </div>
        </div>

        <SheetFooter className="border-t border-outline-variant/15 bg-surface-container-low/40 px-6 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="button" onClick={handleSave}>
            Save changes
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
