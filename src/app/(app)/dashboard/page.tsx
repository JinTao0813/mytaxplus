import Link from 'next/link'

import { getDashboardStatus } from '@/lib/api'
import { cookieHeaderFromRequest } from '@/lib/api/server-cookies'
import { StatusHeroCard } from './_components/status-hero-card'
import { PendingActionCard } from './_components/pending-action-card'
import { QuickLinksGrid } from './_components/quick-links-grid'
import { TaxJourney } from './_components/tax-journey'
import { HeaderActions } from './_components/header-actions'

export default async function DashboardPage() {
  const cookieHeader = await cookieHeaderFromRequest()
  const status = await getDashboardStatus({ cookieHeader })

  return (
    <div className="min-h-screen bg-surface px-6 pb-24 pt-8 md:px-12 md:pb-12 md:pt-12">
      {/* ── Page header ─────────────────────────────────────────────── */}
      <header className="mb-10 flex items-end justify-between">
        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-secondary">
            Filing Year {status.filingYear}
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-on-surface">
            Overview
          </h1>
        </div>
        <HeaderActions />
      </header>

      {/* ── Bento grid ──────────────────────────────────────────────── */}
      <div className="flex flex-col gap-6">
        <div className="flex justify-end">
          <Link
            href="/chat"
            className="text-sm font-semibold text-secondary underline"
          >
            Open AI Assistant
          </Link>
        </div>
        <StatusHeroCard
          filingYear={status.filingYear}
          completionPercent={status.completionPercent}
          estimatedRefund={status.estimatedRefund}
        />

        {status.pendingAction && (
          <PendingActionCard action={status.pendingAction} />
        )}

        <QuickLinksGrid />

        <TaxJourney />
      </div>
    </div>
  )
}
