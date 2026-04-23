import 'server-only'

import { generateMockChatReply, MOCK_CHAT_CONTEXT } from '@/lib/mock-data'

export function sendChatMessage(message: string) {
  return {
    id: `msg-${Date.now()}`,
    role: 'assistant' as const,
    content: generateMockChatReply(message, MOCK_CHAT_CONTEXT),
    timestamp: new Date().toISOString(),
  }
}
