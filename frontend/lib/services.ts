// ─── Service layer for MyTax+ ────────────────────────────────────────────────
// Each function currently returns mock data.
// To connect to the real backend, uncomment the apiFetch line and remove the mock return.
// All endpoints assume base URL from NEXT_PUBLIC_API_URL (default: http://localhost:8000).

import { apiFetch } from "@/lib/api";
import type {
  DashboardStatus,
  UploadedDocument,
  AiExtraction,
  TaxProfile,
  Relief,
  TaxSummary,
  FilingData,
  ChatMessage,
  ChatContext,
} from "@/lib/types";
import {
  MOCK_DASHBOARD_STATUS,
  MOCK_DOCUMENTS,
  MOCK_AI_EXTRACTIONS,
  MOCK_TAX_PROFILE,
  MOCK_RELIEFS,
  MOCK_TAX_SUMMARY,
  MOCK_FILING_DATA,
  MOCK_CHAT_MESSAGES,
  MOCK_CHAT_CONTEXT,
} from "@/lib/mock-data";

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== "false";

// ─── Dashboard ───────────────────────────────────────────────────────────────

// GET /api/v1/dashboard
export async function getDashboardStatus(): Promise<DashboardStatus> {
  if (!USE_MOCK) return apiFetch<DashboardStatus>("/api/v1/dashboard");
  return MOCK_DASHBOARD_STATUS;
}

// ─── Module 1: Documents ─────────────────────────────────────────────────────

// GET /api/v1/documents
export async function getDocuments(): Promise<UploadedDocument[]> {
  if (!USE_MOCK) return apiFetch<UploadedDocument[]>("/api/v1/documents");
  return MOCK_DOCUMENTS;
}

// GET /api/v1/documents/extractions
export async function getAiExtractions(): Promise<AiExtraction[]> {
  if (!USE_MOCK) return apiFetch<AiExtraction[]>("/api/v1/documents/extractions");
  return MOCK_AI_EXTRACTIONS;
}

// POST /api/v1/documents/upload
export async function uploadDocument(file: File): Promise<UploadedDocument> {
  if (!USE_MOCK) {
    const form = new FormData();
    form.append("file", file);
    return apiFetch<UploadedDocument>("/api/v1/documents/upload", {
      method: "POST",
      body: form,
    });
  }
  // Mock: return a new "uploading" document
  const mock: UploadedDocument = {
    id: `doc-${Date.now()}`,
    name: file.name,
    sizeKb: Math.round(file.size / 1024),
    uploadedAt: new Date().toISOString(),
    status: "uploading",
    category: null,
  };
  return mock;
}

// ─── Module 2: Tax Profile ────────────────────────────────────────────────────

// GET /api/v1/profile
export async function getProfile(): Promise<TaxProfile> {
  if (!USE_MOCK) return apiFetch<TaxProfile>("/api/v1/profile");
  return MOCK_TAX_PROFILE;
}

// PUT /api/v1/profile
export async function updateProfile(data: Partial<TaxProfile>): Promise<TaxProfile> {
  if (!USE_MOCK)
    return apiFetch<TaxProfile>("/api/v1/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  return { ...MOCK_TAX_PROFILE, ...data };
}

// ─── Module 3: Relief Detection ──────────────────────────────────────────────

// GET /api/v1/reliefs
export async function getReliefs(): Promise<Relief[]> {
  if (!USE_MOCK) return apiFetch<Relief[]>("/api/v1/reliefs");
  return MOCK_RELIEFS;
}

// POST /api/v1/reliefs/analyze
export async function analyzeReliefs(): Promise<Relief[]> {
  if (!USE_MOCK)
    return apiFetch<Relief[]>("/api/v1/reliefs/analyze", { method: "POST" });
  return MOCK_RELIEFS;
}

// ─── Module 4: Tax Summary ────────────────────────────────────────────────────

// GET /api/v1/summary
export async function getTaxSummary(): Promise<TaxSummary> {
  if (!USE_MOCK) return apiFetch<TaxSummary>("/api/v1/summary");
  return MOCK_TAX_SUMMARY;
}

// ─── Module 5: Filing Assistant ───────────────────────────────────────────────

// GET /api/v1/filing
export async function getFilingData(): Promise<FilingData> {
  if (!USE_MOCK) return apiFetch<FilingData>("/api/v1/filing");
  return MOCK_FILING_DATA;
}

// ─── Module 6: AI Chat ────────────────────────────────────────────────────────

// GET /api/v1/chat/history
export async function getChatHistory(): Promise<ChatMessage[]> {
  if (!USE_MOCK) return apiFetch<ChatMessage[]>("/api/v1/chat/history");
  return MOCK_CHAT_MESSAGES;
}

// GET /api/v1/chat/context
export async function getChatContext(): Promise<ChatContext> {
  if (!USE_MOCK) return apiFetch<ChatContext>("/api/v1/chat/context");
  return MOCK_CHAT_CONTEXT;
}

// POST /api/v1/chat
export async function sendChatMessage(
  message: string,
): Promise<ChatMessage> {
  if (!USE_MOCK)
    return apiFetch<ChatMessage>("/api/v1/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
  // Mock: echo a simulated AI reply
  const reply: ChatMessage = {
    id: `msg-${Date.now()}`,
    role: "assistant",
    content: `Based on your 2023 tax profile, here's what I found regarding "${message}": Your current optimised deductions total RM 26,950, resulting in a chargeable income of RM 69,050. I recommend reviewing your EPF and lifestyle relief claims for additional savings.`,
    timestamp: new Date().toISOString(),
  };
  return reply;
}
