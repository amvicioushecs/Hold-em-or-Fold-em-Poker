"use client"

import { useState } from "react"
import HomeLobby from "@/components/lobby"
import TableSelection from "@/components/table-selection"
import SeatSelection from "@/components/seat-selection"
import TournamentLobby from "@/components/tournament-lobby"
import PokerTable from "@/components/poker-table"
import Store from "@/components/store"
import type { StakeTable } from "@/components/table-selection"

type PageView = "lobby" | "cash" | "allin" | "mtt" | "sng" | "seat-selection" | "table" | "store"

export default function Home() {
  const [currentView, setCurrentView] = useState<PageView>("lobby")
  const [selectedGameMode, setSelectedGameMode] = useState<"cash" | "allin" | "mtt" | "sng">("cash")
  const [selectedTable, setSelectedTable] = useState<StakeTable | null>(null)
  const [playerChips] = useState(100000)
  const [playerDiamonds] = useState(250)

  console.log("[v0] Current view:", currentView, "| Selected game mode:", selectedGameMode)

  const handleNavigate = (page: "cash" | "allin" | "mtt" | "sng") => {
    console.log("[v0] Navigate triggered:", page)
    setSelectedGameMode(page)
    if (page === "mtt" || page === "sng") {
      setCurrentView(page)
    } else {
      setCurrentView(page)
    }
  }

  const handleTableSelect = (table: StakeTable) => {
    console.log("[v0] Table selected:", table)
    setSelectedTable(table)
    setCurrentView("seat-selection")
  }

  const handleSeatSelect = (seatId: number) => {
    console.log("[v0] Seat selected:", seatId)
    setCurrentView("table")
  }

  const handleBack = () => {
    console.log("[v0] Back to lobby")
    setCurrentView("lobby")
    setSelectedTable(null)
  }

  const handleBackFromSeatSelection = () => {
    console.log("[v0] Back to table selection")
    setCurrentView(selectedGameMode)
    setSelectedTable(null)
  }

  const handleStartTournament = (tournamentId: string) => {
    console.log("[v0] Starting tournament:", tournamentId)
    setCurrentView("table")
  }

  const handleOpenStore = () => {
    console.log("[v0] Opening store")
    setCurrentView("store")
  }

  if (currentView === "lobby") {
    console.log("[v0] Rendering HomeLobby")
    return <HomeLobby onNavigate={handleNavigate} onOpenStore={handleOpenStore} />
  }

  if (currentView === "store") {
    console.log("[v0] Rendering Store")
    return <Store onClose={handleBack} playerChips={playerChips} playerDiamonds={playerDiamonds} />
  }

  if (currentView === "cash" || currentView === "allin") {
    console.log("[v0] Rendering TableSelection for:", currentView)
    return (
      <TableSelection
        isOpen={true}
        onClose={handleBack}
        onSelectTable={handleTableSelect}
        gameMode={selectedGameMode}
        playerChips={playerChips}
      />
    )
  }

  if (currentView === "seat-selection" && selectedTable) {
    console.log("[v0] Rendering SeatSelection for table:", selectedTable.name)
    return (
      <SeatSelection
        isOpen={true}
        onClose={handleBackFromSeatSelection}
        onSelectSeat={handleSeatSelect}
        table={selectedTable}
      />
    )
  }

  if (currentView === "mtt" || currentView === "sng") {
    console.log("[v0] Rendering TournamentLobby for:", currentView)
    return <TournamentLobby onClose={handleBack} onStart={handleStartTournament} />
  }

  if (currentView === "table") {
    console.log("[v0] Rendering PokerTable")
    return <PokerTable />
  }

  console.log("[v0] Fallback to HomeLobby")
  return <HomeLobby onNavigate={handleNavigate} onOpenStore={handleOpenStore} />
}
