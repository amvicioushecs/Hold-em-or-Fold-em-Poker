"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import type { PlayerStats } from "@/types/stats"

interface StatsDashboardProps {
  onClose: () => void
}

export default function StatsDashboard({ onClose }: StatsDashboardProps) {
  const [selectedMode, setSelectedMode] = useState<"nlh" | "omaha" | "aof" | "sng" | "3pin">("nlh")

  // Mock stats data - in a real app, this would come from the backend
  const stats: PlayerStats = {
    totalHands: 66518,
    maxProfit: 1050000000, // 1.05B
    winRate: 27,
    vpip: 72,
    pfr: 12,
    wtsd: 36,
    reRaiseRate: 5,
    cBetRate: 16,
    bestHand: {
      cards: [
        { rank: "10", suit: "hearts" },
        { rank: "J", suit: "hearts" },
        { rank: "Q", suit: "hearts" },
        { rank: "K", suit: "hearts" },
        { rank: "A", suit: "hearts" },
      ],
      handName: "Royal Flush",
    },
  }

  const formatNumber = (num: number): string => {
    if (num >= 1000000000) {
      return `${(num / 1000000000).toFixed(2)}B`
    } else if (num >= 1000000) {
      return `${(num / 1000000).toFixed(2)}M`
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`
    }
    return num.toString()
  }

  const gameModes = [
    { id: "nlh", label: "NLH" },
    { id: "omaha", label: "OMAHA" },
    { id: "aof", label: "AOF" },
    { id: "sng", label: "SNG" },
    { id: "3pin", label: "3PIN" },
  ] as const

  const getSuitSymbol = (suit: string) => {
    switch (suit) {
      case "hearts":
        return "♥"
      case "diamonds":
        return "♦"
      case "clubs":
        return "♣"
      case "spades":
        return "♠"
      default:
        return ""
    }
  }

  const getSuitColor = (suit: string) => {
    return suit === "hearts" || suit === "diamonds" ? "text-red-500" : "text-gray-900"
  }

  return (
    <div className="relative w-full h-[100dvh] bg-gradient-to-b from-background to-card overflow-hidden">
      {/* Header - Optimized for mobile */}
      <div className="relative z-20 bg-card/80 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between p-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="w-10 h-10 rounded-full border-2 border-border text-foreground hover:bg-muted touch-manipulation"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold text-foreground">Data</h1>
          <div className="w-10" />
        </div>
      </div>

      <ScrollArea className="h-[calc(100vh-60px)]">
        <div className="p-3 space-y-3">
          {/* Game Mode Selector - Optimized */}
          <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-hide">
            {gameModes.map((mode) => (
              <Button
                key={mode.id}
                onClick={() => setSelectedMode(mode.id)}
                className={cn(
                  "px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap transition-all touch-manipulation flex-shrink-0",
                  selectedMode === mode.id
                    ? "bg-secondary text-secondary-foreground border-2 border-border"
                    : "bg-muted text-muted-foreground border-2 border-border hover:bg-secondary",
                )}
              >
                {mode.label}
              </Button>
            ))}
          </div>

          {/* Main Stats Grid - Mobile Optimized (2 columns) */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-card rounded-lg p-3 border-2 border-border">
              <p className="text-muted-foreground text-xs font-bold mb-1">Total Hands</p>
              <p className="text-chart-2 text-xl font-bold">{formatNumber(stats.totalHands)}</p>
            </div>
            <div className="bg-card rounded-lg p-3 border-2 border-border">
              <p className="text-muted-foreground text-xs font-bold mb-1">Max Profit</p>
              <p className="text-chart-2 text-xl font-bold">{formatNumber(stats.maxProfit)}</p>
            </div>
          </div>

          {/* Detailed Stats with Progress Bars - Mobile Optimized */}
          <div className="grid grid-cols-2 gap-2">
            {/* Win Rate */}
            <div className="bg-card rounded-lg p-3 border-2 border-border">
              <p className="text-muted-foreground text-xs font-bold mb-1">Win Rate</p>
              <p className="text-chart-2 text-2xl font-bold mb-2">{stats.winRate}%</p>
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div
                  className="bg-chart-2 h-full rounded-full transition-all duration-500"
                  style={{ width: `${stats.winRate}%` }}
                />
              </div>
            </div>

            {/* VPIP */}
            <div className="bg-card rounded-lg p-3 border-2 border-border">
              <p className="text-muted-foreground text-xs font-bold mb-1">VPIP</p>
              <p className="text-destructive text-2xl font-bold mb-2">{stats.vpip}%</p>
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div
                  className="bg-destructive h-full rounded-full transition-all duration-500"
                  style={{ width: `${stats.vpip}%` }}
                />
              </div>
            </div>

            {/* PFR */}
            <div className="bg-card rounded-lg p-3 border-2 border-border">
              <p className="text-muted-foreground text-xs font-bold mb-1">PFR</p>
              <p className="text-chart-4 text-2xl font-bold mb-2">{stats.pfr}%</p>
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div
                  className="bg-chart-4 h-full rounded-full transition-all duration-500"
                  style={{ width: `${stats.pfr}%` }}
                />
              </div>
            </div>

            {/* WTSD */}
            <div className="bg-card rounded-lg p-3 border-2 border-border">
              <p className="text-muted-foreground text-xs font-bold mb-1">WTSD</p>
              <p className="text-chart-2 text-2xl font-bold mb-2">{stats.wtsd}%</p>
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div
                  className="bg-chart-2 h-full rounded-full transition-all duration-500"
                  style={{ width: `${stats.wtsd}%` }}
                />
              </div>
            </div>

            {/* Re-raise Rate */}
            <div className="bg-card rounded-lg p-3 border-2 border-border">
              <p className="text-muted-foreground text-xs font-bold mb-1">Re-raise</p>
              <p className="text-chart-3 text-2xl font-bold mb-2">{stats.reRaiseRate}%</p>
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div
                  className="bg-chart-3 h-full rounded-full transition-all duration-500"
                  style={{ width: `${stats.reRaiseRate}%` }}
                />
              </div>
            </div>

            {/* C-bet Rate */}
            <div className="bg-card rounded-lg p-3 border-2 border-border">
              <p className="text-muted-foreground text-xs font-bold mb-1">C-bet</p>
              <p className="text-chart-1 text-2xl font-bold mb-2">{stats.cBetRate}%</p>
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div
                  className="bg-chart-1 h-full rounded-full transition-all duration-500"
                  style={{ width: `${stats.cBetRate}%` }}
                />
              </div>
            </div>
          </div>

          {/* Best Poker Hand - Mobile Optimized */}
          {stats.bestHand && (
            <div className="bg-card rounded-lg p-4 border-2 border-border">
              <h2 className="text-foreground text-lg font-bold mb-3 text-center">Best Poker Hand</h2>
              <div className="flex justify-center gap-1.5 mb-3">
                {stats.bestHand.cards.map((card, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-br from-chart-4/20 to-chart-4/40 rounded-md p-2 w-12 border-2 border-chart-4 shadow-lg"
                  >
                    <div className="flex flex-col items-center">
                      <span className={cn("text-lg font-bold", getSuitColor(card.suit))}>{card.rank}</span>
                      <span className={cn("text-2xl", getSuitColor(card.suit))}>{getSuitSymbol(card.suit)}</span>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-center text-muted-foreground text-sm font-bold">{stats.bestHand.handName}</p>
            </div>
          )}

          {/* Info Cards - Mobile Optimized */}
          <div className="space-y-1.5 text-xs text-muted-foreground bg-card/50 rounded-lg p-3 border border-border">
            <p className="leading-relaxed">
              <strong className="text-destructive">VPIP:</strong> Voluntarily Put money In Pot
            </p>
            <p className="leading-relaxed">
              <strong className="text-chart-4">PFR:</strong> Pre-Flop Raise rate
            </p>
            <p className="leading-relaxed">
              <strong className="text-chart-2">WTSD:</strong> Went To ShowDown
            </p>
            <p className="leading-relaxed">
              <strong className="text-chart-3">Re-raise:</strong> Re-raise opponents
            </p>
            <p className="leading-relaxed">
              <strong className="text-chart-1">C-bet:</strong> Continuation bet rate
            </p>
          </div>

          {/* Bottom Padding for safe area */}
          <div className="h-16" />
        </div>
      </ScrollArea>
    </div>
  )
}
