"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import LuckyWheel from "@/components/lucky-wheel"
import type { WheelPrize } from "@/types/lucky-wheel"

export default function DailyBonusPage() {
  const router = useRouter()
  const [playerChips, setPlayerChips] = useState(302480000)
  const [playerDiamonds, setPlayerDiamonds] = useState(72)

  const handlePrizeWon = (prize: WheelPrize, multiplier: number) => {
    const finalAmount = prize.amount * multiplier

    if (prize.type === "coins") {
      setPlayerChips((prev) => prev + finalAmount)
    } else if (prize.type === "diamonds") {
      setPlayerDiamonds((prev) => prev + finalAmount)
    }

    console.log(`Won ${prize.label}! (x${multiplier})`)
  }

  return (
    <div className="relative w-full h-[100dvh] bg-background overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-sm border-b border-border p-4 flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="w-12 h-12 rounded-full border-2 border-border text-foreground hover:bg-accent"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-xl md:text-2xl font-bold text-foreground">Daily Bonus</h1>
      </div>

      {/* Lucky Wheel - Always Open */}
      <LuckyWheel
        isOpen={true}
        onClose={() => router.back()}
        playerName="Player"
        playerLevel={98}
        playerChips={playerChips}
        playerDiamonds={playerDiamonds}
        onPrizeWon={handlePrizeWon}
      />
    </div>
  )
}
