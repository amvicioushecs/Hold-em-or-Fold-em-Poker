export interface CoinPackage {
  id: string
  baseAmount: number
  bonusPercentage: number
  totalAmount: number
  bonusTickets: number
  price: number
  popular?: boolean
  bestValue?: boolean
}

export interface DiamondPackage {
  id: string
  amount: number
  bonusPercentage?: number
  price: number
  popular?: boolean
}

export interface Subscription {
  id: string
  name: string
  duration: "weekly" | "monthly" | "yearly"
  benefits: string[]
  price: number
  savings?: string
}
