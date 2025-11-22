"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import type { ChatMessage } from "@/types/chat"

interface ChatContextType {
  messages: ChatMessage[]
  sendMessage: (playerId: string, playerName: string, message: string, type?: "text" | "system" | "emoji") => void
  clearMessages: () => void
  unreadCount: number
  markAsRead: () => void
}

const ChatContext = createContext<ChatContextType | null>(null)

export function ChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      playerId: "system",
      playerName: "System",
      message: "Welcome to Hold'em or Fold'em Poker! Good luck!",
      timestamp: new Date(),
      type: "system",
    },
  ])
  const [unreadCount, setUnreadCount] = useState(0)

  const sendMessage = (
    playerId: string,
    playerName: string,
    message: string,
    type: "text" | "system" | "emoji" = "text",
  ) => {
    const newMessage: ChatMessage = {
      id: `${Date.now()}-${Math.random()}`,
      playerId,
      playerName,
      message,
      timestamp: new Date(),
      type,
    }

    setMessages((prev) => [...prev, newMessage])
    if (playerId !== "local") {
      setUnreadCount((prev) => prev + 1)
    }
  }

  const clearMessages = () => {
    setMessages([])
  }

  const markAsRead = () => {
    setUnreadCount(0)
  }

  return (
    <ChatContext.Provider
      value={{
        messages,
        sendMessage,
        clearMessages,
        unreadCount,
        markAsRead,
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider")
  }
  return context
}
