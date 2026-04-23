import 'server-only'

export function loggableGoogleClientError(
  err: unknown
): Record<string, unknown> {
  if (err === null || err === undefined) {
    return { message: String(err) }
  }
  if (typeof err !== 'object') {
    return { message: String(err) }
  }

  const error = err as Record<string, unknown> & {
    message?: unknown
    stack?: unknown
  }
  const out: Record<string, unknown> = {
    message:
      typeof error.message === 'string'
        ? error.message
        : JSON.stringify(error.message ?? err),
  }
  if (typeof error.stack === 'string') out.stack = error.stack
  if (error.name !== undefined) out.name = error.name
  if (error.code !== undefined) out.code = error.code
  if (error.details !== undefined) out.details = error.details
  if (error.status !== undefined) out.status = error.status
  if (error.metadata !== undefined) out.metadata = error.metadata
  return out
}
