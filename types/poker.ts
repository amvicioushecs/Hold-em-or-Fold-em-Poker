export type Suit = "hearts" | "diamonds" | "clubs" | "spades"
export type Rank = "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K" | "A"

export interface Card {
  suit: Suit
  rank: Rank
}

export type HandRank =
  | "royal-flush"
  | "straight-flush"
  | "four-of-a-kind"
  | "full-house"
  | "flush"
  | "straight"
  | "three-of-a-kind"
  | "two-pair"
  | "pair"
  | "high-card"

export interface HandEvaluation {
  rank: HandRank
  value: number
  cards: Card[]
  description: string
}

export type PlayerAction = "fold" | "check" | "call" | "raise" | "all-in"
export type GamePhase = "waiting" | "pre-flop" | "flop" | "turn" | "river" | "showdown" | "complete"
export type GameMode = "sng" | "mtt" | "allin" | "omaha"

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
  seatNumber: number // NEW: Track seat position
}

export interface GameState {
  phase: GamePhase
  pot: number
  communityCards: Card[]
  currentBet: number
  currentPlayerIndex: number
  dealerIndex: number
  dealerSeatNumber: number // NEW: Track dealer seat
  smallBlindIndex: number
  bigBlindIndex: number
  players: PlayerState[]
  deck: Card[]
  winners: string[]
  handNumber: number // NEW: Track hand count
  gameMode: GameMode // NEW: Track which poker variant is being played
}
