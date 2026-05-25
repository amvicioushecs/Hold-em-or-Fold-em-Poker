"use client"

import { useState, useEffect } from "react"
import { useWebRTC } from "@/hooks/use-webrtc"
import { useChat } from "@/hooks/use-chat"
import { usePokerGame } from "@/hooks/use-poker-game"
import Card from "./card"
import PlayerTurnIndicator from "./player-turn-indicator"

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

  // Get player's state from game
  const playerState = gameState?.players.find((p) => p.id === playerId)
  const playerCards = playerState?.cards || []
  const isPlayerTurn = gameState && gameState.players[gameState.currentPlayerIndex]?.id === playerId
  const isDealer = gameState && gameState.players[gameState.dealerIndex]?.id === playerId
  const isLocalPlayer = playerId === "local"

  // Position mappings for 6 players around the table
  const positionClasses: Record<string, string> = {
    "top": "bottom-[5%] left-0",
    "top-left": "top-[25%] left-[5%]",
    "top-right": "top-[25%] right-[5%]",
    "bottom-left": "bottom-[28%] left-[5%]",
    "bottom-right": "bottom-[28%] right-[5%]",
    "bottom": "bottom-[5%] left-1/2 -translate-x-1/2",
  }

  // Get last action text
  const getStatusText = () => {
    if (playerState?.folded) return "Folded"
    if (playerState?.allIn) return "All-In"
    if (playerState?.lastAction === "check") return "Checked"
    if (playerState?.lastAction === "call") return "Called"
    if (playerState?.lastAction === "raise") return "Raised"
    return null
  }

  const statusText = getStatusText()

  return (
    <div className={`absolute ${positionClasses[position]} z-30 flex flex-col items-center`}>
      {/* Turn Timer (only show when it's this player's turn) */}
      {isPlayerTurn && !isLocalPlayer && (
        <PlayerTurnIndicator
          position={position}
          isActive={true}
          onTimeUp={handleTimeUp}
          duration={turnDuration}
        />
      )}

      {/* Player Card Container */}
      <div 
        className={`
          relative flex flex-col items-center overflow-hidden
          ${position === 'top' ? 'rounded-3xl border-4 border-primary w-32 md:w-48 ml-[1px]' : 'rounded-xl'}
          ${position !== 'top' && (isLocalPlayer ? 'w-24 md:w-32' : 'w-20 md:w-28')}
          ${isPlayerTurn && position !== 'top' ? 'ring-2 ring-primary gold-glow' : ''}
          ${isLocalPlayer && position !== 'top' ? 'border-2 border-primary bg-gradient-to-b from-primary/20 to-primary/5' : position !== 'top' ? 'player-card border border-border/50' : 'bg-slate-700'}
        `}
      >
        {/* Avatar/Video Area */}
        <div className={`
          relative w-full ${position === 'top' ? 'aspect-video' : 'aspect-[4/3]'} flex items-center justify-center
          ${playerState?.folded && position !== 'top' ? 'opacity-40' : ''}
          ${position === 'top' ? 'bg-gradient-to-br from-slate-500 to-slate-700' : 'bg-gradient-to-br from-slate-600/50 to-slate-800/50'}
        `}>


          {/* Dealer Button */}
          {isDealer && (
            <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-white text-black text-[10px] font-bold flex items-center justify-center shadow-md">
              D
            </div>
          )}

          {/* Player Cards (shown below video screen) */}
          {showCards && playerCards.length > 0 && !isLocalPlayer && position === 'top' && (
            <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex gap-1.5 origin-top">
              {playerCards.map((card, index) => (
                <Card 
                  key={index} 
                  card={card} 
                  faceDown={!playerState?.folded && gameState?.phase !== "showdown"} 
                  animate={true} 
                  delay={index * 150} 
                  size="md" 
                />
              ))}
            </div>
          )}
        </div>

        {/* Player Info */}
        {position !== 'top' && (
          <div className={`
            w-full px-2 py-1.5 text-center
            ${isLocalPlayer ? 'bg-gradient-to-b from-primary/10 to-transparent' : 'bg-black/40'}
            ${position === 'bottom' ? 'py-0 pr-[73px] bg-gradient-to-b from-primary/10 to-transparent' : ''}
          `}>
            {/* Player Name */}
            <p className={`
              text-xs md:text-sm font-semibold truncate
              ${isLocalPlayer ? 'text-primary' : 'text-white'}
              ${position === 'top' ? 'text-[rgba(255,255,255,0)]' : ''}
              ${position === 'bottom' ? 'text-transparent' : ''}
            `}>
              {player.name}{isLocalPlayer ? " (You)" : ""}
            </p>
            
            {/* Chips */}
            <p className={`
              text-[10px] md:text-xs font-bold
              ${isLocalPlayer ? 'text-primary' : 'text-emerald-400'}
              ${position === 'top' ? 'text-[rgba(0,0,0,0)]' : ''}
              ${position === 'bottom' ? 'text-[rgba(0,0,0,0.02)]' : ''}
            `}>
              ${playerState?.chips?.toLocaleString() || "0"}
            </p>
          </div>
        )}
      </div>

      {/* Bet Badge (positioned below the card) */}
      {playerState && playerState.bet > 0 && position !== 'bottom' && position !== 'top' && (
        <div className="mt-1.5 bet-badge px-2 py-0.5 rounded-full">
          <span className="text-[10px] md:text-xs text-white font-semibold">
            Bet: ${playerState.bet.toLocaleString()}
          </span>
        </div>
      )}

      {/* Status Badge (Checked, Folded, etc.) */}
      {statusText && playerState?.bet === 0 && position !== 'top' && (
        <div className="mt-1.5 px-2 py-0.5 rounded-full bg-black/60 border border-border/50">
          <span className="text-[10px] md:text-xs text-muted-foreground font-medium">
            {statusText}
          </span>
        </div>
      )}
    </div>
  )
}
