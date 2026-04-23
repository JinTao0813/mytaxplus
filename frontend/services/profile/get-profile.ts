import 'server-only'

import type { TaxProfile, TaxProfileStatutory } from '@/lib/types'
import { listDocuments, listExtractions } from '@/dal/documents'
import { getStoredProfile } from '@/dal/profile'
import {
  EA_WORKBENCH_INCOME_TOTAL_ID,
  EA_WORKBENCH_MTD_FIELD_ID,
} from '@/services/documents/extractors/ea-form.schema'

export async function getProfile(uid: string): Promise<TaxProfile> {
  const saved = await getStoredProfile(uid)
  if (saved) return normalizeProfile(saved)

  const [documents, extractions] = await Promise.all([
    listDocuments({ uid, limit: 50 }),
    listExtractions({ uid, limit: 500 }),
  ])
  const orderedDocIds = documents
    .map((d) => String(d.id || ''))
    .filter((id) => id.length > 0)

  return buildProfileFromExtractions(extractions, orderedDocIds)
}

function emptyStatutory(): TaxProfileStatutory {
  return { epf: 0, socso: 0, mtd: 0 }
}

/** Prefer the EA document that has Section B+C total income, else newest doc with EPF rows. */
function pickEaDocumentId(
  rows: Array<Record<string, unknown>>,
  orderedDocIds: string[]
): string | null {
  const withSectionTotal = new Set<string>()
  for (const row of rows) {
    if (String(row.category || '') !== 'income') continue
    if (String(row.sourceFieldId || '') !== EA_WORKBENCH_INCOME_TOTAL_ID)
      continue
    if (Number(row.amount || 0) <= 0) continue
    const did = String(row.documentId || '')
    if (did) withSectionTotal.add(did)
  }
  for (const id of orderedDocIds) {
    if (withSectionTotal.has(id)) return id
  }
  if (withSectionTotal.size === 1) {
    return [...withSectionTotal][0] ?? null
  }

  const withEpf = new Set<string>()
  for (const row of rows) {
    if (String(row.category || '') !== 'epf') continue
    if (Number(row.amount || 0) <= 0) continue
    const did = String(row.documentId || '')
    if (did) withEpf.add(did)
  }
  for (const id of orderedDocIds) {
    if (withEpf.has(id)) return id
  }
  if (withEpf.size === 1) return [...withEpf][0] ?? null

  return null
}

function sumStatutoryForScope(
  rows: Array<Record<string, unknown>>,
  scopeDocumentId: string | null
): TaxProfileStatutory {
  const out = emptyStatutory()
  for (const row of rows) {
    const did = String(row.documentId || '')
    if (scopeDocumentId !== null && did !== scopeDocumentId) continue

    const amount = Number(row.amount || 0)
    if (!Number.isFinite(amount) || amount <= 0) continue

    const category = String(row.category || '')
    if (category === 'epf') {
      out.epf += amount
      continue
    }
    if (category === 'socso') {
      out.socso += amount
      continue
    }
    if (
      category === 'tax_paid' &&
      String(row.sourceFieldId || '') === EA_WORKBENCH_MTD_FIELD_ID
    ) {
      out.mtd += amount
    }
  }
  return out
}

function buildProfileFromExtractions(
  rows: Array<Record<string, unknown>>,
  orderedDocIds: string[]
): TaxProfile {
  const incomeItems: TaxProfile['incomeItems'] = []
  const expenses: TaxProfile['expenses'] = {
    medical: [],
    education: [],
    lifestyle: [],
    epf: [],
    parental: [],
  }

  for (const row of rows) {
    const id = String(row.id || crypto.randomUUID())
    const label = String(row.label || 'Item')
    const amount = Number(row.amount || 0)
    const category = String(row.category || 'other')
    if (!Number.isFinite(amount) || amount <= 0) continue

    if (category === 'income') continue

    if (category === 'epf') {
      expenses.epf.push({ id, category: 'epf', label, amount })
      continue
    }

    if (
      category === 'medical' ||
      category === 'education' ||
      category === 'lifestyle'
    ) {
      expenses[category].push({ id, category, label, amount })
    }
  }

  const rowsByDocument = new Map<string, Array<Record<string, unknown>>>()
  for (const row of rows) {
    const documentId = String(row.documentId || '')
    const key = documentId || '_'
    if (!rowsByDocument.has(key)) rowsByDocument.set(key, [])
    rowsByDocument.get(key)?.push(row)
  }

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
      const id = String(totalRow.id || crypto.randomUUID())
      const label = String(totalRow.label || 'Total employment income')
      const amount = Number(totalRow.amount || 0)
      if (Number.isFinite(amount) && amount > 0) {
        incomeItems.push({
          id,
          type: 'employment',
          label,
          amount,
        })
      }
      continue
    }

    for (const row of incomeRows) {
      const id = String(row.id || crypto.randomUUID())
      const label = String(row.label || 'Income')
      const amount = Number(row.amount || 0)
      if (!Number.isFinite(amount) || amount <= 0) continue
      incomeItems.push({
        id,
        type: 'employment',
        label,
        amount,
      })
    }
  }

  const totalIncome = incomeItems.reduce((sum, item) => sum + item.amount, 0)
  const totalDeductions = Object.values(expenses)
    .flat()
    .reduce((sum, item) => sum + item.amount, 0)

  const eaDocId = pickEaDocumentId(rows, orderedDocIds)
  const statutory =
    eaDocId !== null
      ? sumStatutoryForScope(rows, eaDocId)
      : sumStatutoryForScope(rows, null)

  return {
    totalIncome,
    totalDeductions,
    incomeItems,
    expenses,
    statutory,
  }
}

export function normalizeProfile(raw: Record<string, unknown>): TaxProfile {
  const incomeItems = Array.isArray(raw.incomeItems)
    ? raw.incomeItems
        .map((item) => {
          if (!item || typeof item !== 'object') return null
          const i = item as Record<string, unknown>
          return {
            id: String(i.id || crypto.randomUUID()),
            type: normalizeIncomeType(i.type),
            label: String(i.label || ''),
            amount: Number(i.amount || 0),
          }
        })
        .filter((value): value is TaxProfile['incomeItems'][number] =>
          Boolean(value)
        )
    : []

  const rawExpenses =
    raw.expenses && typeof raw.expenses === 'object'
      ? (raw.expenses as Record<string, unknown>)
      : {}

  const expenses: TaxProfile['expenses'] = {
    medical: normalizeExpenseItems(rawExpenses.medical, 'medical'),
    education: normalizeExpenseItems(rawExpenses.education, 'education'),
    lifestyle: normalizeExpenseItems(rawExpenses.lifestyle, 'lifestyle'),
    epf: normalizeExpenseItems(rawExpenses.epf, 'epf'),
    parental: normalizeExpenseItems(rawExpenses.parental, 'parental'),
  }

  const totalIncome = incomeItems.reduce((sum, item) => sum + item.amount, 0)
  const totalDeductions = Object.values(expenses)
    .flat()
    .reduce((sum, item) => sum + item.amount, 0)

  const statutory = normalizeStatutory(raw.statutory)

  return {
    totalIncome,
    totalDeductions,
    incomeItems,
    expenses,
    statutory,
  }
}

function normalizeStatutory(input: unknown): TaxProfileStatutory {
  if (!input || typeof input !== 'object') return emptyStatutory()
  const o = input as Record<string, unknown>
  const epf = Number(o.epf ?? 0)
  const socso = Number(o.socso ?? 0)
  const mtd = Number(o.mtd ?? 0)
  return {
    epf: Number.isFinite(epf) ? epf : 0,
    socso: Number.isFinite(socso) ? socso : 0,
    mtd: Number.isFinite(mtd) ? mtd : 0,
  }
}

function normalizeExpenseItems(
  input: unknown,
  category: TaxProfile['expenses'][keyof TaxProfile['expenses']][number]['category']
): TaxProfile['expenses'][keyof TaxProfile['expenses']] {
  if (!Array.isArray(input)) return []
  return input
    .map((item) => {
      if (!item || typeof item !== 'object') return null
      const i = item as Record<string, unknown>
      return {
        id: String(i.id || crypto.randomUUID()),
        category,
        label: String(i.label || ''),
        amount: Number(i.amount || 0),
      }
    })
    .filter(
      (
        value
      ): value is TaxProfile['expenses'][keyof TaxProfile['expenses']][number] =>
        Boolean(value)
    )
}

function normalizeIncomeType(
  value: unknown
): TaxProfile['incomeItems'][number]['type'] {
  if (
    value === 'employment' ||
    value === 'freelance' ||
    value === 'rental' ||
    value === 'dividend' ||
    value === 'other'
  ) {
    return value
  }
  return 'other'
}
