import { getReliefs } from '@/lib/services'
import { AiPanel } from '@/components/layout/ai-panel'
import { SavingsBanner } from './_components/savings-banner'
import { ReliefStats } from './_components/relief-stats'
import { ReliefCardList } from './_components/relief-card-list'

export default async function ReliefsPage() {
  const reliefs = await getReliefs()

  const claimed = reliefs.filter((r) => r.status === 'claimed')
  const actionable = reliefs.filter((r) => r.status !== 'claimed')
  const totalClaimed = claimed.reduce((s, r) => s + r.claimedAmount, 0)
  const totalMissed = actionable.reduce(
    (s, r) => s + (r.maxAmount - r.claimedAmount),
    0
  )

  return (
    <div className="flex min-h-screen bg-surface">
      {/* ── Main content ──────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto px-6 pb-24 pt-8 md:px-12 md:pb-12 md:pt-12 lg:mr-96">
        {/* Header */}
        <header className="mb-10">
          <h1 className="text-3xl font-semibold tracking-tight text-on-surface">
            Relief Detection &amp; Optimisation
          </h1>
          <p className="mt-2 max-w-2xl text-base leading-relaxed text-on-surface-variant">
            Our AI has analysed your tax profile to identify eligible Malaysian
            tax reliefs. Review the optimised calculations below.
          </p>
        </header>

        <SavingsBanner totalMissed={totalMissed} />

        <ReliefStats
          totalCount={reliefs.length}
          claimedCount={claimed.length}
          totalClaimed={totalClaimed}
          totalMissed={totalMissed}
        />

        <ReliefCardList initialReliefs={reliefs} />
      </main>

      {/* ── Fixed AI sidebar ──────────────────────────────────────────── */}
      <aside className="fixed right-0 top-0 hidden h-screen w-96 border-l border-outline-variant/20 bg-surface-container-lowest ambient-shadow-lg lg:flex lg:flex-col z-30">
        <AiPanel
          title="Ledger Intelligence"
          statusLabel="Analysing Profile"
          message="I've completed the optimisation scan. The most significant finding is the unregistered Lifestyle deduction for your device purchase. I also found EPF contributions that have not been fully claimed. Would you like me to automatically apply all eligible reliefs?"
          chips={[
            { label: 'Apply all reliefs' },
            { label: 'Explain Lifestyle relief' },
            { label: 'Maximise EPF' },
          ]}
          inputPlaceholder="Ask about your tax profile..."
          className="h-full rounded-none border-0 shadow-none"
        />
      </aside>
    </div>
  )
}
