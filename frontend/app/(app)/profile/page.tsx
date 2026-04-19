import { getProfile } from '@/lib/services'
import { AiPanel } from '@/components/layout/ai-panel'
import { ProfileEditor } from './_components/profile-editor'

export default async function ProfilePage() {
  const profile = await getProfile()
  const epfTotal = profile.expenses.epf.reduce((s, e) => s + e.amount, 0)
  const epfFormatted = `RM ${epfTotal.toLocaleString('en-MY', { minimumFractionDigits: 2 })}`

  return (
    <div className="min-h-screen bg-surface px-6 pb-24 pt-8 md:px-12 md:pb-12 md:pt-12">
      <div className="flex flex-col gap-10 lg:flex-row">
        {/* ── Builder area ─────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col gap-8">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-on-surface">
              Tax Profile Builder
            </h1>
            <p className="mt-2 text-base text-secondary">
              Review and refine your extracted financial data.
            </p>
          </div>

          <ProfileEditor initialProfile={profile} />
        </div>

        {/* ── AI panel ─────────────────────────────────────────────────── */}
        <aside className="w-full lg:w-96 shrink-0">
          <AiPanel
            title="Ledger AI"
            statusLabel="Analysing Profile"
            message={`I noticed a 1099-NEC for Consulting Services. Since you have freelance income, you may be eligible to deduct home office expenses or internet costs under the Lifestyle category. Your EPF contributions (${epfFormatted}) may also qualify for additional relief.`}
            chips={[
              { label: 'Add Home Office Deduction' },
              { label: 'What qualifies as medical?' },
              { label: 'Maximise EPF relief' },
            ]}
            inputPlaceholder="Ask Ledger AI..."
            className="sticky top-8"
          />
        </aside>
      </div>
    </div>
  )
}
