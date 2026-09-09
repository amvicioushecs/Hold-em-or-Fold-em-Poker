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

interface TournamentLobbyProps {
  onClose: () => void
  onStart: (tournamentId: string) => void
}

const BOT_NAMES = [
  "Daniel Negreanu",
  "Phil Ivey",
  "Doyle Brunson",
  "Phil Hellmuth",
  "Antonio Esfandiari",
  "Gus Hansen",
  "Vanessa Selbst",
  "Tom Dwan",
  "Erik Seidel",
  "Jennifer Harman",
  "Chris Moneymaker",
  "Johnny Chan",
  "Stu Ungar",
  "Fedor Holz",
  "Stephen Chidwick",
  "Liv Boeree",
  "Maria Ho",
]

export default function TournamentLobby({ onClose, onStart }: TournamentLobbyProps) {
  const [availableTournaments, setAvailableTournaments] = useState<TournamentConfig[]>([])
  const [isRegistering, setIsRegistering] = useState(false)
  const [autoStart, setAutoStart] = useState(true)
  const autoStartTriggered = useRef(false)

  const { tournament, createAndRegister, registerPlayer, startTournament } = useTournament()

  useEffect(() => {
    const tournaments: TournamentConfig[] = [
      {
        id: "mtt-turbo-1",
        name: "Turbo Showdown",
        buyIn: 1000,
        entryFee: 100,
        startingChips: 5000,
        maxPlayers: 18,
        minPlayers: 6,
        playersPerTable: 6,
        lateRegistrationMinutes: 15,
        blindStructure: TournamentEngine.getDefaultBlindStructure(),
        prizePoolPercentages: [50, 30, 20],
      },
      {
        id: "mtt-regular-1",
        name: "Regular Tournament",
        buyIn: 5000,
        entryFee: 500,
        startingChips: 10000,
        maxPlayers: 36,
        minPlayers: 9,
        playersPerTable: 6,
        lateRegistrationMinutes: 30,
        blindStructure: TournamentEngine.getDefaultBlindStructure(),
        prizePoolPercentages: [40, 25, 15, 10, 10],
      },
      {
        id: "mtt-high-roller-1",
        name: "High Roller",
        buyIn: 50000,
        entryFee: 5000,
        startingChips: 50000,
        maxPlayers: 27,
        minPlayers: 9,
        playersPerTable: 9,
        lateRegistrationMinutes: 45,
        blindStructure: TournamentEngine.getDefaultBlindStructure(),
        prizePoolPercentages: [50, 30, 20],
      },
    ]

    setAvailableTournaments(tournaments)
  }, [])

  // Reset auto-start guard when switching tournaments or leaving registration
  useEffect(() => {
    if (!tournament || tournament.phase === "running" || tournament.phase === "completed") {
      autoStartTriggered.current = false
    }
  }, [tournament?.config.id, tournament?.phase])

  // Fill remaining seats with bots while on the MTT registration page
  useEffect(() => {
    if (!tournament) return
    if (tournament.phase !== "registration" && tournament.phase !== "late-registration") return
    if (!tournament.config.id.startsWith("mtt-")) return

    const currentCount = tournament.registeredPlayers.length
    if (currentCount >= tournament.config.maxPlayers) return

    const timer = setTimeout(() => {
      const botIndex = currentCount - 1
      const botName = BOT_NAMES[botIndex] || `Player ${currentCount + 1}`
      registerPlayer(`bot-mtt-${currentCount}`, botName, tournament.config.id)
    }, currentCount < tournament.config.minPlayers ? 600 : 1200)

    return () => clearTimeout(timer)
  }, [tournament, registerPlayer])

  const canStart =
    !!tournament &&
    tournament.registeredPlayers.length >= tournament.config.minPlayers &&
    (tournament.phase === "registration" || tournament.phase === "late-registration")

  // Auto-start when enabled and min players reached
  useEffect(() => {
    if (!autoStart || !canStart || !tournament) return
    if (autoStartTriggered.current) return

    autoStartTriggered.current = true

    const timer = setTimeout(() => {
      if (startTournament()) {
        onStart(tournament.config.id)
      } else {
        // Allow retry if start failed
        autoStartTriggered.current = false
      }
    }, 800)

    return () => clearTimeout(timer)
  }, [autoStart, canStart, tournament, startTournament, onStart])

  const handleRegister = (config: TournamentConfig) => {
    setIsRegistering(true)
    autoStartTriggered.current = false
    const success = createAndRegister(config, "local", "You")
    setIsRegistering(false)

    if (!success) {
      console.error("[v0] Failed to register for MTT", config.id)
    }
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

  const formatTime = (minutes: number): string => {
    if (minutes >= 60) return `${Math.floor(minutes / 60)}h ${minutes % 60}m`
    return `${minutes}m`
  }

  const isRegisteredFor = (configId: string) => tournament?.config.id === configId

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
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white">MTT Lobby</h1>
            <p className="text-xs text-slate-400">Register & start multi-table tournaments</p>
          </div>
          <div className="w-12" />
        </div>
      </div>

      <ScrollArea className="h-[calc(100vh-80px)]">
        <div className="p-4 space-y-4">
          {/* Auto-start preference */}
          <div className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/15 text-amber-400">
                <Zap className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Auto-start</p>
                <p className="text-xs text-slate-400">Start automatically when min players join</p>
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

          {/* Active registration panel */}
          {tournament && isRegisteredFor(tournament.config.id) && (
            <div className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 rounded-2xl p-6 border-2 border-purple-500">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">{tournament.config.name}</h2>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className="bg-green-500 text-white">
                      {tournament.phase === "registration" || tournament.phase === "late-registration"
                        ? "Registering"
                        : tournament.phase}
                    </Badge>
                    {autoStart && canStart && (
                      <Badge className="bg-amber-500 text-black animate-pulse">Auto-starting…</Badge>
                    )}
                    {autoStart && !canStart && (
                      <Badge variant="secondary" className="text-xs">
                        Auto-start on
                      </Badge>
                    )}
                  </div>
                </div>
                <Trophy className="w-12 h-12 text-yellow-400" />
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-semibold">Players Registered</span>
                  <span className="text-cyan-400 font-bold">
                    {tournament.registeredPlayers.length} / {tournament.config.maxPlayers}
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-cyan-500 h-full transition-all duration-500"
                    style={{
                      width: `${(tournament.registeredPlayers.length / tournament.config.maxPlayers) * 100}%`,
                    }}
                  />
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  Min to start: {tournament.config.minPlayers} · Late reg:{" "}
                  {formatTime(tournament.config.lateRegistrationMinutes)}
                </p>
              </div>

              <div className="mb-4 max-h-36 overflow-y-auto rounded-lg bg-black/30 p-3">
                <p className="text-xs text-gray-400 mb-2">Registered field</p>
                <div className="flex flex-wrap gap-2">
                  {tournament.registeredPlayers.map((p) => (
                    <Badge
                      key={p.id}
                      variant="secondary"
                      className={cn("text-xs", p.id === "local" && "bg-purple-600 text-white")}
                    >
                      {p.name}
                      {p.id === "local" ? " (You)" : ""}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-300">Prize Pool</span>
                <span className="text-yellow-400 font-bold text-xl">{formatNumber(tournament.totalPrizePool)}</span>
              </div>

              {canStart ? (
                <Button
                  onClick={handleStartTournament}
                  disabled={autoStart && autoStartTriggered.current}
                  className="w-full h-14 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold text-lg disabled:opacity-70"
                >
                  {autoStart ? "Starting…" : "Start Tournament"}
                </Button>
              ) : (
                <div className="flex items-center gap-2 text-orange-400 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>
                    Need {Math.max(0, tournament.config.minPlayers - tournament.registeredPlayers.length)} more
                    players to start
                    {autoStart ? " — will auto-start" : ""}
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide px-1">Available MTTs</h3>

            {availableTournaments.map((config) => {
              const registered = isRegisteredFor(config.id)
              const totalPrizePool = config.buyIn * config.maxPlayers

              return (
                <div
                  key={config.id}
                  className={cn(
                    "bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 border-2 transition-all",
                    registered ? "border-purple-500 ring-2 ring-purple-400/50" : "border-gray-700",
                  )}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">{config.name}</h3>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {config.blindStructure[0].duration / 60} min levels
                        </Badge>
                        <Badge className="bg-purple-600 text-white text-xs">MTT</Badge>
                        {config.id.includes("turbo") && (
                          <Badge className="bg-orange-500 text-white text-xs">TURBO</Badge>
                        )}
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
                        <span className="text-xs text-gray-400">Players</span>
                      </div>
                      <p className="text-lg font-bold text-cyan-400">
                        {config.minPlayers}-{config.maxPlayers}
                      </p>
                    </div>

                    <div className="bg-black/30 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="w-4 h-4 text-purple-400" />
                        <span className="text-xs text-gray-400">Late Reg</span>
                      </div>
                      <p className="text-lg font-bold text-purple-400">{formatTime(config.lateRegistrationMinutes)}</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-xs text-gray-400 mb-2">Prize Structure</p>
                    <div className="grid grid-cols-3 sm:flex gap-2">
                      {config.prizePoolPercentages.map((percent, idx) => (
                        <div key={idx} className="bg-black/30 rounded-lg p-2 text-center sm:flex-1">
                          <p className="text-xs text-gray-400">#{idx + 1}</p>
                          <p className="text-sm font-bold text-yellow-400">{percent}%</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {!registered ? (
                    <Button
                      onClick={() => handleRegister(config)}
                      disabled={isRegistering || (!!tournament && tournament.config.id !== config.id)}
                      className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold disabled:opacity-50"
                    >
                      {isRegistering ? "Registering…" : "Register for MTT"}
                    </Button>
                  ) : (
                    <div className="text-center py-3">
                      <Badge className="bg-green-500 text-white text-sm px-4 py-2">✓ Registered on MTT page</Badge>
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
