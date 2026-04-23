'use client'

import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { MatIcon } from '@/components/ui/mat-icon'
import {
  generateMockChatReply,
  MOCK_SUGGESTED_QUERIES,
} from '@/lib/mock-data'
import type { ChatMessage, ChatContext } from '@/lib/types'

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-MY', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

interface Props {
  initialMessages: ChatMessage[]
  chatContext: ChatContext
}

export function ChatWindow({ initialMessages, chatContext }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [input, setInput] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isThinking])

  function sendMessage(text: string) {
    if (!text.trim() || isThinking) return
    const userId = crypto.randomUUID()
    const userMsg: ChatMessage = {
      id: `msg-${userId}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsThinking(true)

    setTimeout(() => {
      const aiMsg: ChatMessage = {
        id: `msg-${crypto.randomUUID()}-ai`,
        role: 'assistant',
        content: generateMockChatReply(text, chatContext),
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, aiMsg])
      setIsThinking(false)
    }, 1500)
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Chat header */}
      <div className="border-b border-outline-variant/20 bg-surface-container-lowest px-6 py-4 ambient-shadow">
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-high">
            <MatIcon
              name="smart_toy"
              filled
              className="text-xl text-secondary"
            />
            <span className="ai-pulse absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-surface-container-lowest bg-tertiary-fixed" />
          </div>
          <div>
            <p className="text-sm font-semibold text-on-surface">Ledger AI</p>
            <p className="text-xs text-secondary">
              Malaysian Tax Assistant · 2023 Filing
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="mx-auto flex max-w-2xl flex-col gap-5">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                'flex gap-3',
                msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              )}
            >
              {msg.role === 'assistant' && (
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-container-high">
                  <MatIcon
                    name="auto_awesome"
                    className="text-sm text-secondary"
                  />
                </div>
              )}
              <div
                className={cn(
                  'max-w-[75%] rounded-xl px-4 py-3',
                  msg.role === 'user'
                    ? 'rounded-tr-none bg-secondary text-secondary-foreground'
                    : 'rounded-tl-none bg-surface-container-lowest ambient-shadow text-on-surface'
                )}
              >
                <p className="whitespace-pre-line text-sm leading-relaxed">
                  {msg.content}
                </p>
                <p
                  className={cn(
                    'mt-1.5 text-[10px]',
                    msg.role === 'user'
                      ? 'text-secondary-foreground/60 text-right'
                      : 'text-on-surface-variant'
                  )}
                >
                  {formatTime(msg.timestamp)}
                </p>
              </div>
            </div>
          ))}

          {/* Thinking indicator */}
          {isThinking && (
            <div className="flex gap-3">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-container-high">
                <MatIcon
                  name="auto_awesome"
                  className="text-sm text-secondary"
                />
              </div>
              <div className="rounded-xl rounded-tl-none bg-surface-container-lowest px-4 py-3 ambient-shadow">
                <div className="flex gap-1.5 py-1">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="inline-block h-2 w-2 rounded-full bg-secondary opacity-60"
                      style={{ animation: `bounce 1.2s ${i * 0.2}s infinite` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Suggested queries */}
      <div className="border-t border-outline-variant/15 bg-surface-container-lowest/80 px-6 py-3">
        <div className="mx-auto max-w-2xl">
          <div className="flex flex-wrap gap-2">
            {MOCK_SUGGESTED_QUERIES.map((q) => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                className="rounded-full ghost-border bg-surface-container-low px-3 py-1.5 text-xs font-medium text-secondary hover:bg-surface-container-high transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-outline-variant/20 bg-surface-container-lowest px-6 py-4">
        <div className="mx-auto max-w-2xl">
          <div className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
              placeholder="Ask about your tax situation..."
              disabled={isThinking}
              className="w-full rounded-xl ghost-border bg-surface py-4 pl-5 pr-14 text-sm text-on-surface placeholder:text-on-surface-variant/40 outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all disabled:opacity-50"
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={isThinking || !input.trim()}
              className="absolute right-2 flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-secondary-foreground hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
            >
              <MatIcon name="send" filled className="text-xl" />
            </button>
          </div>
          <p className="mt-2 text-center text-[10px] font-medium uppercase tracking-widest text-on-surface-variant/40">
            Confidential AI Analysis · Grounded in Malaysian Tax Law
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes bounce {
          0%,
          80%,
          100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-6px);
          }
        }
      `}</style>
    </div>
  )
}
