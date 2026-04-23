import 'server-only'

export function userDocumentPath(params: {
  uid: string
  documentId: string
}): string {
  return `users/${params.uid}/documents/${params.documentId}`
}

export function userDocumentsCollectionPath(params: { uid: string }): string {
  return `users/${params.uid}/documents`
}

export function documentExtractionsCollectionPath(params: {
  uid: string
  documentId: string
}): string {
  return `users/${params.uid}/documents/${params.documentId}/extractions`
}

export function documentExtractionPath(params: {
  uid: string
  documentId: string
  extractionId: string
}): string {
  return `users/${params.uid}/documents/${params.documentId}/extractions/${params.extractionId}`
}

export function userReliefClaimsCollectionPath(params: {
  uid: string
}): string {
  return `users/${params.uid}/reliefClaims`
}

export function userReliefClaimPath(params: {
  uid: string
  claimId: string
}): string {
  return `users/${params.uid}/reliefClaims/${params.claimId}`
}

export function userTaxContextPath(params: {
  uid: string
  year: number
}): string {
  return `users/${params.uid}/taxContexts/${params.year}`
}
