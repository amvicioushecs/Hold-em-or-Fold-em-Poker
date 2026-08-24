"use client"

import { cn } from "@/lib/utils"

interface DealerButtonProps {
  seatNumber: number
  className?: string
}

export default function DealerButton({ seatNumber, className }: DealerButtonProps) {
  const positionClasses: Record<number, string> = {
    1: "top-[16%] left-[62%] md:left-[64%]",
    2: "top-[23%] right-[85px] md:right-[100px]",
    3: "bottom-[23%] right-[85px] md:right-[100px]",
    4: "bottom-[16%] left-[62%] md:left-[64%]",
    5: "bottom-[23%] left-[85px] md:left-[100px]",
    6: "top-[23%] left-[85px] md:left-[100px]",
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
