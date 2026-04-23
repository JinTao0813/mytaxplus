import {
  findEntityConfidence,
  findEntityText,
  parseAmount,
  parseDateValue,
} from './shared'
import {
  RECEIPT_ENTITY_DATE,
  RECEIPT_ENTITY_TOTAL,
  RECEIPT_ENTITY_VENDOR,
} from './receipt.schema'
import type { ExtractionRow, ExtractorResult, NormalizedDocAi } from './types'

type ReceiptFields = {
  vendor: string | null
  date: string | null
  total: number | null
  confidence: number | null
}

function extractReceiptFields(input: NormalizedDocAi): ReceiptFields {
  const entities = input.entities
  const vendor = findEntityText(entities, [...RECEIPT_ENTITY_VENDOR])
  const date = parseDateValue(findEntityText(entities, [...RECEIPT_ENTITY_DATE]))
  const total = parseAmount(findEntityText(entities, [...RECEIPT_ENTITY_TOTAL]))
  const confidence = findEntityConfidence(entities, ['total_amount', 'total'])
  return { vendor, date, total, confidence }
}

function receiptRows(
  documentId: string,
  receipt: ReceiptFields
): ExtractionRow[] {
  if (receipt.total === null) return []
  return [
    {
      id: crypto.randomUUID(),
      documentId,
      label: receipt.vendor || 'Receipt',
      category: 'other',
      amount: receipt.total,
      confidence: receipt.confidence ?? 0.7,
      taxSection: 'Receipt',
      status: 'complete',
      ...(receipt.vendor ? { vendor: receipt.vendor } : {}),
      ...(receipt.date ? { date: receipt.date } : {}),
      mappingStatus: 'in_progress',
    },
  ]
}

export function extractReceipt(
  documentId: string,
  input: NormalizedDocAi
): ExtractorResult {
  const receipt = extractReceiptFields(input)
  const rows = receiptRows(documentId, receipt)
  const documentCategory = 'other'
  return { documentCategory, rows }
}
