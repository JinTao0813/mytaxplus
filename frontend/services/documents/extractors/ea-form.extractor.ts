import {
  EA_METADATA_ENTITY_MAP,
  EA_MONEY_FIELD_SPECS,
} from './ea-form.schema'
import {
  findEntityConfidence,
  findEntityText,
  firstAmountInText,
  parseAmount,
} from './shared'
import type { ExtractionRow, ExtractorResult, NormalizedDocAi } from './types'

function extractMetadataFromEntities(
  input: NormalizedDocAi
): Record<string, string> {
  const meta: Record<string, string> = {}
  for (const { workbenchFieldId, storageKey } of EA_METADATA_ENTITY_MAP) {
    const typeAliases = [
      workbenchFieldId,
      workbenchFieldId.replace(/_/g, ' '),
    ]
    const t = findEntityText(input.entities, typeAliases)
    if (!t) continue
    let v = t.replace(/\s+/g, ' ').trim()
    if (storageKey === 'taxYear') {
      const y = v.match(/\b(20\d{2})\b/)
      if (y) v = y[1] ?? v
    }
    if (v) meta[storageKey] = v
  }
  if (!meta.taxYear) {
    const y = input.text.match(/\b(20\d{2})\b/g)
    if (y?.length) meta.taxYear = y[y.length - 1] ?? ''
  }
  return meta
}

function resolveMoneyAmount(
  input: NormalizedDocAi,
  workbenchFieldId: string
): { amount: number | null; confidence: number } {
  const typeAliases = [
    workbenchFieldId,
    workbenchFieldId.replace(/_/g, ' '),
  ]
  const mention = findEntityText(input.entities, typeAliases)
  if (mention) {
    const amount =
      firstAmountInText(mention) ?? parseAmount(mention)
    const conf =
      findEntityConfidence(input.entities, typeAliases) ?? 0.82
    if (amount != null && Number.isFinite(amount)) {
      return { amount, confidence: Number.isFinite(conf) ? conf : 0.82 }
    }
  }
  return { amount: null, confidence: 0 }
}

function buildRows(documentId: string, input: NormalizedDocAi): ExtractionRow[] {
  const rows: ExtractionRow[] = []
  for (const spec of EA_MONEY_FIELD_SPECS) {
    const { amount, confidence } = resolveMoneyAmount(
      input,
      spec.workbenchFieldId
    )
    if (amount == null || !Number.isFinite(amount)) continue
    rows.push({
      id: crypto.randomUUID(),
      documentId,
      label: spec.label,
      category: spec.category,
      amount,
      confidence,
      taxSection: 'EA',
      status: 'complete',
      sourceFieldId: spec.workbenchFieldId,
    })
  }
  return rows
}

export function extractEaForm(
  documentId: string,
  input: NormalizedDocAi
): ExtractorResult {
  const extractedMetadataRaw = extractMetadataFromEntities(input)
  const rows = buildRows(documentId, input)
  return {
    documentCategory: 'income',
    rows,
    extractedMetadata:
      Object.keys(extractedMetadataRaw).length > 0
        ? extractedMetadataRaw
        : undefined,
  }
}
