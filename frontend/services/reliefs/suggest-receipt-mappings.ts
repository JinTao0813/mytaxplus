import 'server-only'

import { z } from 'zod'

import { upsertExtraction } from '@/dal/documents'
import type {
  ReceiptReliefSuggestionAlternative,
  ReceiptMappingStatus,
} from '@/services/documents/extractors/types'
import { getReliefRulesByYear } from '@/lib/reliefs/registry'

const GeminiSuggestionSchema = z.object({
  bestReliefId: z.string().nullable(),
  confidence: z.number().min(0).max(1).nullable().optional(),
  rationale: z.string().optional(),
  alternatives: z
    .array(
      z.object({
        reliefId: z.string(),
        confidence: z.number().min(0).max(1),
        rationale: z.string().optional(),
      })
    )
    .optional(),
  reliefBucket: z.string().optional(),
  subcapId: z.string().optional(),
})

type ReceiptExtractionInput = {
  id: string
  label: string
  amount: number
  confidence?: number
  vendor?: string
  date?: string
}

type SuggestionPatch = {
  suggestedReliefId: string | null
  suggestionConfidence: number | null
  suggestionRationale: string | null
  suggestionAlternatives: ReceiptReliefSuggestionAlternative[]
  mappingStatus: ReceiptMappingStatus
  mappingErrorCode: string | null
  reliefBucket?: string | null
  subcapId?: string | null
}

function geminiApiKey(): string {
  return process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || ''
}

function geminiModel(): string {
  return process.env.GEMINI_MODEL || 'gemini-2.5-flash'
}

function buildPrompt(params: {
  year: number
  row: ReceiptExtractionInput
}): string {
  const allowedReliefs = getReliefRulesByYear(params.year).map((rule) => ({
    reliefId: rule.id,
    title: rule.name,
    description: rule.description,
    category: rule.category,
  }))

  return [
    'You classify a Malaysian tax receipt into a closed set of relief categories.',
    'Return JSON only.',
    'Rules:',
    '- bestReliefId must be null or one of the provided reliefId values.',
    '- If uncertain, use bestReliefId null and provide alternatives.',
    '- Do not invent relief ids or legal rules.',
    '',
    `Year of assessment: ${params.year}`,
    `Receipt label: ${params.row.label}`,
    `Vendor: ${params.row.vendor ?? ''}`,
    `Date: ${params.row.date ?? ''}`,
    `Amount RM: ${params.row.amount}`,
    '',
    `Allowed reliefs JSON: ${JSON.stringify(allowedReliefs)}`,
    '',
    'JSON shape:',
    JSON.stringify({
      bestReliefId: 'string | null',
      confidence: 'number 0..1',
      rationale: 'string',
      alternatives: [
        {
          reliefId: 'string',
          confidence: 'number 0..1',
          rationale: 'string',
        },
      ],
      reliefBucket: 'string optional',
      subcapId: 'string optional',
    }),
  ].join('\n')
}

async function classifyReceiptWithGemini(params: {
  year: number
  row: ReceiptExtractionInput
}): Promise<z.infer<typeof GeminiSuggestionSchema>> {
  const apiKey = geminiApiKey()
  if (!apiKey) {
    throw new Error('gemini_not_configured')
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel()}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: buildPrompt(params) }],
          },
        ],
        generationConfig: {
          temperature: 0.1,
          responseMimeType: 'application/json',
        },
      }),
    }
  )

  if (!response.ok) {
    throw new Error(`gemini_http_${response.status}`)
  }

  const payload = (await response.json()) as {
    candidates?: Array<{
      content?: { parts?: Array<{ text?: string }> }
    }>
  }
  const text =
    payload.candidates?.[0]?.content?.parts
      ?.map((part) => part.text || '')
      .join('')
      .trim() || ''

  if (!text) {
    throw new Error('gemini_empty_response')
  }

  let rawJson: unknown
  try {
    rawJson = JSON.parse(text)
  } catch {
    throw new Error('gemini_invalid_response')
  }

  const parsed = GeminiSuggestionSchema.safeParse(rawJson)
  if (!parsed.success) {
    throw new Error('gemini_invalid_response')
  }

  const allowedIds = new Set(getReliefRulesByYear(params.year).map((rule) => rule.id))
  if (
    parsed.data.bestReliefId !== null &&
    !allowedIds.has(parsed.data.bestReliefId)
  ) {
    throw new Error('gemini_invalid_response')
  }
  for (const alternative of parsed.data.alternatives ?? []) {
    if (!allowedIds.has(alternative.reliefId)) {
      throw new Error('gemini_invalid_response')
    }
  }

  return parsed.data
}

function toErrorPatch(errorCode: string): SuggestionPatch {
  return {
    suggestedReliefId: null,
    suggestionConfidence: null,
    suggestionRationale: null,
    suggestionAlternatives: [],
    mappingStatus:
      errorCode === 'gemini_not_configured' ? 'needs_review' : 'gemini_error',
    mappingErrorCode: errorCode,
    reliefBucket: null,
    subcapId: null,
  }
}

function toSuggestionPatch(
  suggestion: z.infer<typeof GeminiSuggestionSchema>
): SuggestionPatch {
  const alternatives = suggestion.alternatives ?? []
  const mappingStatus: ReceiptMappingStatus =
    suggestion.bestReliefId === null ? 'needs_review' : 'suggested'

  return {
    suggestedReliefId: suggestion.bestReliefId,
    suggestionConfidence: suggestion.confidence ?? null,
    suggestionRationale: suggestion.rationale ?? null,
    suggestionAlternatives: alternatives,
    mappingStatus,
    mappingErrorCode: null,
    reliefBucket: suggestion.reliefBucket ?? null,
    subcapId: suggestion.subcapId ?? null,
  }
}

export function summarizeDocumentMappingStatus(
  rows: Array<{ mappingStatus?: ReceiptMappingStatus }>
): ReceiptMappingStatus | null {
  const statuses = rows
    .map((row) => row.mappingStatus)
    .filter((value): value is ReceiptMappingStatus => Boolean(value))
  if (statuses.length === 0) return null
  if (statuses.some((status) => status === 'gemini_error')) return 'gemini_error'
  if (statuses.some((status) => status === 'needs_review')) return 'needs_review'
  if (statuses.some((status) => status === 'suggested')) return 'suggested'
  if (statuses.some((status) => status === 'in_progress')) return 'in_progress'
  if (statuses.every((status) => status === 'confirmed')) return 'confirmed'
  return statuses[0] ?? null
}

export async function suggestReceiptReliefMappings(params: {
  uid: string
  documentId: string
  year?: number
  rows: ReceiptExtractionInput[]
}): Promise<Array<ReceiptExtractionInput & SuggestionPatch>> {
  const year = params.year ?? 2025
  const out: Array<ReceiptExtractionInput & SuggestionPatch> = []

  for (const row of params.rows) {
    let patch: SuggestionPatch
    try {
      const suggestion = await classifyReceiptWithGemini({
        year,
        row,
      })
      patch = toSuggestionPatch(suggestion)
    } catch (error) {
      const code =
        error instanceof Error && error.message ? error.message : 'gemini_error'
      patch = toErrorPatch(code)
    }

    await upsertExtraction({
      uid: params.uid,
      documentId: params.documentId,
      extractionId: row.id,
      payload: patch,
    })

    out.push({ ...row, ...patch })
  }

  return out
}
