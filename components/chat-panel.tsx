"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { MessageCircle, Send, Smile } from "lucide-react"
import { useChat } from "@/hooks/use-chat"
import { useWebRTC } from "@/hooks/use-webrtc"
import { cn } from "@/lib/utils"
import EmojiPicker from "./emoji-picker"

export default function ChatPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState("")
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const { messages, sendMessage, unreadCount, markAsRead } = useChat()
  const { players } = useWebRTC()
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const localPlayer = Array.from(players.values()).find((p) => p.isLocal)

  useEffect(() => {
    if (isOpen) {
      markAsRead()
      // Focus input when chat opens
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen, markAsRead])

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]")
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [messages])

  const handleSendMessage = () => {
    if (!message.trim() || !localPlayer) return

    sendMessage(localPlayer.id, localPlayer.name, message.trim(), "text")
    setMessage("")
    setShowEmojiPicker(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleEmojiSelect = (emoji: string) => {
    if (!localPlayer) return
    sendMessage(localPlayer.id, localPlayer.name, emoji, "emoji")
    setShowEmojiPicker(false)
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          size="icon"
          variant="secondary"
          className="w-9 h-9 md:w-12 md:h-12 rounded-full shadow-lg touch-manipulation relative"
        >
          <MessageCircle className="w-4 h-4 md:w-5 md:h-5 text-yellow-400" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md p-0 flex flex-col h-full bg-slate-950/60 backdrop-blur-md border-l border-slate-800/50 text-white shadow-2xl"
      >
        <SheetHeader className="p-4 border-b border-slate-800/60 bg-slate-950/40">
          <SheetTitle className="text-slate-100 font-extrabold tracking-wide">Chat</SheetTitle>
        </SheetHeader>

        {/* Messages Area */}
        <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
          <div className="space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex flex-col",
                  msg.type === "system" ? "items-center" : msg.playerId === "local" ? "items-end" : "items-start",
                )}
              >
                {msg.type === "system" ? (
                  <div className="bg-slate-900/60 text-slate-300 border border-slate-850 px-3 py-1.5 rounded-full text-xs font-medium">{msg.message}</div>
                ) : (
                  <>
                    {msg.playerId !== "local" && (
                      <span className="text-xs text-slate-400 mb-1 px-1 font-semibold">{msg.playerName}</span>
                    )}
                    <div
                      className={cn(
                        "rounded-2xl px-4 py-2 max-w-[75%] break-words border font-medium shadow-md",
                        msg.type === "emoji" ? "text-4xl p-2 bg-transparent border-0 shadow-none" : "",
                        msg.playerId === "local"
                          ? "bg-gradient-to-r from-[#FEB956] to-amber-500 text-slate-950 border-amber-500/30 rounded-br-sm font-extrabold"
                          : "bg-slate-900/90 text-slate-100 border-slate-800/80 rounded-bl-sm",
                      )}
                    >
                      {msg.message}
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 px-1">
                      {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Emoji Picker */}
        {showEmojiPicker && (
          <div className="border-t border-slate-800/60 p-2 bg-slate-950/80">
            <EmojiPicker onSelect={handleEmojiSelect} />
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 border-t border-slate-800/60 bg-slate-950/80 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="shrink-0 text-slate-400 hover:text-white hover:bg-slate-900/50"
            >
              <Smile className="w-5 h-5" />
            </Button>
            <Input
              ref={inputRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="flex-1 bg-slate-900/80 border-slate-800 text-slate-100 placeholder:text-slate-500 focus-visible:ring-[#FEB956]/50 focus-visible:border-[#FEB956]"
            />
            <Button
              size="icon"
              onClick={handleSendMessage}
              disabled={!message.trim()}
              className="shrink-0 bg-gradient-to-r from-[#FEB956] to-amber-500 text-slate-950 hover:from-[#FEB956]/90 hover:to-amber-500/90 disabled:opacity-50 disabled:bg-slate-800 disabled:text-slate-500"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
