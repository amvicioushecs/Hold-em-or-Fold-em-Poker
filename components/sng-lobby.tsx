"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Users, Clock, Trophy, Coins, AlertCircle, Zap } from "lucide-react"
import { cn } from "@/lib/utils"
import type { TournamentConfig } from "@/types/tournament"
import { useTournament } from "@/hooks/use-tournament"
import { TournamentEngine } from "@/lib/tournament-engine"

interface SngLobbyProps {
  onClose: () => void
  onStart: (tournamentId: string) => void
}

const BOT_NAMES = [
  "Daniel Negreanu",
  "Phil Ivey",
  "Doyle Brunson",
  "Phil Hellmuth",
  "Fedora Phil",
  "Antonio Esfandiari",
  "Gus Hansen",
  "Vanessa Selbst",
]

export default function SngLobby({ onClose, onStart }: SngLobbyProps) {
  const [availableTournaments, setAvailableTournaments] = useState<TournamentConfig[]>([])
  const [autoStart, setAutoStart] = useState(true)
  const autoStartTriggered = useRef(false)
  const { tournament, createAndRegister, registerPlayer, startTournament } = useTournament()

  useEffect(() => {
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

  useEffect(() => {
    if (!tournament || tournament.phase === "running" || tournament.phase === "completed") {
      autoStartTriggered.current = false
    }
  }, [tournament?.config.id, tournament?.phase])

  // Auto-fill SNG with bots on the SNG page
  useEffect(() => {
    if (!tournament || tournament.phase !== "registration") return
    if (!tournament.config.id.startsWith("sng-")) return

    const currentCount = tournament.registeredPlayers.length
    if (currentCount >= tournament.config.maxPlayers) return

    const timer = setTimeout(() => {
      const botName = BOT_NAMES[currentCount - 1] || `Player ${currentCount}`
      registerPlayer(`bot-${currentCount}`, botName, tournament.config.id)
    }, 800)

    return () => clearTimeout(timer)
  }, [tournament, registerPlayer])

  const canStart =
    !!tournament &&
    tournament.config.id.startsWith("sng-") &&
    tournament.registeredPlayers.length >= tournament.config.minPlayers &&
    tournament.phase === "registration"

  // Auto-start when table is full / min reached
  useEffect(() => {
    if (!autoStart || !canStart || !tournament) return
    if (autoStartTriggered.current) return

    autoStartTriggered.current = true

    const timer = setTimeout(() => {
      if (startTournament()) {
        onStart(tournament.config.id)
      } else {
        autoStartTriggered.current = false
      }
    }, 600)

    return () => clearTimeout(timer)
  }, [autoStart, canStart, tournament, startTournament, onStart])

  const handleRegister = (config: TournamentConfig) => {
    autoStartTriggered.current = false
    createAndRegister(config, "local", "You")
  }

  const handleStartTournament = () => {
    if (!tournament) return
    autoStartTriggered.current = true
    if (startTournament()) {
      onStart(tournament.config.id)
    } else {
      autoStartTriggered.current = false
    }
  }

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  return (
    <div className="relative w-full h-[100dvh] bg-gradient-to-b from-gray-900 to-black">
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
          <div className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/15 text-amber-400">
                <Zap className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Auto-start</p>
                <p className="text-xs text-slate-400">Start when the table is full</p>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={autoStart}
              onClick={() => setAutoStart((v) => !v)}
              className={cn(
                "relative h-7 w-12 rounded-full transition-colors",
                autoStart ? "bg-emerald-500" : "bg-slate-600",
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform",
                  autoStart && "translate-x-5",
                )}
              />
            </button>
          </div>

          {tournament && tournament.config.id.startsWith("sng-") && (
            <div className="bg-gradient-to-br from-blue-900/50 to-emerald-900/50 rounded-2xl p-6 border-2 border-emerald-500">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">{tournament.config.name}</h2>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className="bg-green-500 text-white animate-pulse">
                      {tournament.registeredPlayers.length === tournament.config.maxPlayers
                        ? "Ready to Start"
                        : "Filling Table..."}
                    </Badge>
                    {autoStart && canStart && (
                      <Badge className="bg-amber-500 text-black animate-pulse">Auto-starting…</Badge>
                    )}
                  </div>
                </div>
                <Trophy className="w-12 h-12 text-yellow-400" />
              </div>

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

              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-300">Total Prize Pool:</span>
                <span className="text-yellow-400 font-bold text-xl">{formatNumber(tournament.totalPrizePool)}</span>
              </div>

              {canStart ? (
                <Button
                  onClick={handleStartTournament}
                  disabled={autoStart && autoStartTriggered.current}
                  className="w-full h-14 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold text-lg disabled:opacity-70"
                >
                  {autoStart ? "Starting…" : "Start SNG Game"}
                </Button>
              ) : (
                <div className="flex items-center gap-2 text-orange-400 text-sm">
                  <AlertCircle className="w-4 h-4 animate-bounce" />
                  <span>
                    Waiting for players to join...
                    {autoStart ? " (auto-start on)" : ""}
                  </span>
                </div>
              )}
            </div>
          )}

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

                  {!isRegistered ? (
                    <Button
                      onClick={() => handleRegister(config)}
                      className="w-full h-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold"
                    >
                      Join SNG Table
                    </Button>
                  ) : (
                    <div className="text-center py-3">
                      <Badge className="bg-emerald-500 text-white text-sm px-4 py-2">✓ Joined</Badge>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <div className="h-8" />
        </div>
      </ScrollArea>
    </div>
  )
}
