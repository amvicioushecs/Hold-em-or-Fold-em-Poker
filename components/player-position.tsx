"use client"

import { useState, useEffect } from "react"
import { useWebRTC } from "@/hooks/use-webrtc"
import { useChat } from "@/hooks/use-chat"
import { usePokerGame } from "@/hooks/use-poker-game"
import VideoPlayer from "./video-player"
import ChatBubble from "./chat-bubble"
import Card from "./card"
import PlayerTurnIndicator from "./player-turn-indicator"
import { cn } from "@/lib/utils"

interface PlayerPositionProps {
  playerId: string
  position: string
  showCards?: boolean
}

export default function PlayerPosition({ playerId, position, showCards = false }: PlayerPositionProps) {
  const { players } = useWebRTC()
  const { messages } = useChat()
  const { gameState, handleTimeUp, turnDuration } = usePokerGame()
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

  const playerState = gameState?.players.find((p) => p.id === playerId)
  const playerCards = playerState?.cards || []
  const isPlayerTurn = gameState && gameState.players[gameState.currentPlayerIndex]?.id === playerId
  const isHero = playerId === "local" || position === "bottom"

  // Mobile-first seat ring positions (portrait felt)
  const positionClasses: Record<string, string> = {
    top: "top-[1%] left-1/2 -translate-x-1/2",
    "top-left": "top-[14%] left-[1%]",
    "top-right": "top-[14%] right-[1%]",
    "bottom-left": "bottom-[14%] left-[1%]",
    "bottom-right": "bottom-[14%] right-[1%]",
    bottom: "bottom-[0%] left-1/2 -translate-x-1/2",
  }

  const getCardPositionClass = (pos: string) => {
    switch (pos) {
      case "top":
        return "absolute top-[105%] left-1/2 -translate-x-1/2 flex gap-0.5 scale-75 origin-top z-40"
      case "top-left":
      case "bottom-left":
        return "absolute left-[105%] top-[12%] flex gap-0.5 scale-75 origin-left z-40"
      case "top-right":
      case "bottom-right":
        return "absolute right-[105%] top-[12%] flex gap-0.5 scale-75 origin-right z-40"
      case "bottom":
        return "absolute bottom-[102%] left-1/2 -translate-x-1/2 flex gap-0.5 scale-90 origin-bottom z-40"
      default:
        return "absolute -bottom-6 left-1/2 -translate-x-1/2 flex gap-0.5 scale-75 origin-top z-40"
    }
  }

  const chipLabel = `$${(playerState?.chips ?? 0).toLocaleString()}`

  return (
    <div className={cn("absolute z-30 transition-all duration-300", positionClasses[position])}>
      <div className="relative flex flex-col items-center">
        {playerId !== "local" && (
          <PlayerTurnIndicator
            position={position}
            isActive={!!isPlayerTurn}
            onTimeUp={handleTimeUp}
            duration={turnDuration}
          />
        )}

        {/* Chip stack above seat for top half; below for bottom half */}
        {(position === "top" || position === "top-left" || position === "top-right") && (
          <span className="mb-1.5 text-[15px] leading-none font-normal text-[#FFDA5F] tracking-tight">
            {chipLabel}
          </span>
        )}

        {/* Seat video tile — Figma: 96×128, #131A33 / #2C344D */}
        <div
          className={cn(
            "relative w-[80px] h-[106px] sm:w-[96px] sm:h-[128px] rounded-lg overflow-hidden flex flex-col bg-[#131A33] border border-[#2C344D] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] transition-all duration-300",
            isPlayerTurn && "ring-2 ring-[#E5A93C] shadow-[0_0_16px_rgba(229,169,60,0.45)]",
            isHero && "ring-1 ring-white/10",
          )}
        >
          <div className="w-full flex-grow overflow-hidden relative">
            <VideoPlayer
              stream={player.stream}
              name={player.name}
              isLocal={player.isLocal}
              videoEnabled={player.videoEnabled}
              audioEnabled={player.audioEnabled}
            />
          </div>

          <div className="absolute bottom-0 inset-x-0 bg-[#07090E]/85 backdrop-blur-[2px] py-0.5 text-center border-t border-white/5 z-20">
            <span className="text-[9px] sm:text-[10px] font-bold text-white tracking-wide truncate block px-1">
              {player.name}
            </span>
          </div>

          {showCards && playerCards.length > 0 && (
            <div className={getCardPositionClass(position)}>
              {playerCards.map((card, index) => (
                <Card
                  key={index}
                  card={card}
                  faceDown={playerId !== "local" && gameState?.phase !== "showdown"}
                  animate={true}
                  delay={index * 150}
                  size="sm"
                />
              ))}
            </div>
          )}
        </div>

        {(position === "bottom" || position === "bottom-left" || position === "bottom-right") && (
          <span className="mt-1.5 text-[15px] leading-none font-normal text-[#FFDA5F] tracking-tight">
            {chipLabel}
          </span>
        )}

        {lastMessage && (
          <ChatBubble
            key={lastMessage.timestamp}
            message={lastMessage.message}
            playerName={player.name}
            position={position as any}
          />
        )}
      </div>
    </div>
  )
}
