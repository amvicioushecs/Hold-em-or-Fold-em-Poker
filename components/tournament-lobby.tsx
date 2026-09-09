"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Users, Clock, Trophy, Coins, AlertCircle, Zap, CalendarClock } from "lucide-react"
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

/** Build MTT templates with a scheduled start offset from now (seconds). */
function buildScheduledMtts(now = Date.now()): TournamentConfig[] {
  return [
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
      scheduledStartTime: now + 60_000, // 1 min from open
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
      scheduledStartTime: now + 90_000, // 1.5 min
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
      scheduledStartTime: now + 120_000, // 2 min
    },
  ]
}

function toMs(scheduled?: string | number): number | null {
  if (scheduled == null) return null
  if (typeof scheduled === "number") return scheduled
  const parsed = Date.parse(scheduled)
  return Number.isNaN(parsed) ? null : parsed
}

function formatCountdown(msRemaining: number): string {
  if (msRemaining <= 0) return "0:00"
  const totalSec = Math.ceil(msRemaining / 1000)
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  return `${m}:${s.toString().padStart(2, "0")}`
}

function formatClock(ms: number): string {
  return new Date(ms).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
}

export default function TournamentLobby({ onClose, onStart }: TournamentLobbyProps) {
  const [availableTournaments, setAvailableTournaments] = useState<TournamentConfig[]>([])
  const [isRegistering, setIsRegistering] = useState(false)
  const [autoStart, setAutoStart] = useState(true)
  const [now, setNow] = useState(() => Date.now())
  const autoStartTriggered = useRef(false)
  const cancelledNotice = useRef(false)

  const { tournament, createAndRegister, registerPlayer, startTournament } = useTournament()

  useEffect(() => {
    setAvailableTournaments(buildScheduledMtts())
  }, [])

  // Tick every second for scheduled countdown UI + auto-start checks
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (!tournament || tournament.phase === "running" || tournament.phase === "completed") {
      autoStartTriggered.current = false
      cancelledNotice.current = false
    }
  }, [tournament?.config.id, tournament?.phase])

  // Fill seats with bots during registration
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

  const scheduledMs = useMemo(
    () => (tournament ? toMs(tournament.config.scheduledStartTime) : null),
    [tournament],
  )

  const msUntilStart = scheduledMs != null ? scheduledMs - now : null
  const scheduleReached = scheduledMs != null && now >= scheduledMs

  const hasMinPlayers =
    !!tournament && tournament.registeredPlayers.length >= tournament.config.minPlayers

  const isRegistrationOpen =
    !!tournament &&
    (tournament.phase === "registration" || tournament.phase === "late-registration")

  /**
   * Scheduled auto-start:
   * - Only when scheduled time is reached
   * - AND minPlayers are registered
   * - Does NOT start early just because minPlayers is met
   */
  useEffect(() => {
    if (!autoStart || !tournament || !isRegistrationOpen) return
    if (autoStartTriggered.current) return
    if (scheduledMs == null) return // no schedule → no scheduled auto-start
    if (!scheduleReached) return

    if (!hasMinPlayers) {
      // Time hit but not enough players — do not start
      if (!cancelledNotice.current) {
        cancelledNotice.current = true
        console.warn(
          "[v0] Scheduled MTT reached start time without min players — not starting",
          tournament.config.id,
        )
      }
      return
    }

    autoStartTriggered.current = true
    const timer = setTimeout(() => {
      if (startTournament()) {
        onStart(tournament.config.id)
      } else {
        autoStartTriggered.current = false
      }
    }, 400)

    return () => clearTimeout(timer)
  }, [
    autoStart,
    tournament,
    isRegistrationOpen,
    scheduledMs,
    scheduleReached,
    hasMinPlayers,
    startTournament,
    onStart,
  ])

  const handleRegister = (config: TournamentConfig) => {
    setIsRegistering(true)
    autoStartTriggered.current = false
    cancelledNotice.current = false
    const success = createAndRegister(config, "local", "You")
    setIsRegistering(false)

    if (!success) {
      console.error("[v0] Failed to register for MTT", config.id)
    }
  }

  const handleStartTournament = () => {
    if (!tournament) return
    // Manual start still requires min players; schedule is a soft gate for auto only
    if (tournament.registeredPlayers.length < tournament.config.minPlayers) return

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

  const canManualStart = isRegistrationOpen && hasMinPlayers

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
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white">MTT Lobby</h1>
            <p className="text-xs text-slate-400">Scheduled multi-table tournaments</p>
          </div>
          <div className="w-12" />
        </div>
      </div>

      <ScrollArea className="h-[calc(100vh-80px)]">
        <div className="p-4 space-y-4">
          {/* Scheduled auto-start preference */}
          <div className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/15 text-amber-400">
                <Zap className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Scheduled auto-start</p>
                <p className="text-xs text-slate-400">
                  Starts at scheduled time only if min players are registered
                </p>
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
                    {autoStart && scheduleReached && hasMinPlayers && isRegistrationOpen && (
                      <Badge className="bg-amber-500 text-black animate-pulse">Auto-starting…</Badge>
                    )}
                    {autoStart && scheduleReached && !hasMinPlayers && isRegistrationOpen && (
                      <Badge className="bg-red-500 text-white">Min not met</Badge>
                    )}
                  </div>
                </div>
                <Trophy className="w-12 h-12 text-yellow-400" />
              </div>

              {/* Scheduled start countdown */}
              {scheduledMs != null && isRegistrationOpen && (
                <div className="mb-4 rounded-xl border border-purple-400/30 bg-black/30 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-slate-300">
                      <CalendarClock className="h-4 w-4 text-purple-300" />
                      <span className="text-sm">Scheduled start</span>
                    </div>
                    <span className="text-sm text-slate-400">{formatClock(scheduledMs)}</span>
                  </div>
                  <div className="mt-2 flex items-end justify-between">
                    <span className="text-xs text-slate-400">
                      {scheduleReached
                        ? hasMinPlayers
                          ? "Start time reached — launching"
                          : "Start time reached — waiting for min players (will not auto-start)"
                        : "Starts when countdown hits 0 if min players are in"}
                    </span>
                    <span
                      className={cn(
                        "font-mono text-2xl font-bold",
                        scheduleReached ? "text-amber-400" : "text-cyan-400",
                      )}
                    >
                      {scheduleReached ? "0:00" : formatCountdown(msUntilStart ?? 0)}
                    </span>
                  </div>
                </div>
              )}

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

              {canManualStart ? (
                <Button
                  onClick={handleStartTournament}
                  disabled={autoStart && scheduleReached && autoStartTriggered.current}
                  className="w-full h-14 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold text-lg disabled:opacity-70"
                >
                  {autoStart && scheduleReached ? "Starting…" : "Start Tournament Now"}
                </Button>
              ) : (
                <div className="flex items-center gap-2 text-orange-400 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>
                    Need {Math.max(0, tournament.config.minPlayers - tournament.registeredPlayers.length)} more
                    players before scheduled start can launch
                  </span>
                </div>
              )}

              {scheduleReached && !hasMinPlayers && isRegistrationOpen && (
                <p className="mt-3 text-xs text-red-300">
                  Scheduled time passed without {tournament.config.minPlayers} players. Auto-start will not run.
                  Register more players and start manually if the event continues.
                </p>
              )}
            </div>
          )}

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide px-1">Available MTTs</h3>

            {availableTournaments.map((config) => {
              const registered = isRegisteredFor(config.id)
              const totalPrizePool = config.buyIn * config.maxPlayers
              const startMs = toMs(config.scheduledStartTime)
              const remaining = startMs != null ? startMs - now : null

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
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {config.blindStructure[0].duration / 60} min levels
                        </Badge>
                        <Badge className="bg-purple-600 text-white text-xs">MTT</Badge>
                        {config.id.includes("turbo") && (
                          <Badge className="bg-orange-500 text-white text-xs">TURBO</Badge>
                        )}
                        {startMs != null && (
                          <Badge className="bg-cyan-700 text-white text-xs">
                            {remaining != null && remaining > 0
                              ? `Starts in ${formatCountdown(remaining)}`
                              : "Start time reached"}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Trophy className="w-8 h-8 text-yellow-400" />
                  </div>

                  {startMs != null && (
                    <div className="mb-4 flex items-center gap-2 rounded-lg bg-black/30 px-3 py-2 text-sm text-slate-300">
                      <CalendarClock className="h-4 w-4 text-cyan-400" />
                      <span>Scheduled: {formatClock(startMs)}</span>
                    </div>
                  )}

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
