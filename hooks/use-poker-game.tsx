"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import type { GameState, PlayerAction, GameMode } from "@/types/poker"
import { initializeGame, processAction, startNewHand } from "@/lib/poker-engine"

interface PokerGameContextType {
  gameState: GameState | null
  turnTimeLeft: number
  turnDuration: number
  startGame: (
    playerIds: string[],
    playerNames: string[],
    seatNumbers: number[],
    smallBlind?: number,
    bigBlind?: number,
    dealerSeat?: number,
    gameMode?: GameMode,
  ) => void
  makeAction: (playerId: string, action: PlayerAction, amount?: number) => void
  resetGame: () => void
  nextHand: () => void
  handleTimeUp: () => void
  resetTimer: () => void
}

const PokerGameContext = createContext<PokerGameContextType | null>(null)

export function PokerGameProvider({ children }: { children: ReactNode }) {
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [smallBlind, setSmallBlind] = useState(10)
  const [bigBlind, setBigBlind] = useState(20)
  const [turnTimeLeft, setTurnTimeLeft] = useState(30)
  const [turnDuration] = useState(30) // 30 seconds per turn

  const resetTimer = () => {
    console.log("[v0] Timer reset")
    setTurnTimeLeft(turnDuration)
  }

  const startGame = (
    playerIds: string[],
    playerNames: string[],
    seatNumbers: number[],
    sbAmount = 10,
    bbAmount = 20,
    dealerSeat = 1,
    gameMode: GameMode = "sng",
  ) => {
    console.log("[v0] Starting game with:", {
      playerCount: playerIds.length,
      playerNames,
      seatNumbers,
      smallBlind: sbAmount,
      bigBlind: bbAmount,
      dealerSeat,
      gameMode,
    })

    // Don't start if not enough players
    if (playerIds.length < 2) {
      console.log("[v0] ERROR: Not enough players to start game")
      return
    }

    setSmallBlind(sbAmount)
    setBigBlind(bbAmount)
    resetTimer()

    const initialState = initializeGame(playerIds, playerNames, seatNumbers, 1000, dealerSeat, gameMode)
    console.log("[v0] Game initialized:", initialState)

    // Ensure we have valid player indices
    if (!initialState.players[initialState.smallBlindIndex] || !initialState.players[initialState.bigBlindIndex]) {
      console.error("Invalid player indices")
      return
    }

    // Post blinds
    const smallBlindPlayer = initialState.players[initialState.smallBlindIndex]
    const bigBlindPlayer = initialState.players[initialState.bigBlindIndex]

    const smallBlindAmount = sbAmount
    const bigBlindAmount = bbAmount

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
    console.log("[v0] Game state set, ready to play")
  }

  const makeAction = (playerId: string, action: PlayerAction, amount?: number) => {
    if (!gameState) {
      console.log("[v0] ERROR: Cannot make action, no game state")
      return
    }

    console.log("[v0] Player action:", { playerId, action, amount })
    const newState = processAction(gameState, playerId, action, amount)
    console.log("[v0] New game state after action:", newState)
    setGameState(newState)
    resetTimer()

    // Check if hand is complete and auto-start next hand
    if (newState.phase === "complete") {
      console.log("[v0] Hand complete, starting next hand in 3 seconds")
      setTimeout(() => {
        nextHand()
      }, 3000) // 3 second delay before next hand
    }
  }

  const handleTimeUp = () => {
    if (!gameState) return

    const currentPlayer = gameState.players[gameState.currentPlayerIndex]
    if (!currentPlayer) return

    console.log("[v0] Time's up for player:", currentPlayer.name)

    // Auto-action on timeout
    const currentBet = gameState.currentBet
    const playerBet = currentPlayer.bet
    const amountToCall = currentBet - playerBet

    if (amountToCall === 0) {
      console.log("[v0] Auto-check on timeout")
      makeAction(currentPlayer.id, "check")
    } else {
      console.log("[v0] Auto-fold on timeout")
      makeAction(currentPlayer.id, "fold")
    }
  }

  const nextHand = () => {
    if (!gameState) {
      console.log("[v0] ERROR: Cannot start next hand, no game state")
      return
    }

    console.log("[v0] Starting next hand")
    const newState = startNewHand(gameState, smallBlind, bigBlind)
    console.log("[v0] Next hand state:", newState)
    setGameState(newState)
    resetTimer()
  }

  const resetGame = () => {
    console.log("[v0] Resetting game")
    setGameState(null)
    resetTimer()
  }

  return (
    <PokerGameContext.Provider
      value={{
        gameState,
        turnTimeLeft,
        turnDuration,
        startGame,
        makeAction,
        resetGame,
        nextHand,
        handleTimeUp,
        resetTimer,
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
