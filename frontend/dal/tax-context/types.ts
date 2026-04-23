import type { IncomeItem, TaxContext, TaxProfileStatutory } from '@/lib/types'

export type TaxContextSnapshotStored = TaxContext

export type SaveTaxContextSnapshotInput = {
  uid: string
  year: number
  totalIncome: number
  incomeItems: IncomeItem[]
  statutory: TaxProfileStatutory
  parameters: TaxContext['parameters']
  trace: TaxContext['trace']
  updatedAt: string
}
