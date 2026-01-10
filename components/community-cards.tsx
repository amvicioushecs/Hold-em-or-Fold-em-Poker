"use client"

import { usePokerGame } from "@/hooks/use-poker-game"
import Card from "./card"

export default function CommunityCards() {
  const { gameState } = usePokerGame()

  // Show 5 card slots, filled or empty
  const slots = Array.from({ length: 5 }, (_, i) => gameState?.communityCards[i] || null)

  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-1 md:gap-2">
      {slots.map((card, index) => (
        <Card key={index} card={card || undefined} faceDown={!card} animate={!!card} delay={index * 200} size="md" />
      ))}
    </div>
  )
}
