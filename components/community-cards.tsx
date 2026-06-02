"use client"

import { usePokerGame } from "@/hooks/use-poker-game"
import Card from "./card"

export default function CommunityCards() {
  const { gameState } = usePokerGame()

  // Determine cards to show based on game phase
  const getVisibleCards = () => {
    if (!gameState || !gameState.communityCards) return []
    
    const phase = gameState.phase
    const cards = gameState.communityCards
    
    switch (phase) {
      case "flop":
        // Flop: show first 3 cards
        return cards.slice(0, 3)
      case "turn":
        // Turn: show first 4 cards
        return cards.slice(0, 4)
      case "river":
        // River: show all 5 cards
        return cards.slice(0, 5)
      default:
        return []
    }
  }

  const visibleCards = getVisibleCards()

  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-2 md:gap-3 lg:gap-4">
      {visibleCards.map((card, index) => (
        <Card 
          key={index} 
          card={card} 
          faceDown={false} 
          animate={true} 
          delay={index * 250} 
          size="md" 
        />
      ))}
    </div>
  )
}
