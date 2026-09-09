"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import type { TournamentState, TournamentConfig } from "@/types/tournament"
import { tournamentEngine } from "@/lib/tournament-engine"

interface TournamentContextType {
  tournament: TournamentState | null
  createTournament: (config: TournamentConfig) => TournamentState
  registerPlayer: (playerId: string, playerName: string, tournamentId?: string) => boolean
  createAndRegister: (config: TournamentConfig, playerId: string, playerName: string) => boolean
  startTournament: () => boolean
  eliminatePlayer: (playerId: string) => void
  currentBlindLevel: any
  timeUntilNextLevel: string
}

const TournamentContext = createContext<TournamentContextType | null>(null)

export function TournamentProvider({ children }: { children: ReactNode }) {
  const [tournament, setTournament] = useState<TournamentState | null>(null)
  const [currentBlindLevel, setCurrentBlindLevel] = useState<any>(null)
  const [timeUntilNextLevel, setTimeUntilNextLevel] = useState<string>("")

  const refreshTournament = useCallback((tournamentId: string) => {
    const updated = tournamentEngine.getTournament(tournamentId)
    if (updated) {
      setTournament({ ...updated })
    }
    return updated
  }, [])

  // Timer effect for blind levels
  useEffect(() => {
    if (!tournament || tournament.phase !== "running") return

    const interval = setInterval(() => {
      if (tournament.config.id) {
        tournamentEngine.updateTimer(tournament.config.id, 1)
        refreshTournament(tournament.config.id)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [tournament?.config.id, tournament?.phase, refreshTournament])

  // Update time display + current blind level
  useEffect(() => {
    if (!tournament) return

    const timeRemaining = tournament.blindLevelTimeRemaining
    const minutes = Math.floor(timeRemaining / 60)
    const seconds = timeRemaining % 60
    setTimeUntilNextLevel(`${minutes}:${seconds.toString().padStart(2, "0")}`)

    const blindLevel = tournamentEngine.getCurrentBlindLevel(tournament.config.id)
    setCurrentBlindLevel(blindLevel)
  }, [tournament])

  const createTournament = useCallback(
    (config: TournamentConfig): TournamentState => {
      const newTournament = tournamentEngine.createTournament(config)
      setTournament(newTournament)
      return newTournament
    },
    [],
  )

  /**
   * Register a player. Pass tournamentId to avoid React state race
   * right after createTournament().
   */
  const registerPlayer = useCallback(
    (playerId: string, playerName: string, tournamentId?: string): boolean => {
      const id = tournamentId || tournament?.config.id
      if (!id) return false

      const success = tournamentEngine.registerPlayer(id, playerId, playerName)
      if (success) {
        refreshTournament(id)
      }
      return success
    },
    [tournament?.config.id, refreshTournament],
  )

  /**
   * Atomic create + register used by MTT / SNG lobby pages.
   * Registration happens entirely on those pages.
   */
  const createAndRegister = useCallback(
    (config: TournamentConfig, playerId: string, playerName: string): boolean => {
      const created = tournamentEngine.createTournament(config)
      setTournament(created)

      const success = tournamentEngine.registerPlayer(config.id, playerId, playerName)
      if (success) {
        refreshTournament(config.id)
      }
      return success
    },
    [refreshTournament],
  )

  const startTournament = useCallback((): boolean => {
    if (!tournament) return false
    const success = tournamentEngine.startTournament(tournament.config.id)
    if (success) {
      refreshTournament(tournament.config.id)
    }
    return success
  }, [tournament, refreshTournament])

  const eliminatePlayer = useCallback(
    (playerId: string) => {
      if (!tournament) return
      tournamentEngine.eliminatePlayer(tournament.config.id, playerId)
      refreshTournament(tournament.config.id)
    },
    [tournament, refreshTournament],
  )

  return (
    <TournamentContext.Provider
      value={{
        tournament,
        createTournament,
        registerPlayer,
        createAndRegister,
        startTournament,
        eliminatePlayer,
        currentBlindLevel,
        timeUntilNextLevel,
      }}
    >
      {children}
    </TournamentContext.Provider>
  )
}

export function useTournament() {
  const context = useContext(TournamentContext)
  if (!context) {
    throw new Error("useTournament must be used within a TournamentProvider")
  }
  return context
}
