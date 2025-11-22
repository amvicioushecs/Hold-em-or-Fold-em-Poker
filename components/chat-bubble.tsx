"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

interface ChatBubbleProps {
  message: string
  playerName: string
  position: "top" | "top-left" | "top-right" | "bottom-left" | "bottom-right" | "bottom"
}

export default function ChatBubble({ message, playerName, position }: ChatBubbleProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
    }, 5000)

    return () => clearTimeout(timer)
  }, [message])

  if (!isVisible) return null

  const positionClasses: Record<string, string> = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    "top-left": "bottom-full left-0 mb-2",
    "top-right": "bottom-full right-0 mb-2",
    "bottom-left": "top-full left-0 mt-2",
    "bottom-right": "top-full right-0 mt-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
  }

  return (
    <div
      className={cn("absolute z-50 animate-in fade-in slide-in-from-bottom-2 duration-300", positionClasses[position])}
    >
      <div className="bg-card/95 backdrop-blur-sm rounded-lg shadow-lg border border-border p-2 max-w-[200px]">
        <p className="text-[10px] font-semibold text-foreground mb-0.5">{playerName}</p>
        <p className="text-xs text-foreground break-words">{message}</p>
      </div>
    </div>
  )
}
