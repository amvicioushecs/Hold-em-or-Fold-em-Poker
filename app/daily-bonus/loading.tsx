"use client"

import { Loader2 } from "lucide-react"

export default function DailyBonusLoading() {
  return (
    <div className="w-full h-[100dvh] bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 text-foreground animate-spin" />
        <p className="text-foreground text-sm">Loading your daily bonus...</p>
      </div>
    </div>
  )
}
