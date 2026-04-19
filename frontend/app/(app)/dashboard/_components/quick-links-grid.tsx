import Link from 'next/link'
import { MatIcon } from '@/components/ui/mat-icon'

const quickLinks = [
  {
    href: '/upload',
    icon: 'folder',
    label: 'Documents',
    sub: '3 recently added',
  },
  {
    href: '/profile',
    icon: 'description',
    label: 'Tax Files',
    sub: 'Review profile',
  },
  {
    href: '/chat',
    icon: 'support_agent',
    label: 'Support',
    sub: 'Connect with an expert',
  },
]

export function QuickLinksGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {quickLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="group flex flex-col items-start gap-4 rounded-xl bg-surface-container-lowest p-6 ambient-shadow hover:-translate-y-1 transition-transform"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-low text-secondary group-hover:bg-secondary group-hover:text-secondary-foreground transition-colors">
            <MatIcon name={link.icon} className="text-xl" />
          </div>
          <div>
            <p className="text-sm font-semibold text-on-surface">
              {link.label}
            </p>
            <p className="mt-0.5 text-xs text-on-surface-variant">{link.sub}</p>
          </div>
        </Link>
      ))}
    </div>
  )
}
