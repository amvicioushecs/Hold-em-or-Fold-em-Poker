"use client"

import { useState as useReactState } from "react"
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
import { tournamentEngine } from "@/lib/tournament-engine"

interface LobbyProps {
  onStartGame: (table: StakeTable, seatId: number) => void
}

export default function Lobby({ onStartGame }: LobbyProps) {
  const { players } = useWebRTC()
  const [selectedGameMode, setSelectedGameMode] = useReactState<string | null>(null)
  const [showTableSelection, setShowTableSelection] = useReactState(false)
  const [showSeatSelection, setShowSeatSelection] = useReactState(false)
  const [selectedTable, setSelectedTable] = useReactState<StakeTable | null>(null)
  const [playerChips, setPlayerChips] = useReactState(302480000) // 302.48M chips
  const [playerDiamonds, setPlayerDiamonds] = useReactState(72)
  const [showTournamentLobby, setShowTournamentLobby] = useReactState(false)
  const [showStore, setShowStore] = useReactState(false)
  const localPlayer = Array.from(players.values()).find((p) => p.isLocal)

  const handleGameModeClick = (mode: string) => {
    if (mode === "3pin") return // Closed mode
    if (mode === "mtt") {
      setShowTournamentLobby(true)
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
        gameMode: "mtt",
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
