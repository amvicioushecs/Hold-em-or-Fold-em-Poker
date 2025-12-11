export interface Friend {
  id: string
  name: string
  avatar?: string
  level: number
  chips: number
  isOnline: boolean
  lastSeen?: Date
  currentTable?: string
  status?: "playing" | "idle" | "away"
  vipLevel: number
  country: string
}

export interface FriendRequest {
  id: string
  from: Friend
  to: Friend
  timestamp: Date
  status: "pending" | "accepted" | "rejected"
}

export interface FriendStats {
  totalFriends: number
  onlineFriends: number
  gamesPlayedTogether: number
  giftsExchanged: number
}
