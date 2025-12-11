export interface WheelPrize {
  id: string
  type: "coins" | "diamonds" | "tickets" | "special"
  amount: number
  label: string
  icon: string
  rarity: "common" | "rare" | "epic" | "legendary"
}

export interface SpinHistory {
  timestamp: Date
  prize: WheelPrize
  multiplier: number
}

export interface WheelState {
  spinsAvailable: number
  nextSpinTime: Date | null
  spinProgress: number
  totalSpinsToday: number
  spinHistory: SpinHistory[]
  selectedColor: "blue" | "purple" | "gold"
}
