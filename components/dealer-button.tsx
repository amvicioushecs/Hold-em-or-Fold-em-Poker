"use client"

import { cn } from "@/lib/utils"

interface DealerButtonProps {
  seatNumber: number
  className?: string
}

export default function DealerButton({ seatNumber, className }: DealerButtonProps) {
  // Now positioned in a tighter circle closer to center of tables
  const positionClasses: Record<number, string> = {
    1: "top-[28%] left-1/2 -translate-x-1/2", // Top - closer to table center
    2: "top-[32%] right-[28%]", // Top-right - on table surface
    3: "bottom-[32%] right-[28%]", // Bottom-right - on table surface
    4: "bottom-[28%] left-1/2 -translate-x-1/2", // Bottom - closer to table center
    5: "bottom-[32%] left-[28%]", // Bottom-left - on table surface
    6: "top-[32%] left-[28%]", // Top-left - on table surface
  }

  return (
    <div
      className={cn(
        "absolute w-8 h-8 md:w-10 md:h-10 bg-white rounded-full shadow-lg border-2 border-yellow-500 flex items-center justify-center z-40 transition-all duration-500",
        positionClasses[seatNumber],
        className,
      )}
    >
      <div className="relative">
        <span className="text-base md:text-lg font-bold text-gray-900">D</span>
      </div>
    </div>
  )
}
