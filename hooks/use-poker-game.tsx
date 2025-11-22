"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import type { GameState, PlayerAction } from "@/types/poker"
import { initializeGame, processAction } from "@/lib/poker-engine"

interface PokerGameContextType {
  gameState: GameState | null
  startGame: (playerIds: string[], playerNames: string[]) => void
  makeAction: (playerId: string, action: PlayerAction, amount?: number) => void
  resetGame: () => void
}

const PokerGameContext = createContext<PokerGameContextType | null>(null)

export function PokerGameProvider({ children }: { children: ReactNode }) {
  const [gameState, setGameState] = useState<GameState | null>(null)

  const startGame = (playerIds: string[], playerNames: string[]) => {
    // Don't start if not enough players
    if (playerIds.length < 2) {
      console.log("Not enough players to start game")
      return
    }

    const initialState = initializeGame(playerIds, playerNames)

    // Ensure we have valid player indices
    if (!initialState.players[initialState.smallBlindIndex] || !initialState.players[initialState.bigBlindIndex]) {
      console.error("Invalid player indices")
      return
    }

    // Post blinds
    const smallBlindPlayer = initialState.players[initialState.smallBlindIndex]
    const bigBlindPlayer = initialState.players[initialState.bigBlindIndex]

    const smallBlindAmount = 10
    const bigBlindAmount = 20

    // Post small blind
    if (smallBlindPlayer && smallBlindPlayer.chips >= smallBlindAmount) {
      smallBlindPlayer.chips -= smallBlindAmount
      smallBlindPlayer.bet = smallBlindAmount
      initialState.pot += smallBlindAmount
    }

    // Post big blind
    if (bigBlindPlayer && bigBlindPlayer.chips >= bigBlindAmount) {
      bigBlindPlayer.chips -= bigBlindAmount
      bigBlindPlayer.bet = bigBlindAmount
      initialState.pot += bigBlindAmount
      initialState.currentBet = bigBlindAmount
    }

    // Start with player after big blind
    initialState.currentPlayerIndex = (initialState.bigBlindIndex + 1) % initialState.players.length

    setGameState(initialState)
  }

  const makeAction = (playerId: string, action: PlayerAction, amount?: number) => {
    if (!gameState) return

    const newState = processAction(gameState, playerId, action, amount)
    setGameState(newState)
  }

  const resetGame = () => {
    setGameState(null)
  }

  return (
    <PokerGameContext.Provider
      value={{
        gameState,
        startGame,
        makeAction,
        resetGame,
      }}
    >
      {children}
    </PokerGameContext.Provider>
  )
}

export function usePokerGame() {
  const context = useContext(PokerGameContext)
  if (!context) {
    throw new Error("usePokerGame must be used within a PokerGameProvider")
  }
  return context
}
