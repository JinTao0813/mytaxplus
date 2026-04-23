import Link from 'next/link'
import { MatIcon } from '@/components/ui/mat-icon'
import type { ChatContext } from '@/lib/types'

function formatRM(n: number) {
  return `RM ${n.toLocaleString('en-MY', { minimumFractionDigits: 2 })}`
}

const quickNav = [
  { href: '/upload', label: 'Document Ingestion', icon: 'upload_file' },
  { href: '/profile', label: 'Tax Profile', icon: 'account_balance' },
  { href: '/reliefs', label: 'Relief claim planner', icon: 'auto_awesome' },
  { href: '/summary', label: 'Tax Summary', icon: 'calculate' },
  { href: '/filing', label: 'Filing Assistant', icon: 'task_alt' },
]

export function ChatContextSidebar({ ctx }: { ctx: ChatContext }) {
  const contextItems = [
    {
      label: 'Total Income',
      value: formatRM(ctx.totalIncome),
      icon: 'account_balance',
    },
    {
      label: 'Total Deductions',
      value: formatRM(ctx.totalDeductions),
      icon: 'receipt_long',
    },
    { label: 'Top Relief', value: ctx.topRelief, icon: 'star' },
    {
      label: 'Estimated Savings',
      value: formatRM(ctx.estimatedSavings),
      icon: 'savings',
    },
  ]

  return (
    <aside className="hidden w-80 shrink-0 flex-col border-l border-outline-variant/20 bg-surface-container-lowest lg:flex">
      <div className="border-b border-outline-variant/15 px-5 py-4">
        <h3 className="text-sm font-semibold text-on-surface">
          Your Tax Context
        </h3>
        <p className="text-xs text-on-surface-variant">
          AI uses this data for grounded responses
        </p>
      </div>
      <div className="flex-1 overflow-y-auto p-5">
        <div className="flex flex-col gap-3">
          {contextItems.map((item) => (
            <div
              key={item.label}
              className="flex items-start gap-3 rounded-lg bg-surface-container-low p-4"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-container-lowest text-secondary">
                <MatIcon name={item.icon} className="text-base" />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant">
                  {item.label}
                </p>
                <p className="text-sm font-bold text-on-surface">
                  {item.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant">
            Jump To
          </p>
          <div className="flex flex-col gap-1">
            {quickNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-on-surface-variant hover:bg-surface-container-low transition-colors"
              >
                <MatIcon
                  name={item.icon}
                  className="text-base text-secondary"
                />
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </aside>
  )
}
