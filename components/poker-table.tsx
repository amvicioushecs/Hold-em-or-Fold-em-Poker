"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { ArrowLeft, Video, Settings } from "lucide-react"
import PlayerPosition from "./player-position"
import CommunityCards from "./community-cards"
import GameMenu from "./game-menu"
import Card from "./card"
import { useWebRTC } from "@/hooks/use-webrtc"
import { useChat } from "@/hooks/use-chat"
import { usePokerGame } from "@/hooks/use-poker-game"
import Lobby from "./lobby"
import type { StakeTable } from "./table-selection"

export default function PokerTable() {
  const [raiseAmount, setRaiseAmount] = useState([800])
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [gameStarted, setGameStarted] = useState(false)
  const [showLobby, setShowLobby] = useState(true)
  const [selectedTable, setSelectedTable] = useState<StakeTable | null>(null)
  const [selectedSeat, setSelectedSeat] = useState<number>(4)
  const { players } = useWebRTC()
  const { sendMessage } = useChat()
  const { gameState, startGame, makeAction, turnDuration } = usePokerGame()
  const [playerIds, setPlayerIds] = useState<string[]>([])

  useEffect(() => {
    const ids = Array.from(players.keys()).filter((id) => id !== "local")
    setPlayerIds(ids)
  }, [players])

  // Start game when we have enough players
  useEffect(() => {
    if (players.size >= 2 && !gameState && !gameStarted && !showLobby) {
      const timer = setTimeout(() => {
        const allPlayerIds = Array.from(players.keys())
        const allPlayerNames = Array.from(players.values()).map((p) => p.name)
        const seatNumbers: number[] = []
        const availableSeats = [1, 2, 3, 4, 5, 6].filter((s) => s !== selectedSeat)

        allPlayerIds.forEach((id) => {
          if (id === "local") {
            seatNumbers.push(selectedSeat)
          } else {
            seatNumbers.push(availableSeats.shift() || 1)
          }
        })

        const smallBlind = selectedTable?.smallBlind || 10
        const bigBlind = selectedTable?.bigBlind || 20
        const gameMode = selectedTable?.gameMode || "sng"
        startGame(allPlayerIds, allPlayerNames, seatNumbers, smallBlind, bigBlind, selectedSeat, gameMode)
        setGameStarted(true)
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [players, gameState, gameStarted, startGame, showLobby, selectedTable, selectedSeat])

  const positions = ["top", "top-left", "top-right", "bottom-left", "bottom-right"]

  // Get local player's state
  const localPlayerState = gameState?.players.find((p) => p.id === "local")
  const localPlayerCards = localPlayerState?.cards || []
  const isLocalPlayerTurn = gameState?.players[gameState.currentPlayerIndex]?.id === "local"
  const currentBet = gameState?.currentBet || 0
  const localPlayerBet = localPlayerState?.bet || 0
  const localPlayerChips = localPlayerState?.chips || 0
  const amountToCall = currentBet - localPlayerBet
  const pot = gameState?.pot || 0

  const isAllInOrFoldMode = gameState?.gameMode === "allin"

  // Calculate minimum raise amount
  const minRaise = currentBet > 0 ? currentBet * 2 : 20
  const maxRaise = localPlayerChips + localPlayerBet

  // Handle player actions
  const handleFold = () => {
    if (!isLocalPlayerTurn || !gameState) return
    makeAction("local", "fold")
    sendMessage("local", "You", "Fold", "text")
  }

  const handleCall = () => {
    if (!isLocalPlayerTurn || !gameState) return

    if (isAllInOrFoldMode) {
      makeAction("local", "all-in")
      sendMessage("local", "You", `All-in $${localPlayerChips}`, "text")
      return
    }

    if (amountToCall === 0) {
      makeAction("local", "check")
      sendMessage("local", "You", "Check", "text")
    } else if (amountToCall >= localPlayerChips) {
      makeAction("local", "all-in")
      sendMessage("local", "You", `All-in $${localPlayerChips}`, "text")
    } else {
      makeAction("local", "call")
      sendMessage("local", "You", `Call $${amountToCall}`, "text")
    }
  }

  const handleRaise = (amount?: number) => {
    if (!isLocalPlayerTurn || !gameState) return

    const raiseTotal = amount || raiseAmount[0]

    if (raiseTotal >= localPlayerChips + localPlayerBet) {
      makeAction("local", "all-in")
      sendMessage("local", "You", `All-in $${localPlayerChips}`, "text")
    } else {
      makeAction("local", "raise", raiseTotal)
      sendMessage("local", "You", `Raise to $${raiseTotal}`, "text")
    }
  }

  const handleQuickBet = (multiplier: number | "all-in") => {
    if (!isLocalPlayerTurn || !gameState) return

    if (multiplier === "all-in") {
      makeAction("local", "all-in")
      sendMessage("local", "You", `All-in $${localPlayerChips}`, "text")
    } else {
      const betAmount = Math.floor(pot * multiplier)
      const totalBet = Math.min(betAmount + localPlayerBet, maxRaise)
      handleRaise(totalBet)
    }
  }

  const getCallButtonLabel = () => {
    if (isAllInOrFoldMode) return `All-in $${localPlayerChips}`
    if (amountToCall === 0) return "Check"
    if (amountToCall >= localPlayerChips) return `All-in $${localPlayerChips}`
    return `Call\n$${amountToCall}`
  }

  const canRaise = !isAllInOrFoldMode && localPlayerChips > amountToCall && amountToCall < maxRaise

  if (showLobby) {
    return (
      <Lobby
        onStartGame={(table, seatId) => {
          setSelectedTable(table)
          setSelectedSeat(seatId)
          setShowLobby(false)
        }}
      />
    )
  }

  return (
    <div className="relative w-full h-[100dvh] bg-background overflow-hidden flex flex-col">
      {/* Top Header Bar */}
      <header className="flex items-center justify-between px-4 py-3 bg-background/90 backdrop-blur-sm z-50">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowLobby(true)}
          className="w-10 h-10 rounded-full text-foreground hover:bg-card"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="w-10 h-10 rounded-full text-foreground hover:bg-card"
          >
            <Video className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMenuOpen(true)}
            className="w-10 h-10 rounded-full text-foreground hover:bg-card"
          >
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Game Menu */}
      <GameMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      {/* Main Game Area */}
      <div className="flex-1 relative flex items-center justify-center px-2 pb-2">
        {/* Poker Table */}
        <div className="relative w-full max-w-lg aspect-[3/4] md:aspect-[4/5]">
          {/* Green Felt Table */}
          <div className="absolute inset-[5%] poker-felt rounded-[50%] border-[12px] border-[#1a1c2e] shadow-2xl">
            {/* Inner table ring */}
            <div className="absolute inset-2 rounded-[50%] border border-emerald-700/30" />
            
            {/* Total Pot Display */}
            <div className="absolute top-[38%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
              <div className="bg-card/90 backdrop-blur-sm px-6 py-3 rounded-xl border border-border/50 shadow-lg">
                <p className="text-xs text-muted-foreground text-center uppercase tracking-wider">Total Pot</p>
                <p className="text-2xl md:text-3xl font-bold text-primary text-center">
                  ${pot.toLocaleString()}.00
                </p>
              </div>
            </div>

            {/* Community Cards */}
            {gameState && <CommunityCards />}

            {/* Waiting for Players */}
            {!gameState && players.size < 2 && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card/90 backdrop-blur-sm px-6 py-4 rounded-xl border border-primary/50 z-20">
                <p className="text-base font-bold text-primary text-center">
                  Waiting for players...
                </p>
                <p className="text-sm text-muted-foreground text-center">
                  ({players.size}/2 minimum)
                </p>
              </div>
            )}
          </div>

          {/* Player Positions */}
          {playerIds.map((playerId, index) => {
            if (index >= positions.length) return null
            return (
              <PlayerPosition 
                key={playerId} 
                playerId={playerId} 
                position={positions[index]} 
                showCards={true} 
              />
            )
          })}

          {/* Local Player Position */}
          {players.has("local") && (
            <PlayerPosition playerId="local" position="bottom" showCards={false} />
          )}
        </div>
      </div>

      {/* Bottom Action Area */}
      <div className="bg-background/95 backdrop-blur-sm border-t border-border px-4 pt-3 pb-6 space-y-4">
        {/* Player's Hole Cards */}
        {localPlayerCards.length > 0 && (
          <div className="flex justify-center gap-1 -mt-16 mb-2">
            {localPlayerCards.map((card, index) => (
              <Card 
                key={index} 
                card={card} 
                faceDown={false} 
                animate={true} 
                delay={index * 150} 
                size="lg" 
              />
            ))}
          </div>
        )}

        {/* Quick Bet Buttons */}
        <div className="flex gap-3 justify-center px-2">
          <Button
            variant="outline"
            size="sm"
            disabled={!isLocalPlayerTurn || !canRaise}
            onClick={() => handleQuickBet(0.5)}
            className="flex-1 max-w-[90px] h-10 text-[10px] font-semibold rounded-full border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground"
          >
            1/2 Pot
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!isLocalPlayerTurn || !canRaise}
            onClick={() => handleQuickBet(0.75)}
            className="flex-1 max-w-[90px] h-10 text-[10px] font-semibold rounded-full border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground"
          >
            3/4 Pot
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!isLocalPlayerTurn || !canRaise}
            onClick={() => handleQuickBet(1)}
            className="flex-1 max-w-[90px] h-10 text-[10px] font-semibold rounded-full border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground"
          >
            Pot
          </Button>
          <Button
            variant="default"
            size="sm"
            disabled={!isLocalPlayerTurn}
            onClick={() => handleQuickBet("all-in")}
            className="flex-1 max-w-[90px] h-10 text-[10px] font-bold rounded-full bg-primary text-primary-foreground"
          >
            All-In
          </Button>
        </div>

        {/* Raise Slider */}
        {canRaise && (
          <div className="px-4">
            <Slider
              value={raiseAmount}
              onValueChange={setRaiseAmount}
              max={maxRaise}
              min={minRaise}
              step={Math.max(10, Math.floor((maxRaise - minRaise) / 100))}
              className="w-full"
            />
          </div>
        )}

        {/* Main Action Buttons */}
        <div className="flex gap-3 justify-center">
          <Button
            variant="outline"
            size="lg"
            disabled={!gameState || !isLocalPlayerTurn}
            onClick={handleFold}
            className="flex-1 max-w-[100px] h-14 text-base font-bold rounded-full bg-destructive/10 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
          >
            Fold
          </Button>
          
          <Button
            variant="outline"
            size="lg"
            disabled={!gameState || !isLocalPlayerTurn}
            onClick={handleCall}
            className="flex-1 max-w-[100px] h-14 text-sm font-bold rounded-full border-border hover:bg-card whitespace-pre-line"
          >
            {getCallButtonLabel()}
          </Button>

          {!isAllInOrFoldMode && (
            <Button
              variant="default"
              size="lg"
              disabled={!gameState || !isLocalPlayerTurn || !canRaise}
              onClick={() => handleRaise()}
              className="flex-1 max-w-[120px] h-14 text-sm font-bold rounded-full bg-primary text-primary-foreground whitespace-pre-line"
            >
              RAISE TO{"\n"}${raiseAmount[0].toLocaleString()}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
