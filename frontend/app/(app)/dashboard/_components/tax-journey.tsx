import Link from 'next/link'
import { MatIcon } from '@/components/ui/mat-icon'

const steps = [
  { href: '/upload', label: 'Documents', icon: 'upload_file', done: true },
  { href: '/profile', label: 'Profile', icon: 'account_balance', done: true },
  { href: '/reliefs', label: 'Reliefs', icon: 'auto_awesome', done: false },
  { href: '/summary', label: 'Summary', icon: 'calculate', done: false },
  { href: '/filing', label: 'Filing', icon: 'task_alt', done: false },
]

export function TaxJourney() {
  return (
    <div className="rounded-xl bg-surface-container-lowest p-6 ambient-shadow">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.08em] text-secondary">
        Your Tax Journey
      </h3>
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {steps.map((step, i) => (
          <div key={step.href} className="flex items-center gap-2 shrink-0">
            <Link
              href={step.href}
              className={`flex flex-col items-center gap-1 rounded-lg px-4 py-3 text-xs font-medium transition-colors ${
                step.done
                  ? 'bg-tertiary-container text-on-tertiary-container'
                  : 'bg-surface-container-low text-secondary hover:bg-surface-container-high'
              }`}
            >
              <MatIcon
                name={step.icon}
                filled={step.done}
                className="text-xl"
              />
              {step.label}
            </Link>
            {i < steps.length - 1 && (
              <MatIcon
                name="chevron_right"
                className="text-xl text-outline-variant shrink-0"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
