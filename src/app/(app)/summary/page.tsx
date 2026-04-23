import Link from 'next/link'
import { getTaxSummary } from '@/lib/api'
import { cookieHeaderFromRequest } from '@/lib/api/server-cookies'
import { MatIcon } from '@/components/ui/mat-icon'
import { SavingsHero } from './_components/savings-hero'
import { CalcPanel } from './_components/calc-panel'
import { DeductionsBreakdown } from './_components/deductions-breakdown'

export default async function SummaryPage() {
  const cookieHeader = await cookieHeaderFromRequest()
  const { baseline, optimized, savings } = await getTaxSummary({
    cookieHeader,
  })

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

      <div className="flex flex-col gap-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-on-surface-variant">
            Questions?{' '}
            <Link href="/chat" className="font-semibold text-secondary underline">
              Ask in AI Assistant
            </Link>
          </p>
        </div>
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
    </div>
  )
}
