"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Menu, Plus, Minus } from "lucide-react"
import PlayerPosition from "./player-position"
import CommunityCards from "./community-cards"
import VideoControls from "./video-controls"
import ChatPanel from "./chat-panel"
import GameMenu from "./game-menu"
import Card from "./card"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useWebRTC } from "@/hooks/use-webrtc"
import { useChat } from "@/hooks/use-chat"
import { usePokerGame } from "@/hooks/use-poker-game"
import Image from "next/image"

export default function PokerTable() {
  const [raiseAmount, setRaiseAmount] = useState([50])
  const [isRaiseBarOpen, setIsRaiseBarOpen] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [gameStarted, setGameStarted] = useState(false)
  const { players } = useWebRTC()
  const { sendMessage } = useChat()
  const { gameState, startGame, makeAction } = usePokerGame()
  const [playerIds, setPlayerIds] = useState<string[]>([])

  useEffect(() => {
    const ids = Array.from(players.keys()).filter((id) => id !== "local")
    setPlayerIds(ids)
  }, [players])

  // Start game when we have enough players (at least 2)
  useEffect(() => {
    if (players.size >= 2 && !gameState && !gameStarted) {
      const timer = setTimeout(() => {
        const allPlayerIds = Array.from(players.keys())
        const allPlayerNames = Array.from(players.values()).map((p) => p.name)

        console.log("Starting game with players:", allPlayerNames)
        startGame(allPlayerIds, allPlayerNames)
        setGameStarted(true)
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [players, gameState, gameStarted, startGame])

  // Simulate other players sending messages
  useEffect(() => {
    if (playerIds.length === 0) return

    const interval = setInterval(() => {
      const randomPlayerIndex = Math.floor(Math.random() * playerIds.length)
      const randomPlayerId = playerIds[randomPlayerIndex]
      const player = players.get(randomPlayerId)

      if (player) {
        const messages = [
          "Nice hand!",
          "All in!",
          "Good luck everyone",
          "That was close",
          "Great play",
          "Let's go!",
          "Fold",
          "I'm feeling lucky",
        ]
        const randomMessage = messages[Math.floor(Math.random() * messages.length)]
        sendMessage(player.id, player.name, randomMessage, "text")
      }
    }, 15000)

    return () => clearInterval(interval)
  }, [playerIds, players, sendMessage])

  const positions = ["top", "top-left", "top-right", "bottom-left", "bottom-right"]

  // Get local player's state
  const localPlayerState = gameState?.players.find((p) => p.id === "local")
  const localPlayerCards = localPlayerState?.cards || []
  const isLocalPlayerTurn = gameState?.players[gameState.currentPlayerIndex]?.id === "local"
  const currentBet = gameState?.currentBet || 0
  const localPlayerBet = localPlayerState?.bet || 0
  const localPlayerChips = localPlayerState?.chips || 0
  const amountToCall = currentBet - localPlayerBet

  // Calculate minimum raise amount (current bet + big blind, or double current bet)
  const minRaise = currentBet > 0 ? currentBet * 2 : 20
  const maxRaise = localPlayerChips + localPlayerBet

  // Update raise amount when game state changes
  useEffect(() => {
    if (gameState) {
      const defaultRaise = Math.min(minRaise, maxRaise)
      setRaiseAmount([defaultRaise])
    }
  }, [gameState, minRaise, maxRaise])

  // Handle player actions
  const handleFold = () => {
    if (!isLocalPlayerTurn || !gameState) return
    makeAction("local", "fold")
    sendMessage("local", "You", "Fold", "text")
  }

  const handleCall = () => {
    if (!isLocalPlayerTurn || !gameState) return

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

  // Determine button label and state
  const getCallButtonLabel = () => {
    if (amountToCall === 0) return "Check"
    if (amountToCall >= localPlayerChips) return `All-in $${localPlayerChips}`
    return `Call $${amountToCall}`
  }

  const canRaise = localPlayerChips > amountToCall && amountToCall < maxRaise

  return (
    <div className="relative w-full h-[100dvh] bg-background overflow-hidden">
      {/* Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsMenuOpen(true)}
        className="absolute top-2 left-2 z-50 backdrop-blur-sm rounded-lg border md:top-4 md:left-4 w-9 h-9 md:w-10 md:h-10 shadow-xl text-yellow-400 bg-slate-800 border-slate-700"
      >
        <Menu className="w-5 h-5 md:w-6 md:h-6 text-foreground" />
      </Button>

      {/* Game Menu */}
      <GameMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      {/* Video Controls */}
      <VideoControls />

      {/* Chat Panel */}
      <div className="absolute top-2 right-14 md:top-4 md:right-32 z-50">
        <ChatPanel />
      </div>

      {/* Main Container */}
      <div className="relative w-full h-full flex items-center justify-center p-2 pb-24 md:p-4 md:pb-28 bg-popover-foreground text-slate-50 bg-black">
        {/* Poker Table */}
        <div className="relative w-full max-w-5xl h-full max-h-[calc(100vh-8rem)] md:max-h-none md:aspect-[4/3]">
          {/* Player Positions */}
          {playerIds.map((playerId, index) => {
            if (index >= positions.length) return null
            return <PlayerPosition key={playerId} playerId={playerId} position={positions[index]} showCards={true} />
          })}

          {/* Local Player (bottom position) */}
          {players.has("local") && <PlayerPosition playerId="local" position="bottom" showCards={false} />}

          {/* Table Surface */}
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <div className="relative w-[85%] h-[90%] md:w-[70%] md:h-[85%] bg-gradient-to-br from-emerald-900 via-emerald-950 to-emerald-900 rounded-[50%] shadow-2xl flex items-center justify-center">
              {/* Table Border */}
              <div className="absolute inset-0 rounded-[50%] border-4 md:border-8 border-amber-600/50 shadow-xl"></div>

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
              {gameState && (
                <div className="absolute top-[20%] left-[15%] md:top-[25%] md:left-[20%] w-5 h-5 md:w-8 md:h-8 bg-card rounded-full shadow-lg border border-border md:border-2 flex items-center justify-center">
                  <span className="text-[8px] md:text-xs font-bold text-foreground">D</span>
                </div>
              )}

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

              {/* Pot Display */}
              {gameState && gameState.pot > 0 && (
                <div className="absolute top-[35%] md:top-[40%] left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-sm px-4 py-2 rounded-full border-2 border-amber-500">
                  <p className="text-sm md:text-base font-bold text-amber-400">Pot: ${gameState.pot}</p>
                </div>
              )}

              {/* Waiting for Players */}
              {!gameState && players.size < 2 && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/80 backdrop-blur-sm px-6 py-4 rounded-lg border-2 border-amber-500">
                  <p className="text-base md:text-lg font-bold text-amber-400 text-center">
                    Waiting for players...
                    <br />
                    <span className="text-sm text-amber-300">({players.size}/2 minimum)</span>
                  </p>
                </div>
              )}

              {/* Turn Indicator */}
              {gameState && isLocalPlayerTurn && (
                <div className="absolute bottom-[15%] md:bottom-[18%] left-1/2 -translate-x-1/2 bg-amber-500 backdrop-blur-sm px-4 py-2 rounded-full border-2 border-amber-400 animate-pulse">
                  <p className="text-sm md:text-base font-bold text-black">YOUR TURN</p>
                </div>
              )}

              {/* Game Phase Display */}
              {gameState && gameState.phase !== "waiting" && (
                <div className="absolute top-[20%] right-[15%] md:top-[25%] md:right-[20%] bg-black/80 backdrop-blur-sm px-3 py-1 rounded-full border border-amber-500">
                  <p className="text-[10px] md:text-xs font-bold text-amber-400 uppercase">{gameState.phase}</p>
                </div>
              )}

              {/* Player Chips Display */}
              {localPlayerState && (
                <div className="absolute bottom-[22%] md:bottom-[25%] left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full">
                  <p className="text-xs md:text-sm font-bold text-amber-400">Chips: ${localPlayerChips}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons - Mobile First */}
      <div className="absolute bottom-2 left-0 right-0 px-2 z-40 md:bottom-8 md:left-1/2 md:-translate-x-1/2 md:px-0">
        <div className="flex gap-2 md:gap-4 justify-center">
          <Button
            variant="outline"
            size="lg"
            disabled={!gameState || !isLocalPlayerTurn}
            onClick={handleFold}
            className="flex-1 md:flex-none py-5 md:px-8 md:py-6 text-base md:text-lg font-semibold rounded-full touch-manipulation hover:bg-destructive hover:text-destructive-foreground hover:border-destructive shadow-xl text-yellow-400 bg-slate-800 border-slate-600 border-solid border disabled:opacity-50"
          >
            Fold
          </Button>
          <Button
            variant="outline"
            size="lg"
            disabled={!gameState || !isLocalPlayerTurn}
            onClick={handleCall}
            className="flex-1 md:flex-none py-5 md:px-8 md:py-6 text-base md:text-lg font-semibold rounded-full touch-manipulation hover:bg-primary hover:text-primary-foreground shadow-xl text-yellow-400 bg-slate-800 border-slate-600 border-solid border disabled:opacity-50"
          >
            {getCallButtonLabel()}
          </Button>
          <Sheet open={isRaiseBarOpen} onOpenChange={setIsRaiseBarOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="lg"
                disabled={!gameState || !isLocalPlayerTurn || !canRaise}
                className="flex-1 md:hidden py-5 text-base font-semibold rounded-full touch-manipulation hover:bg-primary hover:text-primary-foreground shadow-xl text-yellow-400 bg-slate-800 border-slate-600 border-solid border disabled:opacity-50"
              >
                Raise ${raiseAmount[0]}
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
            variant="outline"
            size="lg"
            disabled={!gameState || !isLocalPlayerTurn || !canRaise}
            onClick={() => setIsRaiseBarOpen(true)}
            className="hidden md:flex px-8 py-6 text-lg font-semibold rounded-full hover:bg-primary hover:text-primary-foreground shadow-xl text-yellow-400 bg-slate-800 border-slate-600 border-solid border disabled:opacity-50"
          >
            Raise ${raiseAmount[0]}
          </Button>
        </div>
      </div>

      {/* Raise Bar - Desktop Only */}
      <div className="hidden md:block absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 bg-amber-100 p-4 lg:p-6 rounded-lg shadow-lg z-40 border-2 border-amber-600">
        <div className="text-center mb-4">
          <p className="text-xs lg:text-sm font-semibold mb-2 text-foreground">Raise Bar</p>
          <p className="text-xl lg:text-2xl font-bold text-foreground">${raiseAmount[0]}</p>
          <p className="text-[10px] text-muted-foreground mt-1">
            ${minRaise} - ${maxRaise}
          </p>
        </div>
        <Slider
          value={raiseAmount}
          onValueChange={setRaiseAmount}
          max={maxRaise}
          min={minRaise}
          step={10}
          className="h-32 lg:h-48"
          orientation="vertical"
        />
        <Button
          className="w-full mt-4 text-sm"
          disabled={!gameState || !isLocalPlayerTurn || !canRaise}
          onClick={handleRaise}
        >
          Confirm
        </Button>
      </div>
    </div>
  )
}
