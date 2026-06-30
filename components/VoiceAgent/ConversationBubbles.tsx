'use client'

import { useEffect, useRef } from 'react'

export type BubbleMessage = {
  id: string
  role: 'user' | 'agent'
  text: string
  timestamp: Date
}

interface ConversationBubblesProps {
  messages: BubbleMessage[]
}

export function ConversationBubbles({ messages }: ConversationBubblesProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (messages.length === 0) return null

  return (
    <div className="flex flex-col gap-2 max-h-48 overflow-y-auto px-1 py-2">
      {messages.map(msg => (
        <div
          key={msg.id}
          className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm leading-snug ${
              msg.role === 'user'
                ? 'bg-orange-500 text-white rounded-br-sm'
                : 'bg-white text-gray-800 border border-gray-200 rounded-bl-sm shadow-sm'
            }`}
          >
            {msg.role === 'agent' && (
              <span className="text-xs font-bold text-green-700 block mb-0.5">
                MaMairie IA
              </span>
            )}
            <p>{msg.text}</p>
          </div>
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  )
}
