"use client"

import { Button } from "@/components/ui/button"
import type { EmojiReaction } from "@/types/chat"

const quickEmojis: EmojiReaction[] = [
  { emoji: "👍", label: "Thumbs up" },
  { emoji: "👎", label: "Thumbs down" },
  { emoji: "😂", label: "Laughing" },
  { emoji: "😎", label: "Cool" },
  { emoji: "🤔", label: "Thinking" },
  { emoji: "😮", label: "Surprised" },
  { emoji: "🔥", label: "Fire" },
  { emoji: "💯", label: "100" },
  { emoji: "🎉", label: "Party" },
  { emoji: "💪", label: "Strong" },
  { emoji: "👏", label: "Clap" },
  { emoji: "🙏", label: "Pray" },
  { emoji: "❤️", label: "Heart" },
  { emoji: "😡", label: "Angry" },
  { emoji: "🤯", label: "Mind blown" },
  { emoji: "🎰", label: "Slot machine" },
  { emoji: "🃏", label: "Playing card" },
  { emoji: "💰", label: "Money bag" },
]

interface EmojiPickerProps {
  onSelect: (emoji: string) => void
}

export default function EmojiPicker({ onSelect }: EmojiPickerProps) {
  return (
    <div className="grid grid-cols-6 gap-2">
      {quickEmojis.map((item) => (
        <Button
          key={item.emoji}
          variant="ghost"
          size="sm"
          onClick={() => onSelect(item.emoji)}
          className="h-10 text-2xl hover:bg-accent p-0"
          title={item.label}
        >
          {item.emoji}
        </Button>
      ))}
    </div>
  )
}
