"use client"

import { useState as useReactState } from "react"
import { Button } from "@/components/ui/button"
import { Trophy, Users, Sparkles, Crown, Coins, Diamond, Star } from "lucide-react"
import Image from "next/image"
import { useWebRTC } from "@/hooks/use-webrtc"
import { cn } from "@/lib/utils"
import TableSelection, { type StakeTable } from "./table-selection"
import SeatSelection from "./seat-selection"
import ProfileButton from "./profile-button"
import Store from "./store"
import LuckyWheelButton from "./lucky-wheel-button"
import type { WheelPrize } from "@/types/lucky-wheel"

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
  const [showStore, setShowStore] = useReactState(false)
  const localPlayer = Array.from(players.values()).find((p) => p.isLocal)

  const handleGameModeClick = (mode: string) => {
    if (mode === "3pin") return // Closed mode
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

  if (showStore) {
    return <Store onClose={() => setShowStore(false)} playerChips={playerChips} playerDiamonds={playerDiamonds} />
  }

  return (
    <div className="relative w-full h-[100dvh] overflow-hidden bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Background with Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />

      {/* Content Container */}
      <div className="relative z-10 flex flex-col h-full max-w-7xl mx-auto">
        {/* Header Bar */}
        <div className="flex items-center justify-between p-3 md:p-4 border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
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
            <div className="flex items-center gap-1.5 bg-slate-800 rounded-full px-2 md:px-3 py-1 md:py-1.5 border border-slate-600">
              <Coins className="w-4 h-4 text-yellow-400" />
              <span className="text-white font-bold text-xs md:text-sm">{formatChips(playerChips)}</span>
            </div>

            {/* Diamonds */}
            <div className="flex items-center gap-1.5 bg-slate-800 rounded-full px-2 md:px-3 py-1 md:py-1.5 border border-slate-600">
              <Diamond className="w-4 h-4 text-cyan-400" />
              <span className="text-white font-bold text-xs md:text-sm">{playerDiamonds}</span>
            </div>

            {/* Profile Button */}
            <ProfileButton />

            {/* Profile Display */}
            <div className="hidden md:flex items-center gap-2 bg-slate-800 rounded-full pl-1 pr-3 py-1 border border-slate-600">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm">
                {localPlayer?.name.charAt(0).toUpperCase() || "P"}
              </div>
              <span className="text-white font-semibold text-sm">{localPlayer?.name || "Player"}</span>
            </div>

            {/* Store Button */}
            <Button
              size="sm"
              onClick={() => setShowStore(true)}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
            >
              <Sparkles className="w-4 h-4 mr-1.5" />
              <span className="text-xs md:text-sm">Store</span>
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-6 overflow-y-auto">
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
            onClick={() => handleGameModeClick("sng")}
            className="w-full max-w-xs h-14 md:h-16 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-xl md:text-2xl font-bold rounded-full shadow-2xl transform hover:scale-105 transition-all mb-2 bg-slate-800 border-slate-500 border text-chart-4"
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
                "h-20 md:h-24 bg-gradient-to-br from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 rounded-xl md:rounded-2xl relative overflow-hidden border-2 md:border-4 border-purple-400/50",
                selectedGameMode === "sng" && "ring-2 md:ring-4 ring-yellow-400",
              )}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <div className="relative z-10">
                <Trophy className="w-5 h-5 md:w-6 md:h-6 mx-auto mb-0.5 md:mb-1 text-white" />
                <h3 className="text-xl md:text-3xl font-bold text-white drop-shadow-lg mb-0.5 md:mb-1">SNG</h3>
                <span className="inline-block bg-green-500 text-white text-xs md:text-sm px-2 md:px-3 py-0.5 md:py-1 rounded-full font-bold">
                  OPEN
                </span>
              </div>
            </Button>

            {/* Multi-Table Tournament */}
            <Button
              onClick={() => handleGameModeClick("mtt")}
              className={cn(
                "h-20 md:h-24 bg-gradient-to-br from-green-600 to-green-800 hover:from-green-700 hover:to-green-900 rounded-xl md:rounded-2xl relative overflow-hidden border-2 md:border-4 border-green-400/50",
                selectedGameMode === "mtt" && "ring-2 md:ring-4 ring-yellow-400",
              )}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <div className="relative z-10">
                <Users className="w-5 h-5 md:w-6 md:h-6 mx-auto mb-0.5 md:mb-1 text-white" />
                <h3 className="text-xl md:text-3xl font-bold text-white drop-shadow-lg mb-0.5 md:mb-1">MTT</h3>
                <span className="inline-block bg-green-500 text-white text-xs md:text-sm px-2 md:px-3 py-0.5 md:py-1 rounded-full font-bold">
                  OPEN
                </span>
              </div>
            </Button>

            {/* ALL IN OR FOLD */}
            <Button
              onClick={() => handleGameModeClick("allin")}
              className={cn(
                "h-20 md:h-24 bg-gradient-to-br from-yellow-600 to-yellow-800 hover:from-yellow-700 hover:to-yellow-900 rounded-xl md:rounded-2xl relative overflow-hidden border-2 md:border-4 border-yellow-400/50",
                selectedGameMode === "allin" && "ring-2 md:ring-4 ring-yellow-400",
              )}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <div className="relative z-10">
                <Sparkles className="w-5 h-5 md:w-6 md:h-6 mx-auto mb-0.5 md:mb-1 text-white" />
                <p className="text-[10px] md:text-xs text-yellow-200">Jackpot</p>
                <h3 className="text-xs md:text-lg lg:text-xl font-bold text-white drop-shadow-lg leading-tight">
                  ALL IN OR FOLD
                </h3>
                <p className="text-[9px] md:text-xs text-yellow-200 mt-0.5">6,984,016.13</p>
              </div>
            </Button>

            {/* OMAHA */}
            <Button
              onClick={() => handleGameModeClick("omaha")}
              className={cn(
                "h-20 md:h-24 bg-gradient-to-br from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 rounded-xl md:rounded-2xl relative overflow-hidden border-2 md:border-4 border-blue-400/50",
                selectedGameMode === "omaha" && "ring-2 md:ring-4 ring-yellow-400",
              )}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <div className="relative z-10">
                <Star className="w-5 h-5 md:w-6 md:h-6 mx-auto mb-0.5 md:mb-1 text-white" />
                <h3 className="text-xl md:text-3xl font-bold text-white drop-shadow-lg mb-0.5 md:mb-1">OMAHA</h3>
              </div>
            </Button>
          </div>
        </div>

        {/* Bottom Quick Actions */}
        <div className="border-t border-slate-700/50 bg-slate-900/50 backdrop-blur-sm p-3 md:p-4">
          <div className="flex justify-center gap-2 md:gap-3 max-w-4xl mx-auto flex-wrap">
            <Button
              variant="outline"
              size="sm"
              className="bg-slate-800/80 border-slate-600 text-white hover:bg-slate-700"
            >
              <Crown className="w-4 h-4 mr-1.5" />
              <span className="text-xs md:text-sm">VIP</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-slate-800/80 border-slate-600 text-white hover:bg-slate-700"
            >
              <Users className="w-4 h-4 mr-1.5" />
              <span className="text-xs md:text-sm">Friends</span>
            </Button>
            <LuckyWheelButton
              playerName={localPlayer?.name || "Player"}
              playerLevel={98}
              playerChips={playerChips}
              playerDiamonds={playerDiamonds}
              onPrizeWon={handlePrizeWon}
            />
          </div>
        </div>
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
