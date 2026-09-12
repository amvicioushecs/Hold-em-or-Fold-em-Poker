"use client"

import { usePokerGame } from "@/hooks/use-poker-game"
import Card from "./card"

export default function CommunityCards() {
  const { gameState } = usePokerGame()

  if (!gameState || gameState.communityCards.length === 0) return null

  return (
    <div className="flex items-center justify-center gap-1.5">
      {gameState.communityCards.map((card, index) => (
        <Card key={index} card={card} faceDown={false} animate={true} delay={index * 150} size="md" />
      ))}
    </div>
  )
}
