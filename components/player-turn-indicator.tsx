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
    top: "left-[105%] top-1/2 -translate-y-1/2 md:left-[110%]",
    "top-left": "right-[105%] top-1/2 -translate-y-1/2 md:right-[110%]",
    "top-right": "left-[105%] top-1/2 -translate-y-1/2 md:left-[110%]",
    "bottom-left": "right-[105%] top-1/2 -translate-y-1/2 md:right-[110%]",
    "bottom-right": "left-[105%] top-1/2 -translate-y-1/2 md:left-[110%]",
    bottom: "bottom-[-4rem] left-1/2 -translate-x-1/2",
  }

  return (
    <div className={cn("absolute z-50", positionClasses[position])}>
      <TurnTimer isActive={isActive} onTimeUp={onTimeUp} duration={duration} />
    </div>
  )
}
