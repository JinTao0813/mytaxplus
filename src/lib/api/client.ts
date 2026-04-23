import type { z } from 'zod'

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/** API error JSON shape `{ "detail": string | object }`. */
export function parseFastApiErrorDetail(
  body: unknown
): string | Record<string, unknown> | null {
  if (!body || typeof body !== 'object' || body === null) return null
  const d = (body as { detail?: unknown }).detail
  if (d === undefined) return null
  if (typeof d === 'string') return d
  if (typeof d === 'object' && d !== null)
    return d as Record<string, unknown>
  return null
}

export function getApiBase(): string {
  const base = process.env.NEXT_PUBLIC_API_URL ?? ''
  return base.replace(/\/$/, '')
}

export type ApiFetchOptions<T = unknown> = RequestInit & {
  token?: string | null
  /** Defaults to "include" so session cookies are sent with API requests. */
  credentials?: RequestCredentials
  /** When set, successful JSON is validated before returning (replaces unchecked casts). */
  responseSchema?: z.ZodType<T>
  /**
   * Forward the browser `Cookie` header when calling from a Server Component
   * (browsers do not automatically send cookies to another origin during SSR fetch).
   */
  cookieHeader?: string
}

type IdTokenUser = {
  getIdToken?: (forceRefresh?: boolean) => Promise<string>
}

export async function getTokenForApi(
  user: unknown
): Promise<string | undefined> {
  const u = user as IdTokenUser | null | undefined
  if (!u || typeof u.getIdToken !== 'function') return undefined
  try {
    return await u.getIdToken()
  } catch {
    return undefined
  }
}

export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions<T> = {}
): Promise<T> {
  const {
    token,
    headers: initHeaders,
    credentials,
    responseSchema,
    cookieHeader,
    ...rest
  } = options
  const url = `${getApiBase()}${path.startsWith('/') ? path : `/${path}`}`
  const headers = new Headers(initHeaders)
  if (!headers.has('Accept')) headers.set('Accept', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)
  if (cookieHeader) headers.set('Cookie', cookieHeader)
  const res = await fetch(url, {
    ...rest,
    headers,
    credentials: credentials ?? 'include',
  })
  const text = await res.text()
  let data: unknown = text
  if (text.length > 0) {
    try {
      data = JSON.parse(text) as unknown
    } catch {
      data = text
    }
  }
  if (!res.ok) {
    throw new ApiError(`HTTP ${res.status}`, res.status, data)
  }
  if (responseSchema) {
    const parsed = responseSchema.safeParse(data)
    if (!parsed.success) {
      throw new ApiError(
        'Response did not match schema',
        res.status,
        parsed.error.flatten()
      )
    }
    return parsed.data
  }
  return data as T
}
