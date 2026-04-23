import 'server-only'

import { DocumentProcessorServiceClient } from '@google-cloud/documentai'

type DocAiResult = {
  processorName: string
  rawJson: Record<string, unknown>
  text: string
}

export type DocAiKvPair = {
  key: string
  value: string
  confidence?: number
}

const location = process.env.DOCAI_LOCATION || 'us'
const client = new DocumentProcessorServiceClient({
  apiEndpoint: `${location}-documentai.googleapis.com`,
})

function toCharIndex(v: unknown): number {
  if (v == null) return 0
  if (typeof v === 'number' && Number.isFinite(v)) return v
  if (typeof v === 'string') {
    const n = parseInt(v, 10)
    return Number.isFinite(n) ? n : 0
  }
  if (typeof v === 'object' && v !== null && 'toNumber' in v) {
    const n = (v as { toNumber: () => number }).toNumber()
    return Number.isFinite(n) ? n : 0
  }
  return 0
}

function textFromAnchor(
  fullText: string,
  anchor: { textSegments?: unknown } | null | undefined
): string {
  const segments = Array.isArray(anchor?.textSegments)
    ? (anchor.textSegments as Array<{ startIndex?: unknown; endIndex?: unknown }>)
    : []
  if (!segments.length) return ''
  const parts: string[] = []
  for (const segment of segments) {
    const start = toCharIndex(segment.startIndex)
    const end = toCharIndex(segment.endIndex)
    if (end > start) parts.push(fullText.slice(start, end))
  }
  return parts.join('').trim()
}

function collectKvPairs(doc: {
  text?: string | null
  pages?: Array<{
    formFields?: Array<{
      fieldName?: { textAnchor?: { textSegments?: unknown[] } }
      fieldValue?: { textAnchor?: { textSegments?: unknown[] }; confidence?: number | null }
    }>
  }>
}): DocAiKvPair[] {
  const fullText = doc.text ?? ''
  const out: DocAiKvPair[] = []
  for (const page of doc.pages ?? []) {
    for (const field of page.formFields ?? []) {
      const key = textFromAnchor(fullText, field.fieldName?.textAnchor)
      const value = textFromAnchor(fullText, field.fieldValue?.textAnchor)
      const confidence = field.fieldValue?.confidence
      if (!key && !value) continue
      out.push({
        key,
        value,
        ...(confidence != null && Number.isFinite(Number(confidence))
          ? { confidence: Number(confidence) }
          : {}),
      })
    }
  }
  return out
}

function processorResource(processorId: string): string {
  const projectId = process.env.DOCAI_PROJECT_ID || ''
  if (!projectId) throw new Error('Document AI project id not configured')
  return client.processorPath(projectId, location, processorId)
}

export async function processDocumentWithAi(params: {
  processorId: string
  content: Buffer
  mimeType: string
}): Promise<DocAiResult> {
  const name = processorResource(params.processorId)
  const byteLength = params.content.length
  const headHex = params.content.subarray(0, Math.min(12, byteLength)).toString('hex')
  console.debug('[document-ai] processDocument request', {
    processor: name,
    mimeType: params.mimeType,
    byteLength,
    headHex,
  })

  const [res] = await client.processDocument({
    name,
    rawDocument: {
      content: params.content,
      mimeType: params.mimeType,
    },
  })

  const doc = res.document
  const kvPairs = collectKvPairs(doc as Parameters<typeof collectKvPairs>[0])
  const rawJson: Record<string, unknown> = {
    text: doc?.text || '',
    entities: (doc?.entities || []).map((entity) => ({
      type: entity.type,
      mentionText: entity.mentionText,
      confidence: entity.confidence,
    })),
    kvPairs,
    pages: (doc?.pages || []).map((page) => ({
      pageNumber: page.pageNumber,
      dimension: {
        width: page.dimension?.width,
        height: page.dimension?.height,
        unit: page.dimension?.unit,
      },
    })),
  }

  console.debug('[document-ai] processDocument ok', {
    processor: name,
    entityCount: doc?.entities?.length ?? 0,
    kvPairCount: kvPairs.length,
    pageCount: doc?.pages?.length ?? 0,
    textLength: (doc?.text || '').length,
  })

  return {
    processorName: name,
    rawJson,
    text: doc?.text || '',
  }
}
