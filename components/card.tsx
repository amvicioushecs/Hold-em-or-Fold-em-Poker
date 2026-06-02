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
    sm: "w-8 h-11 text-sm",
    md: "w-12 h-16 text-lg",
    lg: "w-16 h-22 text-2xl",
  }

  const color = card ? getCardColor(card.suit) : "black"
  const symbol = card ? getSuitSymbol(card.suit) : ""

  return (
    <div
      className={cn(
        "relative rounded-lg shadow-lg border-2 transition-all duration-300",
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
        className="absolute inset-0 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 border-2 border-blue-900 flex items-center justify-center"
        style={{
          backfaceVisibility: "hidden",
          transform: "rotateY(180deg)",
        }}
      >
        <div className="w-full h-full p-1 flex items-center justify-center">
          <div className="w-full h-full border-2 border-blue-400 rounded bg-blue-700/30 flex items-center justify-center">
            <div className="grid grid-cols-3 gap-0.5">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="w-1 h-1 md:w-1.5 md:h-1.5 bg-blue-300 rounded-full" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Card Face */}
      <div
        className={cn(
          "absolute inset-0 rounded-lg bg-white border-2 border-gray-300 flex flex-col items-center justify-center overflow-hidden",
          color === "red" ? "text-red-600" : "text-gray-900",
        )}
        style={{
          backfaceVisibility: "hidden",
        }}
      >
        {card ? (
          <>
            {/* Top Corner */}
            <div className="absolute top-0.5 left-0.5 flex flex-col items-center leading-tight">
              <span className="font-bold text-xs md:text-sm truncate w-6">{card.rank}</span>
              <span className="text-xs md:text-sm leading-none">{symbol}</span>
            </div>

            {/* Center Symbol */}
            <div className="flex items-center justify-center flex-1">
              <span className="text-lg md:text-2xl lg:text-3xl leading-none">{symbol}</span>
            </div>

            {/* Bottom Corner (rotated) */}
            <div className="absolute bottom-0.5 right-0.5 flex flex-col items-center leading-tight rotate-180">
              <span className="font-bold text-xs md:text-sm truncate w-6">{card.rank}</span>
              <span className="text-xs md:text-sm leading-none">{symbol}</span>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">?</div>
        )}
      </div>
    </div>
  )
}
