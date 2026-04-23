// ─── Mock data for all MyTax+ modules ───────────────────────────────────────
// All monetary values are in RM (Malaysian Ringgit).
// Replace imports of this file with real API calls via lib/api/*.

import type {
  DashboardStatus,
  UploadedDocument,
  AiExtraction,
  TaxProfile,
  TaxSummary,
  FilingData,
  ChatMessage,
  ChatContext,
} from '@/lib/types'

// ─── Dashboard ───────────────────────────────────────────────────────────────

export const MOCK_DASHBOARD_STATUS: DashboardStatus = {
  filingYear: 2023,
  status: 'draft',
  completionPercent: 65,
  estimatedRefund: 4250,
  pendingAction: {
    title: 'Upload your EA Form',
    description:
      'We need your primary earnings document to proceed. Secure upload takes less than a minute.',
    actionLabel: 'Upload Now',
    actionHref: '/upload',
  },
}

// ─── Module 1: Documents ─────────────────────────────────────────────────────

export const MOCK_DOCUMENTS: UploadedDocument[] = [
  {
    id: 'doc-001',
    name: 'Medical_Receipt_Gleneagles_2023.pdf',
    sizeKb: 2400,
    uploadedAt: '2024-01-15T10:45:00Z',
    status: 'processed',
    category: 'medical',
  },
  {
    id: 'doc-002',
    name: 'EA_Form_TechCorp_FY23.pdf',
    sizeKb: 1100,
    uploadedAt: '2024-01-15T10:30:00Z',
    status: 'processed',
    category: 'income',
  },
  {
    id: 'doc-003',
    name: 'Tuition_Invoice_Semester1.jpeg',
    sizeKb: 4500,
    uploadedAt: '2024-01-15T11:00:00Z',
    status: 'processing',
    category: 'education',
  },
]

export const MOCK_AI_EXTRACTIONS: AiExtraction[] = [
  {
    documentId: 'doc-001',
    label: 'Gleneagles Medical Checkup',
    category: 'medical',
    amount: 1250,
    confidence: 98,
    taxSection: 'Section 46(1)(g) Complete Medical Examination',
    status: 'complete',
  },
  {
    documentId: 'doc-002',
    label: 'TechCorp Upskill Course',
    category: 'education',
    amount: 3400,
    confidence: 95,
    taxSection: 'Section 46(1)(f) Approved Course of Study',
    status: 'complete',
  },
  {
    documentId: 'doc-003',
    label: 'University Tuition Fee',
    category: 'education',
    amount: 0,
    confidence: 0,
    taxSection: '',
    status: 'parsing',
  },
]

// ─── Module 2: Tax Profile ────────────────────────────────────────────────────

export const MOCK_TAX_PROFILE: TaxProfile = {
  totalIncome: 96000,
  totalDeductions: 18240,
  incomeItems: [
    {
      id: 'inc-001',
      type: 'employment',
      label: 'TechCorp Sdn Bhd (EA Form)',
      amount: 84000,
    },
    {
      id: 'inc-002',
      type: 'freelance',
      label: 'Freelance Consulting (1099-NEC)',
      amount: 12000,
    },
  ],
  expenses: {
    medical: [
      {
        id: 'med-001',
        category: 'medical',
        label: 'Gleneagles Hospital – Surgery',
        amount: 4200,
      },
      {
        id: 'med-002',
        category: 'medical',
        label: 'Pantai Hospital – Checkup',
        amount: 1250,
      },
    ],
    education: [
      {
        id: 'edu-001',
        category: 'education',
        label: 'TechCorp Upskill – Cybersecurity',
        amount: 3400,
      },
      {
        id: 'edu-002',
        category: 'education',
        label: 'University Tuition Fee – Semester 1',
        amount: 5800,
      },
    ],
    lifestyle: [
      {
        id: 'lif-001',
        category: 'lifestyle',
        label: 'Laptop (Home Office Equipment)',
        amount: 2500,
      },
    ],
    epf: [
      {
        id: 'epf-001',
        category: 'epf',
        label: 'Employee Provident Fund (EPF)',
        amount: 8400,
      },
    ],
    parental: [],
  },
  statutory: {
    epf: 8400,
    socso: 276.15,
    mtd: 4200,
  },
}

// ─── Module 4: Tax Summary ────────────────────────────────────────────────────

export const MOCK_TAX_SUMMARY: TaxSummary = {
  baseline: {
    totalIncome: 96000,
    totalDeductions: 15000,
    chargeableIncome: 81000,
    taxPayable: 6800,
  },
  optimized: {
    totalIncome: 96000,
    totalDeductions: 26950,
    chargeableIncome: 69050,
    taxPayable: 4900,
  },
  savings: 1900,
}

// ─── Module 5: Filing Assistant ───────────────────────────────────────────────

export const MOCK_FILING_DATA: FilingData = {
  overallProgress: 60,
  steps: [
    {
      id: 'step-001',
      step: 1,
      title: 'Personal Details',
      description: 'Verify your NRIC, address, and contact information',
      status: 'complete',
      fields: [
        { id: 'f-001', label: 'Full Name', value: 'Ahmad Rizal bin Abdullah' },
        { id: 'f-002', label: 'NRIC', value: '890101-14-5678' },
        { id: 'f-003', label: 'Address', value: 'No. 12, Jalan Ampang, KL' },
        { id: 'f-004', label: 'Email', value: 'ahmad.rizal@email.com' },
      ],
    },
    {
      id: 'step-002',
      step: 2,
      title: 'Income Declaration',
      description:
        'Confirm all income sources extracted from your EA Form and receipts',
      status: 'complete',
      fields: [
        {
          id: 'f-005',
          label: 'Gross Employment Income',
          value: 'RM 84,000.00',
        },
        {
          id: 'f-006',
          label: 'Freelance / Other Income',
          value: 'RM 12,000.00',
        },
        { id: 'f-007', label: 'Total Income', value: 'RM 96,000.00' },
      ],
    },
    {
      id: 'step-003',
      step: 3,
      title: 'Reliefs & Deductions',
      description: 'Review AI-optimized reliefs before submission',
      status: 'in_progress',
      fields: [
        { id: 'f-008', label: 'Medical Expenses', value: 'RM 5,450.00' },
        { id: 'f-009', label: 'Education Fees', value: 'RM 7,000.00' },
        { id: 'f-010', label: 'Lifestyle Relief', value: 'RM 2,500.00' },
        { id: 'f-011', label: 'EPF Contribution', value: 'RM 8,400.00' },
        {
          id: 'f-012',
          label: 'Parental Care',
          value: '',
          isMissing: true,
        },
      ],
    },
    {
      id: 'step-004',
      step: 4,
      title: 'Tax Computation',
      description: 'Final chargeable income and tax payable',
      status: 'pending',
      fields: [
        { id: 'f-013', label: 'Chargeable Income', value: 'RM 69,050.00' },
        { id: 'f-014', label: 'Estimated Tax Payable', value: 'RM 4,900.00' },
        { id: 'f-015', label: 'PCB Already Deducted', value: 'RM 5,200.00' },
        { id: 'f-016', label: 'Estimated Refund', value: 'RM 300.00' },
      ],
    },
    {
      id: 'step-005',
      step: 5,
      title: 'Submit to LHDN',
      description: 'Review and submit your e-Filing via MyTax portal',
      status: 'pending',
    },
  ],
}

// ─── Module 6: AI Chat ────────────────────────────────────────────────────────

export const MOCK_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-001',
    role: 'assistant',
    content:
      "Hello! I'm Ledger AI, your personal Malaysian tax assistant. I've analysed your 2023 tax profile. You have an estimated refund of RM 4,250 after optimisation. How can I help you today?",
    timestamp: '2024-01-15T10:00:00Z',
  },
]

export const MOCK_CHAT_CONTEXT: ChatContext = {
  totalIncome: 96000,
  totalDeductions: 26950,
  topRelief: 'Education Fees (RM 7,000)',
  estimatedSavings: 1900,
}

function formatRMForMock(n: number) {
  return `RM ${n.toLocaleString('en-MY', { minimumFractionDigits: 2 })}`
}

/** Demo assistant replies for the chat UI when not calling the real chat API. */
export function generateMockChatReply(
  question: string,
  ctx: ChatContext
): string {
  const q = question.toLowerCase()
  if (q.includes('relief') || q.includes('claim'))
    return `Based on your 2023 tax profile, you are eligible for the following Malaysian tax reliefs:\n\n• **Medical Expenses** (Section 46(1)(g)) — up to RM 10,000\n• **Education Fees** (Section 46(1)(f)) — up to RM 7,000\n• **Lifestyle** (Section 46(1)(k)) — up to RM 2,500\n• **EPF / Life Insurance** (Section 46(1)(b)) — up to RM 7,000\n• **Parental Care** (Section 46(1)(c)) — up to RM 8,000\n\nYou currently have RM ${ctx.totalDeductions.toLocaleString()} in optimised deductions.`
  if (q.includes('high') || q.includes('why'))
    return `Your chargeable income is higher than it should be because two key reliefs have not been fully claimed: your Lifestyle relief (RM 2,500) and EPF contributions. Once applied, your tax payable drops to ${formatRMForMock(4900)}, saving you ${formatRMForMock(ctx.estimatedSavings)}.`
  if (q.includes('reduce') || q.includes('save') || q.includes('lower'))
    return `The top three ways to reduce your tax this year:\n\n1. **Apply Lifestyle Relief** — your laptop purchase qualifies under Section 46(1)(k) for up to RM 2,500.\n2. **Maximise EPF** — you contributed RM 8,400 but only RM 4,000 has been claimed.\n3. **Add Parental Care** — if your parents required medical treatment, you can claim up to RM 8,000.\n\nTogether, these could save you an additional ${formatRMForMock(ctx.estimatedSavings)}.`
  return `Great question! Based on your 2023 filing profile (Total Income: ${formatRMForMock(ctx.totalIncome)}, Total Deductions: ${formatRMForMock(ctx.totalDeductions)}), I can help you with that. Could you provide more details so I can give you a more precise answer?`
}

export const MOCK_SUGGESTED_QUERIES = [
  'What reliefs can I claim?',
  'Why is my tax high?',
  'How to reduce my tax?',
  'Is my Gleneagles receipt eligible?',
  'What is the EPF relief limit?',
]
