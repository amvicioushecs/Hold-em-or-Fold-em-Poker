"use client"

import { useState, useEffect } from "react"
import { useWebRTC } from "@/hooks/use-webrtc"
import { useChat } from "@/hooks/use-chat"
import { usePokerGame } from "@/hooks/use-poker-game"
import VideoPlayer from "./video-player"
import ChatBubble from "./chat-bubble"
import Card from "./card"

interface PlayerPositionProps {
  playerId: string
  position: string
  showCards?: boolean
}

export default function PlayerPosition({ playerId, position, showCards = false }: PlayerPositionProps) {
  const { players } = useWebRTC()
  const { messages } = useChat()
  const { gameState } = usePokerGame()
  const player = players.get(playerId)
  const [lastMessage, setLastMessage] = useState<{ message: string; timestamp: number } | null>(null)

  useEffect(() => {
    const playerMessages = messages.filter((msg) => msg.playerId === playerId && msg.type === "text")
    if (playerMessages.length > 0) {
      const latest = playerMessages[playerMessages.length - 1]
      setLastMessage({
        message: latest.message,
        timestamp: latest.timestamp.getTime(),
      })
    }
  }, [messages, playerId])

  if (!player) return null

  // Get player's cards from game state
  const playerState = gameState?.players.find((p) => p.id === playerId)
  const playerCards = playerState?.cards || []

  const positionClasses: Record<string, string> = {
    top: "top-1 left-1/2 -translate-x-1/2 md:top-4",
    "top-left": "top-8 left-1 md:top-16 md:left-4",
    "top-right": "top-8 right-1 md:top-16 md:right-4",
    "bottom-left": "bottom-20 left-1 md:bottom-32 md:left-4",
    "bottom-right": "bottom-20 right-1 md:bottom-32 md:right-4",
    bottom: "bottom-14 left-1/2 -translate-x-1/2 md:bottom-4",
  }

  return (
    <div
      className={`absolute bg-sidebar-border shadow-xl text-transparent border-0 rounded-4xl ${positionClasses[position]} z-30`}
    >
      <div className="relative">
        {/* Video Feed */}
        <div className="relative w-20 h-20 md:w-32 md:h-32 lg:w-40 lg:h-40 shadow-md md:shadow-lg border border-border md:border-2 rounded-md md:rounded-lg overflow-hidden">
          <VideoPlayer
            stream={player.stream}
            name={player.name}
            isLocal={player.isLocal}
            videoEnabled={player.videoEnabled}
            audioEnabled={player.audioEnabled}
          />

          {/* Player Cards */}
          {showCards && playerCards.length > 0 && (
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5 md:gap-1">
              {playerCards.map((card, index) => (
                <Card key={index} card={card} faceDown={!player.isLocal} animate={true} delay={index * 150} size="sm" />
              ))}
            </div>
          )}
        </div>

        {/* Chat Bubble */}
        {lastMessage && (
          <ChatBubble
            key={lastMessage.timestamp}
            message={lastMessage.message}
            playerName={player.name}
            position={position as any}
          />
        )}
      </div>

      {/* Player Info */}
      <div className="mt-1 md:mt-2 text-center backdrop-blur-sm rounded px-1.5 py-0.5 md:px-2 md:py-1 md:shadow max-w-[80px] md:max-w-none mx-auto text-slate-50 shadow-none bg-black border-solid border opacity-100 border-slate-700">
        <p className="text-[10px] md:text-xs font-semibold truncate text-card-foreground">{player.name}</p>
        <p className="text-[9px] md:text-xs text-muted-foreground">${playerState?.chips || 0}</p>
      </div>
    </div>
  )
}
