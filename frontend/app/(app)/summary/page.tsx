import Link from 'next/link'
import { getTaxSummary } from '@/lib/services'
import { MatIcon } from '@/components/ui/mat-icon'
import { AiPanel } from '@/components/layout/ai-panel'
import { SavingsHero } from './_components/savings-hero'
import { CalcPanel } from './_components/calc-panel'
import { DeductionsBreakdown } from './_components/deductions-breakdown'

function formatRM(n: number) {
  return `RM ${n.toLocaleString('en-MY', { minimumFractionDigits: 2 })}`
}

export default async function SummaryPage() {
  const { baseline, optimized, savings } = await getTaxSummary()

  return (
    <div className="min-h-screen bg-surface px-6 pb-24 pt-8 md:px-12 md:pb-12 md:pt-12">
      {/* Header */}
      <header className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight text-on-surface">
          Tax Calculation &amp; Comparison
        </h1>
        <p className="mt-2 max-w-2xl text-base leading-relaxed text-on-surface-variant">
          Review your before and after optimisation tax calculations. Accept the
          AI recommendations to lock in your savings.
        </p>
      </header>

      <SavingsHero savings={savings} />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left: comparison + details */}
        <div className="flex flex-col gap-8 lg:col-span-8">
          <CalcPanel baseline={baseline} optimized={optimized} />
          <DeductionsBreakdown />

          <div className="flex justify-end pb-4">
            <Link
              href="/filing"
              className="flex items-center gap-3 rounded-lg bg-on-primary-container px-9 py-4 text-lg font-semibold text-on-primary-fixed shadow-lg shadow-on-primary-container/20 hover:opacity-90 transition-opacity"
            >
              Proceed to Filing
              <MatIcon name="arrow_forward" className="text-xl" />
            </Link>
          </div>
        </div>

        {/* Right: AI panel */}
        <div className="lg:col-span-4">
          <AiPanel
            title="Ledger AI"
            statusLabel="Calculation Complete"
            message={`Your optimised chargeable income is ${formatRM(optimized.chargeableIncome)}, resulting in ${formatRM(optimized.taxPayable)} tax payable — a saving of ${formatRM(savings)} compared to the standard calculation. Would you like to proceed to the Filing Assistant?`}
            chips={[
              { label: 'Proceed to Filing' },
              { label: 'Explain my tax bracket' },
              { label: 'Can I save more?' },
            ]}
            inputPlaceholder="Ask about your tax calculation..."
            className="sticky top-8"
          />
        </div>
      </div>
    </div>
  )
}
