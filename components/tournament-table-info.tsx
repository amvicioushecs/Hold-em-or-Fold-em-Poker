"use client"

import { Badge } from "@/components/ui/badge"
import { Trophy, Users, Clock, TrendingUp } from "lucide-react"
import { useTournament } from "@/hooks/use-tournament"
import { cn } from "@/lib/utils"

export default function TournamentTableInfo() {
  const { tournament, currentBlindLevel, timeUntilNextLevel } = useTournament()

  if (!tournament || tournament.phase === "registration") return null

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`
    }
    return num.toString()
  }

  return (
    <div className="absolute top-4 left-4 z-40 space-y-2">
      {/* Tournament Name */}
      <div className="bg-black/90 backdrop-blur-sm rounded-xl px-4 py-2 border-2 border-purple-500">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-400" />
          <div>
            <p className="text-sm font-bold text-white">{tournament.config.name}</p>
            <Badge
              className={cn(
                "text-xs",
                tournament.phase === "running" && "bg-green-500",
                tournament.phase === "final-table" && "bg-yellow-500",
                tournament.phase === "completed" && "bg-gray-500",
              )}
            >
              {tournament.phase === "final-table" ? "FINAL TABLE" : tournament.phase.toUpperCase()}
            </Badge>
          </div>
        </div>
      </div>

      {/* Blind Level Info */}
      {currentBlindLevel && (
        <div className="bg-black/90 backdrop-blur-sm rounded-xl px-4 py-3 border-2 border-blue-500">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            <div>
              <p className="text-xs text-gray-400">Blinds</p>
              <p className="text-lg font-bold text-white">
                {formatNumber(currentBlindLevel.smallBlind)}/{formatNumber(currentBlindLevel.bigBlind)}
              </p>
              {currentBlindLevel.ante > 0 && (
                <p className="text-xs text-gray-400">Ante: {formatNumber(currentBlindLevel.ante)}</p>
              )}
            </div>
          </div>

          {/* Timer */}
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <div className="flex-1">
              <p className="text-xs text-gray-400">Next level in:</p>
              <p className="text-xl font-bold text-cyan-400">{timeUntilNextLevel}</p>
            </div>
          </div>

          {/* Level Number */}
          <div className="mt-2 text-center">
            <Badge variant="outline" className="text-xs">
              Level {currentBlindLevel.level}
            </Badge>
          </div>
        </div>
      )}

      {/* Players Remaining */}
      <div className="bg-black/90 backdrop-blur-sm rounded-xl px-4 py-2 border-2 border-cyan-500">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-cyan-400" />
          <div>
            <p className="text-xs text-gray-400">Players</p>
            <p className="text-lg font-bold text-white">
              {tournament.remainingPlayers} / {tournament.totalPlayers}
            </p>
          </div>
        </div>
      </div>

      {/* Prize Pool */}
      <div className="bg-black/90 backdrop-blur-sm rounded-xl px-4 py-2 border-2 border-yellow-500">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-400" />
          <div>
            <p className="text-xs text-gray-400">Prize Pool</p>
            <p className="text-lg font-bold text-yellow-400">{formatNumber(tournament.totalPrizePool)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
