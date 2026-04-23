import { MatIcon } from '@/components/ui/mat-icon'

interface Props {
  totalCount: number
  claimedCount: number
  totalClaimed: number
  totalMissed: number
}

function formatRM(n: number) {
  return `RM ${n.toLocaleString('en-MY', { minimumFractionDigits: 2 })}`
}

export function ReliefStats({
  totalCount,
  claimedCount,
  totalClaimed,
  totalMissed,
}: Props) {
  const stats = [
    { label: 'Reliefs Found', value: String(totalCount), icon: 'search' },
    { label: 'Claimed', value: String(claimedCount), icon: 'check_circle' },
    { label: 'Total Claimed', value: formatRM(totalClaimed), icon: 'savings' },
    {
      label: 'Potential Extra',
      value: formatRM(totalMissed),
      icon: 'trending_up',
    },
  ]

  return (
    <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-xl bg-surface-container-lowest p-5 ambient-shadow"
        >
          <div className="mb-2 flex items-center gap-2 text-secondary">
            <MatIcon name={stat.icon} className="text-base" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant">
              {stat.label}
            </span>
          </div>
          <p className="text-xl font-bold text-on-surface">{stat.value}</p>
        </div>
      ))}
    </div>
  )
}
