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
    // Don't start if not enough players
    if (playerIds.length < 2) {
      console.log("Not enough players to start game")
      return
    }

    setSmallBlind(sbAmount)
    setBigBlind(bbAmount)
    resetTimer()

    const initialState = initializeGame(playerIds, playerNames, seatNumbers, 1000, dealerSeat, gameMode)

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
  }

  const makeAction = (playerId: string, action: PlayerAction, amount?: number) => {
    if (!gameState) return

    const newState = processAction(gameState, playerId, action, amount)
    setGameState(newState)
    resetTimer()

    // Check if hand is complete and auto-start next hand
    if (newState.phase === "complete") {
      setTimeout(() => {
        nextHand()
      }, 3000) // 3 second delay before next hand
    }
  }

  const handleTimeUp = () => {
    if (!gameState) return

    const currentPlayer = gameState.players[gameState.currentPlayerIndex]
    if (!currentPlayer) return

    // Auto-action on timeout
    const currentBet = gameState.currentBet
    const playerBet = currentPlayer.bet
    const amountToCall = currentBet - playerBet

    if (amountToCall === 0) {
      // Auto-check if no bet to call
      makeAction(currentPlayer.id, "check")
    } else {
      // Auto-fold if there's a bet to call
      makeAction(currentPlayer.id, "fold")
    }
  }

  const nextHand = () => {
    if (!gameState) return

    const newState = startNewHand(gameState, smallBlind, bigBlind)
    setGameState(newState)
    resetTimer()
  }

  const resetGame = () => {
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
