import { getChatHistory, getChatContext } from '@/lib/api'
import { cookieHeaderFromRequest } from '@/lib/api/server-cookies'
import { ChatWindow } from './_components/chat-window'
import { ChatContextSidebar } from './_components/chat-context-sidebar'

export default async function ChatPage() {
  const cookieHeader = await cookieHeaderFromRequest()
  const ctx = { cookieHeader }
  const [messages, chatContext] = await Promise.all([
    getChatHistory(ctx),
    getChatContext(ctx),
  ])

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-surface md:flex-row">
      <ChatWindow initialMessages={messages} chatContext={chatContext} />
      <ChatContextSidebar ctx={chatContext} />
    </div>
  )
}
