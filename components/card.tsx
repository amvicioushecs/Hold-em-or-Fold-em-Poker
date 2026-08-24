"use client"

import { useState, useEffect } from "react"
import type { Card as CardType } from "@/types/poker"
import { getSuitSymbol, getCardColor } from "@/lib/card-utils"
import { cn } from "@/lib/utils"

interface CardProps {
  card?: CardType
  faceDown?: boolean
  animate?: boolean
  delay?: number
  size?: "sm" | "md" | "lg"
  className?: string
}

export default function Card({
  card,
  faceDown = false,
  animate = false,
  delay = 0,
  size = "md",
  className,
}: CardProps) {
  const [isRevealed, setIsRevealed] = useState(!animate)
  const [isDealing, setIsDealing] = useState(animate)

  useEffect(() => {
    if (animate) {
      const dealTimer = setTimeout(() => {
        setIsDealing(false)
      }, delay)

      const revealTimer = setTimeout(() => {
        if (!faceDown) {
          setIsRevealed(true)
        }
      }, delay + 300)

      return () => {
        clearTimeout(dealTimer)
        clearTimeout(revealTimer)
      }
    }
  }, [animate, delay, faceDown])

  const sizeClasses = {
    sm: "w-8 h-11 text-[10px]",
    md: "w-10 h-14 md:w-12 md:h-16 text-xs md:text-sm",
    lg: "w-14 h-19 md:w-16 md:h-22 text-sm md:text-base",
  }

  const color = card ? getCardColor(card.suit) : "black"
  const symbol = card ? getSuitSymbol(card.suit) : ""

  return (
    <div
      className={cn(
        "relative rounded-lg shadow-md border border-gray-200 transition-all duration-300",
        sizeClasses[size],
        isDealing && "translate-y-[-50px] opacity-0",
        !isDealing && "translate-y-0 opacity-100",
        className,
      )}
      style={{
        transitionDelay: `${delay}ms`,
        transformStyle: "preserve-3d",
        transform: isRevealed || !faceDown ? "rotateY(0deg)" : "rotateY(180deg)",
      }}
    >
      {/* Card Back */}
      <div
        className="absolute inset-0 rounded-lg bg-gradient-to-br from-blue-700 to-blue-900 border border-blue-950 flex items-center justify-center"
        style={{
          backfaceVisibility: "hidden",
          transform: "rotateY(180deg)",
        }}
      >
        <div className="w-full h-full p-0.5 flex items-center justify-center">
          <div className="w-full h-full border border-blue-400/30 rounded bg-blue-800/20 flex items-center justify-center">
            <div className="grid grid-cols-3 gap-0.5">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="w-0.5 h-0.5 md:w-1 md:h-1 bg-blue-300/60 rounded-full" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Card Face */}
      <div
        className={cn(
          "absolute inset-0 rounded-lg bg-white border border-gray-300 flex flex-col justify-between p-1.5 md:p-2",
          color === "red" ? "text-red-600" : "text-gray-900",
        )}
        style={{
          backfaceVisibility: "hidden",
        }}
      >
        {card ? (
          <>
            {/* Top Corner */}
            <div className="flex flex-col items-start leading-none">
              <span className="font-bold text-[10px] md:text-xs leading-none">{card.rank}</span>
              <span className="text-xs md:text-sm mt-0.5 leading-none">{symbol}</span>
            </div>

            {/* Empty Center Spacer */}
            <div className="flex-1" />

            {/* Bottom Corner (rotated) */}
            <div className="flex flex-col items-start leading-none rotate-180">
              <span className="font-bold text-[10px] md:text-xs leading-none">{card.rank}</span>
              <span className="text-xs md:text-sm mt-0.5 leading-none">{symbol}</span>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">?</div>
        )}
      </div>
    </div>
  )
}
