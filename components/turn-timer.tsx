"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { Clock } from "lucide-react"

interface TurnTimerProps {
  isActive: boolean
  onTimeUp: () => void
  duration?: number
  className?: string
}

export default function TurnTimer({ isActive, onTimeUp, duration = 30, className }: TurnTimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration)
  const [isPulsing, setIsPulsing] = useState(false)

  useEffect(() => {
    if (!isActive) {
      setTimeLeft(duration)
      setIsPulsing(false)
      return
    }

    setTimeLeft(duration)
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          onTimeUp()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isActive, duration, onTimeUp])

  useEffect(() => {
    // Start pulsing when time is running low
    if (timeLeft <= 10 && timeLeft > 0) {
      setIsPulsing(true)
    } else {
      setIsPulsing(false)
    }
  }, [timeLeft])

  if (!isActive) return null

  const percentage = (timeLeft / duration) * 100
  const isLowTime = timeLeft <= 10
  const isCriticalTime = timeLeft <= 5

  return (
    <div className={cn("relative", className)}>
      {/* Circular Timer */}
      <div className="relative w-16 h-16 md:w-20 md:h-20">
        {/* Background Circle */}
        <svg className="w-full h-full -rotate-90">
          
          {/* Progress Circle */}
          
        </svg>

        {/* Time Display */}
        

        {/* Pulse Effect */}
        {isPulsing && (
          <div
            className={cn(
              "absolute inset-0 rounded-full animate-ping",
              isCriticalTime ? "bg-red-500/30" : "bg-orange-500/30",
            )}
          />
        )}
      </div>

      {/* Warning Text */}
      {isLowTime && (
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
          
        </div>
      )}
    </div>
  )
}
