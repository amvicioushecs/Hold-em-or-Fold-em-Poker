"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
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
  const router = useRouter()

  return (
    <>
      null

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
