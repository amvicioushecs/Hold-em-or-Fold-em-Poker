export interface PlayerStats {
  totalHands: number
  maxProfit: number
  winRate: number
  vpip: number // Voluntarily Put In Pot
  pfr: number // Pre-Flop Raise
  wtsd: number // Went To Showdown
  reRaiseRate: number
  cBetRate: number
  bestHand?: {
    cards: Array<{ rank: string; suit: string }>
    handName: string
  }
}

export interface GameModeStats {
  nlh: PlayerStats
  omaha: PlayerStats
  aof: PlayerStats
  sng: PlayerStats
  threePin: PlayerStats
}
