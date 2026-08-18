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

  // Get player's cards from game state
  const playerState = gameState?.players.find((p) => p.id === playerId)
  const playerCards = playerState?.cards || []

  // Check if this player is small blind or big blind
  const isSmallBlind = gameState && gameState.players[gameState.smallBlindIndex]?.id === playerId
  const isBigBlind = gameState && gameState.players[gameState.bigBlindIndex]?.id === playerId

  // Check if it's this player's turn
  const isPlayerTurn = gameState && gameState.players[gameState.currentPlayerIndex]?.id === playerId

  const positionClasses: Record<string, string> = {
    top: "top-[2%] left-1/2 -translate-x-1/2",
    "top-left": "top-[18%] left-[2%] md:left-[4%]",
    "top-right": "top-[18%] right-[2%] md:right-[4%]",
    "bottom-left": "bottom-[18%] left-[2%] md:left-[4%]",
    "bottom-right": "bottom-[18%] right-[2%] md:right-[4%]",
    bottom: "bottom-[2%] left-1/2 -translate-x-1/2",
  }

  const getCardPositionClass = (pos: string) => {
    switch (pos) {
      case "top":
        return "absolute top-[105%] left-1/2 -translate-x-1/2 flex gap-0.5 scale-75 md:scale-80 origin-top z-40"
      case "top-left":
      case "bottom-left":
        return "absolute left-[105%] top-[15%] flex gap-0.5 scale-75 md:scale-80 origin-left z-40"
      case "top-right":
      case "bottom-right":
        return "absolute right-[105%] top-[15%] flex gap-0.5 scale-75 md:scale-80 origin-right z-40"
      case "bottom":
        return "absolute bottom-[102%] left-1/2 -translate-x-1/2 flex gap-0.5 scale-90 md:scale-95 origin-bottom z-40"
      default:
        return "absolute -bottom-6 left-1/2 -translate-x-1/2 flex gap-0.5 scale-75 origin-top z-40"
    }
  }


  return (
    <div className={cn("absolute z-30 transition-all duration-300", positionClasses[position])}>
      <div className="relative">
        {/* Turn Timer Indicator - Opponents Only */}
        {playerId !== "local" && (
          <PlayerTurnIndicator
            position={position}
            isActive={isPlayerTurn || false}
            onTimeUp={handleTimeUp}
            duration={turnDuration}
          />
        )}

        {/* Avatar Box */}
        <div
          className={cn(
            "relative w-[80px] h-[106px] md:w-[96px] md:h-[128px] rounded-xl md:rounded-2xl bg-gradient-to-b from-slate-800 to-slate-900 overflow-hidden flex flex-col justify-between transition-all duration-300 border-2",
            isPlayerTurn ? "border-amber-400 shadow-[0_0_15px_rgba(251,176,59,0.5)]" : "border-slate-700/60 shadow-xl"
          )}
        >
          {/* Video / Profile Placeholder */}
          <div className="w-full flex-grow h-[80%] overflow-hidden relative">
            <VideoPlayer
              stream={player.stream}
              name={player.name}
              isLocal={player.isLocal}
              videoEnabled={player.videoEnabled}
              audioEnabled={player.audioEnabled}
            />
          </div>



          {/* Glassmorphic Player Name Banner at Bottom of Avatar Box */}
          <div className="absolute bottom-0 inset-x-0 bg-slate-950/85 backdrop-blur-[2px] py-0.5 md:py-1 text-center border-t border-white/5 z-20">
            <span className="text-[9px] md:text-[10px] font-bold text-white tracking-wide truncate block px-1">
              {player.name}
            </span>
          </div>

          {/* Player Cards (Opponent Hole Cards peeking) */}
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

      {/* Chips stack pill below avatar box */}
      <div className="mt-2 text-center z-20">
        <span className="bg-slate-950/90 border border-slate-800/80 text-[#FEB956] text-[9px] md:text-[11px] font-extrabold px-2.5 py-0.5 md:px-3 md:py-0.5 rounded-full shadow-lg whitespace-nowrap tracking-tight">
          ${playerState?.chips?.toLocaleString() || 0}
        </span>
      </div>
    </div>
  )
}
