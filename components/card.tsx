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
    sm: "w-7 h-10 text-xs",
    md: "w-10 h-14 text-sm md:w-12 md:h-16 md:text-base",
    lg: "w-14 h-20 text-lg md:w-16 md:h-22",
  }

  const color = card ? getCardColor(card.suit) : "black"
  const symbol = card ? getSuitSymbol(card.suit) : ""

  return (
    <div
      className={cn(
        "relative rounded-lg shadow-lg transition-all duration-300",
        sizeClasses[size],
        isDealing && "translate-y-[-30px] opacity-0",
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
        className="absolute inset-0 rounded-lg bg-gradient-to-br from-slate-600 to-slate-800 border border-slate-500 flex items-center justify-center overflow-hidden"
        style={{
          backfaceVisibility: "hidden",
          transform: "rotateY(180deg)",
        }}
      >
        {/* Grid pattern */}
        <div className="absolute inset-1 rounded border border-slate-500/50 bg-slate-700/30">
          <div className="w-full h-full grid grid-cols-4 grid-rows-5 gap-px opacity-40">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="bg-slate-500/30" />
            ))}
          </div>
        </div>
      </div>

      {/* Card Face */}
      <div
        className={cn(
          "absolute inset-0 rounded-lg bg-white border border-gray-200 flex flex-col overflow-hidden shadow-inner",
          color === "red" ? "text-red-600" : "text-gray-900",
        )}
        style={{
          backfaceVisibility: "hidden",
        }}
      >
        {card ? (
          <>
            {/* Top left corner */}
            <div className="absolute top-0.5 left-1 flex flex-col items-center leading-none">
              <span className="font-bold text-[0.65rem] md:text-xs">{card.rank}</span>
              <span className="text-[0.6rem] md:text-sm -mt-0.5">{symbol}</span>
            </div>

            {/* Center Symbol */}
            <div className="flex-1 flex items-center justify-center">
              <span className={cn(
                "font-bold",
                size === "sm" ? "text-lg" : size === "md" ? "text-2xl md:text-3xl" : "text-4xl md:text-5xl"
              )}>
                {symbol}
              </span>
            </div>

            {/* Bottom right corner (rotated) */}
            <div className="absolute bottom-0.5 right-1 flex flex-col items-center leading-none rotate-180">
              <span className="font-bold text-[0.65rem] md:text-xs">{card.rank}</span>
              <span className="text-[0.6rem] md:text-sm -mt-0.5">{symbol}</span>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-xl">?</div>
        )}
      </div>
    </div>
  )
}
