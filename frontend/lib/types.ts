// ─── Shared domain types for MyTax+ ────────────────────────────────────────
// All monetary values are in Malaysian Ringgit (RM).

export type FilingStatus = "not_started" | "draft" | "in_progress" | "submitted";

export interface DashboardStatus {
  filingYear: number;
  status: FilingStatus;
  completionPercent: number;
  estimatedRefund: number;
  pendingAction: {
    title: string;
    description: string;
    actionLabel: string;
    actionHref: string;
  } | null;
}

// ─── Module 1: Document Ingestion ───────────────────────────────────────────

export type DocumentStatus = "uploading" | "processing" | "processed" | "error";
export type DocumentCategory = "medical" | "education" | "lifestyle" | "income" | "other";

export interface UploadedDocument {
  id: string;
  name: string;
  sizeKb: number;
  uploadedAt: string;
  status: DocumentStatus;
  category: DocumentCategory | null;
}

export interface AiExtraction {
  documentId: string;
  label: string;
  category: DocumentCategory;
  amount: number;
  confidence: number;
  taxSection: string;
  status: "complete" | "parsing";
}

// ─── Module 2: Tax Profile ───────────────────────────────────────────────────

export type IncomeType = "employment" | "freelance" | "rental" | "dividend" | "other";
export type ExpenseCategory = "medical" | "education" | "lifestyle" | "epf" | "parental" | "other";

export interface IncomeItem {
  id: string;
  type: IncomeType;
  label: string;
  amount: number;
}

export interface ExpenseItem {
  id: string;
  category: ExpenseCategory;
  label: string;
  amount: number;
}

export interface TaxProfile {
  totalIncome: number;
  totalDeductions: number;
  incomeItems: IncomeItem[];
  expenses: {
    medical: ExpenseItem[];
    education: ExpenseItem[];
    lifestyle: ExpenseItem[];
    epf: ExpenseItem[];
    parental: ExpenseItem[];
  };
}

// ─── Module 3: Relief Detection ─────────────────────────────────────────────

export type ReliefStatus = "claimed" | "missed" | "partial";

export interface Relief {
  id: string;
  name: string;
  category: ExpenseCategory;
  icon: string;
  description: string;
  claimedAmount: number;
  maxAmount: number;
  status: ReliefStatus;
  taxSection: string;
  suggestion?: string;
}

// ─── Module 4: Tax Summary ───────────────────────────────────────────────────

export interface TaxBracket {
  from: number;
  to: number | null;
  rate: number;
}

export interface TaxCalculation {
  totalIncome: number;
  totalDeductions: number;
  chargeableIncome: number;
  taxPayable: number;
}

export interface TaxSummary {
  baseline: TaxCalculation;
  optimized: TaxCalculation;
  savings: number;
}

// ─── Module 5: Filing Assistant ──────────────────────────────────────────────

export type FilingStepStatus = "complete" | "in_progress" | "pending" | "missing";

export interface FilingStep {
  id: string;
  step: number;
  title: string;
  description: string;
  status: FilingStepStatus;
  fields?: FilingField[];
}

export interface FilingField {
  id: string;
  label: string;
  value: string;
  isMissing?: boolean;
}

export interface FilingData {
  steps: FilingStep[];
  overallProgress: number;
}

// ─── Module 6: AI Assistant ──────────────────────────────────────────────────

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface ChatContext {
  totalIncome: number;
  totalDeductions: number;
  topRelief: string;
  estimatedSavings: number;
}
