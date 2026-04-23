import { z } from 'zod'

/** GET /health */
export const healthResponseSchema = z.object({
  status: z.string(),
})

const filingStatusSchema = z.enum([
  'not_started',
  'draft',
  'in_progress',
  'submitted',
])

const pendingActionSchema = z.object({
  title: z.string(),
  description: z.string(),
  actionLabel: z.string(),
  actionHref: z.string(),
})

/** GET /api/v1/dashboard */
export const dashboardStatusSchema = z.object({
  filingYear: z.number(),
  status: filingStatusSchema,
  completionPercent: z.number(),
  estimatedRefund: z.number(),
  pendingAction: pendingActionSchema.nullable(),
})

const documentStatusSchema = z.enum([
  'uploading',
  'processing',
  'processed',
  'error',
])

const receiptMappingStatusSchema = z.enum([
  'in_progress',
  'unmapped',
  'suggested',
  'needs_review',
  'confirmed',
  'gemini_error',
])

const documentCategorySchema = z.enum([
  'medical',
  'education',
  'lifestyle',
  'income',
  'other',
])

/** Extraction row categories (documents list `category` stays `documentCategorySchema`). */
export const extractionCategorySchema = z.enum([
  'medical',
  'education',
  'lifestyle',
  'income',
  'other',
  'tax_paid',
  'epf',
  'socso',
])

/** Document list / register / upload responses */
export const uploadedDocumentSchema = z.object({
  id: z.string(),
  name: z.string(),
  sizeKb: z.number(),
  uploadedAt: z.string(),
  status: documentStatusSchema,
  category: documentCategorySchema.nullable(),
  documentType: z.enum(['EA_FORM', 'RECEIPT', 'UNKNOWN']).optional(),
  processingError: z.string().nullable().optional(),
  mappingStatusSummary: receiptMappingStatusSchema.optional(),
})

export const uploadedDocumentListSchema = z.array(uploadedDocumentSchema)

/** GET /api/v1/documents/{documentId} */
export const documentDetailSchema = uploadedDocumentSchema.extend({
  documentType: z.enum(['EA_FORM', 'RECEIPT', 'UNKNOWN']).optional(),
  extractedMetadata: z.record(z.string(), z.string()).optional(),
})

/** GET /api/v1/documents/{documentId}/docai-json — normalized Document AI JSON from Storage */
export const documentDocAiJsonSchema = z.record(z.string(), z.unknown())

const suggestionAlternativeSchema = z.object({
  reliefId: z.string(),
  confidence: z.number(),
  rationale: z.string().optional(),
})

export const aiExtractionSchema = z.object({
  documentId: z.string(),
  label: z.string(),
  category: extractionCategorySchema,
  amount: z.number(),
  confidence: z.number(),
  taxSection: z.string(),
  status: z.enum(['complete', 'parsing']),
  sourceFieldId: z.string().optional(),
  vendor: z.string().optional(),
  date: z.string().optional(),
  reliefId: z.string().optional(),
  suggestedReliefId: z.string().nullable().optional(),
  suggestionConfidence: z.number().nullable().optional(),
  suggestionRationale: z.string().nullable().optional(),
  suggestionAlternatives: z.array(suggestionAlternativeSchema).optional(),
  mappingStatus: receiptMappingStatusSchema.optional(),
  mappingErrorCode: z.string().nullable().optional(),
  reliefBucket: z.string().optional(),
  subcapId: z.string().optional(),
})

export const aiExtractionListSchema = z.array(aiExtractionSchema)

/** GET /api/v1/documents/{documentId}/extractions (includes extraction row id) */
export const aiExtractionWithIdSchema = aiExtractionSchema.extend({
  id: z.string(),
})

export const aiExtractionWithIdListSchema = z.array(aiExtractionWithIdSchema)

const incomeTypeSchema = z.enum([
  'employment',
  'freelance',
  'rental',
  'dividend',
  'other',
])

const expenseCategorySchema = z.enum([
  'medical',
  'education',
  'lifestyle',
  'epf',
  'parental',
  'other',
])

const incomeItemSchema = z.object({
  id: z.string(),
  type: incomeTypeSchema,
  label: z.string(),
  amount: z.number(),
})

const expenseItemSchema = z.object({
  id: z.string(),
  category: expenseCategorySchema,
  label: z.string(),
  amount: z.number(),
})

const taxProfileStatutorySchema = z.object({
  epf: z.number(),
  socso: z.number(),
  mtd: z.number(),
})

/** GET/PUT /api/v1/profile */
export const taxProfileSchema = z.object({
  totalIncome: z.number(),
  totalDeductions: z.number(),
  incomeItems: z.array(incomeItemSchema),
  expenses: z.object({
    medical: z.array(expenseItemSchema),
    education: z.array(expenseItemSchema),
    lifestyle: z.array(expenseItemSchema),
    epf: z.array(expenseItemSchema),
    parental: z.array(expenseItemSchema),
  }),
  statutory: taxProfileStatutorySchema.default({ epf: 0, socso: 0, mtd: 0 }),
})

export const taxContextSchema = z.object({
  year: z.number().int(),
  totalIncome: z.number(),
  incomeItems: z.array(incomeItemSchema),
  statutory: taxProfileStatutorySchema,
  parameters: z.object({
    propertyPriceRm: z.number().optional(),
  }),
  trace: z.object({
    totalIncomeSourceIds: z.array(z.string()),
    statutorySourceIds: z.array(z.string()),
  }),
  updatedAt: z.string(),
})

export const receiptReviewItemSchema = z.object({
  extractionId: z.string(),
  documentId: z.string(),
  label: z.string(),
  vendor: z.string().optional(),
  date: z.string().optional(),
  amount: z.number(),
  confidence: z.number(),
  mappingStatus: receiptMappingStatusSchema,
  mappingErrorCode: z.string().nullable().optional(),
  suggestedReliefId: z.string().nullable().optional(),
  suggestionConfidence: z.number().nullable().optional(),
  suggestionRationale: z.string().nullable().optional(),
  suggestionAlternatives: z.array(suggestionAlternativeSchema).optional(),
  reliefId: z.string().optional(),
  reliefBucket: z.string().optional(),
  subcapId: z.string().optional(),
})

export const receiptReviewListSchema = z.array(receiptReviewItemSchema)

const reliefStatusSchema = z.enum(['claimed', 'missed', 'partial'])

const normalizedRectSchema = z.object({
  x: z.number(),
  y: z.number(),
  w: z.number(),
  h: z.number(),
})

export const reliefClaimHighlightsSchema = z.object({
  amount: normalizedRectSchema.optional(),
  date: normalizedRectSchema.optional(),
})

export const reliefClaimRecordSchema = z.object({
  id: z.string(),
  date: z.string(),
  vendor: z.string(),
  amount: z.number(),
  documentId: z.string().optional(),
  previewUrl: z.string().optional(),
  highlights: reliefClaimHighlightsSchema.optional(),
  reliefBucket: z.string().optional(),
  subcapId: z.string().optional(),
})

const reliefPendingNudgeSchema = z.object({
  id: z.string(),
  headline: z.string(),
  amount: z.number(),
  vendor: z.string().optional(),
  documentId: z.string().optional(),
})

export const reliefSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: expenseCategorySchema,
  icon: z.string(),
  description: z.string(),
  claimedAmount: z.number(),
  maxAmount: z.number(),
  limitDisplay: z.string().optional(),
  status: reliefStatusSchema,
  taxSection: z.string(),
  suggestion: z.string().optional(),
  claims: z.array(reliefClaimRecordSchema).optional(),
  nudge: reliefPendingNudgeSchema.optional(),
})

export const reliefListSchema = z.array(reliefSchema)

export const createReliefClaimResponseSchema = z.object({
  claimId: z.string(),
})

export const okResponseSchema = z.object({
  ok: z.boolean(),
})

/** GET /api/v1/reliefs/rules — structured relief catalog for a YA (dropdowns / prompts). */
export const reliefRuleApiSchema = z.object({
  id: z.string(),
  year: z.number(),
  docSection: z.string(),
  name: z.string(),
  description: z.string(),
  limit: z.unknown(),
  category: expenseCategorySchema,
  icon: z.string(),
  taxSectionHint: z.string(),
})

export const reliefRulesListSchema = z.array(reliefRuleApiSchema)

const taxCalculationSchema = z.object({
  totalIncome: z.number(),
  totalDeductions: z.number(),
  chargeableIncome: z.number(),
  taxPayable: z.number(),
})

/** GET /api/v1/summary */
export const taxSummarySchema = z.object({
  baseline: taxCalculationSchema,
  optimized: taxCalculationSchema,
  savings: z.number(),
})

const filingStepStatusSchema = z.enum([
  'complete',
  'in_progress',
  'pending',
  'missing',
])

const filingFieldSchema = z.object({
  id: z.string(),
  label: z.string(),
  value: z.string(),
  isMissing: z.boolean().optional(),
})

const filingStepSchema = z.object({
  id: z.string(),
  step: z.number(),
  title: z.string(),
  description: z.string(),
  status: filingStepStatusSchema,
  fields: z.array(filingFieldSchema).optional(),
})

/** GET /api/v1/filing */
export const filingDataSchema = z.object({
  steps: z.array(filingStepSchema),
  overallProgress: z.number(),
})

export const chatMessageSchema = z.object({
  id: z.string(),
  role: z.enum(['user', 'assistant']),
  content: z.string(),
  timestamp: z.string(),
})

export const chatMessageListSchema = z.array(chatMessageSchema)

/** GET /api/v1/chat/context */
export const chatContextSchema = z.object({
  totalIncome: z.number(),
  totalDeductions: z.number(),
  topRelief: z.string(),
  estimatedSavings: z.number(),
})
