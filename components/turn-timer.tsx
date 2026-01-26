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
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-muted/30"
          />
          {/* Progress Circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeDasharray={`${2 * Math.PI * 45}`}
            strokeDashoffset={`${2 * Math.PI * 45 * (1 - percentage / 100)}`}
            strokeLinecap="round"
            className={cn(
              "transition-all duration-1000",
              isCriticalTime ? "text-destructive" : isLowTime ? "text-chart-4" : "text-primary"
            )}
          />
        </svg>

        {/* Time Display */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex items-center gap-1">
            <Clock className={cn(
              "w-3 h-3 md:w-4 md:h-4",
              isCriticalTime ? "text-destructive" : isLowTime ? "text-chart-4" : "text-foreground"
            )} />
            <span className={cn(
              "text-lg md:text-xl font-bold",
              isCriticalTime ? "text-destructive" : isLowTime ? "text-chart-4" : "text-foreground"
            )}>
              {timeLeft}
            </span>
          </div>
        </div>

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
          <span className={cn(
            "text-xs font-semibold",
            isCriticalTime ? "text-destructive" : "text-chart-4"
          )}>
            {isCriticalTime ? "Hurry!" : "Time running out!"}
          </span>
        </div>
      )}
    </div>
  )
}
