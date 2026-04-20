'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth'

import { getFirebaseAuth, isFirebaseConfigured } from '@/lib/firebase/client'
import {
  deleteBackendSession,
  isRealApiMode,
  syncBackendSession,
} from '@/lib/auth-session'

type AuthContextValue = {
  user: User | null
  loading: boolean
  devBypass: boolean
  signInEmail: (email: string, password: string) => Promise<void>
  signUpEmail: (email: string, password: string) => Promise<void>
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
  const [loading, setLoading] = useState(() => {
    if (bypass) return false
    return isFirebaseConfigured()
  })

  useEffect(() => {
    if (bypass) return
    if (!isFirebaseConfigured()) return

    const auth = getFirebaseAuth()
    if (!auth) return

    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setLoading(false)
      if (u && isRealApiMode()) {
        void (async () => {
          try {
            const idToken = await u.getIdToken()
            await syncBackendSession(idToken)
          } catch {
            /* offline or API down; explicit sign-in still validates session */
          }
        })()
      }
    })

    return () => unsub()
  }, [])

  const signInEmail = useCallback(async (email: string, password: string) => {
    const auth = getFirebaseAuth()
    if (!auth) throw new Error('Firebase Auth is not configured.')
    const cred = await signInWithEmailAndPassword(auth, email, password)
    if (isRealApiMode()) {
      const idToken = await cred.user.getIdToken()
      await syncBackendSession(idToken)
    }
  }, [])

  const signUpEmail = useCallback(async (email: string, password: string) => {
    const auth = getFirebaseAuth()
    if (!auth) throw new Error('Firebase Auth is not configured.')
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    if (isRealApiMode()) {
      const idToken = await cred.user.getIdToken()
      await syncBackendSession(idToken)
    }
  }, [])

  const signOutFn = useCallback(async () => {
    if (bypass) return
    const auth = getFirebaseAuth()
    if (!auth) return
    try {
      await deleteBackendSession()
    } catch {
      /* still clear Firebase client session */
    }
    await firebaseSignOut(auth)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user: bypass ? mockDevUser : user,
      loading: bypass ? false : loading,
      devBypass: bypass,
      signInEmail,
      signUpEmail,
      signOut: signOutFn,
    }),
    [user, loading, signInEmail, signUpEmail, signOutFn]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
