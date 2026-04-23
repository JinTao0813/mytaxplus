/** HTTP client and domain API helpers (see lib/api/*.ts). */
export {
  ApiError,
  getApiBase,
  getTokenForApi,
  apiFetch,
  parseFastApiErrorDetail,
  type ApiFetchOptions,
} from '@/lib/api/client'
export {
  USE_API_MOCK,
  type ClientApiContext,
  type ServerApiContext,
} from '@/lib/api/config'

export { getDashboardStatus } from '@/lib/api/dashboard'
export {
  getDocuments,
  getDocument,
  getDocumentDocAiJson,
  getAiExtractions,
  getDocumentExtractions,
  registerUploadedDocument,
  deleteDocument,
  uploadDocument,
} from '@/lib/api/documents'
export { getProfile, updateProfile } from '@/lib/api/profile'
export {
  getReliefs,
  analyzeReliefs,
  createReliefClaim,
  updateReliefClaim,
  deleteReliefClaim,
} from '@/lib/api/reliefs'
export { getReliefRules, type ReliefRuleApi } from '@/lib/api/reliefs-rules'
export {
  listReceiptReviewItems,
  confirmReceiptMapping,
  clearReceiptMapping,
  retryReceiptSuggestion,
  type ConfirmReceiptMappingBody,
} from '@/lib/api/receipts-review'
export { getTaxContext } from '@/lib/api/tax-context'
export { getTaxSummary } from '@/lib/api/summary'
export { getFilingData } from '@/lib/api/filing'
export { getChatHistory, getChatContext, sendChatMessage } from '@/lib/api/chat'
