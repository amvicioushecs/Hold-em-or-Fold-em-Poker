"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Trophy, TrendingUp } from "lucide-react"
import type { BlindLevel, TournamentConfig } from "@/types/tournament"

interface TournamentStructureProps {
  config: TournamentConfig
  currentLevel?: number
}

export default function TournamentStructure({ config, currentLevel = 0 }: TournamentStructureProps) {
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`
    }
    return num.toString()
  }

  const formatTime = (seconds: number): string => {
    return `${seconds / 60} min`
  }

  return (
    <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-blue-400" />
        <h3 className="text-lg font-bold text-white">Blind Structure</h3>
      </div>

      <ScrollArea className="h-[400px]">
        <div className="space-y-2">
          {config.blindStructure.map((level: BlindLevel) => {
            const isCurrentLevel = level.level === currentLevel + 1
            const isPastLevel = level.level < currentLevel + 1

            return (
              <div
                key={level.level}
                className={`
                  rounded-lg p-3 border-2 transition-all
                  ${isCurrentLevel ? "bg-blue-900/50 border-blue-500" : "bg-gray-800/50 border-gray-700"}
                  ${isPastLevel ? "opacity-50" : ""}
                `}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`
                      w-10 h-10 rounded-full flex items-center justify-center font-bold
                      ${isCurrentLevel ? "bg-blue-500 text-white" : "bg-gray-700 text-gray-400"}
                    `}
                    >
                      {level.level}
                    </div>

                    <div>
                      <p className="text-white font-bold">
                        {formatNumber(level.smallBlind)}/{formatNumber(level.bigBlind)}
                      </p>
                      {level.ante > 0 && <p className="text-xs text-gray-400">Ante: {formatNumber(level.ante)}</p>}
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-sm text-gray-400">{formatTime(level.duration)}</p>
                  </div>
                </div>

                {isCurrentLevel && (
                  <div className="mt-2 flex items-center gap-1 text-xs text-blue-400">
                    <Trophy className="w-3 h-3" />
                    <span>Current Level</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </ScrollArea>

      {/* Prize Structure */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <h4 className="text-sm font-bold text-white mb-2">Prize Distribution</h4>
        <div className="grid grid-cols-3 gap-2">
          {config.prizePoolPercentages.map((percent, idx) => (
            <div key={idx} className="bg-gray-800 rounded-lg p-2 text-center">
              <p className="text-xs text-gray-400">#{idx + 1}</p>
              <p className="text-sm font-bold text-yellow-400">{percent}%</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
