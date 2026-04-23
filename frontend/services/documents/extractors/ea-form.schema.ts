/**
 * EA Form (C.P.8A) — Custom Document Extractor field IDs must match Workbench label
 * `Name` values (same as `id` in ea-form-schema-fields.json at repo root).
 */

import type { ExtractionCategory } from './types'

/** Canonical employment income for tax profile when present (avoids double-count with line items). */
export const EA_WORKBENCH_INCOME_TOTAL_ID = 'total_sum_section_b_and_c'

/** MTD / PCB remitted to LHDNM (EA Form D1). */
export const EA_WORKBENCH_MTD_FIELD_ID = 'deduction_mtd_remittance_lhdnm_d1'

export type EaMoneyFieldSpec = {
  /** Workbench / JSON field id — must match `entity.type` from Document AI (case-insensitive). */
  workbenchFieldId: string
  /** Row label in UI / Firestore. */
  label: string
  category: ExtractionCategory
}

/**
 * Money fields to persist as extraction rows (PRD core + optional Section B/D/F for richer UI).
 * Order does not affect output; entities are matched by id.
 */
export const EA_MONEY_FIELD_SPECS: EaMoneyFieldSpec[] = [
  // PRD core — income detail
  {
    workbenchFieldId: 'income_gross_salary_wages_leave_pay_1a',
    label: 'Gross salary, wages or leave pay (1a)',
    category: 'income',
  },
  {
    workbenchFieldId: 'income_fees_commission_bonus_1b',
    label: 'Fees, commission or bonus (1b)',
    category: 'income',
  },
  {
    workbenchFieldId: EA_WORKBENCH_INCOME_TOTAL_ID,
    label: 'Total (Section B and C)',
    category: 'income',
  },
  // Section B — optional lines
  {
    workbenchFieldId: 'income_tips_perquisites_allowances_1c',
    label: 'Tips, perquisites, allowances (1c)',
    category: 'income',
  },
  {
    workbenchFieldId: 'income_tax_borne_by_employer_1d',
    label: 'Income tax borne by employer (1d)',
    category: 'income',
  },
  {
    workbenchFieldId: 'income_esos_benefit_1e',
    label: 'ESOS benefit (1e)',
    category: 'income',
  },
  {
    workbenchFieldId: 'income_gratuity_1f',
    label: 'Gratuity (1f)',
    category: 'income',
  },
  {
    workbenchFieldId: 'income_arrears_preceding_years_2',
    label: 'Arrears preceding years (2)',
    category: 'income',
  },
  {
    workbenchFieldId: 'income_benefits_in_kind_3',
    label: 'Benefits in kind (3)',
    category: 'income',
  },
  {
    workbenchFieldId: 'income_value_living_accommodation_4',
    label: 'Living accommodation (4)',
    category: 'income',
  },
  {
    workbenchFieldId: 'income_refund_unapproved_fund_5',
    label: 'Refund unapproved fund (5)',
    category: 'income',
  },
  {
    workbenchFieldId: 'income_compensation_loss_of_employment_6',
    label: 'Compensation loss of employment (6)',
    category: 'income',
  },
  {
    workbenchFieldId: 'income_pension_section_c_1',
    label: 'Pension (Section C)',
    category: 'income',
  },
  {
    workbenchFieldId: 'income_annuities_periodical_2',
    label: 'Annuities / periodical (Section C)',
    category: 'income',
  },
  // Tax / deductions
  {
    workbenchFieldId: EA_WORKBENCH_MTD_FIELD_ID,
    label: 'Monthly tax deductions (MTD/PCB)',
    category: 'tax_paid',
  },
  {
    workbenchFieldId: 'deduction_cp38_remittance_lhdnm_d2',
    label: 'CP38 remitted',
    category: 'tax_paid',
  },
  {
    workbenchFieldId: 'deduction_zakat_salary_d3',
    label: 'Zakat via salary',
    category: 'other',
  },
  {
    workbenchFieldId: 'deduction_approved_donations_salary_d4',
    label: 'Approved donations via salary',
    category: 'other',
  },
  {
    workbenchFieldId: 'deduction_tp1_relief_d5a',
    label: 'Form TP1 relief',
    category: 'other',
  },
  {
    workbenchFieldId: 'deduction_tp1_zakat_non_salary_d5b',
    label: 'Form TP1 zakat (non-salary)',
    category: 'other',
  },
  {
    workbenchFieldId: 'deduction_qualifying_child_relief_d6',
    label: 'Qualifying child relief',
    category: 'other',
  },
  // Section E / F
  {
    workbenchFieldId: 'epf_amount_employee_share',
    label: 'EPF (KWSP) employee contribution',
    category: 'epf',
  },
  {
    workbenchFieldId: 'socso_amount_employee_share',
    label: 'SOCSO employee contribution',
    category: 'socso',
  },
  {
    workbenchFieldId: 'total_tax_exempt_allowances_section_f',
    label: 'Total tax-exempt allowances (Section F)',
    category: 'other',
  },
]

/** Map Workbench text field ids → keys on document.extractedMetadata (UI + API). */
export const EA_METADATA_ENTITY_MAP: Array<{
  workbenchFieldId: string
  storageKey: string
}> = [
  { workbenchFieldId: 'year_ended', storageKey: 'taxYear' },
  { workbenchFieldId: 'employee_full_name', storageKey: 'employeeName' },
  { workbenchFieldId: 'employee_tin', storageKey: 'employeeTin' },
  { workbenchFieldId: 'new_ic_no', storageKey: 'employeeIc' },
  { workbenchFieldId: 'employer_name_address', storageKey: 'employerName' },
  { workbenchFieldId: 'employer_telephone', storageKey: 'employerPhone' },
  { workbenchFieldId: 'employer_tin', storageKey: 'employerTin' },
  { workbenchFieldId: 'job_designation', storageKey: 'jobDesignation' },
  { workbenchFieldId: 'staff_payroll_no', storageKey: 'staffPayrollNo' },
]
