"use client"

import { useState as useReactState } from "react"
import { Button } from "@/components/ui/button"
import { Trophy, Users, Sparkles, Star } from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import TableSelection, { type StakeTable } from "./table-selection"
import SeatSelection from "./seat-selection"
import Store from "./store"
import type { WheelPrize } from "@/types/lucky-wheel"
import TournamentLobby from "./tournament-lobby"
import SngLobby from "./sng-lobby"
import { tournamentEngine } from "@/lib/tournament-engine"

interface LobbyProps {
  onStartGame: (table: StakeTable, seatId: number) => void
}

export default function Lobby({ onStartGame }: LobbyProps) {
  const [selectedGameMode, setSelectedGameMode] = useReactState<string | null>(null)
  const [showTableSelection, setShowTableSelection] = useReactState(false)
  const [showSeatSelection, setShowSeatSelection] = useReactState(false)
  const [selectedTable, setSelectedTable] = useReactState<StakeTable | null>(null)
  const [playerChips, setPlayerChips] = useReactState(302480000)
  const [playerDiamonds, setPlayerDiamonds] = useReactState(72)
  const [showTournamentLobby, setShowTournamentLobby] = useReactState(false)
  const [showSngLobby, setShowSngLobby] = useReactState(false)
  const [showStore, setShowStore] = useReactState(false)

  const handleGameModeClick = (mode: string) => {
    if (mode === "3pin") return
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
  }

  void handlePrizeWon

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
    return (
      <Store
        onClose={() => setShowStore(false)}
        playerChips={playerChips}
        playerDiamonds={playerDiamonds}
      />
    )
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
    <div className="screen-mobile relative flex h-dvh w-full flex-col overflow-hidden bg-[#07090E]">
      {/* Header */}
      <header className="flex shrink-0 items-center justify-end border-b border-slate-800/60 bg-[#1D1E28] px-3 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3">
        <Button
          size="sm"
          onClick={() => setShowStore(true)}
          className="h-10 touch-target border border-slate-500/40 bg-blue-600 px-3 text-white hover:bg-blue-500"
        >
          <Sparkles className="mr-1.5 h-4 w-4" />
          <span className="text-sm font-semibold">Store</span>
        </Button>
      </header>

      {/* Main — scrolls if needed on short phones */}
      <div className="flex min-h-0 flex-1 flex-col items-center overflow-y-auto overscroll-contain px-4 py-6">
        <div className="mb-6 flex justify-center sm:mb-8">
          <Image
            src="/logo.png"
            alt="Hold'em or Fold'em Poker Logo"
            width={200}
            height={200}
            priority
            className="h-28 w-28 object-contain drop-shadow-2xl sm:h-36 sm:w-36"
          />
        </div>

        <Button
          onClick={() => handleGameModeClick("cash")}
          className="mb-2 h-14 w-full max-w-[320px] touch-target rounded-full border-2 border-slate-400 bg-slate-600 text-lg font-bold text-[#070604] shadow-xl transition active:scale-[0.98] sm:h-16 sm:text-xl"
        >
          Play Now
        </Button>
        <p className="mb-6 text-center text-xs text-white/60 sm:mb-8">Select your table</p>

        <div className="grid w-full max-w-[360px] grid-cols-2 gap-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <ModeTile
            active={selectedGameMode === "sng"}
            onClick={() => handleGameModeClick("sng")}
            icon={<Trophy className="mx-auto mb-1 h-5 w-5 text-[#E5A93C]" />}
            title="SNG"
            badge="OPEN"
          />
          <ModeTile
            active={selectedGameMode === "mtt"}
            onClick={() => handleGameModeClick("mtt")}
            icon={<Users className="mx-auto mb-1 h-5 w-5 text-cyan-400" />}
            title="MTT"
            badge="OPEN"
          />
          <ModeTile
            active={selectedGameMode === "allin"}
            onClick={() => handleGameModeClick("allin")}
            icon={<Sparkles className="mx-auto mb-0.5 h-5 w-5 text-[#FEB956]" />}
            title="ALL IN OR FOLD"
            subtitle="Jackpot · 6,984,016"
            compactTitle
          />
          <ModeTile
            active={selectedGameMode === "omaha"}
            onClick={() => handleGameModeClick("omaha")}
            icon={<Star className="mx-auto mb-1 h-5 w-5 text-emerald-400" />}
            title="OMAHA"
          />
        </div>
      </div>

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

function ModeTile({
  onClick,
  active,
  icon,
  title,
  badge,
  subtitle,
  compactTitle,
}: {
  onClick: () => void
  active?: boolean
  icon: React.ReactNode
  title: string
  badge?: string
  subtitle?: string
  compactTitle?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex h-[88px] w-full flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-slate-700/80 bg-[#151922] px-2 transition active:scale-[0.98] sm:h-24",
        active && "ring-2 ring-[#E5A93C]",
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
      <div className="relative z-10 text-center">
        {icon}
        <h3
          className={cn(
            "font-bold leading-tight text-[#E5A93C] drop-shadow",
            compactTitle ? "text-[11px] sm:text-sm" : "text-xl sm:text-2xl",
          )}
        >
          {title}
        </h3>
        {subtitle && <p className="mt-0.5 text-[9px] text-slate-400">{subtitle}</p>}
        {badge && (
          <span className="mt-1 inline-block rounded-full bg-emerald-600/90 px-2 py-0.5 text-[10px] font-bold text-white">
            {badge}
          </span>
        )}
      </div>
    </button>
  )
}
