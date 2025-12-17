export type TournamentPhase = "registration" | "late-registration" | "running" | "final-table" | "completed"

export interface BlindLevel {
  level: number
  smallBlind: number
  bigBlind: number
  ante?: number
  duration: number // in seconds
}

export interface TournamentConfig {
  id: string
  name: string
  buyIn: number
  entryFee: number
  startingChips: number
  maxPlayers: number
  minPlayers: number
  playersPerTable: number
  lateRegistrationMinutes: number
  blindStructure: BlindLevel[]
  prizePoolPercentages: number[] // e.g., [50, 30, 20] for top 3
}

export interface TournamentPlayer {
  id: string
  name: string
  chips: number
  tableId: string
  seatNumber: number
  isEliminated: boolean
  eliminationPlace?: number
  prizeWon?: number
}

export interface TournamentTable {
  id: string
  players: TournamentPlayer[]
  gameState: any // Will use existing GameState
  isActive: boolean
}

export interface TournamentState {
  config: TournamentConfig
  phase: TournamentPhase
  currentBlindLevel: number
  blindLevelTimeRemaining: number
  totalPrizePool: number
  registeredPlayers: TournamentPlayer[]
  tables: TournamentTable[]
  eliminatedPlayers: TournamentPlayer[]
  startTime?: Date
  currentTime: Date
  totalPlayers: number
  remainingPlayers: number
}

export interface TournamentStats {
  tournamentId: string
  playerRank: number
  totalPlayers: number
  handsPlayed: number
  biggestPot: number
  prizeWon: number
  eliminatedBy?: string
}
