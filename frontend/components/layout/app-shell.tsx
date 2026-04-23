'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'

import { useAuth } from '@/hooks/useAuth'
import { UserMenu } from '@/components/layout/user-menu'
import { MatIcon } from '@/components/ui/mat-icon'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: 'dashboard' },
  { href: '/upload', label: 'Tax Files', icon: 'folder_open' },
  { href: '/profile', label: 'Income Builder', icon: 'account_balance' },
  { href: '/reliefs', label: 'Claim planner', icon: 'auto_awesome' },
  { href: '/summary', label: 'Tax Summary', icon: 'calculate' },
  { href: '/filing', label: 'Filing', icon: 'task_alt' },
  { href: '/chat', label: 'AI Assistant', icon: 'chat_bubble' },
]

const mobileNavItems = [
  { href: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { href: '/upload', label: 'Documents', icon: 'folder' },
  { href: '/profile', label: 'Profile', icon: 'person' },
  { href: '/reliefs', label: 'Claims', icon: 'auto_awesome' },
]

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, loading, devBypass } = useAuth()

  useEffect(() => {
    if (loading) return
    if (!user && !devBypass) router.replace('/login')
  }, [user, loading, devBypass, router])

  if (loading && !devBypass) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-[60vh] w-full max-w-3xl" />
      </div>
    )
  }

  if (!user && !devBypass) return null

  return (
    <div className="flex min-h-screen flex-col bg-surface md:flex-row">
      {/* ── Mobile top nav ──────────────────────────────────────────────── */}
      <nav className="fixed top-0 z-50 flex w-full items-center justify-between border-b border-outline-variant/30 bg-surface-container-low/90 px-6 py-4 backdrop-blur-md ambient-shadow md:hidden">
        <span className="text-xl font-black tracking-tighter text-secondary">
          MyTax+
        </span>
        <div className="flex items-center gap-2 text-on-surface-variant">
          <UserMenu variant="header" />
        </div>
      </nav>

      {/* ── Desktop sidebar ─────────────────────────────────────────────── */}
      <aside className="fixed left-0 top-0 hidden h-screen w-64 flex-col border-r border-outline-variant/30 bg-surface-container-low p-6 pt-10 md:flex z-40">
        {/* Brand */}
        <div className="mb-8">
          <h1 className="font-black text-lg uppercase tracking-widest text-secondary">
            MyTax+
          </h1>
          <div className="mt-2 flex items-center gap-2">
            <span className="ai-pulse inline-block h-2 w-2 rounded-full bg-tertiary-fixed" />
            <span className="text-[10px] font-medium text-secondary">
              AI Assistant Active
            </span>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex flex-1 flex-col gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 active:scale-95',
                  isActive
                    ? 'bg-secondary text-secondary-foreground shadow-lg shadow-secondary/20'
                    : 'text-on-surface-variant hover:bg-surface-container-high hover:translate-x-1'
                )}
              >
                <MatIcon
                  name={item.icon}
                  filled={isActive}
                  className="text-xl"
                />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Bottom actions */}
        <div className="mt-auto flex flex-col gap-2">
          <Link
            href="/reliefs"
            className="mb-2 w-full rounded-lg bg-on-primary-container px-4 py-3 text-center text-sm font-semibold text-on-primary-fixed shadow-lg shadow-on-primary-container/20 hover:opacity-90 transition-opacity"
          >
            Plan reliefs
          </Link>
          <div className="border-t border-outline-variant/50 pt-2 flex flex-col gap-0.5">
            <Link
              href="/chat"
              className="flex items-center gap-3 rounded-lg px-4 py-2 text-sm text-on-surface-variant hover:bg-surface-container-high transition-colors"
            >
              <MatIcon name="help" className="text-base" />
              <span>Support</span>
            </Link>
            <UserMenu variant="sidebar" />
          </div>
        </div>
      </aside>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col md:ml-64">
        <main className="flex-1 pt-16 md:pt-0">{children}</main>
      </div>

      {/* ── Mobile bottom nav ───────────────────────────────────────────── */}
      <nav className="fixed bottom-0 z-50 flex w-full items-center justify-around border-t border-outline-variant/30 bg-surface-container-low/90 py-3 backdrop-blur-md ambient-shadow md:hidden">
        {mobileNavItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex min-w-[64px] flex-col items-center gap-1 pt-1',
                isActive
                  ? 'border-t-2 border-on-primary-container text-secondary'
                  : 'text-on-surface-variant'
              )}
            >
              <MatIcon
                name={item.icon}
                filled={isActive}
                className="text-2xl"
              />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
