"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Users, Clock, Trophy, Coins, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import type { TournamentConfig } from "@/types/tournament"
import { useTournament } from "@/hooks/use-tournament"
import { tournamentEngine, TournamentEngine } from "@/lib/tournament-engine"

interface SngLobbyProps {
  onClose: () => void
  onStart: (tournamentId: string) => void
}

export default function SngLobby({ onClose, onStart }: SngLobbyProps) {
  const [availableTournaments, setAvailableTournaments] = useState<TournamentConfig[]>([])
  const [selectedTournament, setSelectedTournament] = useState<TournamentConfig | null>(null)
  const { tournament, createTournament, registerPlayer, startTournament } = useTournament()

  useEffect(() => {
    // Create SNG templates
    const templates: TournamentConfig[] = [
      {
        id: "sng-heads-up",
        name: "Heads-Up Duel",
        buyIn: 1000,
        entryFee: 100,
        startingChips: 1500,
        maxPlayers: 2,
        minPlayers: 2,
        playersPerTable: 2,
        lateRegistrationMinutes: 0,
        blindStructure: TournamentEngine.getDefaultBlindStructure(),
        prizePoolPercentages: [100],
      },
      {
        id: "sng-6max-turbo",
        name: "6-Max Turbo SNG",
        buyIn: 2500,
        entryFee: 250,
        startingChips: 3000,
        maxPlayers: 6,
        minPlayers: 6,
        playersPerTable: 6,
        lateRegistrationMinutes: 0,
        blindStructure: TournamentEngine.getDefaultBlindStructure(),
        prizePoolPercentages: [65, 35],
      },
      {
        id: "sng-9max-regular",
        name: "9-Max Regular SNG",
        buyIn: 5000,
        entryFee: 500,
        startingChips: 5000,
        maxPlayers: 9,
        minPlayers: 9,
        playersPerTable: 9,
        lateRegistrationMinutes: 0,
        blindStructure: TournamentEngine.getDefaultBlindStructure(),
        prizePoolPercentages: [50, 30, 20],
      },
      {
        id: "sng-high-roller",
        name: "High Roller SNG",
        buyIn: 25000,
        entryFee: 2500,
        startingChips: 10000,
        maxPlayers: 6,
        minPlayers: 6,
        playersPerTable: 6,
        lateRegistrationMinutes: 0,
        blindStructure: TournamentEngine.getDefaultBlindStructure(),
        prizePoolPercentages: [65, 35],
      },
    ]

    setAvailableTournaments(templates)
  }, [])

  // Auto-fill SNG players with bots for instant testing
  useEffect(() => {
    if (!tournament || tournament.phase !== "registration") return
    if (!tournament.config.id.startsWith("sng-")) return

    const bots = ["Daniel Negreanu", "Phil Ivey", "Doyle Brunson", "Phil Hellmuth", "Fedora Phil", "Antonio Esfandiari", "Gus Hansen", "Vanessa Selbst"]
    
    // Register bots one by one every 800ms to simulate live lobby fills
    const currentCount = tournament.registeredPlayers.length
    if (currentCount < tournament.config.maxPlayers) {
      const timer = setTimeout(() => {
        const botName = bots[currentCount - 1] || `Player ${currentCount}`
        registerPlayer(`bot-${currentCount}`, botName)
      }, 800)
      return () => clearTimeout(timer)
    }
  }, [tournament, registerPlayer])

  const handleRegister = (config: TournamentConfig) => {
    if (tournament) {
      // Clean up previous registration
      tournamentEngine.eliminatePlayer(tournament.config.id, "local")
    }

    createTournament(config)
    registerPlayer("local", "You")
    setSelectedTournament(config)
  }

  const handleStartTournament = () => {
    if (startTournament()) {
      onStart(tournament!.config.id)
    }
  }

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`
    }
    return num.toString()
  }

  return (
    <div className="relative w-full h-[100dvh] bg-gradient-to-b from-gray-900 to-black">
      {/* Header */}
      <div className="relative z-20 bg-black/90 backdrop-blur-sm border-b border-gray-700">
        <div className="flex items-center justify-between p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="w-12 h-12 rounded-full border-2 border-white/50 text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-2xl font-bold text-white">SNG Tournament Lobby</h1>
          <div className="w-12" />
        </div>
      </div>

      <ScrollArea className="h-[calc(100vh-80px)]">
        <div className="p-4 space-y-4">
          {/* Registered Tournament Status */}
          {tournament && selectedTournament && (
            <div className="bg-gradient-to-br from-blue-900/50 to-emerald-900/50 rounded-2xl p-6 border-2 border-emerald-500">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">{tournament.config.name}</h2>
                  <Badge className="bg-green-500 text-white animate-pulse">
                    {tournament.registeredPlayers.length === tournament.config.maxPlayers ? "Ready to Start" : "Filling Table..."}
                  </Badge>
                </div>
                <Trophy className="w-12 h-12 text-yellow-400" />
              </div>

              {/* Registration Progress */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-semibold">Players Joined</span>
                  <span className="text-cyan-400 font-bold">
                    {tournament.registeredPlayers.length} / {tournament.config.maxPlayers}
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-full transition-all duration-500"
                    style={{
                      width: `${(tournament.registeredPlayers.length / tournament.config.maxPlayers) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* Prize Pool */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-300">Total Prize Pool:</span>
                <span className="text-yellow-400 font-bold text-xl">{formatNumber(tournament.totalPrizePool)}</span>
              </div>

              {/* Start Button */}
              {tournament.registeredPlayers.length >= tournament.config.minPlayers && (
                <Button
                  onClick={handleStartTournament}
                  className="w-full h-14 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold text-lg"
                >
                  Start SNG Game
                </Button>
              )}

              {tournament.registeredPlayers.length < tournament.config.minPlayers && (
                <div className="flex items-center gap-2 text-orange-400 text-sm">
                  <AlertCircle className="w-4 h-4 animate-bounce" />
                  <span>Waiting for bots to join...</span>
                </div>
              )}
            </div>
          )}

          {/* Available Tournaments */}
          <div className="space-y-3">
            {availableTournaments.map((config) => {
              const isRegistered = tournament?.config.id === config.id
              const totalPrizePool = config.buyIn * config.maxPlayers

              return (
                <div
                  key={config.id}
                  className={cn(
                    "bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 border-2 transition-all",
                    isRegistered ? "border-emerald-500 ring-2 ring-emerald-400/50" : "border-gray-700",
                  )}
                >
                  {/* Tournament Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">{config.name}</h3>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          Sit & Go (Instant Start)
                        </Badge>
                        <Badge className="bg-emerald-500 text-white text-xs">SNG</Badge>
                      </div>
                    </div>
                    <Trophy className="w-8 h-8 text-yellow-400" />
                  </div>

                  {/* Tournament Stats Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-black/30 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Coins className="w-4 h-4 text-yellow-400" />
                        <span className="text-xs text-gray-400">Buy-in</span>
                      </div>
                      <p className="text-lg font-bold text-white">{formatNumber(config.buyIn)}</p>
                    </div>

                    <div className="bg-black/30 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Trophy className="w-4 h-4 text-yellow-400" />
                        <span className="text-xs text-gray-400">Prize Pool</span>
                      </div>
                      <p className="text-lg font-bold text-yellow-400">{formatNumber(totalPrizePool)}</p>
                    </div>

                    <div className="bg-black/30 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Users className="w-4 h-4 text-cyan-400" />
                        <span className="text-xs text-gray-400">Max Players</span>
                      </div>
                      <p className="text-lg font-bold text-cyan-400">{config.maxPlayers}</p>
                    </div>

                    <div className="bg-black/30 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="w-4 h-4 text-purple-400" />
                        <span className="text-xs text-gray-400">Blinds Increase</span>
                      </div>
                      <p className="text-lg font-bold text-purple-400">Every Level</p>
                    </div>
                  </div>

                  {/* Prize Structure */}
                  <div className="mb-4">
                    <p className="text-xs text-gray-400 mb-2">Prize Structure:</p>
                    <div className="grid grid-cols-3 sm:flex gap-2">
                      {config.prizePoolPercentages.map((percent, idx) => (
                        <div key={idx} className="bg-black/30 rounded-lg p-2 text-center sm:flex-1">
                          <p className="text-xs text-gray-400">#{idx + 1}</p>
                          <p className="text-sm font-bold text-yellow-400">{percent}%</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Register Button */}
                  {!isRegistered && (
                    <Button
                      onClick={() => handleRegister(config)}
                      className="w-full h-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold"
                    >
                      Join SNG Table
                    </Button>
                  )}

                  {isRegistered && (
                    <div className="text-center py-3">
                      <Badge className="bg-emerald-500 text-white text-sm px-4 py-2">✓ Joined</Badge>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Bottom Padding */}
          <div className="h-8" />
        </div>
      </ScrollArea>
    </div>
  )
}
