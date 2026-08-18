"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Menu, Plus, Minus, ArrowLeft, Settings, Video } from "lucide-react"
import PlayerPosition from "./player-position"
import CommunityCards from "./community-cards"
import VideoControls from "./video-controls"
import ChatPanel from "./chat-panel"
import GameMenu from "./game-menu"
import Card from "./card"
import TurnTimer from "./turn-timer"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useWebRTC } from "@/hooks/use-webrtc"
import { useChat } from "@/hooks/use-chat"
import { usePokerGame } from "@/hooks/use-poker-game"
import Image from "next/image"
import Lobby from "./lobby"
import type { StakeTable } from "./table-selection"
import DealerButton from "./dealer-button"
import GiftButton from "./gift-button"

export default function PokerTable() {
  const [raiseAmount, setRaiseAmount] = useState([50])
  const [isRaiseBarOpen, setIsRaiseBarOpen] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [gameStarted, setGameStarted] = useState(false)
  const [showLobby, setShowLobby] = useState(true)
  const [selectedTable, setSelectedTable] = useState<StakeTable | null>(null)
  const [selectedSeat, setSelectedSeat] = useState<number>(4)
  const [localTimeLeft, setLocalTimeLeft] = useState(30)

  const { players } = useWebRTC()
  const { sendMessage } = useChat()
  const { gameState, startGame, makeAction, handleTimeUp, turnDuration } = usePokerGame()
  const [playerIds, setPlayerIds] = useState<string[]>([])

  const calculatedPlayerIds = useMemo(() => {
    return Array.from(players.keys()).filter((id) => id !== "local")
  }, [players])

  useEffect(() => {
    setPlayerIds(calculatedPlayerIds)
  }, [calculatedPlayerIds])

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

  const seatToPositionMap = useMemo<Record<number, string>>(() => ({
    1: "top",
    2: "top-right",
    3: "bottom-right",
    4: "bottom",
    5: "bottom-left",
    6: "top-left"
  }), [])

  const getPlayerPosition = useCallback((playerId: string) => {
    if (gameState) {
      const pState = gameState.players.find((p) => p.id === playerId)
      if (pState) {
        return seatToPositionMap[pState.seatNumber] || "top"
      }
    }
    // Fallback if game hasn't started yet
    if (playerId === "local") return "bottom"
    const index = playerIds.indexOf(playerId)
    const fallbackPositions = ["top", "top-left", "top-right", "bottom-left", "bottom-right"]
    return fallbackPositions[index] || "top"
  }, [gameState, playerIds, seatToPositionMap])

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

  useEffect(() => {
    if (!isLocalPlayerTurn || !gameState) {
      setLocalTimeLeft(turnDuration)
      return
    }

    setLocalTimeLeft(turnDuration)
    const interval = setInterval(() => {
      setLocalTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          handleTimeUp()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isLocalPlayerTurn, turnDuration, handleTimeUp, gameState])

  const handleFold = useCallback(() => {
    if (!isLocalPlayerTurn || !gameState) return
    makeAction("local", "fold")
    sendMessage("local", "You", "Fold", "text")
  }, [isLocalPlayerTurn, gameState, makeAction, sendMessage])

  const handleCall = useCallback(() => {
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
  }, [isLocalPlayerTurn, gameState, isAllInOrFoldMode, amountToCall, localPlayerChips, makeAction, sendMessage])

  const handleRaise = useCallback(() => {
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
  }, [isLocalPlayerTurn, gameState, raiseAmount, localPlayerChips, localPlayerBet, makeAction, sendMessage])

  const getCallButtonLabel = useCallback(() => {
    if (isAllInOrFoldMode) return `All-in $${localPlayerChips}`
    if (amountToCall === 0) return "Check"
    if (amountToCall >= localPlayerChips) return `All-in $${localPlayerChips}`
    return `Call $${amountToCall}`
  }, [isAllInOrFoldMode, amountToCall, localPlayerChips])

  const canRaise = useMemo(
    () => !isAllInOrFoldMode && localPlayerChips > amountToCall && amountToCall < maxRaise,
    [isAllInOrFoldMode, localPlayerChips, amountToCall, maxRaise],
  )

  const handleRaiseAmountChange = useCallback((value: number[]) => {
    setRaiseAmount(value)
  }, [])

  const handleIncrementRaise = useCallback(() => {
    setRaiseAmount([Math.min(maxRaise, raiseAmount[0] + 10)])
  }, [maxRaise, raiseAmount])

  const handleDecrementRaise = useCallback(() => {
    setRaiseAmount([Math.max(minRaise, raiseAmount[0] - 10)])
  }, [minRaise, raiseAmount])

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
    <div className="relative w-full h-[100dvh] bg-[#111625] overflow-hidden">
      {/* Top Info Bar */}
      <div className="absolute top-0 left-0 right-0 h-14 md:h-16 bg-[#131a2e]/60 backdrop-blur-md border-b border-slate-900/50 z-40 flex items-center justify-between px-4">
        {/* Back Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowLobby(true)}
          className="rounded-full w-10 h-10 hover:bg-slate-800/50 text-[#FEB956]"
        >
          <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" />
        </Button>

        {/* Table Info - Center */}
        {selectedTable && (
          <div className="flex flex-col items-center">
            <h2 className="text-xs md:text-sm font-extrabold text-[#FEB956] flex items-center gap-1.5 uppercase tracking-wider">
              {selectedTable.name}
              {isAllInOrFoldMode && (
                <span className="text-[9px] text-red-500 font-black px-1.5 py-0.2 bg-red-500/10 rounded border border-red-500/20">
                  AOF
                </span>
              )}
            </h2>
            <div className="flex items-center gap-1.5 text-[10px] md:text-xs text-slate-400 font-medium mt-0.5">
              <span>Blinds: ${selectedTable.smallBlind}/${selectedTable.bigBlind}</span>
              {gameState && (
                <>
                  <span>•</span>
                  <span>Pot: <span className="text-[#FEB956] font-bold">${gameState.pot || 0}</span></span>
                </>
              )}
            </div>
          </div>
        )}

        {/* Right Side Controls */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full w-10 h-10 hover:bg-slate-800/50 text-[#FEB956]"
          >
            <Video className="w-5 h-5 md:w-6 md:h-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMenuOpen(true)}
            className="rounded-full w-10 h-10 hover:bg-slate-800/50 text-[#FEB956]"
          >
            <Settings className="w-5 h-5 md:w-6 md:h-6" />
          </Button>
        </div>
      </div>

      {/* Game Menu */}
      <GameMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      {/* Video Controls */}
      <VideoControls />

      {/* Chat Panel */}
      <div className="absolute top-2 right-14 md:top-4 md:right-32 z-50">
        <ChatPanel />
      </div>

      {/* Main Container */}
      <div className="relative w-full h-full flex items-center justify-center p-0 pt-16 pb-24 md:pb-28 bg-[#111625]">
        {/* Game Area Container - Fixed aspect ratio to keep vertical felt table and player circles scaled together */}
        <div className="relative w-[92%] max-w-[420px] h-[80dvh] md:max-w-[450px] md:h-[82dvh] flex items-center justify-center">
          
          {/* Player Positions */}
          {playerIds.map((playerId) => {
            const position = getPlayerPosition(playerId)
            return <PlayerPosition key={playerId} playerId={playerId} position={position} showCards={true} />
          })}

          {/* Local Player (bottom position) */}
          {players.has("local") && (
            <PlayerPosition playerId="local" position="bottom" showCards={true} />
          )}

          {/* Felt Table Surface */}
          <div className="absolute inset-x-8 top-[10%] bottom-[10%] flex items-center justify-center z-10 pointer-events-none">
            <div
              className="relative w-full h-full rounded-[110px] shadow-[0px_20px_50px_rgba(0,0,0,0.85),_inset_0px_0px_60px_15px_rgba(0,0,0,0.6)] border-[10px] border-[#222938] ring-1 ring-white/5 overflow-hidden"
              style={{ background: 'radial-gradient(ellipse at center, #1b5e20 0%, #0d3c13 100%)' }}
            >
              {/* Gold Felt Border Lining */}
              <div className="absolute inset-3 rounded-[98px] border border-amber-500/10 pointer-events-none" />
              
              {/* Subtle Center Logo */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.05] pointer-events-none">
                <Image
                  src="/logo.png"
                  alt="Hold'em or Fold'em Poker"
                  width={140}
                  height={140}
                  className="w-24 h-24 md:w-32 md:h-32 object-contain"
                />
              </div>
            </div>
          </div>

          {/* Dealer Button */}
          {gameState && gameState.dealerSeatNumber && (
            <DealerButton seatNumber={gameState.dealerSeatNumber} />
          )}

          {/* Community Cards */}
          {gameState && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30">
              <CommunityCards />
            </div>
          )}

          {/* Waiting for Players Message */}
          {!gameState && players.size < 2 && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#131a2e]/90 backdrop-blur-md px-6 py-4 rounded-2xl border border-amber-500/20 shadow-2xl z-30">
              <p className="text-sm md:text-base font-extrabold text-[#FEB956] text-center tracking-wide uppercase">
                Waiting for players...
                <br />
                <span className="text-xs text-slate-400 font-semibold normal-case mt-1 block">({players.size}/2 minimum)</span>
              </p>
            </div>
          )}


        </div>
      </div>

      {/* Action Buttons - Mobile First */}
      <div className="absolute bottom-0 left-0 right-0 px-6 py-4 pb-8 z-40 bg-[#131a2e] border-t border-slate-800/80 shadow-[0px_-15px_30px_rgba(0,0,0,0.5)] backdrop-blur-md">
        <div className="flex gap-4 justify-center items-center max-w-md mx-auto w-full relative">


          <Button
            variant="outline"
            disabled={!gameState || !isLocalPlayerTurn}
            onClick={handleFold}
            className="flex-1 h-[44px] text-xs font-bold rounded-xl border border-amber-500/30 text-[#FEB956] bg-transparent hover:bg-amber-500/5 hover:text-[#FEB956] uppercase tracking-wider shadow-lg transition-all"
          >
            Fold
          </Button>
          <Button
            variant="outline"
            disabled={!gameState || !isLocalPlayerTurn}
            onClick={handleCall}
            className="flex-1 h-[44px] text-xs font-bold rounded-xl border border-amber-500/30 text-[#FEB956] bg-transparent hover:bg-amber-500/5 hover:text-[#FEB956] uppercase tracking-wider shadow-lg transition-all"
          >
            {getCallButtonLabel()}
          </Button>
          {!isAllInOrFoldMode && (
            <>
              <Sheet open={isRaiseBarOpen} onOpenChange={setIsRaiseBarOpen}>
                <SheetTrigger asChild>
                  <Button
                    disabled={!gameState || !isLocalPlayerTurn || !canRaise}
                    className="flex-1 md:hidden h-[44px] text-xs font-black rounded-xl bg-[#FEB956] text-[#131a2e] hover:bg-[#FEB956]/90 uppercase tracking-wider shadow-lg border-0 transition-all"
                  >
                    Raise ${raiseAmount[0]}
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[300px] bg-[#131a2e] border-slate-800">
                  <SheetHeader>
                    <SheetTitle className="text-white">Raise Amount</SheetTitle>
                  </SheetHeader>
                  <div className="py-6 text-white">
                    <div className="text-center mb-6">
                      <p className="text-4xl font-extrabold text-[#FEB956]">${raiseAmount[0]}</p>
                      <p className="text-xs text-slate-400 mt-2">
                        Min: ${minRaise} • Max: ${maxRaise}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={handleDecrementRaise}
                        className="touch-manipulation bg-transparent border-slate-700 text-[#FEB956] hover:bg-slate-800"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <Slider
                        value={raiseAmount}
                        onValueChange={handleRaiseAmountChange}
                        max={maxRaise}
                        min={minRaise}
                        step={10}
                        className="flex-grow accent-[#FEB956]"
                      />
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={handleIncrementRaise}
                        className="touch-manipulation bg-transparent border-slate-700 text-[#FEB956] hover:bg-slate-800"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <Button className="w-full mt-6 py-6 text-base font-bold bg-[#FEB956] text-[#131a2e] hover:bg-[#FEB956]/90" onClick={handleRaise}>
                      Confirm Raise
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
              <Button
                disabled={!gameState || !isLocalPlayerTurn || !canRaise}
                onClick={() => setIsRaiseBarOpen(true)}
                className="hidden md:flex px-8 h-[44px] text-xs font-black rounded-xl bg-[#FEB956] text-[#131a2e] hover:bg-[#FEB956]/90 uppercase tracking-wider shadow-lg border-0 transition-all"
              >
                Raise ${raiseAmount[0]}
              </Button>
            </>
          )}
        </div>
      </div>


    </div>
  )
}
