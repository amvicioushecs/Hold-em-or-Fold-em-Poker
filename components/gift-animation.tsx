"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface GiftAnimationProps {
  icon: string
  fromName: string
  toName: string
  onComplete?: () => void
}

export default function GiftAnimation({ icon, fromName, toName, onComplete }: GiftAnimationProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      onComplete?.()
    }, 3000)

    return () => clearTimeout(timer)
  }, [onComplete])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300" />

      {/* Gift Animation */}
      <div className="relative z-10 animate-in zoom-in duration-500">
        <div className="flex flex-col items-center gap-4">
          {/* Gift Icon with particles */}
          <div className="relative">
            {/* Particles */}
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className={cn("absolute top-1/2 left-1/2 w-2 h-2 bg-yellow-400 rounded-full", "animate-ping")}
                style={{
                  transform: `rotate(${i * 45}deg) translateX(60px)`,
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: "1s",
                }}
              />
            ))}

            {/* Main Gift */}
            <div className="relative bg-gradient-to-br from-yellow-400 to-orange-400 p-8 rounded-3xl shadow-2xl animate-bounce">
              <div className="text-8xl">{icon}</div>
            </div>
          </div>

          {/* Text */}
          <div className="bg-black/80 backdrop-blur-sm px-6 py-3 rounded-full border-2 border-yellow-400">
            <p className="text-white font-bold text-lg text-center">
              <span className="text-yellow-400">{fromName}</span>
              {" → "}
              <span className="text-yellow-400">{toName}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
