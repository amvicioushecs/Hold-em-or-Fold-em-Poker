"use client"

import { cn } from "@/lib/utils"

interface DealerButtonProps {
  seatNumber: number
  className?: string
}

export default function DealerButton({ seatNumber, className }: DealerButtonProps) {
  const positionClasses: Record<number, string> = {
    1: "top-[18%] left-[58%]",
    2: "top-[26%] right-[22%]",
    3: "bottom-[26%] right-[22%]",
    4: "bottom-[18%] left-[58%]",
    5: "bottom-[26%] left-[22%]",
    6: "top-[26%] left-[22%]",
  }

  return (
    <div
      className={cn(
        "absolute z-40 flex h-[21px] w-[21px] items-center justify-center rounded-full transition-all duration-500",
        "bg-[radial-gradient(50%_50%_at_50%_50%,#2C344D_82.69%,#EFD405_87.5%,#222A3D_90.38%,#F4E04A_100%)]",
        "shadow-md",
        positionClasses[seatNumber],
        className,
      )}
      aria-label="Dealer"
    >
      <span className="text-[11px] font-medium tracking-[0.4px] text-white">D</span>
    </div>
  )
}
