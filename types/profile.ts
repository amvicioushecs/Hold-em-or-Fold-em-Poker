export interface UserProfile {
  id: string
  name: string
  avatar?: string
  country: string
  language: string
  isVerified: boolean
  vipLevel: number
  level: number
  levelProgress: number
  chips: number
  bio: string
  stats: ProfileStats
  achievements: Achievement[]
  bigFans: Fan[]
  giftsReceived: Gift[]
}

export interface ProfileStats {
  totalHands: number
  maxProfit: number
  winRate: number
  gamesPlayed: number
  tablesJoined: number
}

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  rarity: "common" | "rare" | "epic" | "legendary"
  unlockedAt?: Date
  progress?: number
  total?: number
}

export interface Fan {
  id: string
  name: string
  avatar?: string
  chips: number
}

export interface Gift {
  id: string
  name: string
  icon: string
  forSale: boolean
  price?: number
}
