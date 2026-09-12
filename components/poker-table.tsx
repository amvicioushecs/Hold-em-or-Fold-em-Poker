"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Plus, Minus, ArrowLeft, Settings, Mic, MessageSquare } from "lucide-react"
import PlayerPosition from "./player-position"
import CommunityCards from "./community-cards"
import VideoControls from "./video-controls"
import ChatPanel from "./chat-panel"
import GameMenu from "./game-menu"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useWebRTC } from "@/hooks/use-webrtc"
import { useChat } from "@/hooks/use-chat"
import { usePokerGame } from "@/hooks/use-poker-game"
import { useTournament } from "@/hooks/use-tournament"
import Lobby from "./lobby"
import type { StakeTable } from "./table-selection"
import DealerButton from "./dealer-button"
import { cn } from "@/lib/utils"

export default function PokerTable() {
  const [raiseAmount, setRaiseAmount] = useState([50])
  const [isRaiseBarOpen, setIsRaiseBarOpen] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [gameStarted, setGameStarted] = useState(false)
  const [showLobby, setShowLobby] = useState(true)
  const [selectedTable, setSelectedTable] = useState<StakeTable | null>(null)
  const [selectedSeat, setSelectedSeat] = useState<number>(4)
  const [localTimeLeft, setLocalTimeLeft] = useState(30)

  const { players, roomCode, myUserId } = useWebRTC()
  const { sendMessage } = useChat()
  const {
    gameState,
    startGame,
    makeAction,
    handleTimeUp,
    turnDuration,
    isHost,
    smallBlind: liveSmallBlind,
    bigBlind: liveBigBlind,
  } = usePokerGame()
  const { currentBlindLevel, timeUntilNextLevel, tournament } = useTournament()
  const [playerIds, setPlayerIds] = useState<string[]>([])

  const calculatedPlayerIds = useMemo(() => {
    return Array.from(players.keys()).filter((id) => id !== "local")
  }, [players])

  useEffect(() => {
    setPlayerIds(calculatedPlayerIds)
  }, [calculatedPlayerIds])

  useEffect(() => {
    if (roomCode && !isHost) return

    if (players.size >= 2 && !gameState && !gameStarted && !showLobby) {
      const timer = setTimeout(() => {
        const allPlayerIds = Array.from(players.keys()).map((id) => (id === "local" ? myUserId : id))
        const allPlayerNames = Array.from(players.values()).map((p) => p.name)

        const seatNumbers: number[] = []
        const availableSeats = [1, 2, 3, 4, 5, 6].filter((s) => s !== selectedSeat)

        Array.from(players.keys()).forEach((id) => {
          if (id === "local") {
            seatNumbers.push(selectedSeat)
          } else {
            seatNumbers.push(availableSeats.shift() || 1)
          }
        })

        const smallBlind = selectedTable?.smallBlind || 10
        const bigBlind = selectedTable?.bigBlind || 20
        const gameMode = selectedTable?.gameMode || "cash"
        startGame(allPlayerIds, allPlayerNames, seatNumbers, smallBlind, bigBlind, selectedSeat, gameMode)
        setGameStarted(true)
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [players, gameState, gameStarted, startGame, showLobby, selectedTable, selectedSeat, roomCode, isHost, myUserId])

  useEffect(() => {
    if (gameState && !gameStarted) {
      setGameStarted(true)
    }
  }, [gameState, gameStarted])

  const seatToPositionMap = useMemo<Record<number, string>>(
    () => ({
      1: "top",
      2: "top-right",
      3: "bottom-right",
      4: "bottom",
      5: "bottom-left",
      6: "top-left",
    }),
    [],
  )

  const getPlayerPosition = useCallback(
    (playerId: string) => {
      if (gameState) {
        const pState = gameState.players.find((p) => p.id === playerId)
        if (pState) {
          return seatToPositionMap[pState.seatNumber] || "top"
        }
      }
      if (playerId === "local") return "bottom"
      const index = playerIds.indexOf(playerId)
      const fallbackPositions = ["top", "top-left", "top-right", "bottom-left", "bottom-right"]
      return fallbackPositions[index] || "top"
    },
    [gameState, playerIds, seatToPositionMap],
  )

  const localPlayerState = gameState?.players.find((p) => p.id === "local")
  const isLocalPlayerTurn = gameState?.players[gameState.currentPlayerIndex]?.id === "local"
  const currentBet = gameState?.currentBet || 0
  const localPlayerBet = localPlayerState?.bet || 0
  const localPlayerChips = localPlayerState?.chips || 0
  const amountToCall = currentBet - localPlayerBet

  const isAllInOrFoldMode = gameState?.gameMode === "allin"
  const isTournamentMode = gameState?.gameMode === "sng" || gameState?.gameMode === "mtt"

  const displaySmallBlind = liveSmallBlind || selectedTable?.smallBlind || 10
  const displayBigBlind = liveBigBlind || selectedTable?.bigBlind || 20

  const minRaise = currentBet > 0 ? currentBet * 2 : displayBigBlind
  const maxRaise = localPlayerChips + localPlayerBet

  useEffect(() => {
    if (!isLocalPlayerTurn || !gameState) {
      setLocalTimeLeft(turnDuration)
      return
    }

    setLocalTimeLeft(turnDuration)
    let timeLeft = turnDuration

    const interval = setInterval(() => {
      timeLeft -= 1
      setLocalTimeLeft(timeLeft)
      if (timeLeft <= 0) {
        clearInterval(interval)
        handleTimeUp()
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [isLocalPlayerTurn, turnDuration, handleTimeUp, gameState])

  // Keep raise slider seeded to min when turn starts
  useEffect(() => {
    if (isLocalPlayerTurn) {
      setRaiseAmount([Math.max(minRaise, displayBigBlind)])
    }
  }, [isLocalPlayerTurn, minRaise, displayBigBlind])

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
      makeAction("local", "check")
      sendMessage("local", "You", "Check", "text")
    } else if (amountToCall >= localPlayerChips) {
      makeAction("local", "all-in")
      sendMessage("local", "You", `All-in $${localPlayerChips}`, "text")
    } else {
      makeAction("local", "call")
      sendMessage("local", "You", `Call $${amountToCall}`, "text")
    }
  }, [isLocalPlayerTurn, gameState, isAllInOrFoldMode, amountToCall, localPlayerChips, makeAction, sendMessage])

  const handleRaise = useCallback(() => {
    if (!isLocalPlayerTurn || !gameState) return

    const raiseTotal = raiseAmount[0]

    if (raiseTotal >= localPlayerChips + localPlayerBet) {
      makeAction("local", "all-in")
      sendMessage("local", "You", `All-in $${localPlayerChips}`, "text")
    } else {
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

  const actionDisabled = !gameState || !isLocalPlayerTurn

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

  const tableTitle = selectedTable?.name || "Table"

  return (
    <div className="relative w-full h-[100dvh] max-w-[430px] mx-auto bg-[#07090E] overflow-hidden shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)]">
      {/* —— HeaderSection —— */}
      <header className="absolute top-0 left-0 right-0 z-40 flex h-[68px] items-center justify-between px-4 pt-4 pb-3 bg-gradient-to-b from-[rgba(7,9,14,0.95)] via-[rgba(7,9,14,0.8)] to-transparent">
        <button
          type="button"
          onClick={() => setShowLobby(true)}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-700/40 bg-[rgba(25,28,34,0.8)] text-slate-300"
          aria-label="Exit table"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div className="flex min-w-0 flex-col items-center px-2">
          <h1 className="truncate text-center text-base font-bold uppercase tracking-[0.8px] text-[#E5A93C] drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
            {tableTitle}
          </h1>
          <p className="text-xs font-medium tracking-[0.3px] text-slate-400">
            Blinds: ${displaySmallBlind}/${displayBigBlind}
            {currentBlindLevel?.ante ? ` · Ante ${currentBlindLevel.ante}` : ""}
            {isTournamentMode && gameState?.blindLevel != null ? ` · L${gameState.blindLevel}` : ""}
            {isTournamentMode && timeUntilNextLevel ? ` · ${timeUntilNextLevel}` : ""}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsChatOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-700/60 bg-[#191C22] text-slate-300"
            aria-label="Chat"
          >
            <MessageSquare className="h-5 w-5" />
          </button>
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-700/60 bg-[#191C22] text-slate-300"
            aria-label="Microphone"
          >
            <Mic className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => setIsMenuOpen(true)}
            className="flex h-8 w-8 items-center justify-center text-slate-400"
            aria-label="Settings"
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </header>

      <GameMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      <VideoControls />

      {isChatOpen && (
        <div className="absolute top-[72px] right-3 z-50 w-[min(320px,90vw)]">
          <ChatPanel />
        </div>
      )}

      {/* —— TableArenaSection —— */}
      <div className="absolute left-0 right-0 top-[71px] bottom-[91px] flex items-center justify-center">
        <div className="relative h-full w-full max-w-[390px]">
          {/* Vertical felt */}
          <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 h-[min(516px,72%)] w-[min(233px,60%)] -translate-x-1/2 -translate-y-1/2">
            <div
              className="h-full w-full rounded-[150px] border-[12px] border-[#3D3D3D] shadow-[0px_20px_50px_rgba(0,0,0,0.8),inset_0px_0px_50px_12px_rgba(0,0,0,0.5)]"
              style={{
                background: "radial-gradient(107.61% 56.47% at 50% 50%, #2E7D32 0%, #1B5E20 100%)",
              }}
            />
          </div>

          {/* Pot badge — above board */}
          {gameState && (
            <div className="absolute left-1/2 top-[28%] z-20 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center rounded-xl border border-[rgba(254,185,86,0.15)] bg-[rgba(49,56,82,0.24)] px-6 py-2 backdrop-blur-[10px]">
              <span className="text-[9px] font-bold uppercase tracking-[0.9px] text-[#C6C6CE]">Total Pot</span>
              <span className="text-xl font-extrabold leading-7 text-[#FEB956]">
                ${(gameState.pot || 0).toLocaleString(undefined, { minimumFractionDigits: 0 })}
              </span>
            </div>
          )}

          {/* Community cards */}
          {gameState && (
            <div className="absolute left-1/2 top-[42%] z-30 -translate-x-1/2 -translate-y-1/2">
              <CommunityCards />
            </div>
          )}

          {/* Dealer */}
          {gameState?.dealerSeatNumber != null && <DealerButton seatNumber={gameState.dealerSeatNumber} />}

          {/* Seats */}
          {playerIds.map((playerId) => (
            <PlayerPosition
              key={playerId}
              playerId={playerId}
              position={getPlayerPosition(playerId)}
              showCards={true}
            />
          ))}
          {players.has("local") && <PlayerPosition playerId="local" position="bottom" showCards={true} />}

          {!gameState && players.size < 2 && (
            <div className="absolute left-1/2 top-1/2 z-30 -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-amber-500/20 bg-[#131A33]/95 px-6 py-4 shadow-2xl backdrop-blur-md">
              <p className="text-center text-sm font-extrabold uppercase tracking-wide text-[#E5A93C]">
                Waiting for players...
                <span className="mt-1 block text-xs font-semibold normal-case text-slate-400">
                  ({players.size}/2 minimum)
                </span>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* —— Footer ActionControlsSection (thumb reach) —— */}
      <footer className="absolute bottom-0 left-0 right-0 z-40 border-t border-slate-800/60 bg-gradient-to-t from-[#07090E] via-[#0C0F16] to-[rgba(12,15,22,0.9)] px-4 pb-4 pt-2">
        <div className="mx-auto flex w-full max-w-[358px] gap-2.5">
          <button
            type="button"
            disabled={actionDisabled}
            onClick={handleFold}
            className={cn(
              "flex h-12 flex-1 items-center justify-center rounded-xl border border-slate-700/80 bg-[#151922] text-sm font-bold uppercase tracking-[0.7px] text-slate-200 transition-opacity",
              actionDisabled && "opacity-40",
            )}
          >
            Fold
          </button>

          <button
            type="button"
            disabled={actionDisabled}
            onClick={handleCall}
            className={cn(
              "flex h-12 flex-1 items-center justify-center rounded-xl border border-slate-700/80 bg-[#151922] text-sm font-bold uppercase tracking-[0.7px] text-slate-200 transition-opacity",
              actionDisabled && "opacity-40",
            )}
          >
            {getCallButtonLabel()}
          </button>

          {!isAllInOrFoldMode && (
            <Sheet open={isRaiseBarOpen} onOpenChange={setIsRaiseBarOpen}>
              <SheetTrigger asChild>
                <button
                  type="button"
                  disabled={actionDisabled || !canRaise}
                  className={cn(
                    "relative flex h-12 flex-1 items-center justify-center rounded-xl bg-gradient-to-b from-[#E5A93C] to-[#B87C20] text-sm font-bold uppercase tracking-[0.7px] text-[#020617] shadow-[0px_10px_15px_-3px_rgba(120,53,15,0.3),0px_4px_6px_-4px_rgba(120,53,15,0.3)] transition-opacity",
                    (actionDisabled || !canRaise) && "opacity-40",
                  )}
                >
                  Raise ${raiseAmount[0]}
                </button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[300px] border-slate-800 bg-[#0C0F16]">
                <SheetHeader>
                  <SheetTitle className="text-white">Raise Amount</SheetTitle>
                </SheetHeader>
                <div className="py-6 text-white">
                  <div className="mb-6 text-center">
                    <p className="text-4xl font-extrabold text-[#E5A93C]">${raiseAmount[0]}</p>
                    <p className="mt-2 text-xs text-slate-400">
                      Min: ${minRaise} · Max: ${maxRaise}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => setRaiseAmount([Math.max(minRaise, raiseAmount[0] - 10)])}
                      className="border-slate-700 bg-transparent text-[#E5A93C] hover:bg-slate-800"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Slider
                      value={raiseAmount}
                      onValueChange={setRaiseAmount}
                      max={Math.max(maxRaise, minRaise)}
                      min={minRaise}
                      step={10}
                      className="flex-grow"
                    />
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => setRaiseAmount([Math.min(maxRaise, raiseAmount[0] + 10)])}
                      className="border-slate-700 bg-transparent text-[#E5A93C] hover:bg-slate-800"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button
                    className="mt-6 w-full bg-gradient-to-b from-[#E5A93C] to-[#B87C20] py-6 text-base font-bold text-[#020617] hover:opacity-95"
                    onClick={handleRaise}
                  >
                    Confirm Raise
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </footer>
    </div>
  )
}
