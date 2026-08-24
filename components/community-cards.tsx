"use client"

import { usePokerGame } from "@/hooks/use-poker-game"
import Card from "./card"

export default function CommunityCards() {
  const { gameState } = usePokerGame()

  if (!gameState || gameState.communityCards.length === 0) return null

  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-1 md:gap-2 z-30">
      {gameState.communityCards.map((card, index) => (
        <Card key={index} card={card} faceDown={false} animate={true} delay={index * 150} size="md" />
      ))}
    </div>
  )
}
