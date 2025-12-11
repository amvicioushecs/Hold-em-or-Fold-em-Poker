export interface Gift {
  id: string
  name: string
  icon: string
  description: string
  price: number
  category: "fun" | "romantic" | "luxury" | "celebration"
  rarity: "common" | "rare" | "epic" | "legendary"
  animation?: string
}

export interface GiftTransaction {
  id: string
  giftId: string
  fromPlayerId: string
  fromPlayerName: string
  toPlayerId: string
  toPlayerName: string
  timestamp: Date
  message?: string
}

export interface PlayerInventory {
  gifts: { giftId: string; quantity: number }[]
  totalGiftsReceived: number
  totalGiftsSent: number
}
