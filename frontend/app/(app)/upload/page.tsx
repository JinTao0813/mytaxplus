import type { AiExtraction, UploadedDocument } from '@/lib/types'
import { getDocuments, getAiExtractions } from '@/lib/services'
import { AiPanel } from '@/components/layout/ai-panel'
import { UploadDropZone } from './_components/upload-drop-zone'
import { CategoryGuide } from './_components/category-guide'

export default async function UploadPage() {
  const useMockServices = process.env.NEXT_PUBLIC_USE_MOCK !== 'false'
  const [docs, extractions]: [UploadedDocument[], AiExtraction[]] =
    await Promise.all([
      useMockServices
        ? getDocuments()
        : Promise.resolve([] as UploadedDocument[]),
      useMockServices
        ? getAiExtractions()
        : Promise.resolve([] as AiExtraction[]),
    ])

  const aiPanelExtractions = extractions.map((e) => ({
    id: e.documentId,
    category: e.category,
    label: e.label,
    amount: e.amount,
    confidence: e.confidence,
    taxSection: e.taxSection,
    status: e.status,
  }))

  return (
    <div className="min-h-screen bg-surface px-6 pb-24 pt-8 md:px-12 md:pb-12 md:pt-12">
      {/* Header */}
      <header className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight text-on-surface">
          Document Ingestion
        </h1>
        <p className="mt-2 max-w-2xl text-base leading-relaxed text-on-surface-variant">
          Securely upload your EA forms, receipts, and supporting documents. Our
          AI ledger will automatically extract and categorise relevant financial
          markers.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-12">
        {/* Left: Upload + Recent */}
        <div className="flex flex-col gap-6 xl:col-span-8">
          <UploadDropZone initialDocs={docs} />
          <CategoryGuide />
        </div>

        {/* Right: AI Ledger panel */}
        <div className="xl:col-span-4">
          <AiPanel
            title="AI Ledger Analysis"
            statusLabel="Analysing Documents"
            message="I am actively categorising your uploads against the current Malaysian tax year framework. Your uploaded EA form shows eligible deductions. Need to clarify a receipt?"
            chips={[
              { label: 'What is Section 46?' },
              { label: 'Add medical expense' },
            ]}
            inputPlaceholder="Ask about a specific document..."
            analysisItems={aiPanelExtractions}
            className="sticky top-8"
          />
        </div>
      </div>
    </div>
  )
}
