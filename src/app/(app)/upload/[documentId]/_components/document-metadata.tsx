interface Props {
  metadata: Record<string, string>
}

const LABELS: Record<string, string> = {
  taxYear: 'Tax year',
  employeeName: 'Employee name',
  employeeTin: 'Employee TIN',
  employeeIc: 'NRIC / I.C.',
  employerName: 'Employer name & address',
  employerPhone: 'Employer phone',
  employerTin: "Employer's TIN",
  jobDesignation: 'Job designation',
  staffPayrollNo: 'Staff / payroll no.',
}

export function DocumentMetadata({ metadata }: Props) {
  const entries = Object.entries(metadata).filter(([, v]) => v.trim() !== '')
  if (entries.length === 0) return null

  return (
    <div className="mb-6 rounded-xl bg-surface-container-low p-6">
      <h2 className="text-base font-semibold text-on-surface">
        Extracted details (EA)
      </h2>
      <p className="mt-1 text-sm text-on-surface-variant">
        Non-amount fields stored with this document.
      </p>
      <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {entries.map(([key, value]) => (
          <div key={key}>
            <dt className="text-xs font-semibold text-on-surface-variant">
              {LABELS[key] ?? key}
            </dt>
            <dd className="mt-0.5 text-sm text-on-surface">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
