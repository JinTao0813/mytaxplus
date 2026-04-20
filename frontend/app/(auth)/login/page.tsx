'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { AuthPanel } from '@/components/auth/auth-panel'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MatIcon } from '@/components/ui/mat-icon'
import { useAuth } from '@/hooks/useAuth'
import { isFirebaseConfigured } from '@/lib/firebase/client'

export default function LoginPage() {
  const router = useRouter()
  const { signInEmail, user, loading, devBypass } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  useEffect(() => {
    if (!loading && user) router.replace('/dashboard')
  }, [user, loading, router])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setPending(true)
    try {
      await signInEmail(email, password)
      router.replace('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed.')
    } finally {
      setPending(false)
    }
  }

  const firebaseReady = devBypass || isFirebaseConfigured()

  return (
    <AuthPanel
      eyebrow="Welcome back"
      title="Sign in"
      description="Use your email and password to access your tax workspace."
      icon={<MatIcon name="lock" className="text-xl text-secondary" />}
      footer={
        <p className="text-center text-sm text-on-surface-variant">
          No account?{' '}
          <Link
            href="/register"
            className="font-semibold text-secondary underline-offset-4 transition-opacity hover:opacity-90 hover:underline focus-visible:outline focus-visible:ring-2 focus-visible:ring-secondary/40"
          >
            Create an account
          </Link>
        </p>
      }
    >
      {!firebaseReady ? (
        <Alert
          variant="destructive"
          className="border-destructive/40 bg-error-container/30"
        >
          <AlertTitle className="text-on-error-container">
            Firebase not configured
          </AlertTitle>
          <AlertDescription className="text-on-error-container/90">
            Add{' '}
            <code className="rounded bg-surface-container-high px-1 py-0.5 text-xs">
              NEXT_PUBLIC_FIREBASE_*
            </code>{' '}
            to{' '}
            <code className="rounded bg-surface-container-high px-1 py-0.5 text-xs">
              frontend/.env.local
            </code>
            , or set{' '}
            <code className="rounded bg-surface-container-high px-1 py-0.5 text-xs">
              NEXT_PUBLIC_DEV_AUTH_BYPASS=true
            </code>{' '}
            for local UI-only development.
          </AlertDescription>
        </Alert>
      ) : null}
      <form onSubmit={(e) => void onSubmit(e)} className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="email" className="text-on-surface">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border-outline-variant/50 bg-surface-container-lowest"
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password" className="text-on-surface">
            Password
          </Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border-outline-variant/50 bg-surface-container-lowest"
            required
          />
        </div>
        {error ? (
          <Alert
            variant="destructive"
            className="border-destructive/40 bg-error-container/30"
          >
            <AlertDescription className="text-on-error-container">
              {error}
            </AlertDescription>
          </Alert>
        ) : null}
        <Button
          type="submit"
          variant="secondary"
          size="lg"
          className="h-11 w-full font-semibold shadow-md shadow-secondary/25"
          disabled={pending || !firebaseReady}
        >
          {pending ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
    </AuthPanel>
  )
}
