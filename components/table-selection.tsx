"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Lock, CheckCircle2, Coins, ArrowLeft, X } from "lucide-react"
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
  gameMode: GameMode
}

interface TableSelectionProps {
  isOpen: boolean
  onClose: () => void
  onSelectTable: (table: StakeTable) => void
  gameMode: string
  playerChips: number
}

function mapMode(gameMode: string): GameMode {
  if (gameMode === "sng" || gameMode === "mtt" || gameMode === "allin" || gameMode === "cash" || gameMode === "omaha") {
    return gameMode
  }
  return "cash"
}

function modeLabel(gameMode: string) {
  switch (gameMode) {
    case "sng":
      return "Sit & Go"
    case "mtt":
      return "Tournament"
    case "allin":
      return "All-in or Fold"
    case "omaha":
      return "Omaha"
    default:
      return "Cash Game"
  }
}

function formatChips(amount: number): string {
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(2)}M`
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(1)}K`
  return amount.toString()
}

function difficultyClass(difficulty: string): string {
  switch (difficulty) {
    case "Beginner":
      return "bg-emerald-500/15 text-emerald-400 border-emerald-500/25"
    case "Intermediate":
      return "bg-blue-500/15 text-blue-400 border-blue-500/25"
    case "Advanced":
      return "bg-amber-500/15 text-amber-400 border-amber-500/25"
    case "Expert":
      return "bg-rose-500/15 text-rose-400 border-rose-500/25"
    default:
      return "bg-slate-800 text-slate-400 border-slate-700"
  }
}

/** Stake catalogs per cash-like mode (cash / allin / omaha). */
function buildTables(mode: GameMode): StakeTable[] {
  if (mode === "allin") {
    // Fixed buy-in style tables — only fold / all-in once seated
    return [
      {
        id: "aof-micro",
        name: "AOF Micro",
        smallBlind: 10,
        bigBlind: 20,
        minBuyIn: 200,
        maxBuyIn: 200,
        currentPlayers: 3,
        maxPlayers: 6,
        isVip: false,
        difficulty: "Beginner",
        gameMode: "allin",
      },
      {
        id: "aof-low",
        name: "AOF Low",
        smallBlind: 50,
        bigBlind: 100,
        minBuyIn: 1000,
        maxBuyIn: 1000,
        currentPlayers: 4,
        maxPlayers: 6,
        isVip: false,
        difficulty: "Beginner",
        gameMode: "allin",
      },
      {
        id: "aof-mid",
        name: "AOF Mid",
        smallBlind: 250,
        bigBlind: 500,
        minBuyIn: 5000,
        maxBuyIn: 5000,
        currentPlayers: 2,
        maxPlayers: 6,
        isVip: false,
        difficulty: "Intermediate",
        gameMode: "allin",
      },
      {
        id: "aof-high",
        name: "AOF High",
        smallBlind: 1000,
        bigBlind: 2000,
        minBuyIn: 20000,
        maxBuyIn: 20000,
        currentPlayers: 5,
        maxPlayers: 6,
        isVip: false,
        difficulty: "Advanced",
        gameMode: "allin",
      },
      {
        id: "aof-vip",
        name: "AOF VIP",
        smallBlind: 5000,
        bigBlind: 10000,
        minBuyIn: 100000,
        maxBuyIn: 100000,
        currentPlayers: 1,
        maxPlayers: 6,
        isVip: true,
        difficulty: "Expert",
        gameMode: "allin",
      },
    ]
  }

  if (mode === "omaha") {
    return [
      {
        id: "omaha-micro",
        name: "Omaha Micro",
        smallBlind: 10,
        bigBlind: 20,
        minBuyIn: 400,
        maxBuyIn: 2000,
        currentPlayers: 2,
        maxPlayers: 6,
        isVip: false,
        difficulty: "Beginner",
        gameMode: "omaha",
      },
      {
        id: "omaha-low",
        name: "Omaha Low",
        smallBlind: 50,
        bigBlind: 100,
        minBuyIn: 2000,
        maxBuyIn: 10000,
        currentPlayers: 4,
        maxPlayers: 6,
        isVip: false,
        difficulty: "Beginner",
        gameMode: "omaha",
      },
      {
        id: "omaha-mid",
        name: "Omaha Mid",
        smallBlind: 250,
        bigBlind: 500,
        minBuyIn: 10000,
        maxBuyIn: 50000,
        currentPlayers: 3,
        maxPlayers: 6,
        isVip: false,
        difficulty: "Intermediate",
        gameMode: "omaha",
      },
      {
        id: "omaha-high",
        name: "Omaha High",
        smallBlind: 1000,
        bigBlind: 2000,
        minBuyIn: 40000,
        maxBuyIn: 200000,
        currentPlayers: 1,
        maxPlayers: 6,
        isVip: false,
        difficulty: "Advanced",
        gameMode: "omaha",
      },
      {
        id: "omaha-vip",
        name: "Omaha VIP",
        smallBlind: 5000,
        bigBlind: 10000,
        minBuyIn: 200000,
        maxBuyIn: 1000000,
        currentPlayers: 2,
        maxPlayers: 6,
        isVip: true,
        difficulty: "Expert",
        gameMode: "omaha",
      },
    ]
  }

  // cash (default) and any other non-tournament mode
  return [
    {
      id: "cash-micro",
      name: "Micro Stakes",
      smallBlind: 10,
      bigBlind: 20,
      minBuyIn: 400,
      maxBuyIn: 2000,
      currentPlayers: 4,
      maxPlayers: 6,
      isVip: false,
      difficulty: "Beginner",
      gameMode: "cash",
    },
    {
      id: "cash-low",
      name: "Low Stakes",
      smallBlind: 50,
      bigBlind: 100,
      minBuyIn: 2000,
      maxBuyIn: 10000,
      currentPlayers: 5,
      maxPlayers: 6,
      isVip: false,
      difficulty: "Beginner",
      gameMode: "cash",
    },
    {
      id: "cash-low-plus",
      name: "Low Stakes Plus",
      smallBlind: 100,
      bigBlind: 200,
      minBuyIn: 4000,
      maxBuyIn: 20000,
      currentPlayers: 3,
      maxPlayers: 6,
      isVip: false,
      difficulty: "Intermediate",
      gameMode: "cash",
    },
    {
      id: "cash-mid",
      name: "Medium Stakes",
      smallBlind: 500,
      bigBlind: 1000,
      minBuyIn: 20000,
      maxBuyIn: 100000,
      currentPlayers: 4,
      maxPlayers: 6,
      isVip: false,
      difficulty: "Intermediate",
      gameMode: "cash",
    },
    {
      id: "cash-mid-pro",
      name: "Medium Stakes Pro",
      smallBlind: 1000,
      bigBlind: 2000,
      minBuyIn: 40000,
      maxBuyIn: 200000,
      currentPlayers: 2,
      maxPlayers: 6,
      isVip: false,
      difficulty: "Advanced",
      gameMode: "cash",
    },
    {
      id: "cash-high",
      name: "High Stakes",
      smallBlind: 5000,
      bigBlind: 10000,
      minBuyIn: 200000,
      maxBuyIn: 1000000,
      currentPlayers: 3,
      maxPlayers: 6,
      isVip: false,
      difficulty: "Advanced",
      gameMode: "cash",
    },
    {
      id: "cash-elite",
      name: "High Stakes Elite",
      smallBlind: 10000,
      bigBlind: 20000,
      minBuyIn: 400000,
      maxBuyIn: 2000000,
      currentPlayers: 1,
      maxPlayers: 6,
      isVip: true,
      difficulty: "Expert",
      gameMode: "cash",
    },
    {
      id: "cash-vip",
      name: "VIP Exclusive",
      smallBlind: 50000,
      bigBlind: 100000,
      minBuyIn: 2000000,
      maxBuyIn: 10000000,
      currentPlayers: 2,
      maxPlayers: 6,
      isVip: true,
      difficulty: "Expert",
      gameMode: "cash",
    },
  ]
}

export default function TableSelection({
  isOpen,
  onClose,
  onSelectTable,
  gameMode,
  playerChips,
}: TableSelectionProps) {
  const [selectedTable, setSelectedTable] = useState<StakeTable | null>(null)
  const mode = mapMode(gameMode)
  const tables = useMemo(() => buildTables(mode), [mode])

  if (!isOpen) return null

  const canAfford = (t: StakeTable) => playerChips >= t.minBuyIn

  const handleConfirm = () => {
    if (!selectedTable) return
    onSelectTable(selectedTable)
  }

  return (
    <div className="fixed inset-0 z-[70] flex flex-col bg-[#07090E]">
      <header className="flex shrink-0 items-center gap-3 border-b border-slate-800/70 bg-[#0C0F16] px-3 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <button
          type="button"
          onClick={onClose}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-700/50 bg-[#191C22] text-slate-300"
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-base font-bold text-[#E5A93C]">Select Table</h1>
          <p className="truncate text-[11px] text-slate-400">
            {modeLabel(mode)}
            <span className="mx-1.5 text-slate-600">·</span>
            <Coins className="mr-0.5 inline h-3 w-3 text-[#FEB956]" />
            <span className="font-semibold text-[#FEB956]">{formatChips(playerChips)}</span>
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-700/50 bg-[#191C22] text-slate-400"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
      </header>

      {mode === "allin" && (
        <div className="shrink-0 border-b border-amber-500/20 bg-amber-500/10 px-4 py-2 text-center text-[11px] text-amber-200/90">
          All-in or Fold — only <strong className="text-[#FEB956]">Fold</strong> and{" "}
          <strong className="text-[#FEB956]">All-in</strong> are allowed at these tables
        </div>
      )}

      {mode === "omaha" && (
        <div className="shrink-0 border-b border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-center text-[11px] text-emerald-200/90">
          Omaha — each player is dealt <strong className="text-emerald-300">4 hole cards</strong> (use exactly 2
          with 3 board cards)
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-3">
        <div className="mx-auto flex max-w-[430px] flex-col gap-2.5 pb-2">
          {tables.map((table) => {
            const affordable = canAfford(table)
            const full = table.currentPlayers >= table.maxPlayers
            const selected = selectedTable?.id === table.id
            const disabled = !affordable || full
            const fixedBuyIn = table.minBuyIn === table.maxBuyIn

            return (
              <button
                key={table.id}
                type="button"
                disabled={disabled}
                onClick={() => setSelectedTable(table)}
                className={cn(
                  "w-full rounded-xl border px-3.5 py-3 text-left transition active:scale-[0.99]",
                  selected
                    ? "border-[#E5A93C] bg-[#E5A93C]/10 shadow-[0_0_20px_rgba(229,169,60,0.12)]"
                    : "border-slate-800 bg-[#151922]",
                  disabled && "opacity-45",
                )}
              >
                <div className="flex items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-1.5">
                      {selected && <CheckCircle2 className="h-4 w-4 shrink-0 text-[#E5A93C]" />}
                      <h3
                        className={cn(
                          "truncate text-sm font-bold",
                          selected ? "text-[#E5A93C]" : "text-slate-100",
                        )}
                      >
                        {table.name}
                      </h3>
                      {table.isVip && (
                        <Badge className="shrink-0 border-0 bg-gradient-to-r from-[#E5A93C] to-amber-500 px-1.5 py-0 text-[10px] font-bold text-[#020617]">
                          VIP
                        </Badge>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-slate-400">
                      <span className={cn("font-semibold", selected ? "text-[#FEB956]" : "text-slate-200")}>
                        {formatChips(table.smallBlind)}/{formatChips(table.bigBlind)}
                      </span>
                      <span className="text-slate-600">·</span>
                      <span>
                        {fixedBuyIn ? (
                          <>
                            Buy-in {formatChips(table.minBuyIn)}
                          </>
                        ) : (
                          <>
                            {formatChips(table.minBuyIn)}–{formatChips(table.maxBuyIn)}
                          </>
                        )}
                      </span>
                      <span className="text-slate-600">·</span>
                      <span className="inline-flex items-center gap-0.5">
                        <Users className="h-3 w-3" />
                        {table.currentPlayers}/{table.maxPlayers}
                      </span>
                    </div>

                    {!affordable && (
                      <p className="mt-1.5 flex items-center gap-1 text-[11px] font-semibold text-red-400">
                        <Lock className="h-3 w-3" />
                        Need {formatChips(table.minBuyIn - playerChips)} more
                      </p>
                    )}
                    {full && affordable && (
                      <p className="mt-1.5 text-[11px] font-semibold text-red-400">Table full</p>
                    )}
                  </div>

                  <Badge className={cn("shrink-0 border text-[10px] font-semibold", difficultyClass(table.difficulty))}>
                    {table.difficulty}
                  </Badge>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <footer className="shrink-0 border-t border-slate-800/70 bg-[#0C0F16] px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <p className="mb-2 text-center text-[11px] text-slate-500">
          {selectedTable ? (
            <>
              <span className="font-semibold text-[#E5A93C]">{selectedTable.name}</span>
              <span className="mx-1 text-slate-600">·</span>
              {selectedTable.minBuyIn === selectedTable.maxBuyIn ? "Buy-in " : "From "}
              <span className="font-semibold text-[#FEB956]">{formatChips(selectedTable.minBuyIn)}</span>
            </>
          ) : (
            "Select a table to continue"
          )}
        </p>
        <div className="mx-auto flex max-w-[430px] gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="h-12 flex-1 border-slate-700 bg-[#151922] text-slate-200 hover:bg-slate-800 hover:text-white"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedTable}
            className="h-12 flex-1 bg-gradient-to-b from-[#E5A93C] to-[#B87C20] font-bold text-[#020617] hover:opacity-95 disabled:opacity-40"
          >
            Next: Seat
          </Button>
        </div>
      </footer>
    </div>
  )
}
