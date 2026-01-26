/**
 * POKER TYPES - Core TypeScript type definitions for the poker game
 * 
 * This file defines all the essential types and interfaces used throughout the poker
 * game application. These types ensure type safety and provide clear contracts for
 * data structures passed between components and logic layers.
 */

// ==================== CARD TYPES ====================

/** Suit type: the four card suits in a standard deck */
export type Suit = "hearts" | "diamonds" | "clubs" | "spades"

/** Rank type: the 13 card ranks in a standard deck (2-Ace) */
export type Rank = "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K" | "A"

/**
 * Card interface - Represents a single playing card
 * @property {Suit} suit - The suit of the card (hearts, diamonds, clubs, spades)
 * @property {Rank} rank - The rank of the card (2-10, J, Q, K, A)
 */
export interface Card {
  suit: Suit
  rank: Rank
}

// ==================== HAND EVALUATION TYPES ====================

/**
 * HandRank type - Represents all possible poker hand rankings
 * Listed from lowest to highest rank for comparison purposes
 */
export type HandRank =
  | "royal-flush"        // A-K-Q-J-10, all same suit (highest hand)
  | "straight-flush"     // Five cards in sequence, all same suit
  | "four-of-a-kind"     // Four cards of the same rank
  | "full-house"         // Three of a kind plus a pair
  | "flush"              // Five cards of the same suit
  | "straight"           // Five cards in sequence
  | "three-of-a-kind"    // Three cards of the same rank
  | "two-pair"           // Two different pairs
  | "pair"               // Two cards of the same rank
  | "high-card"          // No combination (lowest hand)

/**
 * HandEvaluation interface - Result of evaluating a poker hand
 * Contains the hand rank, numeric value for comparison, constituent cards, and description
 * @property {HandRank} rank - The type of hand
 * @property {number} value - Numeric representation for easy hand comparison
 * @property {Card[]} cards - The 5 best cards that make up this hand
 * @property {string} description - Human-readable description of the hand
 */
export interface HandEvaluation {
  rank: HandRank
  value: number
  cards: Card[]
  description: string
}

// ==================== PLAYER ACTION TYPES ====================

/**
 * PlayerAction type - All possible actions a player can take during betting rounds
 */
export type PlayerAction = "fold" | "check" | "call" | "raise" | "all-in"
  // fold: discard hand and sit out for current hand
  // check: pass action without betting (only when no bet needed)
  // call: match the current bet
  // raise: increase the current bet
  // all-in: bet all remaining chips

/**
 * GamePhase type - Represents the current stage of a poker hand
 * Phases occur in sequence during a hand
 */
export type GamePhase = "waiting" | "pre-flop" | "flop" | "turn" | "river" | "showdown" | "complete"
  // waiting: waiting for game to start or players to join
  // pre-flop: initial betting round before community cards shown
  // flop: betting after first 3 community cards revealed
  // turn: betting after 4th community card revealed
  // river: betting after 5th (final) community card revealed
  // showdown: players reveal hands to determine winner
  // complete: hand finished, ready for next hand

/**
 * GameMode type - Different poker variants that can be played
 */
export type GameMode = "sng" | "mtt" | "allin" | "omaha"
  // sng: Single Table Tournament
  // mtt: Multi-Table Tournament
  // allin: All-in or Fold variant (faster, more aggressive)
  // omaha: Omaha Hi poker variant

// ==================== PLAYER STATE ====================

/**
 * PlayerState interface - Represents the state of a single player in the game
 * Updated each hand and as actions occur during play
 * @property {string} id - Unique identifier for the player
 * @property {string} name - Display name of the player
 * @property {number} chips - Current chip count (stack size)
 * @property {number} bet - Amount bet in current betting round
 * @property {Card[]} cards - Hole cards dealt to this player
 * @property {boolean} folded - Whether player folded current hand
 * @property {boolean} allIn - Whether player has gone all-in
 * @property {boolean} isActive - Whether player is still in the game
 * @property {PlayerAction} [lastAction] - The last action this player took
 * @property {number} seatNumber - Table seat position (1-based)
 */
export interface PlayerState {
  id: string
  name: string
  chips: number
  bet: number
  cards: Card[]
  folded: boolean
  allIn: boolean
  isActive: boolean
  lastAction?: PlayerAction
  seatNumber: number
}

// ==================== GAME STATE ====================

/**
 * GameState interface - Complete representation of the current game state
 * Used to track the overall progress and status of an active poker hand
 * @property {GamePhase} phase - Current phase of the hand
 * @property {number} pot - Total chips in the pot
 * @property {Card[]} communityCards - Cards shared by all players
 * @property {number} currentBet - The amount needed to stay in current round
 * @property {number} currentPlayerIndex - Index of player whose turn it is
 * @property {number} dealerIndex - Index of player with dealer button
 * @property {number} dealerSeatNumber - Seat number of dealer (for reference)
 * @property {number} smallBlindIndex - Index of player posting small blind
 * @property {number} bigBlindIndex - Index of player posting big blind
 * @property {PlayerState[]} players - Array of all players in the game
 * @property {Card[]} deck - Remaining cards in the deck
 * @property {string[]} winners - IDs of winning player(s)
 * @property {number} handNumber - Sequential hand counter
 * @property {GameMode} gameMode - Which poker variant is being played
 */
export interface GameState {
  phase: GamePhase
  pot: number
  communityCards: Card[]
  currentBet: number
  currentPlayerIndex: number
  dealerIndex: number
  dealerSeatNumber: number
  smallBlindIndex: number
  bigBlindIndex: number
  players: PlayerState[]
  deck: Card[]
  winners: string[]
  handNumber: number
  gameMode: GameMode
}
