"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { X, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { wheelPrizes } from "@/lib/wheel-prizes"
import type { WheelPrize, WheelState } from "@/types/lucky-wheel"

interface LuckyWheelProps {
  isOpen: boolean
  onClose: () => void
  playerName: string
  playerLevel: number
  playerChips: number
  playerDiamonds: number
  onPrizeWon: (prize: WheelPrize, multiplier: number) => void
}

export default function LuckyWheel({
  isOpen,
  onClose,
  playerName,
  playerLevel,
  playerChips,
  playerDiamonds,
  onPrizeWon,
}: LuckyWheelProps) {
  const [wheelState, setWheelState] = useState<WheelState>({
    spinsAvailable: 1,
    nextSpinTime: null,
    spinProgress: 0,
    totalSpinsToday: 0,
    spinHistory: [],
    selectedColor: "purple",
  })
  const [isSpinning, setIsSpinning] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [timeUntilNextSpin, setTimeUntilNextSpin] = useState<string>("")
  const wheelRef = useRef<HTMLDivElement>(null)

  const segmentAngle = 360 / wheelPrizes.length

  // Calculate time until next spin
  useEffect(() => {
    if (!wheelState.nextSpinTime) return

    const interval = setInterval(() => {
      const now = new Date()
      const nextSpin =
        wheelState.nextSpinTime instanceof Date ? wheelState.nextSpinTime : new Date(wheelState.nextSpinTime)
      const diff = nextSpin.getTime() - now.getTime()

      if (diff <= 0) {
        setWheelState((prev) => ({
          ...prev,
          spinsAvailable: prev.spinsAvailable + 1,
          nextSpinTime: null,
        }))
        setTimeUntilNextSpin("")
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60))
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((diff % (1000 * 60)) / 1000)
        setTimeUntilNextSpin(`${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [wheelState.nextSpinTime])

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(2)}M`
    }
    return num.toLocaleString()
  }

  const handleSpin = () => {
    if (wheelState.spinsAvailable === 0 || isSpinning) return

    setIsSpinning(true)

    // Random prize selection
    const prizeIndex = Math.floor(Math.random() * wheelPrizes.length)
    const targetRotation = 360 * 5 + prizeIndex * segmentAngle + segmentAngle / 2

    setRotation(targetRotation)

    // Determine multiplier based on spin progress
    let multiplier = 1
    if (wheelState.spinProgress >= 7) {
      multiplier = 3
    } else if (wheelState.spinProgress >= 3) {
      multiplier = 2
    }

    setTimeout(() => {
      const wonPrize = wheelPrizes[prizeIndex]
      onPrizeWon(wonPrize, multiplier)

      setWheelState((prev) => ({
        ...prev,
        spinsAvailable: prev.spinsAvailable - 1,
        nextSpinTime: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours
        spinProgress: prev.spinProgress + 1 >= 7 ? 0 : prev.spinProgress + 1,
        totalSpinsToday: prev.totalSpinsToday + 1,
        spinHistory: [
          {
            timestamp: new Date(),
            prize: wonPrize,
            multiplier,
          },
          ...prev.spinHistory,
        ].slice(0, 10),
      }))

      setIsSpinning(false)
    }, 5000)
  }

  if (!isOpen) return null

  const currentMultiplier = wheelState.spinProgress >= 7 ? 3 : wheelState.spinProgress >= 3 ? 2 : 1

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm">
      {/* Header */}
      <div className="relative bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-700 p-4">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          {/* Player Info */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-purple-500">
              <div className="w-full h-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-lg font-bold">
                {playerName.charAt(0).toUpperCase()}
              </div>
            </div>
            <div>
              <p className="text-yellow-400 font-bold text-sm">{playerName}</p>
              <p className="text-xs text-cyan-400">Lv.{playerLevel}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-black/30 backdrop-blur-sm rounded-full px-3 py-1.5">
              <span className="text-2xl">💰</span>
              <span className="text-yellow-400 font-bold text-sm">{formatNumber(playerChips)}</span>
            </div>
            <div className="flex items-center gap-1 bg-black/30 backdrop-blur-sm rounded-full px-3 py-1.5">
              <span className="text-2xl">💎</span>
              <span className="text-cyan-400 font-bold text-sm">{playerDiamonds}</span>
            </div>
          </div>

          {/* Close Button */}
          <Button
            size="icon"
            onClick={onClose}
            className="w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 border-2 border-blue-400"
          >
            <X className="w-7 h-7" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] p-4 overflow-y-auto">
        {/* Spin Ticket Indicator */}
        <div className="mb-6 flex items-center gap-4 bg-purple-900/30 backdrop-blur-sm rounded-2xl px-6 py-3 border-2 border-purple-500">
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
              {wheelState.spinsAvailable}
            </div>
          </div>
          {wheelState.nextSpinTime && timeUntilNextSpin && (
            <div>
              <p className="text-white font-bold text-sm">Next spin in:</p>
              <p className="text-cyan-400 font-bold text-xl">{timeUntilNextSpin}</p>
            </div>
          )}
        </div>

        {/* Fortune Wheel */}
        <div className="relative max-w-xl w-full aspect-square">
          {/* Glow Effect */}
          <div className="absolute inset-0 bg-purple-500/30 rounded-full blur-3xl animate-pulse" />

          {/* Pointer */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
            <div className="w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[40px] border-t-yellow-400 drop-shadow-lg" />
          </div>

          {/* Wheel Container */}
          <div
            ref={wheelRef}
            className="relative w-full h-full transition-transform duration-[5000ms] ease-out"
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            {/* Outer Ring */}
            <div className="absolute inset-0 rounded-full border-8 border-purple-500 shadow-2xl">
              <div className="absolute inset-2 rounded-full border-4 border-blue-400" />
            </div>

            {/* Segments */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
              {wheelPrizes.map((prize, index) => {
                const angle = index * segmentAngle
                const isEven = index % 2 === 0
                return (
                  <g key={prize.id} transform={`rotate(${angle + segmentAngle / 2} 50 50)`}>
                    <path
                      d={`M 50 50 L 50 5 A 45 45 0 0 1 ${50 + 45 * Math.sin((segmentAngle * Math.PI) / 180)} ${50 - 45 * Math.cos((segmentAngle * Math.PI) / 180)} Z`}
                      fill={isEven ? "#D4A574" : "#E8C9A0"}
                      stroke="#8B4513"
                      strokeWidth="0.3"
                    />
                    <text
                      x="50"
                      y="20"
                      textAnchor="middle"
                      fill={prize.label === "BIG" ? "#8B0000" : "#000"}
                      fontSize="4"
                      fontWeight="bold"
                      transform={`rotate(${-segmentAngle / 2} 50 20)`}
                    >
                      {prize.label}
                    </text>
                  </g>
                )
              })}
            </svg>

            {/* Center Circle */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-gradient-to-br from-purple-600 to-purple-800 border-4 border-purple-400 flex items-center justify-center shadow-xl">
              <Sparkles className="w-12 h-12 text-white animate-pulse" />
            </div>

            {/* Decorative Dots */}
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-3 h-3 bg-cyan-400 rounded-full"
                style={{
                  top: `${50 + 45 * Math.cos((i * 30 * Math.PI) / 180)}%`,
                  left: `${50 + 45 * Math.sin((i * 30 * Math.PI) / 180)}%`,
                  transform: "translate(-50%, -50%)",
                }}
              />
            ))}
          </div>
        </div>

        {/* Spin Progress Bar */}
        <div className="mt-8 w-full max-w-md">
          <div className="relative bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-full p-2 border-2 border-purple-500">
            <div className="flex items-center justify-between px-4">
              <span className="text-white font-bold text-lg">{wheelState.spinProgress}</span>

              {/* Progress Bar */}
              <div className="flex-1 mx-4 h-3 bg-purple-900/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 transition-all duration-500"
                  style={{ width: `${(wheelState.spinProgress / 7) * 100}%` }}
                />
              </div>

              <span className="text-white font-bold text-lg">7</span>
            </div>

            {/* Multiplier Indicators */}
            <div className="flex justify-between mt-2 px-4">
              <div className="text-center">
                <div
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center border-2",
                    wheelState.spinProgress >= 3
                      ? "bg-gradient-to-br from-purple-500 to-pink-500 border-purple-400"
                      : "bg-gray-700 border-gray-600",
                  )}
                >
                  <span className="text-white font-bold">x2</span>
                </div>
              </div>
              <div className="text-center">
                <div
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center border-2",
                    wheelState.spinProgress >= 7
                      ? "bg-gradient-to-br from-yellow-500 to-orange-500 border-yellow-400"
                      : "bg-gray-700 border-gray-600",
                  )}
                >
                  <span className="text-white font-bold">x3</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Color Selection */}
        <div className="mt-8 flex gap-4">
          {(["blue", "purple", "gold"] as const).map((color) => (
            <button
              key={color}
              onClick={() => setWheelState((prev) => ({ ...prev, selectedColor: color }))}
              className={cn(
                "w-20 h-20 rounded-full text-white font-bold text-lg uppercase transition-all",
                wheelState.selectedColor === color ? "ring-4 ring-white scale-110" : "opacity-50",
                color === "blue" && "bg-gradient-to-br from-blue-600 to-blue-800",
                color === "purple" && "bg-gradient-to-br from-purple-600 to-purple-800",
                color === "gold" && "bg-gradient-to-br from-yellow-600 to-orange-700",
              )}
            >
              {color}
            </button>
          ))}
        </div>

        {/* Spin Button */}
        <Button
          size="lg"
          onClick={handleSpin}
          disabled={wheelState.spinsAvailable === 0 || isSpinning}
          className="mt-8 w-full max-w-md h-16 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-xl rounded-2xl disabled:opacity-50"
        >
          {isSpinning ? "Spinning..." : wheelState.spinsAvailable > 0 ? "SPIN NOW!" : "No Spins Available"}
        </Button>
      </div>
    </div>
  )
}
