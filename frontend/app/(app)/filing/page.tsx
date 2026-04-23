import Link from 'next/link'

import { getFilingData } from '@/lib/api'
import { cookieHeaderFromRequest } from '@/lib/api/server-cookies'
import { FilingProgressBar } from './_components/filing-progress-bar'
import { StepAccordion } from './_components/step-accordion'
import { ExportActions } from './_components/export-actions'

export default async function FilingPage() {
  const cookieHeader = await cookieHeaderFromRequest()
  const filingData = await getFilingData({ cookieHeader })

  const missingCount = filingData.steps
    .flatMap((s) => s.fields ?? [])
    .filter((f) => f.isMissing).length

  return (
    <div className="min-h-screen bg-surface px-6 pb-24 pt-8 md:px-12 md:pb-12 md:pt-12">
      {/* Header */}
      <header className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight text-on-surface">
          Filing Assistant
        </h1>
        <p className="mt-2 max-w-xl text-base leading-relaxed text-on-surface-variant">
          Step-by-step pre-filled simulation of your e-Filing submission. Review
          each section and highlight any missing information before submitting
          to LHDN.
        </p>
      </header>

      <div className="flex flex-col gap-6">
        <p className="text-sm text-on-surface-variant">
          Stuck on a step?{' '}
          <Link href="/chat" className="font-semibold text-secondary underline">
            Ask AI Assistant
          </Link>
        </p>
        <FilingProgressBar
          progress={filingData.overallProgress}
          missingCount={missingCount}
        />
        <StepAccordion steps={filingData.steps} />
        <ExportActions />
      </div>
    </div>
  )
}
