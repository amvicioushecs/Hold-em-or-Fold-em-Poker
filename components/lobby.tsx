"use client"
import { Button } from "@/components/ui/button"
import { Users, MessageCircle, Settings } from "lucide-react"
import Image from "next/image"
import { useWebRTC } from "@/hooks/use-webrtc"
import ProfileButton from "./profile-button"

interface HomeLobbyProps {
  onNavigate: (page: "cash" | "allin" | "mtt" | "sng") => void
  onOpenStore: () => void
}

export default function HomeLobby({ onNavigate, onOpenStore }: HomeLobbyProps) {
  const { players } = useWebRTC()
  const localPlayer = Array.from(players.values()).find((p) => p.isLocal)

  return (
    <div className="relative w-full h-[100dvh] flex flex-col bg-black">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-chart-4/20">
        {/* Profile Section */}
        <div className="flex items-center gap-3">
          <ProfileButton />
          <span className="text-white font-semibold text-sm md:text-base">{localPlayer?.name || "Hector Verdugo"}</span>
        </div>

        {/* Store Button */}
        <Button
          onClick={onOpenStore}
          className="bg-chart-4 hover:bg-chart-4/90 text-black font-bold px-6 py-2 rounded-lg text-sm"
        >
          Store
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        {/* Logo */}
        <div className="mb-12">
          <Image
            src="/logo.png"
            alt="Hold'em or Fold'em Poker"
            width={280}
            height={280}
            className="w-48 h-48 md:w-64 md:h-64 lg:w-80 lg:h-80 drop-shadow-2xl"
            priority
          />
        </div>

        {/* Game Mode Buttons */}
        <div className="grid grid-cols-4 gap-4 md:gap-6 max-w-md">
          {/* Cash */}
          <button onClick={() => onNavigate("cash")} className="flex flex-col items-center justify-center">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-chart-4 flex items-center justify-center hover:bg-chart-4/10 transition-colors bg-[rgba(55,71,117,1)]">
              <span className="text-chart-4 font-bold text-sm md:text-base">Cash</span>
            </div>
          </button>

          {/* All in */}
          <button onClick={() => onNavigate("allin")} className="flex flex-col items-center justify-center">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-chart-4 flex items-center justify-center hover:bg-chart-4/10 transition-colors bg-[rgba(55,71,117,1)]">
              <span className="text-chart-4 font-bold text-sm md:text-base">All in</span>
            </div>
          </button>

          {/* MTT */}
          <button onClick={() => onNavigate("mtt")} className="flex flex-col items-center justify-center">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-chart-4 flex items-center justify-center hover:bg-chart-4/10 transition-colors bg-[rgba(55,71,117,1)]">
              <span className="text-chart-4 font-bold text-sm md:text-base">MTT</span>
            </div>
          </button>

          {/* SNG */}
          <button onClick={() => onNavigate("sng")} className="flex flex-col items-center justify-center">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-chart-4 flex items-center justify-center hover:bg-chart-4/10 transition-colors bg-[rgba(55,71,117,1)]">
              <span className="text-chart-4 font-bold text-sm md:text-base">SNG</span>
            </div>
          </button>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="border-t border-chart-4/20 bg-black">
        <div className="grid grid-cols-4 max-w-2xl mx-auto">
          {/* Friends */}
          <button className="flex flex-col items-center justify-center py-3 hover:bg-chart-4/5 transition-colors">
            <Users className="w-6 h-6 text-chart-4 mb-1" />
            <span className="text-chart-4 text-xs font-semibold">Friends</span>
          </button>

          {/* Club */}
          <button className="flex flex-col items-center justify-center py-3 hover:bg-chart-4/5 transition-colors">
            <Users className="w-6 h-6 text-chart-4 mb-1" />
            <span className="text-chart-4 text-xs font-semibold">Club</span>
          </button>

          {/* Chat */}
          <button className="flex flex-col items-center justify-center py-3 hover:bg-chart-4/5 transition-colors">
            <MessageCircle className="w-6 h-6 text-chart-4 mb-1" />
            <span className="text-chart-4 text-xs font-semibold">Chat</span>
          </button>

          {/* Settings */}
          <button className="flex flex-col items-center justify-center py-3 hover:bg-chart-4/5 transition-colors">
            <Settings className="w-6 h-6 text-chart-4 mb-1" />
            <span className="text-chart-4 text-xs font-semibold">Settings</span>
          </button>
        </div>
      </div>
    </div>
  )
}
