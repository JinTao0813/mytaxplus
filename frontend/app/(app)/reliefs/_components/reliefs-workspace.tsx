'use client'

import { useCallback, useState } from 'react'

import type {
  Relief,
  ReliefClaimRecord,
  TaxContext,
  TaxProfile,
} from '@/lib/types'
import {
  createReliefClaim,
  deleteReliefClaim,
  getReliefs,
  updateReliefClaim,
} from '@/lib/api'
import { ReliefStats } from './relief-stats'
import { ReliefCardList } from './relief-card-list'
import { TaxTopSummary } from './tax-top-summary'
import { ReceiptReviewSheet } from './receipt-review-sheet'
import { syncReliefAggregates, totalReliefsClaimed } from '../_lib/relief-math'

interface Props {
  initialReliefs: Relief[]
  profile: TaxProfile
  taxContext: TaxContext | null
}

export function ReliefsWorkspace({
  initialReliefs,
  profile,
  taxContext,
}: Props) {
  const [reliefs, setReliefs] = useState(() =>
    initialReliefs.map(syncReliefAggregates)
  )

  const [receiptCtx, setReceiptCtx] = useState<{
    reliefId: string
    reliefName: string
    claim: ReliefClaimRecord
  } | null>(null)

  const refreshReliefs = useCallback(async () => {
    const next = await getReliefs()
    setReliefs(next.map(syncReliefAggregates))
  }, [])

  const claimed = reliefs.filter((r) => r.status === 'claimed')
  const actionable = reliefs.filter((r) => r.status !== 'claimed')
  const totalClaimed = totalReliefsClaimed(reliefs)
  const totalMissed = actionable.reduce(
    (s, r) => s + Math.max(0, r.maxAmount - r.claimedAmount),
    0
  )

  function handleOpenReceipt(reliefId: string, claim: ReliefClaimRecord) {
    const r = reliefs.find((x) => x.id === reliefId)
    if (!r) return
    setReceiptCtx({ reliefId, reliefName: r.name, claim: { ...claim } })
  }

  async function handleSaveReceipt(
    patch: Partial<Pick<ReliefClaimRecord, 'date' | 'vendor' | 'amount'>>
  ) {
    if (!receiptCtx) return
    const claimId = receiptCtx.claim.id
    const reliefId = receiptCtx.reliefId
    await updateReliefClaim(reliefId, claimId, patch)
    await refreshReliefs()
    setReceiptCtx(null)
  }

  async function handleAddClaim(reliefId: string) {
    await createReliefClaim(reliefId, {
      date: new Date().toISOString().slice(0, 10),
      vendor: 'New receipt',
      amount: 0,
      previewUrl: '/globe.svg',
    })
    await refreshReliefs()
  }

  async function handleDeleteClaim(reliefId: string, claimId: string) {
    await deleteReliefClaim(reliefId, claimId)
    await refreshReliefs()
  }

  async function handleAcceptNudge(reliefId: string) {
    const r = reliefs.find((x) => x.id === reliefId)
    const n = r?.nudge
    if (!r || !n) return
    const current = r.claims ?? []
    const sumExisting = current.reduce((s, c) => s + c.amount, 0)
    const room = Math.max(0, r.maxAmount - sumExisting)
    const add = Math.min(n.amount, room)
    if (add <= 0) {
      setReliefs((prev) =>
        prev.map((x) =>
          x.id === reliefId
            ? syncReliefAggregates({ ...x, nudge: undefined })
            : x
        )
      )
      return
    }
    await createReliefClaim(reliefId, {
      date: new Date().toISOString().slice(0, 10),
      vendor: n.vendor || 'Receipt',
      amount: add,
      ...(n.documentId != null ? { documentId: n.documentId } : {}),
      previewUrl: '/globe.svg',
      highlights: {
        date: { x: 0.1, y: 0.15, w: 0.3, h: 0.05 },
        amount: { x: 0.55, y: 0.7, w: 0.32, h: 0.07 },
      },
    })
    await refreshReliefs()
  }

  function handleStripNudge(reliefId: string) {
    setReliefs((prev) =>
      prev.map((r) =>
        r.id === reliefId ? syncReliefAggregates({ ...r, nudge: undefined }) : r
      )
    )
  }

  return (
    <>
      <TaxTopSummary
        reliefs={reliefs}
        profile={profile}
        taxContext={taxContext}
      />

      <ReliefStats
        totalCount={reliefs.length}
        claimedCount={claimed.length}
        totalClaimed={totalClaimed}
        totalMissed={totalMissed}
      />

      <ReliefCardList
        reliefs={reliefs}
        onOpenReceipt={handleOpenReceipt}
        onAddClaim={handleAddClaim}
        onDeleteClaim={handleDeleteClaim}
        onAcceptNudge={handleAcceptNudge}
        onStripNudge={handleStripNudge}
      />

      {receiptCtx ? (
        <ReceiptReviewSheet
          key={receiptCtx.claim.id}
          open
          onOpenChange={(open) => {
            if (!open) setReceiptCtx(null)
          }}
          reliefName={receiptCtx.reliefName}
          claim={receiptCtx.claim}
          onSave={handleSaveReceipt}
        />
      ) : null}
    </>
  )
}
