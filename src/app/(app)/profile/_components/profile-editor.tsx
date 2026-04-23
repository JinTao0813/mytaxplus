'use client'

import { useState } from 'react'
import { MatIcon } from '@/components/ui/mat-icon'
import type { IncomeItem, ExpenseItem, TaxProfile } from '@/lib/types'

function formatRM(amount: number) {
  return `RM ${amount.toLocaleString('en-MY', { minimumFractionDigits: 2 })}`
}

function AmountInput({
  value,
  onChange,
}: {
  value: number
  onChange: (v: number) => void
}) {
  return (
    <div className="relative w-full sm:w-48">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-secondary">
        RM
      </span>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className="w-full rounded ghost-border bg-surface-container-lowest py-2 pl-10 pr-3 text-right text-sm font-semibold text-on-surface outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all"
      />
    </div>
  )
}

function SectionCard({
  icon,
  title,
  badge,
  children,
  onAdd,
  addLabel,
}: {
  icon: string
  title: string
  badge?: string
  children: React.ReactNode
  onAdd: () => void
  addLabel: string
}) {
  return (
    <section className="rounded-xl bg-surface-container-low p-7">
      <div className="mb-5 flex items-center gap-3">
        <MatIcon name={icon} className="text-2xl text-secondary" />
        <h3 className="text-lg font-semibold text-on-surface">{title}</h3>
        {badge && (
          <span className="ml-auto rounded-full bg-tertiary-container px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-on-tertiary-container">
            {badge}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-3">{children}</div>
      <button
        onClick={onAdd}
        className="mt-4 flex items-center gap-2 text-sm font-medium text-secondary hover:opacity-80 transition-opacity"
      >
        <MatIcon name="add_circle" className="text-lg" />
        {addLabel}
      </button>
    </section>
  )
}

interface Props {
  initialProfile: TaxProfile
}

export function ProfileEditor({ initialProfile }: Props) {
  const [profile, setProfile] = useState<TaxProfile>(initialProfile)

  function updateIncome(
    id: string,
    field: keyof IncomeItem,
    value: string | number
  ) {
    setProfile((p) => ({
      ...p,
      incomeItems: p.incomeItems.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }))
  }
  function deleteIncome(id: string) {
    setProfile((p) => ({
      ...p,
      incomeItems: p.incomeItems.filter((i) => i.id !== id),
    }))
  }
  function addIncome() {
    const newItem: IncomeItem = {
      id: `inc-${Date.now()}`,
      type: 'other',
      label: '',
      amount: 0,
    }
    setProfile((p) => ({ ...p, incomeItems: [...p.incomeItems, newItem] }))
  }

  function updateExpense(
    category: keyof TaxProfile['expenses'],
    id: string,
    field: keyof ExpenseItem,
    value: string | number
  ) {
    setProfile((p) => ({
      ...p,
      expenses: {
        ...p.expenses,
        [category]: p.expenses[category].map((item) =>
          item.id === id ? { ...item, [field]: value } : item
        ),
      },
    }))
  }
  function deleteExpense(category: keyof TaxProfile['expenses'], id: string) {
    setProfile((p) => ({
      ...p,
      expenses: {
        ...p.expenses,
        [category]: p.expenses[category].filter((i) => i.id !== id),
      },
    }))
  }
  function addExpense(category: keyof TaxProfile['expenses'], label: string) {
    const newItem: ExpenseItem = {
      id: `exp-${Date.now()}`,
      category,
      label,
      amount: 0,
    }
    setProfile((p) => ({
      ...p,
      expenses: {
        ...p.expenses,
        [category]: [...p.expenses[category], newItem],
      },
    }))
  }

  const totalIncome = profile.incomeItems.reduce((s, i) => s + i.amount, 0)
  const totalDeductions = Object.values(profile.expenses)
    .flat()
    .reduce((s, e) => s + e.amount, 0)

  function LineItem({
    label,
    labelPlaceholder,
    amount,
    onLabelChange,
    onAmountChange,
    onDelete,
    accent = false,
  }: {
    label: string
    labelPlaceholder: string
    amount: number
    onLabelChange: (v: string) => void
    onAmountChange: (v: number) => void
    onDelete: () => void
    accent?: boolean
  }) {
    return (
      <div
        className={`relative flex flex-col gap-3 rounded-lg bg-surface-container-lowest p-4 transition-shadow hover:ambient-shadow sm:flex-row sm:items-center ${
          accent ? 'pl-6' : ''
        }`}
      >
        {accent && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 rounded-r-full bg-tertiary-fixed" />
        )}
        <div className="flex-1">
          <input
            type="text"
            value={label}
            placeholder={labelPlaceholder}
            onChange={(e) => onLabelChange(e.target.value)}
            className="w-full rounded ghost-border bg-surface px-3 py-2 text-sm text-on-surface outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all placeholder:text-on-surface-variant/40"
          />
        </div>
        <AmountInput value={amount} onChange={onAmountChange} />
        <button
          onClick={onDelete}
          className="p-2 text-outline hover:text-error transition-colors"
        >
          <MatIcon name="delete" className="text-xl" />
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Financial summary bento */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl bg-surface-container-lowest p-6 ambient-shadow">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-secondary">
            Total Income
          </p>
          <p className="text-5xl font-bold tracking-[-0.02em] text-on-surface leading-none">
            {formatRM(totalIncome)}
          </p>
        </div>
        <div className="relative overflow-hidden rounded-xl bg-surface-container-lowest p-6 ambient-shadow">
          <div className="pointer-events-none absolute -right-0 -top-0 h-24 w-24 rounded-bl-full bg-gradient-to-br from-tertiary-fixed to-transparent opacity-20" />
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-on-tertiary-container">
            Total Deductions
          </p>
          <p className="text-5xl font-bold tracking-[-0.02em] text-tertiary leading-none">
            {formatRM(totalDeductions)}
          </p>
        </div>
      </div>

      {/* Income */}
      <SectionCard
        icon="work"
        title="Income"
        badge={`${profile.incomeItems.length} Sources`}
        onAdd={addIncome}
        addLabel="Add Income Source"
      >
        {profile.incomeItems.map((item, i) => (
          <LineItem
            key={item.id}
            label={item.label}
            labelPlaceholder="Employer / Source"
            amount={item.amount}
            accent={i > 0}
            onLabelChange={(v) => updateIncome(item.id, 'label', v)}
            onAmountChange={(v) => updateIncome(item.id, 'amount', v)}
            onDelete={() => deleteIncome(item.id)}
          />
        ))}
      </SectionCard>

      {/* Medical */}
      <SectionCard
        icon="health_and_safety"
        title="Medical Expenses"
        onAdd={() => addExpense('medical', '')}
        addLabel="Add Medical Expense"
      >
        {profile.expenses.medical.map((item) => (
          <LineItem
            key={item.id}
            label={item.label}
            labelPlaceholder="Provider / Treatment Type"
            amount={item.amount}
            onLabelChange={(v) => updateExpense('medical', item.id, 'label', v)}
            onAmountChange={(v) =>
              updateExpense('medical', item.id, 'amount', v)
            }
            onDelete={() => deleteExpense('medical', item.id)}
          />
        ))}
      </SectionCard>

      {/* Education */}
      <SectionCard
        icon="school"
        title="Education Fees"
        onAdd={() => addExpense('education', '')}
        addLabel="Add Education Fee"
      >
        {profile.expenses.education.map((item) => (
          <LineItem
            key={item.id}
            label={item.label}
            labelPlaceholder="Institution / Course"
            amount={item.amount}
            onLabelChange={(v) =>
              updateExpense('education', item.id, 'label', v)
            }
            onAmountChange={(v) =>
              updateExpense('education', item.id, 'amount', v)
            }
            onDelete={() => deleteExpense('education', item.id)}
          />
        ))}
      </SectionCard>

      {/* Lifestyle */}
      <SectionCard
        icon="home_work"
        title="Lifestyle & Home"
        onAdd={() => addExpense('lifestyle', '')}
        addLabel="Add Lifestyle Expense"
      >
        {profile.expenses.lifestyle.map((item) => (
          <LineItem
            key={item.id}
            label={item.label}
            labelPlaceholder="Category / Item"
            amount={item.amount}
            onLabelChange={(v) =>
              updateExpense('lifestyle', item.id, 'label', v)
            }
            onAmountChange={(v) =>
              updateExpense('lifestyle', item.id, 'amount', v)
            }
            onDelete={() => deleteExpense('lifestyle', item.id)}
          />
        ))}
      </SectionCard>

      {/* EPF */}
      <SectionCard
        icon="savings"
        title="EPF / Life Insurance"
        onAdd={() => addExpense('epf', '')}
        addLabel="Add EPF / Insurance"
      >
        {profile.expenses.epf.map((item) => (
          <LineItem
            key={item.id}
            label={item.label}
            labelPlaceholder="Provider"
            amount={item.amount}
            onLabelChange={(v) => updateExpense('epf', item.id, 'label', v)}
            onAmountChange={(v) => updateExpense('epf', item.id, 'amount', v)}
            onDelete={() => deleteExpense('epf', item.id)}
          />
        ))}
      </SectionCard>

      {/* Parental care */}
      <SectionCard
        icon="family_restroom"
        title="Parental Care"
        onAdd={() => addExpense('parental', '')}
        addLabel="Add Parental Care Expense"
      >
        {profile.expenses.parental.length === 0 && (
          <p className="text-sm text-on-surface-variant">
            No parental care expenses added yet.
          </p>
        )}
        {profile.expenses.parental.map((item) => (
          <LineItem
            key={item.id}
            label={item.label}
            labelPlaceholder="Provider / Type of care"
            amount={item.amount}
            onLabelChange={(v) =>
              updateExpense('parental', item.id, 'label', v)
            }
            onAmountChange={(v) =>
              updateExpense('parental', item.id, 'amount', v)
            }
            onDelete={() => deleteExpense('parental', item.id)}
          />
        ))}
      </SectionCard>

      {/* CTA */}
      <div className="flex justify-end pb-4">
        <a
          href="/reliefs"
          className="flex items-center gap-3 rounded-lg bg-on-primary-container px-9 py-4 text-lg font-semibold text-on-primary-fixed shadow-lg shadow-on-primary-container/20 hover:opacity-90 transition-opacity"
        >
          Verify &amp; Continue
          <MatIcon name="arrow_forward" className="text-xl" />
        </a>
      </div>
    </div>
  )
}
