import 'server-only'

import type { IncomeItem, TaxContext } from '@/lib/types'
import { listDocuments, listExtractions } from '@/dal/documents'
import { saveTaxContextSnapshot } from '@/dal/tax-context'
import {
  EA_WORKBENCH_INCOME_TOTAL_ID,
  EA_WORKBENCH_MTD_FIELD_ID,
} from '@/services/documents/extractors/ea-form.schema'

function emptyStatutory(): TaxContext['statutory'] {
  return { epf: 0, socso: 0, mtd: 0 }
}

function rowTimestampMs(row: Record<string, unknown>): number {
  const value = row.updatedAt ?? row.createdAt
  if (
    value &&
    typeof value === 'object' &&
    'toDate' in value &&
    typeof (value as { toDate: () => Date }).toDate === 'function'
  ) {
    return (value as { toDate: () => Date }).toDate().getTime()
  }
  if (typeof value === 'string') {
    const parsed = Date.parse(value)
    return Number.isNaN(parsed) ? 0 : parsed
  }
  return 0
}

function pickPrimaryEaDocumentId(rows: Array<Record<string, unknown>>): string | null {
  const incomeTotalRows = rows
    .filter(
      (row) =>
        String(row.category || '') === 'income' &&
        String(row.sourceFieldId || '') === EA_WORKBENCH_INCOME_TOTAL_ID &&
        Number(row.amount || 0) > 0
    )
    .sort((a, b) => rowTimestampMs(b) - rowTimestampMs(a))
  if (incomeTotalRows.length > 0) {
    return String(incomeTotalRows[0]?.documentId || '') || null
  }

  const epfRows = rows
    .filter(
      (row) =>
        String(row.category || '') === 'epf' && Number(row.amount || 0) > 0
    )
    .sort((a, b) => rowTimestampMs(b) - rowTimestampMs(a))
  if (epfRows.length > 0) {
    return String(epfRows[0]?.documentId || '') || null
  }
  return null
}

function buildIncomeItems(rows: Array<Record<string, unknown>>): {
  incomeItems: IncomeItem[]
  sourceIds: string[]
} {
  const rowsByDocument = new Map<string, Array<Record<string, unknown>>>()
  for (const row of rows) {
    const documentId = String(row.documentId || '')
    const key = documentId || '_'
    if (!rowsByDocument.has(key)) rowsByDocument.set(key, [])
    rowsByDocument.get(key)?.push(row)
  }

  const incomeItems: IncomeItem[] = []
  const sourceIds: string[] = []
  for (const [, docRows] of rowsByDocument) {
    const incomeRows = docRows.filter(
      (row) => String(row.category || '') === 'income'
    )
    const totalRow = incomeRows.find(
      (row) =>
        String(row.sourceFieldId || '') === EA_WORKBENCH_INCOME_TOTAL_ID &&
        Number(row.amount || 0) > 0
    )

    if (totalRow) {
      incomeItems.push({
        id: String(totalRow.id || crypto.randomUUID()),
        type: 'employment',
        label: String(totalRow.label || 'Total employment income'),
        amount: Number(totalRow.amount || 0),
      })
      sourceIds.push(String(totalRow.id || ''))
      continue
    }

    for (const row of incomeRows) {
      const amount = Number(row.amount || 0)
      if (!Number.isFinite(amount) || amount <= 0) continue
      incomeItems.push({
        id: String(row.id || crypto.randomUUID()),
        type: 'employment',
        label: String(row.label || 'Income'),
        amount,
      })
      sourceIds.push(String(row.id || ''))
    }
  }

  return {
    incomeItems,
    sourceIds: sourceIds.filter((id) => id.length > 0),
  }
}

function buildStatutory(
  rows: Array<Record<string, unknown>>,
  documentId: string | null
): { statutory: TaxContext['statutory']; sourceIds: string[] } {
  const statutory = emptyStatutory()
  const sourceIds: string[] = []

  for (const row of rows) {
    const rowDocumentId = String(row.documentId || '')
    if (documentId !== null && rowDocumentId !== documentId) continue

    const amount = Number(row.amount || 0)
    if (!Number.isFinite(amount) || amount <= 0) continue

    const category = String(row.category || '')
    if (category === 'epf') {
      statutory.epf += amount
      sourceIds.push(String(row.id || ''))
      continue
    }
    if (category === 'socso') {
      statutory.socso += amount
      sourceIds.push(String(row.id || ''))
      continue
    }
    if (
      category === 'tax_paid' &&
      String(row.sourceFieldId || '') === EA_WORKBENCH_MTD_FIELD_ID
    ) {
      statutory.mtd += amount
      sourceIds.push(String(row.id || ''))
    }
  }

  return {
    statutory,
    sourceIds: sourceIds.filter((id) => id.length > 0),
  }
}

export async function getTaxContext(params: {
  uid: string
  year?: number
  propertyPriceRm?: number
}): Promise<TaxContext> {
  const year = params.year ?? 2025
  const [documents, rows] = await Promise.all([
    listDocuments({ uid: params.uid, limit: 50 }),
    listExtractions({ uid: params.uid, limit: 500 }),
  ])

  const relevantRows = rows.filter((row) => {
    const documentId = String(row.documentId || '')
    if (!documentId) return false
    return documents.some((document) => String(document.id || '') === documentId)
  })

  const { incomeItems, sourceIds: totalIncomeSourceIds } =
    buildIncomeItems(relevantRows)
  const primaryEaDocumentId = pickPrimaryEaDocumentId(relevantRows)
  const { statutory, sourceIds: statutorySourceIds } = buildStatutory(
    relevantRows,
    primaryEaDocumentId
  )
  const totalIncome = incomeItems.reduce((sum, item) => sum + item.amount, 0)

  const snapshot: TaxContext = {
    year,
    totalIncome,
    incomeItems,
    statutory,
    parameters:
      params.propertyPriceRm != null
        ? { propertyPriceRm: params.propertyPriceRm }
        : {},
    trace: {
      totalIncomeSourceIds,
      statutorySourceIds,
    },
    updatedAt: new Date().toISOString(),
  }

  await saveTaxContextSnapshot({
    uid: params.uid,
    year,
    totalIncome: snapshot.totalIncome,
    incomeItems: snapshot.incomeItems,
    statutory: snapshot.statutory,
    parameters: snapshot.parameters,
    trace: snapshot.trace,
    updatedAt: snapshot.updatedAt,
  })

  return snapshot
}
