import 'server-only'

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly detail: string | Record<string, unknown>
  ) {
    super(typeof detail === 'string' ? detail : `HTTP ${status}`)
    this.name = 'HttpError'
  }
}

export function asDetail(detail: unknown): string | Record<string, unknown> {
  if (typeof detail === 'string') return detail
  if (detail && typeof detail === 'object' && !Array.isArray(detail)) {
    return detail as Record<string, unknown>
  }
  return 'Unexpected server error'
}
