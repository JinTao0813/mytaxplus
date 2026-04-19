import { getDashboardStatus } from '@/lib/services'
import { AiPanel } from '@/components/layout/ai-panel'
import { StatusHeroCard } from './_components/status-hero-card'
import { PendingActionCard } from './_components/pending-action-card'
import { QuickLinksGrid } from './_components/quick-links-grid'
import { TaxJourney } from './_components/tax-journey'
import { HeaderActions } from './_components/header-actions'

export default async function DashboardPage() {
  const status = await getDashboardStatus()

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
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left column */}
        <div className="flex flex-col gap-6 lg:col-span-8">
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

        {/* Right column — AI panel */}
        <div className="lg:col-span-4">
          <AiPanel
            title="Ledger AI"
            statusLabel="AI Assistant Active"
            message="I noticed a potential deduction opportunity based on your recent Home Office Equipment upload. Would you like me to categorise this under the Lifestyle relief category (Section 46(1)(k))?"
            chips={[
              { label: 'Yes, apply it' },
              { label: 'Review first' },
              { label: 'What is this relief?' },
            ]}
            inputPlaceholder="Ask about your tax situation..."
            className="sticky top-8 h-[600px]"
          />
        </div>
      </div>
    </div>
  )
}
