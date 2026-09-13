"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Users, Crown, CheckCircle2, ArrowLeft, X } from "lucide-react"
import { cn } from "@/lib/utils"
import type { StakeTable } from "./table-selection"

export interface Seat {
  id: number
  position: string
  occupied: boolean
  playerName?: string
  playerChips?: number
  isVip?: boolean
}

interface SeatSelectionProps {
  isOpen: boolean
  onClose: () => void
  onSelectSeat: (seatId: number) => void
  table: StakeTable
}

function formatChips(amount: number): string {
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(2)}M`
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(1)}K`
  return amount.toString()
}

export default function SeatSelection({ isOpen, onClose, onSelectSeat, table }: SeatSelectionProps) {
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null)

  // Stable mock occupancy for the session (avoid re-random on re-render)
  const seats: Seat[] = useMemo(
    () => [
      { id: 1, position: "top", occupied: true, playerName: "Alex K.", playerChips: 45000 },
      { id: 2, position: "top-right", occupied: true, playerName: "Sarah M.", playerChips: 32000, isVip: true },
      { id: 3, position: "bottom-right", occupied: false },
      { id: 4, position: "bottom", occupied: false },
      { id: 5, position: "bottom-left", occupied: true, playerName: "Emma L.", playerChips: 41000 },
      { id: 6, position: "top-left", occupied: false },
    ],
    [],
  )

  const positionClasses: Record<string, string> = {
    top: "top-[4%] left-1/2 -translate-x-1/2",
    "top-right": "top-[16%] right-[2%]",
    "bottom-right": "bottom-[16%] right-[2%]",
    bottom: "bottom-[4%] left-1/2 -translate-x-1/2",
    "bottom-left": "bottom-[16%] left-[2%]",
    "top-left": "top-[16%] left-[2%]",
  }

  const availableSeats = seats.filter((s) => !s.occupied).length

  if (!isOpen) return null

  const handleConfirm = () => {
    if (!selectedSeat) return
    onSelectSeat(selectedSeat)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[70] flex flex-col bg-[#07090E]">
      {/* Header */}
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
          <h1 className="truncate text-base font-bold text-[#E5A93C]">Choose Seat</h1>
          <p className="truncate text-[11px] text-slate-400">
            {table.name}
            <span className="mx-1.5 text-slate-600">·</span>
            ${formatChips(table.smallBlind)}/${formatChips(table.bigBlind)}
            <span className="mx-1.5 text-slate-600">·</span>
            <span className="text-emerald-400">{availableSeats} open</span>
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

      {/* Arena */}
      <div className="relative min-h-0 flex-1">
        {/* Vertical felt */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-[min(70%,480px)] w-[min(62%,240px)] -translate-x-1/2 -translate-y-1/2">
          <div
            className="h-full w-full rounded-[140px] border-[10px] border-[#3D3D3D] shadow-[0_20px_50px_rgba(0,0,0,0.7),inset_0_0_40px_12px_rgba(0,0,0,0.45)]"
            style={{
              background: "radial-gradient(107.61% 56.47% at 50% 50%, #2E7D32 0%, #1B5E20 100%)",
            }}
          />
        </div>

        {/* Center label */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 w-[min(200px,55%)] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-[#E5A93C]/20 bg-[#07090E]/75 px-3 py-2 text-center backdrop-blur-sm">
          <p className="truncate text-sm font-bold text-[#E5A93C]">{table.name}</p>
          <p className="text-[11px] text-slate-400">
            {table.currentPlayers}/{table.maxPlayers} seated
          </p>
        </div>

        {/* Seats */}
        {seats.map((seat) => {
          const isSelected = selectedSeat === seat.id
          return (
            <button
              key={seat.id}
              type="button"
              disabled={seat.occupied}
              onClick={() => !seat.occupied && setSelectedSeat(seat.id)}
              className={cn(
                "absolute z-20 flex h-[72px] w-[72px] flex-col items-center justify-center rounded-xl border transition active:scale-95 sm:h-20 sm:w-20",
                positionClasses[seat.position],
                seat.occupied && "cursor-not-allowed border-slate-700 bg-[#131A33] opacity-90",
                !seat.occupied &&
                  !isSelected &&
                  "border-emerald-500/40 bg-[#151922] shadow-lg shadow-emerald-900/20",
                isSelected &&
                  "scale-105 border-[#E5A93C] bg-gradient-to-b from-[#E5A93C]/25 to-[#B87C20]/20 ring-2 ring-[#E5A93C]",
              )}
            >
              {seat.occupied ? (
                <>
                  <div className="relative mb-0.5 flex h-8 w-8 items-center justify-center rounded-full border border-slate-600 bg-slate-700 text-xs font-bold text-white">
                    {seat.playerName?.charAt(0)}
                    {seat.isVip && (
                      <Crown className="absolute -top-1 -right-1 h-3 w-3 text-[#E5A93C]" />
                    )}
                  </div>
                  <p className="w-full truncate px-1 text-center text-[10px] font-semibold text-slate-200">
                    {seat.playerName}
                  </p>
                  <p className="text-[9px] text-slate-500">${formatChips(seat.playerChips || 0)}</p>
                </>
              ) : isSelected ? (
                <>
                  <CheckCircle2 className="mb-0.5 h-7 w-7 text-[#E5A93C]" />
                  <p className="text-[10px] font-bold text-[#E5A93C]">You</p>
                </>
              ) : (
                <>
                  <Users className="mb-0.5 h-6 w-6 text-emerald-400" />
                  <p className="text-[10px] font-bold text-slate-100">Seat {seat.id}</p>
                  <p className="text-[9px] text-emerald-400/80">Open</p>
                </>
              )}
            </button>
          )
        })}
      </div>

      {/* Footer */}
      <footer className="shrink-0 border-t border-slate-800/70 bg-[#0C0F16] px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <p className="mb-2 text-center text-[11px] text-slate-500">
          {selectedSeat ? (
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-[#E5A93C]" />
              Selected <span className="font-semibold text-[#E5A93C]">Seat {selectedSeat}</span>
            </span>
          ) : (
            "Tap an open seat"
          )}
        </p>
        <div className="mx-auto flex max-w-[430px] gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="h-12 flex-1 border-slate-700 bg-[#151922] text-slate-200 hover:bg-slate-800 hover:text-white"
          >
            Back
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedSeat}
            className="h-12 flex-1 bg-gradient-to-b from-[#E5A93C] to-[#B87C20] font-bold text-[#020617] hover:opacity-95 disabled:opacity-40"
          >
            Sit Down
          </Button>
        </div>
      </footer>
    </div>
  )
}
