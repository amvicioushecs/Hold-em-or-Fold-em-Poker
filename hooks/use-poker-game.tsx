/**
 * POKER GAME HOOK - React Context hook for managing global poker game state
 * 
 * This hook provides centralized game state management for:
 * - Initializing and managing the active poker game
 * - Processing player actions during the game
 * - Tracking turn timers and automatic actions
 * - Starting new hands
 * - Resetting the game
 * 
 * Uses React Context API to make game state accessible to all components without prop drilling.
 * All poker game logic is managed through this hook.
 */

"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import type { GameState, PlayerAction, GameMode } from "@/types/poker"
import { initializeGame, processAction, startNewHand } from "@/lib/poker-engine"

// ==================== TYPE DEFINITIONS ====================

/**
 * PokerGameContextType - Interface for the poker game context value
 * Defines all available game state and action methods
 */
interface PokerGameContextType {
  /** Current state of the active poker game (null if no game started) */
  gameState: GameState | null
  
  /** Time remaining in the current player's turn (in seconds) */
  turnTimeLeft: number
  
  /** Total duration allocated per turn (in seconds) */
  turnDuration: number
  
  /**
   * Starts a new poker game with specified players and parameters
   * @param playerIds - Array of unique player identifiers
   * @param playerNames - Array of display names for players (corresponding to playerIds)
   * @param seatNumbers - Array of seat positions for players
   * @param smallBlind - Small blind amount (default: 10)
   * @param bigBlind - Big blind amount (default: 20)
   * @param dealerSeat - Initial dealer seat number (default: 1)
   * @param gameMode - Type of poker game (sng, mtt, allin, omaha)
   */
  startGame: (
    playerIds: string[],
    playerNames: string[],
    seatNumbers: number[],
    smallBlind?: number,
    bigBlind?: number,
    dealerSeat?: number,
    gameMode?: GameMode,
  ) => void
  
  /**
   * Processes an action taken by a player
   * @param playerId - ID of the player making the action
   * @param action - The action to take (fold, check, call, raise, all-in)
   * @param amount - Bet amount for raise actions (optional)
   */
  makeAction: (playerId: string, action: PlayerAction, amount?: number) => void
  
  /** Resets the game to initial state (clears all game data) */
  resetGame: () => void
  
  /** Starts the next hand with rotated dealer and fresh cards */
  nextHand: () => void
  
  /** Called when a player's turn timer reaches zero (triggers auto-action) */
  handleTimeUp: () => void
  
  /** Resets the turn timer to its full duration */
  resetTimer: () => void
}

// ==================== CONTEXT CREATION ====================

/** React Context for poker game state - provides values to all child components */
const PokerGameContext = createContext<PokerGameContextType | null>(null)

// ==================== PROVIDER COMPONENT ====================

/**
 * PokerGameProvider - Context provider component that manages game state
 * Wrap your app with this component to enable access to poker game context
 * 
 * @param {Object} props - Component props
 * @param {ReactNode} props.children - Child components that can use the poker game context
 */
export function PokerGameProvider({ children }: { children: ReactNode }) {
  // ==================== STATE MANAGEMENT ====================
  
  /** Current game state (null if no game active) */
  const [gameState, setGameState] = useState<GameState | null>(null)
  
  /** Current small blind amount */
  const [smallBlind, setSmallBlind] = useState(10)
  
  /** Current big blind amount */
  const [bigBlind, setBigBlind] = useState(20)
  
  /** Time remaining in current player's turn (seconds) */
  const [turnTimeLeft, setTurnTimeLeft] = useState(30)
  
  /** Total seconds allocated per turn */
  const [turnDuration] = useState(30)

  // ==================== TIMER MANAGEMENT ====================

  /**
   * Resets the turn timer back to full duration
   * Called when a new player's turn begins or an action is taken
   */
  const resetTimer = () => {
    setTurnTimeLeft(turnDuration)
  }

  // ==================== GAME INITIALIZATION ====================

  /**
   * Starts a new poker game with the specified parameters
   * Sets up initial game state, positions blinds, and deals cards
   * 
   * Validates that at least 2 players are present before starting
   * Automatically posts small and big blinds
   */
  const startGame = (
    playerIds: string[],
    playerNames: string[],
    seatNumbers: number[],
    sbAmount = 10,
    bbAmount = 20,
    dealerSeat = 1,
    gameMode: GameMode = "sng",
  ) => {
    // Validation: need at least 2 players to start a game
    if (playerIds.length < 2) {
      console.log("Not enough players to start game")
      return
    }

    // Store blind amounts for this game
    setSmallBlind(sbAmount)
    setBigBlind(bbAmount)
    resetTimer()

    // Initialize the game state using the poker engine
    const initialState = initializeGame(playerIds, playerNames, seatNumbers, 1000, dealerSeat, gameMode)

    // Validate that player indices are valid
    if (!initialState.players[initialState.smallBlindIndex] || !initialState.players[initialState.bigBlindIndex]) {
      console.error("Invalid player indices")
      return
    }

    // Post blinds to the pot
    const smallBlindPlayer = initialState.players[initialState.smallBlindIndex]
    const bigBlindPlayer = initialState.players[initialState.bigBlindIndex]

    // Small blind: deduct from player's chips and add to pot
    if (smallBlindPlayer && smallBlindPlayer.chips >= sbAmount) {
      smallBlindPlayer.chips -= sbAmount
      smallBlindPlayer.bet = sbAmount
      initialState.pot += sbAmount
    }

    // Big blind: deduct from player's chips and add to pot
    if (bigBlindPlayer && bigBlindPlayer.chips >= bbAmount) {
      bigBlindPlayer.chips -= bbAmount
      bigBlindPlayer.bet = bbAmount
      initialState.pot += bbAmount
      initialState.currentBet = bbAmount
    }

    // Start with player after big blind (first to act pre-flop)
    initialState.currentPlayerIndex = (initialState.bigBlindIndex + 1) % initialState.players.length

    setGameState(initialState)
  }

  // ==================== ACTION PROCESSING ====================

  /**
   * Processes an action taken by the current player
   * Updates game state and checks if hand/game is complete
   * 
   * Auto-starts next hand with a 3-second delay when hand completes
   */
  const makeAction = (playerId: string, action: PlayerAction, amount?: number) => {
    if (!gameState) return

    // Process the action through the poker engine
    const newState = processAction(gameState, playerId, action, amount)
    setGameState(newState)
    resetTimer()

    // Check if hand is complete and auto-start next hand after delay
    if (newState.phase === "complete") {
      setTimeout(() => {
        nextHand()
      }, 3000) // 3 second delay allows players to see results
    }
  }

  // ==================== TIMER ACTIONS ====================

  /**
   * Called when a player's turn timer expires
   * Executes an automatic action:
   * - Check if no bet to call
   * - Fold if there's a bet to call
   * 
   * This prevents the game from stalling when a player doesn't act
   */
  const handleTimeUp = () => {
    if (!gameState) return

    const currentPlayer = gameState.players[gameState.currentPlayerIndex]
    if (!currentPlayer) return

    // Calculate amount needed to call
    const currentBet = gameState.currentBet
    const playerBet = currentPlayer.bet
    const amountToCall = currentBet - playerBet

    // Auto-action: check if possible, otherwise fold
    if (amountToCall === 0) {
      // No bet to call: auto-check
      makeAction(currentPlayer.id, "check")
    } else {
      // Bet to call: auto-fold (safer default than calling unknown hands)
      makeAction(currentPlayer.id, "fold")
    }
  }

  // ==================== HAND MANAGEMENT ====================

  /**
   * Starts the next hand
   * Rotates dealer position and resets all player states
   * Called automatically when current hand completes
   */
  const nextHand = () => {
    if (!gameState) return

    const newState = startNewHand(gameState, smallBlind, bigBlind)
    setGameState(newState)
    resetTimer()
  }

  // ==================== GAME RESET ====================

  /**
   * Completely resets the game state
   * Use when returning to lobby or ending the current game
   * Clears all game data and timers
   */
  const resetGame = () => {
    setGameState(null)
    resetTimer()
  }

  // ==================== CONTEXT PROVIDER ====================

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

// ==================== HOOK EXPORT ====================

/**
 * usePokerGame Hook - Access the poker game context
 * 
 * Usage:
 * const { gameState, makeAction, startGame } = usePokerGame()
 * 
 * Must be used within a component wrapped by PokerGameProvider
 * Throws error if used outside of provider
 * 
 * @throws {Error} If used outside PokerGameProvider
 * @returns {PokerGameContextType} Game state and action methods
 */
export function usePokerGame() {
  const context = useContext(PokerGameContext)
  if (!context) {
    throw new Error("usePokerGame must be used within a PokerGameProvider")
  }
  return context
}
