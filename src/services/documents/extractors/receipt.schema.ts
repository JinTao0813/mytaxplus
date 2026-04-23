/**
 * Receipt extraction uses Document AI entity types (prebuilt receipt/invoice processors).
 * See `receipt.extractor.ts` for the active logic.
 */

export const RECEIPT_ENTITY_VENDOR = [
  'supplier_name',
  'vendor_name',
  'merchant_name',
  'supplier',
] as const

export const RECEIPT_ENTITY_TOTAL = [
  'total_amount',
  'total',
  'amount_total',
  'invoice_total',
] as const

export const RECEIPT_ENTITY_DATE = [
  'invoice_date',
  'receipt_date',
  'purchase_date',
  'date',
] as const
