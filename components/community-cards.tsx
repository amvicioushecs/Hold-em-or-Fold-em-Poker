"use client"

import { usePokerGame } from "@/hooks/use-poker-game"
import Card from "./card"

export default function CommunityCards() {
  const { gameState } = usePokerGame()

  // Show 5 card slots, filled or empty
  const slots = Array.from({ length: 5 }, (_, i) => gameState?.communityCards[i] || null)

  return (
    <div className="absolute top-[55%] left-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-1.5 md:gap-2 z-10">
      {slots.map((card, index) => (
        <div 
          key={index}
          className="relative"
          style={{
            animation: card ? `dealCard 0.6s ease-out ${index * 150}ms forwards` : "none",
            opacity: card ? 1 : 0.3,
          }}
        >
          <style>{`
            @keyframes dealCard {
              0% {
                opacity: 0;
                transform: translateX(-120px) translateY(80px) scale(0.6) rotateZ(25deg);
              }
              50% {
                transform: translateX(-40px) translateY(40px) scale(0.85) rotateZ(15deg);
              }
              100% {
                opacity: 1;
                transform: translateX(0) translateY(0) scale(1) rotateZ(0deg);
              }
            }
          `}</style>
          <Card 
            card={card || undefined} 
            faceDown={!card} 
            animate={!!card} 
            delay={index * 150} 
            size="md" 
          />
        </div>
      ))}
    </div>
  )
}
