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

export default function RegisterPage() {
  const router = useRouter()
  const { signUpEmail, user, loading, devBypass } = useAuth()
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
      await signUpEmail(email, password)
      router.replace('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed.')
    } finally {
      setPending(false)
    }
  }

  const firebaseReady = devBypass || isFirebaseConfigured()

  return (
    <AuthPanel
      eyebrow="Get started"
      title="Create your account"
      description="Register with email and password to upload documents and build your tax profile."
      icon={<MatIcon name="person_add" className="text-xl text-secondary" />}
      footer={
        <p className="text-center text-sm text-on-surface-variant">
          Already have an account?{' '}
          <Link
            href="/login"
            className="font-semibold text-secondary underline-offset-4 transition-opacity hover:opacity-90 hover:underline focus-visible:outline focus-visible:ring-2 focus-visible:ring-secondary/40"
          >
            Sign in
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
            Add Firebase env vars to{' '}
            <code className="rounded bg-surface-container-high px-1 py-0.5 text-xs">
              .env.local
            </code>{' '}
            or enable{' '}
            <code className="rounded bg-surface-container-high px-1 py-0.5 text-xs">
              NEXT_PUBLIC_DEV_AUTH_BYPASS=true
            </code>
            .
          </AlertDescription>
        </Alert>
      ) : null}
      <form onSubmit={(e) => void onSubmit(e)} className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="reg-email" className="text-on-surface">
            Email
          </Label>
          <Input
            id="reg-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border-outline-variant/50 bg-surface-container-lowest"
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="reg-password" className="text-on-surface">
            Password
          </Label>
          <Input
            id="reg-password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border-outline-variant/50 bg-surface-container-lowest"
            required
            minLength={6}
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
          {pending ? 'Creating…' : 'Create account'}
        </Button>
      </form>
    </AuthPanel>
  )
}
