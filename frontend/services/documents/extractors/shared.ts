import type { NormalizedDocAi } from './types'

/** Normalize Document AI `entity.type` for comparison (Workbench ids are snake_case). */
export function normalizeEntityType(t: string | null | undefined): string {
  return String(t || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
}

export function normalizeKey(s: string): string {
  return s.toLowerCase().replace(/\s+/g, ' ').trim()
}

export function parseAmount(value: string | null | undefined): number | null {
  if (value == null) return null
  const v = String(value).trim()
  if (!v) return null
  const stripped = v.replace(/[^0-9.,-]/g, '')
  let normalized = stripped
  if (normalized.includes(',') && !normalized.includes('.')) {
    normalized = normalized.replace(/,/g, '.')
  }
  normalized = normalized.replace(/,/g, '')
  const n = Number(normalized)
  return Number.isFinite(n) ? n : null
}

export function parseDateValue(value: string | null | undefined): string | null {
  if (value == null) return null
  const raw = String(value).trim()
  if (!raw) return null

  const direct = new Date(raw)
  if (!Number.isNaN(direct.getTime())) {
    return direct.toISOString().slice(0, 10)
  }

  const slashMatch = raw.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/)
  if (!slashMatch) return null

  const day = Number(slashMatch[1])
  const month = Number(slashMatch[2])
  const year = Number(slashMatch[3].length === 2 ? `20${slashMatch[3]}` : slashMatch[3])
  if (!Number.isFinite(day) || !Number.isFinite(month) || !Number.isFinite(year)) {
    return null
  }
  const normalized = new Date(Date.UTC(year, month - 1, day))
  if (Number.isNaN(normalized.getTime())) return null
  return normalized.toISOString().slice(0, 10)
}

export function findEntityText(
  entities: NormalizedDocAi['entities'],
  types: string[]
): string | null {
  const set = new Set(types.map((t) => normalizeEntityType(t)))
  let best: { conf: number; value: string } | null = null
  for (const entity of entities) {
    const type = normalizeEntityType(entity.type)
    if (!set.has(type)) continue
    const text = String(entity.mentionText || '').trim()
    if (!text) continue
    const conf = Number(entity.confidence || 0)
    if (!best || conf > best.conf) best = { conf, value: text }
  }
  return best?.value || null
}

export function findEntityConfidence(
  entities: NormalizedDocAi['entities'],
  types: string[]
): number | null {
  const set = new Set(types.map((t) => normalizeEntityType(t)))
  for (const entity of entities) {
    const type = normalizeEntityType(entity.type)
    if (!set.has(type)) continue
    const conf = Number(entity.confidence || 0)
    if (Number.isFinite(conf)) return conf
  }
  return null
}

/** Prefer highest-confidence KV row whose key matches any regex. */
export function findKvValue(
  kvPairs: NormalizedDocAi['kvPairs'],
  keyMatchers: RegExp[]
): { value: string; confidence: number } | null {
  let best: { conf: number; value: string } | null = null
  for (const kv of kvPairs) {
    const key = normalizeKey(kv.key)
    if (!keyMatchers.some((re) => re.test(key))) continue
    const value = String(kv.value || '').trim()
    if (!value) continue
    const conf = Number(kv.confidence ?? 0)
    if (!best || conf >= best.conf) best = { conf, value }
  }
  return best ? { value: best.value, confidence: best.conf } : null
}

/** First RM amount in a string (handles 84,000.00 style). */
export function firstAmountInText(s: string | null | undefined): number | null {
  if (!s) return null
  const m = s.match(/RM\s*([\d,]+\.?\d*)/i) || s.match(/([\d,]+\.\d{2})\s*$/)
  if (!m) return parseAmount(s)
  return parseAmount(m[1] ?? m[0])
}

export function findAmountAfterLabel(
  fullText: string,
  labelRegex: RegExp
): number | null {
  const lines = fullText.split(/\r?\n/)
  for (const line of lines) {
    if (!labelRegex.test(line)) continue
    const amt = firstAmountInText(line)
    if (amt != null) return amt
  }
  const idx = fullText.search(labelRegex)
  if (idx >= 0) {
    const slice = fullText.slice(idx, idx + 200)
    return firstAmountInText(slice)
  }
  return null
}

export function normalizeDocAi(raw: Record<string, unknown>): NormalizedDocAi {
  const text = String(raw.text ?? '')
  const entities = Array.isArray(raw.entities)
    ? (raw.entities as NormalizedDocAi['entities'])
    : []
  const kvPairs = Array.isArray(raw.kvPairs)
    ? (raw.kvPairs as NormalizedDocAi['kvPairs']).map((kv) => ({
        key: String(kv.key ?? ''),
        value: String(kv.value ?? ''),
        ...(kv.confidence != null ? { confidence: Number(kv.confidence) } : {}),
      }))
    : []
  return { text, entities, kvPairs }
}
