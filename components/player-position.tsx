"use client"

import { useState, useEffect } from "react"
import { useWebRTC } from "@/hooks/use-webrtc"
import { useChat } from "@/hooks/use-chat"
import { usePokerGame } from "@/hooks/use-poker-game"
import VideoPlayer from "./video-player"
import ChatBubble from "./chat-bubble"
import Card from "./card"
import BlindMarker from "./blind-marker"
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
    top: "top-14 left-1/2 -translate-x-1/2 md:top-16",
    "top-left": "top-28 left-2 md:top-24 md:left-4",
    "top-right": "top-28 right-2 md:top-24 md:right-4",
    "bottom-left": "bottom-36 left-2 md:bottom-36 md:left-4",
    "bottom-right": "bottom-36 right-2 md:bottom-36 md:right-4",
    bottom: "bottom-24 left-1/2 -translate-x-1/2 md:bottom-6",
  }

  return (
    <div
      className={`absolute bg-sidebar-border shadow-xl text-transparent border-0 rounded-2xl ${positionClasses[position]} z-30`}
    >
      <div className="relative">
        {/* Turn Timer Indicator */}
        <PlayerTurnIndicator
          position={position}
          isActive={isPlayerTurn || false}
          onTimeUp={handleTimeUp}
          duration={turnDuration}
        />

        {/* Video Feed */}
        <div className="relative w-[96px] h-[128px] shadow-md md:shadow-lg border border-border md:border-2 rounded-xl overflow-hidden bg-black/50">
          {/* Active Turn Glow */}
          {isPlayerTurn && (
            <div className="absolute inset-0 rounded-xl ring-4 ring-amber-400 animate-pulse z-10 pointer-events-none" />
          )}

          <VideoPlayer
            stream={player.stream}
            name={player.name}
            isLocal={player.isLocal}
            videoEnabled={player.videoEnabled}
            audioEnabled={player.audioEnabled}
          />

          {/* Blind Markers */}
          {isSmallBlind && <BlindMarker type="SB" />}
          {isBigBlind && <BlindMarker type="BB" />}

          {/* Player Cards */}
          {showCards && playerCards.length > 0 && (
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex gap-0.5 md:gap-1 scale-75 md:scale-90 origin-top">
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

      {/* Player Info (Chips only - Name removed) */}
      <div className={cn(
        "mt-1 md:mt-2 text-center backdrop-blur-sm rounded-full px-2 py-0.5 md:px-3 md:py-1 max-w-[80px] md:max-w-none mx-auto bg-black/60 border border-white/10 shadow-sm transition-all",
        showCards && playerCards.length > 0 && "mt-6 md:mt-2"
      )}>
        <div className="flex items-center justify-center gap-1">
          <p className="text-[10px] md:text-xs text-white font-bold tracking-tight">${playerState?.chips || 0}</p>
          {playerState && playerState.bet > 0 && (
            <span className="text-[9px] md:text-[11px] text-amber-400 font-bold">(${playerState.bet})</span>
          )}
        </div>
      </div>
    </div>
  )
}
