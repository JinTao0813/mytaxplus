/** When false, use real API endpoints; otherwise use mock data from lib/mock-data. */
export const USE_API_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== 'false'

/** Optional cookie forward for Server Component API calls (see `server-cookies.ts`). */
export type ServerApiContext = {
  cookieHeader?: string
}

/**
 * Browser client context: session cookie (`credentials: include`) plus optional
 * `Authorization: Bearer` from Firebase (`getTokenForApi`) when httpOnly cookie auth fails.
 */
export type ClientApiContext = ServerApiContext & {
  token?: string | null
}
