"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { TournamentState, TournamentConfig } from "@/types/tournament"
import { tournamentEngine } from "@/lib/tournament-engine"

interface TournamentContextType {
  tournament: TournamentState | null
  createTournament: (config: TournamentConfig) => void
  registerPlayer: (playerId: string, playerName: string) => boolean
  startTournament: () => boolean
  eliminatePlayer: (playerId: string) => void
  processRebuy: (playerId: string) => boolean // Added rebuy support
  processAddOn: (playerId: string) => boolean // Added add-on support
  currentBlindLevel: any
  timeUntilNextLevel: string
}

const TournamentContext = createContext<TournamentContextType | null>(null)

export function TournamentProvider({ children }: { children: ReactNode }) {
  const [tournament, setTournament] = useState<TournamentState | null>(null)
  const [currentBlindLevel, setCurrentBlindLevel] = useState<any>(null)
  const [timeUntilNextLevel, setTimeUntilNextLevel] = useState<string>("")

  // Timer effect for blind levels
  useEffect(() => {
    if (!tournament || (tournament.phase !== "running" && tournament.phase !== "break")) return

    const interval = setInterval(() => {
      if (tournament.config.id) {
        tournamentEngine.updateTimer(tournament.config.id, 1)
        const updatedTournament = tournamentEngine.getTournament(tournament.config.id)
        if (updatedTournament) {
          setTournament({ ...updatedTournament })
        }
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [tournament])

  // Update time display
  useEffect(() => {
    if (!tournament) return

    const timeRemaining =
      tournament.phase === "break" ? tournament.breakTimeRemaining || 0 : tournament.blindLevelTimeRemaining

    const minutes = Math.floor(timeRemaining / 60)
    const seconds = timeRemaining % 60
    setTimeUntilNextLevel(`${minutes}:${seconds.toString().padStart(2, "0")}`)

    const blindLevel = tournamentEngine.getCurrentBlindLevel(tournament.config.id)
    setCurrentBlindLevel(blindLevel)
  }, [tournament])

  const createTournament = (config: TournamentConfig) => {
    const newTournament = tournamentEngine.createTournament(config)
    setTournament(newTournament)
  }

  const registerPlayer = (playerId: string, playerName: string): boolean => {
    if (!tournament) return false
    const success = tournamentEngine.registerPlayer(tournament.config.id, playerId, playerName)
    if (success) {
      const updatedTournament = tournamentEngine.getTournament(tournament.config.id)
      if (updatedTournament) {
        setTournament({ ...updatedTournament })
      }
    }
    return success
  }

  const startTournament = (): boolean => {
    if (!tournament) return false
    const success = tournamentEngine.startTournament(tournament.config.id)
    if (success) {
      const updatedTournament = tournamentEngine.getTournament(tournament.config.id)
      if (updatedTournament) {
        setTournament({ ...updatedTournament })
      }
    }
    return success
  }

  const eliminatePlayer = (playerId: string) => {
    if (!tournament) return
    tournamentEngine.eliminatePlayer(tournament.config.id, playerId)
    const updatedTournament = tournamentEngine.getTournament(tournament.config.id)
    if (updatedTournament) {
      setTournament({ ...updatedTournament })
    }
  }

  const processRebuy = (playerId: string): boolean => {
    if (!tournament) return false
    const success = tournamentEngine.processRebuy(tournament.config.id, playerId)
    if (success) {
      const updatedTournament = tournamentEngine.getTournament(tournament.config.id)
      if (updatedTournament) {
        setTournament({ ...updatedTournament })
      }
    }
    return success
  }

  const processAddOn = (playerId: string): boolean => {
    if (!tournament) return false
    const success = tournamentEngine.processAddOn(tournament.config.id, playerId)
    if (success) {
      const updatedTournament = tournamentEngine.getTournament(tournament.config.id)
      if (updatedTournament) {
        setTournament({ ...updatedTournament })
      }
    }
    return success
  }

  return (
    <TournamentContext.Provider
      value={{
        tournament,
        createTournament,
        registerPlayer,
        startTournament,
        eliminatePlayer,
        processRebuy,
        processAddOn,
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
