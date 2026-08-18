"use client"

import { useState as useReactState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Trophy, Users, Sparkles, Coins, Diamond, Star } from "lucide-react"
import Image from "next/image"
import { useWebRTC } from "@/hooks/use-webrtc"
import { cn } from "@/lib/utils"
import TableSelection, { type StakeTable } from "./table-selection"
import SeatSelection from "./seat-selection"
import ProfileButton from "./profile-button"
import Store from "./store"
import type { WheelPrize } from "@/types/lucky-wheel"
import TournamentLobby from "./tournament-lobby"
import SngLobby from "./sng-lobby"
import { tournamentEngine } from "@/lib/tournament-engine"

interface LobbyProps {
  onStartGame: (table: StakeTable, seatId: number) => void
}

export default function Lobby({ onStartGame }: LobbyProps) {
  const { players, roomCode, joinRoom, leaveRoom } = useWebRTC()
  const [selectedGameMode, setSelectedGameMode] = useReactState<string | null>(null)
  const [inputRoomCode, setInputRoomCode] = useReactState("")
  const [isJoining, setIsJoining] = useReactState(false)
  const [showTableSelection, setShowTableSelection] = useReactState(false)
  const [showSeatSelection, setShowSeatSelection] = useReactState(false)
  const [selectedTable, setSelectedTable] = useReactState<StakeTable | null>(null)
  const [playerChips, setPlayerChips] = useReactState(302480000) // 302.48M chips
  const [playerDiamonds, setPlayerDiamonds] = useReactState(72)
  const [showTournamentLobby, setShowTournamentLobby] = useReactState(false)
  const [showSngLobby, setShowSngLobby] = useReactState(false)
  const [showStore, setShowStore] = useReactState(false)
  const localPlayer = Array.from(players.values()).find((p) => p.isLocal)
  const username = localPlayer?.name || `Guest-${Math.floor(100 + Math.random() * 900)}`

  // Auto-join via room param in URL query
  useEffect(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search)
      const roomParam = searchParams.get("room")
      if (roomParam && !roomCode) {
        joinRoom(roomParam.toUpperCase(), username)
      }
    }
  }, [joinRoom, roomCode, username])

  const handleGameModeClick = (mode: string) => {
    if (mode === "3pin") return // Closed mode
    if (mode === "mtt") {
      setShowTournamentLobby(true)
      return
    }
    if (mode === "sng") {
      setShowSngLobby(true)
      return
    }
    setSelectedGameMode(mode)
    setShowTableSelection(true)
  }

  const handleTableSelect = (table: StakeTable) => {
    setSelectedTable(table)
    setShowTableSelection(false)
    setShowSeatSelection(true)
  }

  const handleSeatSelect = (seatId: number) => {
    if (selectedTable) {
      onStartGame(selectedTable, seatId)
    }
  }

  const handlePrizeWon = (prize: WheelPrize, multiplier: number) => {
    const finalAmount = prize.amount * multiplier

    if (prize.type === "coins") {
      setPlayerChips((prev) => prev + finalAmount)
    } else if (prize.type === "diamonds") {
      setPlayerDiamonds((prev) => prev + finalAmount)
    }

    // Show toast notification
    console.log(`Won ${prize.label}! (x${multiplier})`)
  }

  const formatChips = (amount: number): string => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(2)}M`
    }
    return amount.toString()
  }

  const handleStartTournament = (tournamentId: string) => {
    const tournamentObj = tournamentEngine.getTournament(tournamentId)
    if (tournamentObj) {
      const table: StakeTable = {
        id: tournamentId,
        name: tournamentObj.config.name,
        smallBlind: tournamentObj.config.blindStructure[0].smallBlind,
        bigBlind: tournamentObj.config.blindStructure[0].bigBlind,
        minBuyIn: tournamentObj.config.buyIn,
        maxBuyIn: tournamentObj.config.buyIn,
        gameMode: tournamentId.startsWith("sng-") ? "sng" : "mtt",
        currentPlayers: 1,
        maxPlayers: tournamentObj.config.playersPerTable,
        isVip: false,
        difficulty: "Intermediate",
      }
      onStartGame(table, 1)
    }
  }

  if (showStore) {
    return <Store onClose={() => setShowStore(false)} playerChips={playerChips} playerDiamonds={playerDiamonds} />
  }

  if (showTournamentLobby) {
    return (
      <TournamentLobby
        onClose={() => setShowTournamentLobby(false)}
        onStart={(id) => {
          setShowTournamentLobby(false)
          handleStartTournament(id)
        }}
      />
    )
  }

  if (showSngLobby) {
    return (
      <SngLobby
        onClose={() => setShowSngLobby(false)}
        onStart={(id) => {
          setShowSngLobby(false)
          handleStartTournament(id)
        }}
      />
    )
  }

  return (
    <div className="relative w-full h-[100dvh] overflow-hidden bg-gradient-to-b from-background via-background to-background">
      {/* Background with Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />

      {/* Content Container */}
      <div className="relative z-10 flex flex-col h-full max-w-7xl mx-auto">
        {/* Header Bar */}
        <div className="flex items-center justify-between p-3 md:p-4 border-b border-border/50 backdrop-blur-sm bg-[rgba(29,30,40,1)]">
          {/* Logo */}
          <div className="flex items-center gap-2 hidden">
            <Image src="/logo.png" alt="Logo" width={40} height={40} className="w-8 h-8 md:w-10 md:h-10" />
            <div className="hidden md:block">
              <h1 className="text-sm font-bold text-white">Hold'em or Fold'em</h1>
              <p className="text-xs text-slate-400">Poker</p>
            </div>
          </div>

          {/* User Info */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Chips */}


            {/* Diamonds */}


            {/* Profile Button */}
            <ProfileButton />

            {/* Profile Display */}


            {/* Store Button */}
            <Button
              size="sm"
              onClick={() => setShowStore(true)}
              className="hover:bg-chart-1/90 bg-blue-600 mx-[-15px] px-0 py-0 border-[3px] border-slate-300 text-white shadow-md"
            >
              <Sparkles className="w-4 h-4 mr-1.5" />
              <span className="text-xs md:text-sm">Store</span>
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-6 overflow-y-auto bg-[rgba(5,5,10,1)]">
          {/* Logo - Front and Center */}
          <div className="flex justify-center mb-4 md:mb-6">
            <Image
              src="/logo.png"
              alt="Hold'em or Fold'em Poker Logo"
              width={200}
              height={200}
              className="w-32 h-32 md:w-48 md:h-48 lg:w-56 lg:h-56 drop-shadow-2xl animate-pulse"
            />
          </div>

          {/* Multiplayer Room Section */}
          <div className="w-full max-w-sm bg-slate-900/60 backdrop-blur-md p-4 rounded-xl border border-slate-800/80 mb-6 flex flex-col gap-3 shadow-xl">
            <h4 className="text-[#FEB956] font-bold text-sm text-center tracking-wide uppercase">
              Multiplayer Room
            </h4>
            
            {roomCode ? (
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-1.5 bg-slate-950/80 px-3 py-1.5 rounded-lg border border-emerald-500/30">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
                  <span className="text-xs text-emerald-400 font-medium">Connected to Room:</span>
                  <span className="text-sm font-black text-white tracking-widest uppercase select-all">{roomCode}</span>
                </div>
                <p className="text-[10px] text-slate-400 text-center">
                  Share this link with friends so they can join you! ({players.size} player{players.size !== 1 ? 's' : ''} in room)
                </p>
                <div className="flex gap-2 w-full mt-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/?room=${roomCode}`)
                      alert("Invite link copied to clipboard!")
                    }}
                    className="flex-1 text-xs border-slate-800 text-slate-300 hover:text-white"
                  >
                    Copy Link
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={leaveRoom}
                    className="flex-1 text-xs bg-red-950/60 border border-red-800/40 hover:bg-red-900 text-red-100"
                  >
                    Leave Room
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter Room Code"
                    value={inputRoomCode}
                    onChange={(e) => setInputRoomCode(e.target.value.toUpperCase())}
                    className="flex-1 bg-slate-950/80 border border-slate-800 rounded-lg px-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#FEB956]/50 uppercase tracking-widest font-bold"
                  />
                  <Button
                    onClick={async () => {
                      if (!inputRoomCode.trim()) return
                      setIsJoining(true)
                      await joinRoom(inputRoomCode.trim(), username)
                      setIsJoining(false)
                    }}
                    disabled={isJoining || !inputRoomCode.trim()}
                    className="bg-[#FEB956] hover:bg-[#FEB956]/90 text-slate-950 font-extrabold text-xs px-4"
                  >
                    {isJoining ? "Joining..." : "Join"}
                  </Button>
                </div>
                <div className="flex items-center justify-between gap-2 mt-1">
                  <div className="h-px bg-slate-800/60 flex-1" />
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider">or</span>
                  <div className="h-px bg-slate-800/60 flex-1" />
                </div>
                <Button
                  onClick={async () => {
                    const generatedCode = `poker-${Math.floor(1000 + Math.random() * 9000)}`.toUpperCase()
                    setIsJoining(true)
                    await joinRoom(generatedCode, username)
                    setIsJoining(false)
                  }}
                  disabled={isJoining}
                  className="w-full bg-slate-950/80 border border-slate-800 hover:bg-slate-900 text-[#FEB956] font-bold text-xs"
                >
                  Create Private Room
                </Button>
              </div>
            )}
          </div>

          {/* Title Section */}

          {/* Play Button */}
          <Button
            onClick={() => handleGameModeClick("cash")}
            className="w-full max-w-xs h-14 md:h-16 hover:bg-chart-4/90 text-xl md:text-2xl font-bold rounded-full shadow-2xl transform hover:scale-105 transition-all mb-2 bg-slate-600 border-2 shadow-lg opacity-100 border-slate-300 text-[rgba(7,6,4,1)]"
          >
            Play Now
          </Button>
          <p className="text-center text-white/70 text-xs md:text-sm mb-8 md:mb-10">Select your table</p>

          {/* Game Modes Grid */}
          <div className="w-full max-w-4xl grid grid-cols-2 gap-3 md:gap-4">
            {/* SNG */}
            <Button
              onClick={() => handleGameModeClick("sng")}
              className={cn(
                "h-20 md:h-24 bg-chart-1/20 hover:bg-chart-1/30 rounded-xl md:rounded-2xl relative overflow-hidden border-2 md:border-4 border-chart-1/50",
                selectedGameMode === "sng" && "ring-2 md:ring-4 ring-chart-4",
              )}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent" />
              <div className="relative z-10">
                <Trophy className="w-5 h-5 md:w-6 md:h-6 mx-auto mb-0.5 md:mb-1 text-chart-1" />
                <h3 className="text-xl md:text-3xl font-bold text-chart-4 drop-shadow-lg mb-0.5 md:mb-1">SNG</h3>
                <span className="inline-block bg-chart-3 text-primary text-xs md:text-sm px-2 md:px-3 py-0.5 md:py-1 rounded-full font-bold">
                  OPEN
                </span>
              </div>
            </Button>

            {/* Multi-Table Tournament */}
            <Button
              onClick={() => handleGameModeClick("mtt")}
              className={cn(
                "h-20 md:h-24 bg-chart-5/20 hover:bg-chart-5/30 rounded-xl md:rounded-2xl relative overflow-hidden border-2 md:border-4 border-chart-5/50",
                selectedGameMode === "mtt" && "ring-2 md:ring-4 ring-chart-4",
              )}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent" />
              <div className="relative z-10">
                <Users className="w-5 h-5 md:w-6 md:h-6 mx-auto mb-0.5 md:mb-1 text-chart-5" />
                <h3 className="text-xl md:text-3xl font-bold text-chart-4 drop-shadow-lg mb-0.5 md:mb-1">MTT</h3>
                <span className="inline-block bg-chart-3 text-primary text-xs md:text-sm px-2 md:px-3 py-0.5 md:py-1 rounded-full font-bold">
                  OPEN
                </span>
              </div>
            </Button>

            {/* ALL IN OR FOLD */}
            <Button
              onClick={() => handleGameModeClick("allin")}
              className={cn(
                "h-20 md:h-24 bg-chart-4/20 hover:bg-chart-4/30 rounded-xl md:rounded-2xl relative overflow-hidden border-2 md:border-4 border-chart-4/50",
                selectedGameMode === "allin" && "ring-2 md:ring-4 ring-chart-4",
              )}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent" />
              <div className="relative z-10">
                <Sparkles className="w-5 h-5 md:w-6 md:h-6 mx-auto mb-0.5 md:mb-1 text-chart-4" />
                <p className="text-[10px] md:text-xs text-chart-4/80">Jackpot</p>
                <h3 className="text-xs md:text-lg lg:text-xl font-bold text-chart-4 drop-shadow-lg leading-tight">
                  ALL IN OR FOLD
                </h3>
                <p className="text-[9px] md:text-xs text-chart-4/80 mt-0.5">6,984,016.13</p>
              </div>
            </Button>

            {/* OMAHA */}
            <Button
              onClick={() => handleGameModeClick("omaha")}
              className={cn(
                "h-20 md:h-24 bg-chart-2/20 hover:bg-chart-2/30 rounded-xl md:rounded-2xl relative overflow-hidden border-2 md:border-4 border-chart-2/50",
                selectedGameMode === "omaha" && "ring-2 md:ring-4 ring-chart-4",
              )}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent" />
              <div className="relative z-10">
                <Star className="w-5 h-5 md:w-6 md:h-6 mx-auto mb-0.5 md:mb-1 text-chart-2" />
                <h3 className="text-xl md:text-3xl font-bold text-chart-4 drop-shadow-lg mb-0.5 md:mb-1">OMAHA</h3>
              </div>
            </Button>
          </div>
        </div>

        {/* Bottom Quick Actions */}
        <div className="border-t border-border/50 backdrop-blur-sm p-3 md:p-4 bg-[rgba(21,22,33,0.91)]"></div>
      </div>

      {/* Table Selection Modal */}
      {selectedGameMode && (
        <TableSelection
          isOpen={showTableSelection}
          onClose={() => {
            setShowTableSelection(false)
            setSelectedGameMode(null)
          }}
          onSelectTable={handleTableSelect}
          gameMode={selectedGameMode}
          playerChips={playerChips}
        />
      )}

      {/* Seat Selection Modal */}
      {selectedTable && (
        <SeatSelection
          isOpen={showSeatSelection}
          onClose={() => {
            setShowSeatSelection(false)
            setSelectedTable(null)
          }}
          onSelectSeat={handleSeatSelect}
          table={selectedTable}
        />
      )}
    </div>
  )
}
