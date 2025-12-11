"use client"

import { cn } from "@/lib/utils"
import TurnTimer from "./turn-timer"

interface PlayerTurnIndicatorProps {
  position: string
  isActive: boolean
  onTimeUp: () => void
  duration?: number
}

export default function PlayerTurnIndicator({ position, isActive, onTimeUp, duration = 30 }: PlayerTurnIndicatorProps) {
  if (!isActive) return null

  // Position the timer indicator based on player position
  const positionClasses: Record<string, string> = {
    top: "top-[-3rem] left-1/2 -translate-x-1/2",
    "top-left": "top-[-3rem] left-0",
    "top-right": "top-[-3rem] right-0",
    "bottom-left": "bottom-[-3rem] left-0",
    "bottom-right": "bottom-[-3rem] right-0",
    bottom: "bottom-[-4rem] left-1/2 -translate-x-1/2",
  }

  return (
    <div className={cn("absolute z-50", positionClasses[position])}>
      <TurnTimer isActive={isActive} onTimeUp={onTimeUp} duration={duration} />
    </div>
  )
}
