export interface ChatMessage {
  id: string
  playerId: string
  playerName: string
  message: string
  timestamp: Date
  type: "text" | "system" | "emoji"
}

export interface EmojiReaction {
  emoji: string
  label: string
}
