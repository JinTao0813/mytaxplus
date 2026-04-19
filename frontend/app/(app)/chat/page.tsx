import { getChatHistory, getChatContext } from '@/lib/services'
import { ChatWindow } from './_components/chat-window'
import { ChatContextSidebar } from './_components/chat-context-sidebar'

export default async function ChatPage() {
  const [messages, chatContext] = await Promise.all([
    getChatHistory(),
    getChatContext(),
  ])

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-surface md:flex-row">
      <ChatWindow initialMessages={messages} chatContext={chatContext} />
      <ChatContextSidebar ctx={chatContext} />
    </div>
  )
}
