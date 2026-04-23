import Link from 'next/link'

import { cookieHeaderFromRequest } from '@/lib/api/server-cookies'
import { getDocument, getDocumentExtractions } from '@/lib/api/documents'
import { DocumentMetadata } from './_components/document-metadata'
import { ExtractionReview } from './_components/extraction-review'

interface Props {
  params: Promise<{ documentId: string }>
}

export default async function DocumentReviewPage({ params }: Props) {
  const { documentId } = await params
  const cookieHeader = await cookieHeaderFromRequest()
  const ctx = { cookieHeader }

  const [doc, rows] = await Promise.all([
    getDocument({ documentId, ctx }),
    getDocumentExtractions({ documentId, ctx }),
  ])

  return (
    <div className="min-h-screen bg-surface px-6 pb-24 pt-8 md:px-12 md:pb-12 md:pt-12">
      <header className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight text-on-surface">
          Review Extraction
        </h1>
        <p className="mt-2 max-w-2xl text-base leading-relaxed text-on-surface-variant">
          Verify and edit extracted values before confirming them for your tax
          profile.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-8">
        <div className="max-w-4xl">
          {doc.documentType === 'RECEIPT' ? (
            <div className="mb-6 rounded-xl border border-outline-variant/30 bg-surface-container-low p-4">
              <p className="text-sm font-semibold text-on-surface">
                Receipt relief mapping
              </p>
              <p className="mt-1 text-xs leading-relaxed text-on-surface-variant">
                Relief claims are created only after you confirm a mapping in the
                review queue. Edit vendor, date, and amount here first if needed.
              </p>
              <Link
                href="/receipts/review"
                className="mt-3 inline-flex text-sm font-semibold text-secondary underline"
              >
                Open receipt mapping queue
              </Link>
            </div>
          ) : null}
          {doc.extractedMetadata && Object.keys(doc.extractedMetadata).length > 0 ? (
            <DocumentMetadata metadata={doc.extractedMetadata} />
          ) : null}
          <ExtractionReview documentId={documentId} initialRows={rows} />
        </div>
      </div>
    </div>
  )
}

