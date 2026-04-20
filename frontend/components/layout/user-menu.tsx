'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { buttonVariants } from '@/components/ui/button'
import { MatIcon } from '@/components/ui/mat-icon'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

type UserMenuProps = {
  /** Visual style: full row in sidebar or compact icon for mobile header */
  variant?: 'sidebar' | 'header'
  className?: string
}

export function UserMenu({ variant = 'header', className }: UserMenuProps) {
  const router = useRouter()
  const { user, signOut, devBypass } = useAuth()
  const [signingOut, setSigningOut] = useState(false)
  const [signOutError, setSignOutError] = useState<string | null>(null)

  async function handleSignOut() {
    if (devBypass) return
    setSignOutError(null)
    setSigningOut(true)
    try {
      await signOut()
      router.replace('/login')
    } catch (e) {
      setSignOutError(e instanceof Error ? e.message : 'Sign out failed.')
    } finally {
      setSigningOut(false)
    }
  }

  const triggerClasses =
    variant === 'sidebar'
      ? cn(
          buttonVariants({ variant: 'ghost', size: 'default' }),
          'h-auto w-full justify-between border-0 bg-transparent px-4 py-2 text-sm font-normal text-on-surface-variant shadow-none hover:bg-surface-container-high focus-visible:ring-secondary/30',
          'data-[state=open]:bg-surface-container-high',
          className
        )
      : cn(
          buttonVariants({ variant: 'secondary', size: 'icon-sm' }),
          'rounded-full border-0 shadow-none shrink-0',
          className
        )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={triggerClasses}
        aria-label="Account menu"
        disabled={signingOut}
      >
        {variant === 'sidebar' ? (
          <span className="flex w-full items-center gap-3">
            <MatIcon name="account_circle" className="text-xl text-secondary" />
            <span className="flex-1 text-left font-medium">Account</span>
            <MatIcon name="expand_more" className="text-lg opacity-70" />
          </span>
        ) : (
          <MatIcon name="account_circle" className="text-xl" />
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={variant === 'sidebar' ? 'start' : 'end'}
        className="w-56 border border-outline-variant/30 bg-surface-container-low"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <span className="truncate text-sm font-medium text-on-surface">
                {user?.email ?? 'Signed in'}
              </span>
              {devBypass ? (
                <span className="text-on-surface-variant text-xs">
                  Dev auth bypass — sign-out disabled
                </span>
              ) : null}
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="bg-outline-variant/40" />
        <DropdownMenuGroup>
          <DropdownMenuItem
            className="text-on-surface focus:bg-surface-container-high"
            onClick={() => router.push('/dashboard')}
          >
            Dashboard
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-outline-variant/40" />
          <DropdownMenuItem
            className="text-on-surface focus:bg-surface-container-high"
            disabled={devBypass || signingOut}
            onClick={() => {
              void handleSignOut()
            }}
          >
            {signingOut ? 'Signing out…' : 'Sign out'}
          </DropdownMenuItem>
        </DropdownMenuGroup>
        {signOutError ? (
          <p className="px-2 py-1.5 text-xs text-destructive">{signOutError}</p>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
