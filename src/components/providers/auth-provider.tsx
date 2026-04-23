'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useRef,
  type ReactNode,
} from 'react'
import {
  createUserWithEmailAndPassword,
  getRedirectResult,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth'

import { getFirebaseAuth, isFirebaseConfigured } from '@/lib/firebase/client'
import { deleteBackendSession, syncBackendSession } from '@/lib/api/auth-session'
import { ApiError } from '@/lib/api/client'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

function describeSessionSyncError(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 401) {
      return 'Could not create a server session (unauthorized). Check API URL and CORS.'
    }
    return err.message || `Session sync failed (${err.status}).`
  }
  if (err instanceof Error) return err.message
  return 'Could not sync session with the server.'
}

type AuthContextValue = {
  user: User | null
  loading: boolean
  devBypass: boolean
  sessionSyncError: string | null
  dismissSessionSyncError: () => void
  signInEmail: (email: string, password: string) => Promise<void>
  signUpEmail: (email: string, password: string) => Promise<void>
  signInGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider')
  return ctx
}

const bypass =
  process.env.NEXT_PUBLIC_DEV_AUTH_BYPASS === 'true' ||
  process.env.NEXT_PUBLIC_DEV_AUTH_BYPASS === '1'

const mockDevUser = {
  uid: 'dev-local',
  email: 'dev@local.test',
  emailVerified: true,
} as User

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() =>
    bypass ? mockDevUser : null
  )
  const [sessionSyncError, setSessionSyncError] = useState<string | null>(null)
  const lastSessionSyncRef = useRef<{ uid: string; atMs: number } | null>(null)
  const dismissSessionSyncError = useCallback(() => {
    setSessionSyncError(null)
  }, [])
  const [loading, setLoading] = useState(() => {
    if (bypass) return false
    return isFirebaseConfigured()
  })
  const syncSessionForUser = useCallback(async (u: User) => {
    const idToken = await u.getIdToken()
    await syncBackendSession(idToken)
    lastSessionSyncRef.current = { uid: u.uid, atMs: Date.now() }
    setSessionSyncError(null)
  }, [])

  useEffect(() => {
    if (bypass) return
    if (!isFirebaseConfigured()) return

    const auth = getFirebaseAuth()
    if (!auth) return
    const provider = new GoogleAuthProvider()
    provider.setCustomParameters({ prompt: 'select_account' })

    void (async () => {
      try {
        const redirectResult = await getRedirectResult(auth)
        if (redirectResult?.user) {
          await syncSessionForUser(redirectResult.user)
        }
      } catch (err) {
        console.error('google redirect sign-in failed', err)
        setSessionSyncError(describeSessionSyncError(err))
      }
    })()

    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setLoading(false)
      if (!u) {
        setSessionSyncError(null)
        return
      }
      void (async () => {
        setSessionSyncError(null)
        try {
          // Avoid double-hitting the session endpoint right after sign-in/sign-up.
          const now = Date.now()
          const prev = lastSessionSyncRef.current
          if (prev && prev.uid === u.uid && now - prev.atMs < 3_000) {
            return
          }
          await syncSessionForUser(u)
        } catch (err) {
          console.error('syncBackendSession failed', err)
          setSessionSyncError(describeSessionSyncError(err))
        }
      })()
    })

    return () => unsub()
  }, [syncSessionForUser])

  const signInEmail = useCallback(async (email: string, password: string) => {
    const auth = getFirebaseAuth()
    if (!auth) throw new Error('Firebase Auth is not configured.')
    const cred = await signInWithEmailAndPassword(auth, email, password)
    await syncSessionForUser(cred.user)
  }, [syncSessionForUser])

  const signUpEmail = useCallback(async (email: string, password: string) => {
    const auth = getFirebaseAuth()
    if (!auth) throw new Error('Firebase Auth is not configured.')
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    await syncSessionForUser(cred.user)
  }, [syncSessionForUser])

  const signInGoogle = useCallback(async () => {
    const auth = getFirebaseAuth()
    if (!auth) throw new Error('Firebase Auth is not configured.')
    const provider = new GoogleAuthProvider()
    provider.setCustomParameters({ prompt: 'select_account' })

    try {
      const cred = await signInWithPopup(auth, provider)
      await syncSessionForUser(cred.user)
      return
    } catch (err) {
      const code =
        err && typeof err === 'object' && 'code' in err
          ? String((err as { code: unknown }).code)
          : ''
      const shouldFallbackToRedirect =
        code === 'auth/popup-blocked' ||
        code === 'auth/popup-closed-by-user' ||
        code === 'auth/cancelled-popup-request' ||
        code === 'auth/operation-not-supported-in-this-environment'
      if (!shouldFallbackToRedirect) {
        throw err
      }
    }

    await signInWithRedirect(auth, provider)
  }, [syncSessionForUser])

  const signOutFn = useCallback(async () => {
    if (bypass) return
    const auth = getFirebaseAuth()
    if (!auth) return
    try {
      await deleteBackendSession()
    } catch (err) {
      console.error('deleteBackendSession failed', err)
      throw err
    }
    setSessionSyncError(null)
    await firebaseSignOut(auth)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user: bypass ? mockDevUser : user,
      loading: bypass ? false : loading,
      devBypass: bypass,
      sessionSyncError: bypass ? null : sessionSyncError,
      dismissSessionSyncError,
      signInEmail,
      signUpEmail,
      signInGoogle,
      signOut: signOutFn,
    }),
    [
      user,
      loading,
      sessionSyncError,
      dismissSessionSyncError,
      signInEmail,
      signUpEmail,
      signInGoogle,
      signOutFn,
    ]
  )

  return (
    <>
      {!bypass && sessionSyncError ? (
        <div className="fixed top-0 left-0 right-0 z-[100] px-4 pt-4">
          <Alert variant="destructive" className="mx-auto max-w-2xl shadow-lg">
            <AlertTitle>Server session</AlertTitle>
            <AlertDescription className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <span>{sessionSyncError}</span>
              <button
                type="button"
                className="shrink-0 text-xs font-semibold underline text-on-error-container"
                onClick={dismissSessionSyncError}
              >
                Dismiss
              </button>
            </AlertDescription>
          </Alert>
        </div>
      ) : null}
      <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    </>
  )
}
