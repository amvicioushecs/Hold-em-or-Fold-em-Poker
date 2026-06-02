"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Plus, Minus, Video, Settings } from "lucide-react"
import PlayerPosition from "./player-position"
import CommunityCards from "./community-cards"
import GameMenu from "./game-menu"
import Card from "./card"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useWebRTC } from "@/hooks/use-webrtc"
import { useChat } from "@/hooks/use-chat"
import { usePokerGame } from "@/hooks/use-poker-game"
import Image from "next/image"
import Lobby from "./lobby"
import type { StakeTable } from "./table-selection"
import DealerButton from "./dealer-button"
import BlindInfo from "./blind-info"


export default function PokerTable() {
  const [raiseAmount, setRaiseAmount] = useState([50])
  const [isRaiseBarOpen, setIsRaiseBarOpen] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [gameStarted, setGameStarted] = useState(false)
  const [showLobby, setShowLobby] = useState(true)
  const [selectedTable, setSelectedTable] = useState<StakeTable | null>(null)
  const [selectedSeat, setSelectedSeat] = useState<number>(4)
  const { players } = useWebRTC()
  const { sendMessage } = useChat()
  const { gameState, startGame, makeAction, handleTimeUp, turnDuration } = usePokerGame()
  const [playerIds, setPlayerIds] = useState<string[]>([])

  useEffect(() => {
    const ids = Array.from(players.keys()).filter((id) => id !== "local")
    setPlayerIds(ids)
  }, [players])

  // Start game when we have enough players (at least 2)
  useEffect(() => {
    if (players.size >= 2 && !gameState && !gameStarted && !showLobby) {
      const timer = setTimeout(() => {
        const allPlayerIds = Array.from(players.keys())
        const allPlayerNames = Array.from(players.values()).map((p) => p.name)

        // Assign seat numbers (local player gets selectedSeat, others get remaining seats)
        const seatNumbers: number[] = []
        const availableSeats = [1, 2, 3, 4, 5, 6].filter((s) => s !== selectedSeat)

        allPlayerIds.forEach((id) => {
          if (id === "local") {
            seatNumbers.push(selectedSeat)
          } else {
            seatNumbers.push(availableSeats.shift() || 1)
          }
        })

        console.log("[v0] Starting game with players:", allPlayerNames, "Seats:", seatNumbers)
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

  const isAllInOrFoldMode = gameState?.gameMode === "allin"

  // Calculate minimum raise amount (current bet + big blind, or double current bet)
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
      // Check
      makeAction("local", "check")
      sendMessage("local", "You", "Check", "text")
    } else if (amountToCall >= localPlayerChips) {
      // All-in call
      makeAction("local", "all-in")
      sendMessage("local", "You", `All-in $${localPlayerChips}`, "text")
    } else {
      // Regular call
      makeAction("local", "call")
      sendMessage("local", "You", `Call $${amountToCall}`, "text")
    }
  }

  const handleRaise = () => {
    if (!isLocalPlayerTurn || !gameState) return

    const raiseTotal = raiseAmount[0]

    if (raiseTotal >= localPlayerChips + localPlayerBet) {
      // All-in
      makeAction("local", "all-in")
      sendMessage("local", "You", `All-in $${localPlayerChips}`, "text")
    } else {
      // Regular raise
      makeAction("local", "raise", raiseTotal)
      sendMessage("local", "You", `Raise to $${raiseTotal}`, "text")
    }

    setIsRaiseBarOpen(false)
  }

  const getCallButtonLabel = () => {
    if (isAllInOrFoldMode) return `All-in $${localPlayerChips}`
    if (amountToCall === 0) return "Check"
    if (amountToCall >= localPlayerChips) return `All-in $${localPlayerChips}`
    return `Call $${amountToCall}`
  }

  const canRaise = !isAllInOrFoldMode && localPlayerChips > amountToCall && amountToCall < maxRaise

  if (showLobby) {
    return (
      <Lobby
        onStartGame={(table, seatId) => {
          console.log(
            "[v0] Starting game at table:",
            table.name,
            "Seat:",
            seatId,
            "Blinds:",
            table.smallBlind,
            "/",
            table.bigBlind,
            "Mode:",
            table.gameMode,
          )
          setSelectedTable(table)
          setSelectedSeat(seatId)
          setShowLobby(false)
        }}
      />
    )
  }

  return (
    <div className="relative w-full h-[100dvh] bg-background overflow-hidden">
      {/* Top Info Bar */}
      <div className="absolute top-0 left-0 right-0 h-14 md:h-16 bg-transparent z-40 flex items-center justify-between px-4">
        {/* Back Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowLobby(true)}
          className="w-10 h-10 hover:bg-card/50"
        >
          <svg className="w-5 h-5 md:w-6 md:h-6 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Button>

        {/* Table Title - Left of Center */}
        <div className="absolute left-16 top-1/2 -translate-y-1/2">
          <h2 className="text-base md:text-lg font-semibold text-primary flex items-center gap-2">
            <span className="text-primary">❖</span>
            Poker Table
          </h2>
        </div>

        {/* Right Side - Video & Settings Icons */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="w-10 h-10 hover:bg-card/50"
          >
            <Video className="w-5 h-5 text-foreground" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMenuOpen(true)}
            className="w-10 h-10 hover:bg-card/50"
          >
            <Settings className="w-5 h-5 text-foreground" />
          </Button>
        </div>
      </div>

      {/* Game Menu */}
      <GameMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      {/* Main Container */}
      <div className="relative w-full h-full flex items-center justify-center p-0 pb-20 md:pb-24 bg-background">
        {/* Poker Table */}
        <div className="relative w-full max-w-6xl h-full md:aspect-[16/9] flex items-center justify-center">
          {/* Player Positions */}
          {playerIds.map((playerId, index) => {
            if (index >= positions.length) return null
            return <PlayerPosition key={playerId} playerId={playerId} position={positions[index]} showCards={true} />
          })}

          {/* Local Player (bottom position) */}
          {players.has("local") && <PlayerPosition playerId="local" position="bottom" showCards={false} />}

          {/* Table Surface */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-[95%] h-[60%] md:w-[80%] md:h-[75%] bg-[#0f3a28] rounded-[100px] md:rounded-[200px] shadow-2xl flex items-center justify-center border-[12px] md:border-[20px] border-[#1a1c24] ring-1 ring-white/5">

              {/* Blind Info Display */}
              {gameState && selectedTable && (
                <BlindInfo
                  smallBlind={selectedTable.smallBlind}
                  bigBlind={selectedTable.bigBlind}
                  handNumber={gameState.handNumber}
                />
              )}

              {/* Center Logo */}
              <div className="absolute top-[12%] md:top-[15%]">
                <Image
                  src="/logo.png"
                  alt="Hold'em or Fold'em Poker"
                  width={150}
                  height={150}
                  className="md:w-32 md:h-32 lg:w-36 lg:h-36 my-[75px] py-0 px-0 h-[108px] w-[108px] border-0 border-transparent border-none shadow-none opacity-25"
                />
              </div>

              {/* Dealer Button */}
              {gameState && gameState.dealerSeatNumber && <DealerButton seatNumber={gameState.dealerSeatNumber} />}

              {/* Community Cards */}
              {gameState && <CommunityCards />}

              {/* Player Hand Cards (bottom position) */}
              {localPlayerCards.length > 0 && (
                <div className="absolute bottom-[6%] md:bottom-[8%] left-1/2 -translate-x-1/2 flex gap-1 md:gap-2">
                  {localPlayerCards.map((card, index) => (
                    <Card key={index} card={card} faceDown={false} animate={true} delay={index * 150} size="md" />
                  ))}
                </div>
              )}

              {/* Waiting for Players */}
              {!gameState && players.size < 2 && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card/80 backdrop-blur-sm px-6 py-4 rounded-lg border-2 border-chart-4">
                  <p className="text-base md:text-lg font-bold text-chart-4 text-center">
                    Waiting for players...
                    <br />
                    <span className="text-sm text-chart-4/80">({players.size}/2 minimum)</span>
                  </p>
                </div>
              )}

              {/* Game Phase Display */}
              {gameState && gameState.phase !== "waiting" && (
                <div className="absolute top-[20%] right-[15%] md:top-[25%] md:right-[20%] bg-card/80 backdrop-blur-sm px-3 py-1 rounded-full border border-chart-4">
                  <p className="text-[10px] md:text-xs font-bold text-chart-4 uppercase">{gameState.phase}</p>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons - Mobile First */}
      <div className="absolute bottom-4 left-0 right-0 px-4 z-40 md:bottom-8 md:left-1/2 md:-translate-x-1/2 md:px-0">
        <div className="flex gap-3 md:gap-4 justify-center items-center">
          {/* Fold Button - Dark Red */}
          <Button
            size="lg"
            disabled={!gameState || !isLocalPlayerTurn}
            onClick={handleFold}
            className="px-6 py-5 md:px-8 md:py-6 text-base md:text-lg font-semibold rounded-full touch-manipulation shadow-lg disabled:opacity-50 bg-[#4a1a1a] hover:bg-[#5a2a2a] text-chart-4 border-0"
          >
            Fold
          </Button>

          {/* Call Button - Outlined */}
          <Button
            variant="outline"
            size="lg"
            disabled={!gameState || !isLocalPlayerTurn}
            onClick={handleCall}
            className="px-6 py-5 md:px-8 md:py-6 text-base md:text-lg font-semibold rounded-full touch-manipulation shadow-lg disabled:opacity-50 bg-transparent border-2 border-muted-foreground text-foreground hover:bg-muted"
          >
            {getCallButtonLabel()}
          </Button>

          {/* Raise Button - Gold */}
          {!isAllInOrFoldMode && (
            <>
              <Sheet open={isRaiseBarOpen} onOpenChange={setIsRaiseBarOpen}>
                <SheetTrigger asChild>
                  <Button
                    size="lg"
                    disabled={!gameState || !isLocalPlayerTurn || !canRaise}
                    className="md:hidden px-6 py-5 text-base font-semibold rounded-full touch-manipulation shadow-lg disabled:opacity-50 bg-chart-4 hover:bg-chart-4/90 text-background border-0"
                  >
                    RAISE
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[300px]">
                  <SheetHeader>
                    <SheetTitle>Raise Amount</SheetTitle>
                  </SheetHeader>
                  <div className="py-6">
                    <div className="text-center mb-6">
                      <p className="text-4xl font-bold text-foreground">${raiseAmount[0]}</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Min: ${minRaise} • Max: ${maxRaise}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => setRaiseAmount([Math.max(minRaise, raiseAmount[0] - 10)])}
                        className="touch-manipulation"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <Slider
                        value={raiseAmount}
                        onValueChange={setRaiseAmount}
                        max={maxRaise}
                        min={minRaise}
                        step={10}
                        className="flex-1"
                      />
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => setRaiseAmount([Math.min(maxRaise, raiseAmount[0] + 10)])}
                        className="touch-manipulation"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <Button className="w-full mt-6 py-6 text-lg touch-manipulation" onClick={handleRaise}>
                      Confirm Raise
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
              <Button
                size="lg"
                disabled={!gameState || !isLocalPlayerTurn || !canRaise}
                onClick={() => setIsRaiseBarOpen(true)}
                className="hidden md:flex px-8 py-6 text-lg font-semibold rounded-full shadow-lg disabled:opacity-50 bg-chart-4 hover:bg-chart-4/90 text-background border-0"
              >
                RAISE
              </Button>
            </>
          )}
        </div>
      </div>


    </div>
  )
}
