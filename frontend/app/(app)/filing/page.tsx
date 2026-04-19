import { getFilingData } from '@/lib/services'
import { AiPanel } from '@/components/layout/ai-panel'
import { FilingProgressBar } from './_components/filing-progress-bar'
import { StepAccordion } from './_components/step-accordion'
import { ExportActions } from './_components/export-actions'

export default async function FilingPage() {
  const filingData = await getFilingData()

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

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left: checklist */}
        <div className="flex flex-col gap-6 lg:col-span-8">
          <FilingProgressBar
            progress={filingData.overallProgress}
            missingCount={missingCount}
          />
          <StepAccordion steps={filingData.steps} />
          <ExportActions />
        </div>

        {/* Right: AI panel */}
        <div className="lg:col-span-4">
          <AiPanel
            title="Filing Assistant AI"
            statusLabel="Reviewing Your Filing"
            message={`Your filing is ${filingData.overallProgress}% complete. ${
              missingCount > 0
                ? `There ${missingCount === 1 ? 'is 1 missing field' : `are ${missingCount} missing fields`} that need your attention — especially the Parental Care relief which requires supporting documentation.`
                : 'All required fields are complete. You are ready to export and submit.'
            }`}
            chips={[
              { label: 'What docs are needed?' },
              { label: 'Parental Care help' },
              { label: 'How to submit LHDN?' },
            ]}
            inputPlaceholder="Ask about your filing..."
            className="sticky top-8"
          />
        </div>
      </div>
    </div>
  )
}
