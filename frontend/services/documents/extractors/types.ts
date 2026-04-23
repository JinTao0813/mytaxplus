/** Categories stored on extraction rows (expanded for EA + receipts). */
export type ExtractionCategory =
  | 'income'
  | 'tax_paid'
  | 'epf'
  | 'socso'
  | 'medical'
  | 'education'
  | 'lifestyle'
  | 'other'

export type ExtractionStatus = 'complete' | 'parsing'

export type ReceiptMappingStatus =
  | 'in_progress'
  | 'unmapped'
  | 'suggested'
  | 'needs_review'
  | 'confirmed'
  | 'gemini_error'

export type ReceiptReliefSuggestionAlternative = {
  reliefId: string
  confidence: number
  rationale?: string
}

export type ExtractionRowPayload = {
  documentId: string
  label: string
  category: ExtractionCategory
  amount: number
  confidence: number
  taxSection: string
  status: ExtractionStatus
  /** EA: Workbench field id — used for profile aggregation (e.g. income total vs line items). */
  sourceFieldId?: string
  vendor?: string
  date?: string
  /** Final YA relief rule id after user confirm or auto-accept policy. */
  reliefId?: string
  suggestedReliefId?: string | null
  suggestionConfidence?: number | null
  suggestionRationale?: string | null
  suggestionAlternatives?: ReceiptReliefSuggestionAlternative[]
  mappingStatus?: ReceiptMappingStatus
  mappingErrorCode?: string | null
  reliefBucket?: string
  subcapId?: string
}

export type ExtractionRow = ExtractionRowPayload & { id: string }

/** Normalized Document AI payload (stable shape for extractors). */
export type NormalizedDocAi = {
  text: string
  entities: Array<{
    type?: string | null
    mentionText?: string | null
    confidence?: number | null
  }>
  kvPairs: Array<{
    key: string
    value: string
    confidence?: number
  }>
}

export type ExtractorResult = {
  /** Document-level category for the parent document (e.g. income, medical). */
  documentCategory: string
  rows: ExtractionRow[]
  /** Non-money fields (EA): stored on document as extractedMetadata. */
  extractedMetadata?: Record<string, string>
}
