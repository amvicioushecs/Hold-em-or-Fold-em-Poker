"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Gift } from "lucide-react"
import LuckyWheel from "./lucky-wheel"
import type { WheelPrize } from "@/types/lucky-wheel"

interface LuckyWheelButtonProps {
  playerName: string
  playerLevel: number
  playerChips: number
  playerDiamonds: number
  onPrizeWon: (prize: WheelPrize, multiplier: number) => void
}

export default function LuckyWheelButton({
  playerName,
  playerLevel,
  playerChips,
  playerDiamonds,
  onPrizeWon,
}: LuckyWheelButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="relative bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-full shadow-xl"
        size="lg"
      >
        <Gift className="w-5 h-5 mr-2" />
        Daily Bonus
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs">
          1
        </div>
      </Button>

      <LuckyWheel
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        playerName={playerName}
        playerLevel={playerLevel}
        playerChips={playerChips}
        playerDiamonds={playerDiamonds}
        onPrizeWon={onPrizeWon}
      />
    </>
  )
}
