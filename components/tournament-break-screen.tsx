"use client"

import { Coffee, Clock } from "lucide-react"

interface TournamentBreakScreenProps {
  timeRemaining: string
  nextBlindLevel?: {
    level: number
    smallBlind: number
    bigBlind: number
    ante?: number
  }
}

export function TournamentBreakScreen({ timeRemaining, nextBlindLevel }: TournamentBreakScreenProps) {
  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-4 text-center space-y-8">
        <div className="flex justify-center">
          <div className="relative">
            <Coffee className="w-24 h-24 text-chart-4 animate-pulse" />
            <div className="absolute inset-0 bg-chart-4/20 rounded-full blur-xl animate-pulse" />
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-foreground">Tournament Break</h2>
          <p className="text-muted-foreground">Take a moment to relax</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Clock className="w-6 h-6 text-chart-4" />
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Time Remaining</p>
              <p className="text-4xl font-bold text-chart-4 tabular-nums">{timeRemaining}</p>
            </div>
          </div>
        </div>

        {nextBlindLevel && (
          <div className="bg-card/50 border border-border/50 rounded-xl p-4">
            <p className="text-sm text-muted-foreground mb-2">Next Level</p>
            <div className="flex items-center justify-center gap-6">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Level</p>
                <p className="text-lg font-bold text-foreground">{nextBlindLevel.level}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Blinds</p>
                <p className="text-lg font-bold text-chart-2">
                  {nextBlindLevel.smallBlind}/{nextBlindLevel.bigBlind}
                </p>
              </div>
              {nextBlindLevel.ante && nextBlindLevel.ante > 0 && (
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Ante</p>
                  <p className="text-lg font-bold text-chart-3">{nextBlindLevel.ante}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
