import type { ChatMessage, ChatContext } from '@/lib/types'
import {
  MOCK_CHAT_MESSAGES,
  MOCK_CHAT_CONTEXT,
} from '@/lib/mock-data'
import { apiFetch } from '@/lib/api/client'
import { USE_API_MOCK, type ServerApiContext } from '@/lib/api/config'
import {
  chatContextSchema,
  chatMessageListSchema,
  chatMessageSchema,
} from '@/lib/validations/api-schemas'

/** GET /api/v1/chat/history */
export async function getChatHistory(
  ctx?: ServerApiContext
): Promise<ChatMessage[]> {
  if (!USE_API_MOCK) {
    return apiFetch('/api/v1/chat/history', {
      responseSchema: chatMessageListSchema,
      cookieHeader: ctx?.cookieHeader,
    })
  }
  return chatMessageListSchema.parse(MOCK_CHAT_MESSAGES)
}

/** GET /api/v1/chat/context */
export async function getChatContext(
  ctx?: ServerApiContext
): Promise<ChatContext> {
  if (!USE_API_MOCK) {
    return apiFetch('/api/v1/chat/context', {
      responseSchema: chatContextSchema,
      cookieHeader: ctx?.cookieHeader,
    })
  }
  return chatContextSchema.parse(MOCK_CHAT_CONTEXT)
}

/** POST /api/v1/chat */
export async function sendChatMessage(
  message: string,
  ctx?: ServerApiContext
): Promise<ChatMessage> {
  if (!USE_API_MOCK) {
    return apiFetch('/api/v1/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
      responseSchema: chatMessageSchema,
      cookieHeader: ctx?.cookieHeader,
    })
  }
  const reply: ChatMessage = {
    id: `msg-${Date.now()}`,
    role: 'assistant',
    content: `Based on your 2023 tax profile, here's what I found regarding "${message}": Your current optimised deductions total RM 26,950, resulting in a chargeable income of RM 69,050. I recommend reviewing your EPF and lifestyle relief claims for additional savings.`,
    timestamp: new Date().toISOString(),
  }
  return chatMessageSchema.parse(reply)
}
