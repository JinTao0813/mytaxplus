export type DocumentStatusDb = 'UPLOADED' | 'PROCESSING' | 'PROCESSED' | 'FAILED'
export type DocumentTypeDb = 'EA_FORM' | 'RECEIPT' | 'UNKNOWN'

export type UpsertDocumentInput = {
  uid: string
  documentId: string
  storagePath: string
  originalFilename: string
  sizeKb: number
  contentType: string | null
  documentType: DocumentTypeDb
  status: DocumentStatusDb
  category: string | null
  error: Record<string, unknown> | null
  processor: Record<string, unknown> | null
  rawExtractionRef: string | null
  extractedMetadata?: Record<string, string>
  mappingStatusSummary?: string | null
}

export type UpsertExtractionInput = {
  uid: string
  documentId: string
  extractionId: string
  payload: Record<string, unknown>
}
