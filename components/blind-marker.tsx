"use client"

import { cn } from "@/lib/utils"

interface BlindMarkerProps {
  type: "SB" | "BB"
  className?: string
}

export default function BlindMarker({ type, className }: BlindMarkerProps) {
  return (
    <div
      className={cn(
        "absolute -top-2 -right-2 w-8 h-8 md:w-10 md:h-10 rounded-full shadow-lg border-2 flex items-center justify-center z-50 font-bold text-xs md:text-sm transition-all duration-500",
        type === "SB" ? "bg-blue-600 border-blue-400 text-white" : "bg-red-600 border-red-400 text-white",
        className,
      )}
    >
      <div className="relative">
        {type}
        <div
          className={cn(
            "absolute inset-0 rounded-full animate-ping opacity-75",
            type === "SB" ? "bg-blue-400" : "bg-red-400",
          )}
        />
      </div>
    </div>
  )
}
