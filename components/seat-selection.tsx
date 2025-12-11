"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Users, Crown, CheckCircle2, X } from "lucide-react"
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

export default function SeatSelection({ isOpen, onClose, onSelectSeat, table }: SeatSelectionProps) {
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null)

  // Define 6 seats around the table with their positions
  const seats: Seat[] = [
    {
      id: 1,
      position: "top",
      occupied: Math.random() > 0.5,
      playerName: "Alex K.",
      playerChips: 45000,
      isVip: false,
    },
    {
      id: 2,
      position: "top-right",
      occupied: Math.random() > 0.5,
      playerName: "Sarah M.",
      playerChips: 32000,
      isVip: true,
    },
    {
      id: 3,
      position: "bottom-right",
      occupied: Math.random() > 0.5,
      playerName: "Mike R.",
      playerChips: 58000,
      isVip: false,
    },
    {
      id: 4,
      position: "bottom",
      occupied: false,
      playerName: undefined,
      playerChips: undefined,
    },
    {
      id: 5,
      position: "bottom-left",
      occupied: Math.random() > 0.5,
      playerName: "Emma L.",
      playerChips: 41000,
      isVip: false,
    },
    {
      id: 6,
      position: "top-left",
      occupied: Math.random() > 0.5,
      playerName: "David P.",
      playerChips: 67000,
      isVip: false,
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

  const handleSeatClick = (seat: Seat) => {
    if (!seat.occupied) {
      setSelectedSeat(seat.id)
    }
  }

  const handleConfirm = () => {
    if (selectedSeat) {
      onSelectSeat(selectedSeat)
      onClose()
    }
  }

  // Position mapping for CSS - Optimized for mobile
  const positionClasses: Record<string, string> = {
    top: "top-[8%] left-1/2 -translate-x-1/2",
    "top-right": "top-[18%] right-[8%] md:right-[12%]",
    "bottom-right": "bottom-[18%] right-[8%] md:right-[12%]",
    bottom: "bottom-[8%] left-1/2 -translate-x-1/2",
    "bottom-left": "bottom-[18%] left-[8%] md:left-[12%]",
    "top-left": "top-[18%] left-[8%] md:left-[12%]",
  }

  const availableSeats = seats.filter((s) => !s.occupied).length

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-full md:max-w-5xl h-[100dvh] md:h-auto md:max-h-[90vh] p-0 gap-0 bg-slate-900 border-amber-500/20">
        {/* Header - Mobile Optimized */}
        <DialogHeader className="p-4 md:p-6 pb-3 md:pb-4 border-b border-amber-500/20 bg-gradient-to-br from-slate-800 to-slate-900">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg md:text-2xl font-bold flex items-center gap-2 text-yellow-400">
              <Users className="w-5 h-5 md:w-6 md:h-6" />
              <span className="hidden sm:inline">Choose Your Seat</span>
              <span className="sm:hidden">Select Seat</span>
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className="text-xs md:text-sm bg-amber-500/20 text-amber-400 border-amber-500/30 px-2 py-0.5"
              >
                {availableSeats} <span className="hidden sm:inline">seat{availableSeats !== 1 ? "s" : ""}</span> open
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8 md:hidden text-slate-400 hover:text-yellow-400 hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
          <div className="text-xs md:text-sm text-amber-400/80 mt-1 md:mt-2">
            {table.name} •{" "}
            <span className="text-yellow-400">
              ${formatChips(table.smallBlind)}/${formatChips(table.bigBlind)}
            </span>
          </div>
        </DialogHeader>

        {/* Table Visualization - Mobile Optimized */}
        <div className="relative flex-1 md:h-[450px] lg:h-[500px] p-3 md:p-6 lg:p-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
          {/* Poker Table */}
          <div className="absolute inset-3 md:inset-6 lg:inset-8">
            <div className="relative w-full h-full">
              {/* Table Surface - Enhanced with brand colors */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-emerald-950 to-emerald-900 rounded-[50%] shadow-[0_0_60px_rgba(251,191,36,0.15)] border-4 md:border-8 border-amber-600/30">
                {/* Subtle inner glow */}
                <div className="absolute inset-0 rounded-[50%] shadow-[inset_0_0_40px_rgba(251,191,36,0.1)]" />

                {/* Table Center Info - Mobile Optimized */}
                <div className="absolute inset-0 flex items-center justify-center px-4">
                  <div className="text-center bg-slate-900/80 backdrop-blur-sm rounded-lg px-3 py-2 md:px-6 md:py-4 border border-amber-500/30 shadow-lg shadow-amber-500/10 max-w-[80%]">
                    <p className="text-sm md:text-lg font-bold text-yellow-400 mb-0.5 md:mb-1 truncate">{table.name}</p>
                    <p className="text-xs md:text-sm text-amber-400">
                      {table.currentPlayers}/{table.maxPlayers} Players
                    </p>
                  </div>
                </div>

                {/* Seats - Mobile Optimized with larger touch targets */}
                {seats.map((seat) => (
                  <button
                    key={seat.id}
                    onClick={() => handleSeatClick(seat)}
                    disabled={seat.occupied}
                    className={cn(
                      "absolute rounded-lg transition-all duration-200 touch-manipulation active:scale-95",
                      // Mobile: 70px, Tablet: 90px, Desktop: 112px (28*4)
                      "w-[70px] h-[70px] md:w-[90px] md:h-[90px] lg:w-28 lg:h-28",
                      positionClasses[seat.position],
                      seat.occupied
                        ? "bg-slate-800/90 border-2 border-slate-600/50 cursor-not-allowed"
                        : "bg-gradient-to-br from-emerald-700/60 to-emerald-800/60 border-2 border-emerald-500/50 hover:border-emerald-400 hover:from-emerald-600/70 hover:to-emerald-700/70 hover:scale-105 cursor-pointer shadow-lg shadow-emerald-500/20",
                      selectedSeat === seat.id &&
                        "ring-2 md:ring-4 ring-yellow-400 bg-gradient-to-br from-amber-600 to-amber-700 shadow-xl shadow-yellow-400/40 scale-105 md:scale-110 border-yellow-400",
                    )}
                  >
                    {seat.occupied ? (
                      // Occupied Seat - Mobile Optimized
                      <div className="relative w-full h-full flex flex-col items-center justify-center p-1 md:p-2">
                        <div className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-white font-bold text-sm md:text-base lg:text-lg border-2 border-slate-500 mb-0.5 md:mb-1 shadow-md">
                          {seat.playerName?.charAt(0)}
                        </div>
                        <p className="text-[10px] md:text-xs font-semibold text-white truncate w-full text-center px-1">
                          {seat.playerName}
                        </p>
                        <p className="text-[9px] md:text-[10px] text-slate-300">
                          ${formatChips(seat.playerChips || 0)}
                        </p>
                        {seat.isVip && (
                          <Crown className="absolute top-0.5 right-0.5 md:top-1 md:right-1 w-3 h-3 md:w-4 md:h-4 text-yellow-400 drop-shadow-[0_0_3px_rgba(250,204,21,0.8)]" />
                        )}
                      </div>
                    ) : (
                      // Available Seat - Mobile Optimized
                      <div className="relative w-full h-full flex flex-col items-center justify-center">
                        {selectedSeat === seat.id ? (
                          <>
                            <CheckCircle2 className="w-7 h-7 md:w-9 md:h-9 lg:w-10 lg:h-10 text-yellow-400 mb-0.5 md:mb-1 drop-shadow-[0_0_6px_rgba(250,204,21,0.8)]" />
                            <p className="text-[10px] md:text-xs font-bold text-yellow-400">Selected</p>
                          </>
                        ) : (
                          <>
                            <Users className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 text-emerald-300 mb-0.5 md:mb-1" />
                            <p className="text-[10px] md:text-xs font-bold text-white">Seat {seat.id}</p>
                            <p className="text-[9px] md:text-[10px] text-emerald-300">Available</p>
                          </>
                        )}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Mobile Optimized with brand colors */}
        <div className="p-4 md:p-6 pt-3 md:pt-4 border-t border-amber-500/20 bg-gradient-to-br from-slate-800 to-slate-900">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-0 sm:justify-between sm:items-center">
            <div className="text-xs md:text-sm text-amber-400/80 order-2 sm:order-1">
              {selectedSeat ? (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-yellow-400" />
                  <span>
                    Selected: <span className="font-semibold text-yellow-400">Seat {selectedSeat}</span>
                  </span>
                </div>
              ) : (
                <span className="hidden sm:inline">Tap an available seat to select</span>
              )}
            </div>
            <div className="flex gap-2 order-1 sm:order-2">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1 sm:flex-none min-w-[100px] h-11 md:h-10 bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white hover:border-slate-500 active:scale-95 transition-all"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={!selectedSeat}
                className={cn(
                  "flex-1 sm:flex-none min-w-[120px] h-11 md:h-10 font-bold transition-all active:scale-95",
                  selectedSeat
                    ? "bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-900 shadow-lg shadow-yellow-500/30"
                    : "bg-slate-700 text-slate-500 cursor-not-allowed",
                )}
              >
                Confirm Seat
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
