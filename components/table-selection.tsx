"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Users, TrendingUp, Lock, CheckCircle2, Coins, ChevronLeft, ChevronRight, Grid3x3, List } from "lucide-react"
import { cn } from "@/lib/utils"
import type { GameMode } from "@/types/poker"

export interface StakeTable {
  id: string
  name: string
  smallBlind: number
  bigBlind: number
  minBuyIn: number
  maxBuyIn: number
  currentPlayers: number
  maxPlayers: number
  isVip: boolean
  difficulty: "Beginner" | "Intermediate" | "Advanced" | "Expert"
  gameMode: GameMode // Add gameMode to table definition
}

interface TableSelectionProps {
  isOpen: boolean
  onClose: () => void
  onSelectTable: (table: StakeTable) => void
  gameMode: string
  playerChips: number
}

export default function TableSelection({ isOpen, onClose, onSelectTable, gameMode, playerChips }: TableSelectionProps) {
  const [selectedTable, setSelectedTable] = useState<StakeTable | null>(null)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [isMobile, setIsMobile] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const mappedGameMode: GameMode =
    gameMode === "sng" ? "sng" : gameMode === "mtt" ? "mtt" : gameMode === "allin" ? "allin" : "omaha"

  // Define different stake tables based on game mode
  const tables: StakeTable[] = [
    {
      id: "micro-1",
      name: "Micro Stakes",
      smallBlind: 10,
      bigBlind: 20,
      minBuyIn: 400,
      maxBuyIn: 2000,
      currentPlayers: 4,
      maxPlayers: 6,
      isVip: false,
      difficulty: "Beginner",
      gameMode: mappedGameMode,
    },
    {
      id: "low-1",
      name: "Low Stakes",
      smallBlind: 50,
      bigBlind: 100,
      minBuyIn: 2000,
      maxBuyIn: 10000,
      currentPlayers: 5,
      maxPlayers: 6,
      isVip: false,
      difficulty: "Beginner",
      gameMode: mappedGameMode,
    },
    {
      id: "low-2",
      name: "Low Stakes Plus",
      smallBlind: 100,
      bigBlind: 200,
      minBuyIn: 4000,
      maxBuyIn: 20000,
      currentPlayers: 3,
      maxPlayers: 6,
      isVip: false,
      difficulty: "Intermediate",
      gameMode: mappedGameMode,
    },
    {
      id: "medium-1",
      name: "Medium Stakes",
      smallBlind: 500,
      bigBlind: 1000,
      minBuyIn: 20000,
      maxBuyIn: 100000,
      currentPlayers: 6,
      maxPlayers: 6,
      isVip: false,
      difficulty: "Intermediate",
      gameMode: mappedGameMode,
    },
    {
      id: "medium-2",
      name: "Medium Stakes Pro",
      smallBlind: 1000,
      bigBlind: 2000,
      minBuyIn: 40000,
      maxBuyIn: 200000,
      currentPlayers: 2,
      maxPlayers: 6,
      isVip: false,
      difficulty: "Advanced",
      gameMode: mappedGameMode,
    },
    {
      id: "high-1",
      name: "High Stakes",
      smallBlind: 5000,
      bigBlind: 10000,
      minBuyIn: 200000,
      maxBuyIn: 1000000,
      currentPlayers: 4,
      maxPlayers: 6,
      isVip: false,
      difficulty: "Advanced",
      gameMode: mappedGameMode,
    },
    {
      id: "high-2",
      name: "High Stakes Elite",
      smallBlind: 10000,
      bigBlind: 20000,
      minBuyIn: 400000,
      maxBuyIn: 2000000,
      currentPlayers: 1,
      maxPlayers: 6,
      isVip: true,
      difficulty: "Expert",
      gameMode: mappedGameMode,
    },
    {
      id: "vip-1",
      name: "VIP Exclusive",
      smallBlind: 50000,
      bigBlind: 100000,
      minBuyIn: 2000000,
      maxBuyIn: 10000000,
      currentPlayers: 5,
      maxPlayers: 6,
      isVip: true,
      difficulty: "Expert",
      gameMode: mappedGameMode,
    },
    {
      id: "whale-1",
      name: "Whale Room",
      smallBlind: 100000,
      bigBlind: 200000,
      minBuyIn: 4000000,
      maxBuyIn: 20000000,
      currentPlayers: 3,
      maxPlayers: 6,
      isVip: true,
      difficulty: "Expert",
      gameMode: mappedGameMode,
    },
  ]

  const formatChips = (amount: number): string => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(2)}M`
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1)}K`
    }
    return amount.toString()
  }

  const canAffordTable = (table: StakeTable): boolean => {
    return playerChips >= table.minBuyIn
  }

  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty) {
      case "Beginner":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/50"
      case "Intermediate":
        return "bg-cyan-500/20 text-cyan-400 border-cyan-500/50"
      case "Advanced":
        return "bg-amber-500/20 text-amber-400 border-amber-500/50"
      case "Expert":
        return "bg-rose-500/20 text-rose-400 border-rose-500/50"
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500/50"
    }
  }

  const handleSelectTable = (table: StakeTable) => {
    if (!canAffordTable(table)) {
      return
    }
    setSelectedTable(table)
  }

  const handleConfirm = () => {
    if (selectedTable) {
      onSelectTable(selectedTable)
      onClose()
    }
  }

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 300
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      })
    }
  }

  // Render table card in grid view
  const renderGridCard = (table: StakeTable) => {
    const canAfford = canAffordTable(table)
    const isSelected = selectedTable?.id === table.id
    const isFull = table.currentPlayers >= table.maxPlayers

    return (
      <button
        key={table.id}
        onClick={() => handleSelectTable(table)}
        disabled={!canAfford || isFull}
        className={cn(
          "relative p-4 rounded-xl border-2 transition-all text-left",
          "hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed",
          "min-w-[280px] md:min-w-0",
          "backdrop-blur-sm",
          isSelected
            ? "border-yellow-500/70 bg-gradient-to-br from-yellow-500/20 via-amber-500/10 to-yellow-600/20 shadow-xl shadow-yellow-500/20"
            : "border-slate-700/50 bg-gradient-to-br from-slate-800/50 to-slate-900/50 hover:border-yellow-500/50 hover:shadow-lg hover:shadow-yellow-500/10",
          !canAfford && "border-red-500/50 bg-gradient-to-br from-red-900/20 to-slate-900/50",
        )}
      >
        {/* VIP Badge */}
        {table.isVip && (
          <div className="absolute top-2 right-2">
            <Badge className="bg-gradient-to-r from-yellow-500 to-amber-500 text-slate-900 border-0 text-xs font-bold shadow-lg">
              <Lock className="w-3 h-3 mr-1" />
              VIP
            </Badge>
          </div>
        )}

        {/* Selected Indicator */}
        {isSelected && (
          <div className="absolute top-2 left-2">
            <CheckCircle2 className="w-5 h-5 text-yellow-400 drop-shadow-lg" />
          </div>
        )}

        {/* Table Name */}
        <h3 className="text-base md:text-lg font-bold text-yellow-400 mb-3 pr-12 drop-shadow-md">{table.name}</h3>

        {/* Blinds */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs md:text-sm text-slate-400">Blinds:</span>
          <span className="text-xs md:text-sm font-semibold text-amber-400">
            {formatChips(table.smallBlind)}/{formatChips(table.bigBlind)}
          </span>
        </div>

        {/* Buy-in Range */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs md:text-sm text-slate-400">Buy-in:</span>
          <span className="text-xs md:text-sm font-semibold text-amber-400">
            {formatChips(table.minBuyIn)} - {formatChips(table.maxBuyIn)}
          </span>
        </div>

        {/* Players */}
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-4 h-4 text-slate-400" />
          <span className="text-xs md:text-sm text-slate-200">
            {table.currentPlayers}/{table.maxPlayers} players
          </span>
          {isFull && (
            <Badge variant="destructive" className="text-xs bg-red-500/80 text-white">
              Full
            </Badge>
          )}
        </div>

        {/* Difficulty Badge */}
        <Badge className={cn("text-xs border font-semibold", getDifficultyColor(table.difficulty))}>
          {table.difficulty}
        </Badge>

        {/* Cannot Afford Message */}
        {!canAfford && (
          <div className="mt-2 text-xs text-red-400 font-semibold flex items-center gap-1">
            <Lock className="w-3 h-3" />
            Need {formatChips(table.minBuyIn - playerChips)} more
          </div>
        )}
      </button>
    )
  }

  // Render table card in list view (more compact for mobile)
  const renderListCard = (table: StakeTable) => {
    const canAfford = canAffordTable(table)
    const isSelected = selectedTable?.id === table.id
    const isFull = table.currentPlayers >= table.maxPlayers

    return (
      <button
        key={table.id}
        onClick={() => handleSelectTable(table)}
        disabled={!canAfford || isFull}
        className={cn(
          "relative w-full p-3 rounded-xl border-2 transition-all text-left",
          "hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed",
          "flex flex-col gap-2 backdrop-blur-sm",
          isSelected
            ? "border-yellow-500/70 bg-gradient-to-r from-yellow-500/20 to-amber-500/10 shadow-lg shadow-yellow-500/20"
            : "border-slate-700/50 bg-gradient-to-r from-slate-800/50 to-slate-900/50 hover:border-yellow-500/50",
          !canAfford && "border-red-500/50 bg-gradient-to-r from-red-900/20 to-slate-900/50",
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {isSelected && <CheckCircle2 className="w-4 h-4 text-yellow-400 flex-shrink-0" />}
              <h3 className="text-sm font-bold text-yellow-400 truncate">{table.name}</h3>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-amber-400 font-medium">
                {formatChips(table.smallBlind)}/{formatChips(table.bigBlind)}
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400">{formatChips(table.minBuyIn)} min</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-300 flex items-center gap-1">
                <Users className="w-3 h-3" />
                {table.currentPlayers}/{table.maxPlayers}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            {table.isVip && (
              <Badge className="bg-gradient-to-r from-yellow-500 to-amber-500 text-slate-900 border-0 text-xs font-bold">
                VIP
              </Badge>
            )}
            <Badge className={cn("text-xs border font-semibold", getDifficultyColor(table.difficulty))}>
              {table.difficulty}
            </Badge>
            {isFull && (
              <Badge variant="destructive" className="text-xs bg-red-500/80 text-white">
                Full
              </Badge>
            )}
          </div>
        </div>
        {!canAfford && (
          <div className="text-xs text-red-400 font-semibold flex items-center gap-1">
            <Lock className="w-3 h-3" />
            Need {formatChips(table.minBuyIn - playerChips)} more chips
          </div>
        )}
      </button>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={cn(
          "p-0 gap-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-slate-700",
          isMobile ? "w-full h-full max-w-full max-h-full m-0 rounded-none" : "max-w-4xl max-h-[90vh]",
        )}
      >
        <DialogHeader
          className={cn("border-b border-slate-700/50 bg-slate-900/50", isMobile ? "p-4 pb-3" : "p-6 pb-4")}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <DialogTitle
                className={cn("font-bold flex items-center gap-2 text-yellow-400", isMobile ? "text-lg" : "text-2xl")}
              >
                <TrendingUp className={cn(isMobile ? "w-5 h-5" : "w-6 h-6", "text-yellow-500 flex-shrink-0")} />
                <span className="truncate">
                  {isMobile
                    ? "Select Table"
                    : `Select Your Table - ${gameMode === "sng" ? "SNG" : gameMode === "allin" ? "ALL IN OR FOLD" : "OMAHA"}`}
                </span>
              </DialogTitle>
              <div className="flex items-center gap-2 mt-2 text-xs md:text-sm text-slate-400">
                <Coins className="w-4 h-4 flex-shrink-0 text-amber-500" />
                <span>
                  Your Chips: <span className="text-amber-400 font-semibold">{formatChips(playerChips)}</span>
                </span>
              </div>
            </div>
            {isMobile && (
              <button
                onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
                className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 transition-colors"
                aria-label="Toggle view mode"
              >
                {viewMode === "grid" ? (
                  <List className="w-5 h-5 text-yellow-400" />
                ) : (
                  <Grid3x3 className="w-5 h-5 text-yellow-400" />
                )}
              </button>
            )}
          </div>
        </DialogHeader>

        {/* Horizontal scroll view for mobile grid */}
        {isMobile && viewMode === "grid" ? (
          <div className="relative flex-1 overflow-hidden bg-gradient-to-b from-slate-900/50 to-slate-800/50">
            <button
              onClick={() => scroll("left")}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-slate-800/90 backdrop-blur-sm border border-yellow-500/30 shadow-lg hover:bg-slate-700/90 transition-colors"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5 text-yellow-400" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-slate-800/90 backdrop-blur-sm border border-yellow-500/30 shadow-lg hover:bg-slate-700/90 transition-colors"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5 text-yellow-400" />
            </button>
            <div
              ref={scrollRef}
              className="flex gap-4 p-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide h-full"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {tables.map((table) => (
                <div key={table.id} className="snap-center flex-shrink-0">
                  {renderGridCard(table)}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <ScrollArea className={cn(isMobile ? "flex-1" : "h-[500px]", isMobile ? "p-4" : "p-6")}>
            <div
              className={cn(
                "gap-3",
                isMobile && viewMode === "list" ? "flex flex-col" : "grid grid-cols-1 md:grid-cols-2 gap-4",
              )}
            >
              {tables.map((table) => (isMobile && viewMode === "list" ? renderListCard(table) : renderGridCard(table)))}
            </div>
          </ScrollArea>
        )}

        <div
          className={cn(
            "border-t border-slate-700/50 bg-slate-900/50 flex justify-between items-center gap-2",
            isMobile ? "p-4 pt-3 flex-col" : "p-6 pt-4 flex-row",
          )}
        >
          <div className={cn("text-xs md:text-sm text-slate-400", isMobile && "w-full text-center")}>
            {selectedTable ? (
              <div className="flex flex-wrap items-center justify-center gap-1">
                <span className="font-semibold text-yellow-400">{selectedTable.name}</span>
                <span className="text-slate-600">•</span>
                <span>
                  Buy-in: <span className="text-amber-400 font-semibold">{formatChips(selectedTable.minBuyIn)}</span>
                </span>
              </div>
            ) : (
              <span>Select a table to continue</span>
            )}
          </div>
          <div className={cn("flex gap-2", isMobile && "w-full")}>
            <Button
              variant="outline"
              onClick={onClose}
              className={cn(
                "border-slate-600 hover:bg-slate-800 hover:border-slate-500 text-slate-300",
                isMobile && "flex-1",
              )}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!selectedTable}
              className={cn(
                "bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-slate-900 font-bold shadow-lg disabled:opacity-50 disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-400",
                isMobile ? "flex-1" : "min-w-32",
              )}
            >
              {isMobile ? "Next" : "Next: Choose Seat"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
