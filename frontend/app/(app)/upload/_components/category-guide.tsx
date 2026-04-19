import { MatIcon } from '@/components/ui/mat-icon'

const categories = [
  {
    icon: 'health_and_safety',
    label: 'Medical',
    desc: 'Hospital receipts, pharmacy, checkups',
  },
  {
    icon: 'school',
    label: 'Education',
    desc: 'Tuition fees, approved courses',
  },
  {
    icon: 'devices',
    label: 'Lifestyle',
    desc: 'Tech, books, sports, internet',
  },
]

export function CategoryGuide() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {categories.map((cat) => (
        <div
          key={cat.label}
          className="flex items-start gap-3 rounded-lg bg-surface-container-low p-4"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-container-lowest text-secondary">
            <MatIcon name={cat.icon} className="text-base" />
          </div>
          <div>
            <p className="text-xs font-semibold text-on-surface">{cat.label}</p>
            <p className="text-[11px] text-on-surface-variant">{cat.desc}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
