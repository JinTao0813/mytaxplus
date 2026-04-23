const rows = [
  {
    label: 'Medical Expenses',
    standard: 5450,
    optimised: 5450,
    section: '46(1)(g)',
  },
  {
    label: 'Education Fees',
    standard: 7000,
    optimised: 7000,
    section: '46(1)(f)',
  },
  {
    label: 'Lifestyle Relief',
    standard: 0,
    optimised: 2500,
    section: '46(1)(k)',
  },
  {
    label: 'EPF / Life Insurance',
    standard: 0,
    optimised: 8400,
    section: '46(1)(b)',
  },
  { label: 'Parental Care', standard: 0, optimised: 0, section: '46(1)(c)' },
]

function formatRM(n: number) {
  return `RM ${n.toLocaleString('en-MY', { minimumFractionDigits: 2 })}`
}

export function DeductionsBreakdown() {
  return (
    <div className="rounded-xl bg-surface-container-lowest p-7 ambient-shadow">
      <h3 className="mb-5 text-base font-semibold text-on-surface">
        Deductions Breakdown
      </h3>
      <div className="flex flex-col gap-3">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center gap-4 rounded-lg bg-surface-container-low px-4 py-3"
          >
            <div className="flex-1">
              <p className="text-xs font-semibold text-on-surface">
                {row.label}
              </p>
              <p className="text-[10px] text-on-surface-variant">
                Section {row.section}
              </p>
            </div>
            <span className="w-28 text-right text-sm text-on-surface-variant line-through">
              {row.standard > 0 ? formatRM(row.standard) : '–'}
            </span>
            <span
              className={`w-28 text-right text-sm font-semibold ${
                row.optimised > row.standard
                  ? 'text-on-tertiary-container'
                  : 'text-secondary'
              }`}
            >
              {row.optimised > 0 ? formatRM(row.optimised) : '–'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
