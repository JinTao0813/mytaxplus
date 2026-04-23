import type { DocumentTypeDb } from '@/dal/documents'

import { extractEaForm } from './ea-form.extractor'
import { extractReceipt } from './receipt.extractor'
import { normalizeDocAi } from './shared'
import type { ExtractorResult } from './types'

/**
 * Run the appropriate extractor for a document type.
 */
export function extractDocument(
  documentType: DocumentTypeDb,
  documentId: string,
  rawJson: Record<string, unknown>
): ExtractorResult {
  const input = normalizeDocAi(rawJson)
  if (documentType === 'EA_FORM') {
    return extractEaForm(documentId, input)
  }
  if (documentType === 'RECEIPT') {
    return extractReceipt(documentId, input)
  }
  return { documentCategory: 'other', rows: [] }
}
