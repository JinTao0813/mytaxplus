// ─── Shared domain types for MyTax+ ────────────────────────────────────────
// All monetary values are in Malaysian Ringgit (RM).

export type FilingStatus = 'not_started' | 'draft' | 'in_progress' | 'submitted'

export interface DashboardStatus {
  filingYear: number
  status: FilingStatus
  completionPercent: number
  estimatedRefund: number
  pendingAction: {
    title: string
    description: string
    actionLabel: string
    actionHref: string
  } | null
}

// ─── Module 1: Document Ingestion ───────────────────────────────────────────

export type DocumentStatus = 'uploading' | 'processing' | 'processed' | 'error'
export type DocumentCategory =
  | 'medical'
  | 'education'
  | 'lifestyle'
  | 'income'
  | 'other'

/** Row-level category for AI extractions (includes EA-specific buckets). */
export type ExtractionCategory = DocumentCategory | 'tax_paid' | 'epf' | 'socso'

export interface UploadedDocument {
  id: string
  name: string
  sizeKb: number
  uploadedAt: string
  status: DocumentStatus
  category: DocumentCategory | null
  /** When known (e.g. from register), used for receipt-specific UI. */
  documentType?: 'EA_FORM' | 'RECEIPT' | 'UNKNOWN'
  /** Server-side processing failure message when status is "error". */
  processingError?: string | null
  mappingStatusSummary?: ReceiptMappingStatus
}

/** GET /api/v1/documents/{id} — includes EA extracted metadata when present. */
export interface DocumentDetail extends UploadedDocument {
  documentType?: 'EA_FORM' | 'RECEIPT' | 'UNKNOWN'
  extractedMetadata?: Record<string, string>
}

export interface AiExtraction {
  documentId: string
  label: string
  category: ExtractionCategory
  amount: number
  confidence: number
  taxSection: string
  status: 'complete' | 'parsing'
  /** EA: Workbench field id when extracted via Custom Document Extractor. */
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

export interface AiExtractionWithId extends AiExtraction {
  id: string
}

export type ReceiptMappingStatus =
  | 'in_progress'
  | 'unmapped'
  | 'suggested'
  | 'needs_review'
  | 'confirmed'
  | 'gemini_error'

export interface ReceiptReliefSuggestionAlternative {
  reliefId: string
  confidence: number
  rationale?: string
}

// ─── Module 2: Tax Profile ───────────────────────────────────────────────────

export type IncomeType =
  | 'employment'
  | 'freelance'
  | 'rental'
  | 'dividend'
  | 'other'
export type ExpenseCategory =
  | 'medical'
  | 'education'
  | 'lifestyle'
  | 'epf'
  | 'parental'
  | 'other'

export interface IncomeItem {
  id: string
  type: IncomeType
  label: string
  amount: number
}

export interface ExpenseItem {
  id: string
  category: ExpenseCategory
  label: string
  amount: number
}

/** EA / payroll-sourced figures for the primary employment document (one YA). */
export interface TaxProfileStatutory {
  epf: number
  socso: number
  mtd: number
}

export interface TaxProfile {
  totalIncome: number
  totalDeductions: number
  incomeItems: IncomeItem[]
  expenses: {
    medical: ExpenseItem[]
    education: ExpenseItem[]
    lifestyle: ExpenseItem[]
    epf: ExpenseItem[]
    parental: ExpenseItem[]
  }
  /** EPF, SOCSO, MTD/PCB from EA (aligned with `EA_MONEY_FIELD_SPECS`). */
  statutory: TaxProfileStatutory
}

export interface TaxContextTrace {
  totalIncomeSourceIds: string[]
  statutorySourceIds: string[]
}

export interface TaxContextParameters {
  propertyPriceRm?: number
}

export interface TaxContext {
  year: number
  totalIncome: number
  incomeItems: IncomeItem[]
  statutory: TaxProfileStatutory
  parameters: TaxContextParameters
  trace: TaxContextTrace
  updatedAt: string
}

// ─── Module 3: Relief Detection ─────────────────────────────────────────────

export type ReliefStatus = 'claimed' | 'missed' | 'partial'

/** Bounding box on receipt preview, normalised 0–1 relative to image dimensions. */
export interface NormalizedRect {
  x: number
  y: number
  w: number
  h: number
}

export interface ReliefClaimHighlights {
  amount?: NormalizedRect
  date?: NormalizedRect
}

export interface ReliefClaimRecord {
  id: string
  date: string
  vendor: string
  amount: number
  documentId?: string
  previewUrl?: string
  highlights?: ReliefClaimHighlights
  /** Pool id for split limits (e.g. `epf` vs `life_takaful` for §17). */
  reliefBucket?: string
  /** Sub-cap id for capped-sum reliefs (e.g. `complete_medical_exam`). */
  subcapId?: string
}

export interface ReceiptReviewItem {
  extractionId: string
  documentId: string
  label: string
  vendor?: string
  date?: string
  amount: number
  confidence: number
  mappingStatus: ReceiptMappingStatus
  mappingErrorCode?: string | null
  suggestedReliefId?: string | null
  suggestionConfidence?: number | null
  suggestionRationale?: string | null
  suggestionAlternatives?: ReceiptReliefSuggestionAlternative[]
  reliefId?: string
  reliefBucket?: string
  subcapId?: string
}

/** Inline AI prompt scoped to one relief category (Accept / Ignore). */
export interface ReliefPendingNudge {
  id: string
  headline: string
  amount: number
  vendor?: string
  documentId?: string
}

export interface Relief {
  id: string
  name: string
  category: ExpenseCategory
  icon: string
  description: string
  claimedAmount: number
  maxAmount: number
  /** Human-readable limit from the rules engine (per-unit, tiered, subcaps). */
  limitDisplay?: string
  status: ReliefStatus
  taxSection: string
  suggestion?: string
  claims?: ReliefClaimRecord[]
  nudge?: ReliefPendingNudge
}

// ─── Module 4: Tax Summary ───────────────────────────────────────────────────

export interface TaxBracket {
  from: number
  to: number | null
  rate: number
}

export interface TaxCalculation {
  totalIncome: number
  totalDeductions: number
  chargeableIncome: number
  taxPayable: number
}

export interface TaxSummary {
  baseline: TaxCalculation
  optimized: TaxCalculation
  savings: number
}

// ─── Module 5: Filing Assistant ──────────────────────────────────────────────

export type FilingStepStatus =
  | 'complete'
  | 'in_progress'
  | 'pending'
  | 'missing'

export interface FilingStep {
  id: string
  step: number
  title: string
  description: string
  status: FilingStepStatus
  fields?: FilingField[]
}

export interface FilingField {
  id: string
  label: string
  value: string
  isMissing?: boolean
}

export interface FilingData {
  steps: FilingStep[]
  overallProgress: number
}

// ─── Module 6: AI Assistant ──────────────────────────────────────────────────

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export interface ChatContext {
  totalIncome: number
  totalDeductions: number
  topRelief: string
  estimatedSavings: number
}
