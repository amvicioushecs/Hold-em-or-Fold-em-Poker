export type TournamentPhase = "registration" | "late-registration" | "running" | "break" | "final-table" | "completed"

export type TournamentType = "regular" | "headsup" | "turbo" | "bounty" | "freezeout" | "rebuy" | "pko" | "short-handed"

export interface BlindLevel {
  level: number
  smallBlind: number
  bigBlind: number
  ante?: number
  duration: number // in seconds
  isBreak?: boolean // Mark if this is a break level
  breakDuration?: number // Duration of break if isBreak is true
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
  tournamentType: TournamentType
  bountyAmount?: number // For bounty tournaments
  breakSchedule?: BreakSchedule[] // Optional break schedule
  addOnConfig?: AddOnConfig // Optional add-on configuration
  rebuyConfig?: RebuyConfig // Optional rebuy configuration
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
  bountyValue?: number
  bountiesEarned?: number
  rebuysUsed?: number // Track rebuy count
  hasAddOn?: boolean // Track if player purchased add-on
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
  totalBountyPot?: number
  breakTimeRemaining?: number // Time remaining in current break
  isAddOnAvailable?: boolean // Whether add-on is currently available
  isRebuyAvailable?: boolean // Whether rebuy is currently available
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

export interface BreakSchedule {
  afterLevel: number // Break occurs after this blind level
  duration: number // Break duration in seconds
  label: string // e.g., "15-minute break"
}

export interface AddOnConfig {
  enabled: boolean
  availableAtLevel: number // Add-on available after this blind level
  cost: number
  chipsReceived: number
  availableUntilLevel?: number // Optional: add-on expires after this level
}

export interface RebuyConfig {
  enabled: boolean
  maxRebuys: number
  cost: number
  chipsReceived: number
  allowedUntilLevel: number // Rebuy period ends after this level
  allowedWhenChipsBelow?: number // Can only rebuy when chips below this amount
}
