"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { User } from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import UserProfile from "./user-profile"
import type { UserProfile as UserProfileType } from "@/types/profile"
import { useWebRTC } from "@/hooks/use-webrtc"

export default function ProfileButton() {
  const [isOpen, setIsOpen] = useState(false)
  const { players } = useWebRTC()
  const localPlayer = Array.from(players.values()).find((p) => p.isLocal)

  // Mock profile data - in a real app, this would come from a database
  const mockProfile: UserProfileType = {
    id: "71696988",
    name: localPlayer?.name || "Hector Verdugo",
    country: "United States",
    language: "English",
    isVerified: true,
    vipLevel: 3,
    level: 98,
    levelProgress: 65,
    chips: 256235646,
    bio: "This player did not enter any info.",
    stats: {
      totalHands: 66518,
      maxProfit: 1050000000,
      winRate: 27,
      gamesPlayed: 450,
      tablesJoined: 125,
    },
    achievements: [
      {
        id: "1",
        name: "Quadra Kill~1",
        description: "Win 4 hands in a row",
        icon: "🎯",
        rarity: "rare",
        unlockedAt: new Date(),
      },
      {
        id: "2",
        name: "Win 5M in one hand",
        description: "Win 5 million chips in a single hand",
        icon: "💰",
        rarity: "epic",
        unlockedAt: new Date(),
      },
      {
        id: "3",
        name: "Headhunter~100",
        description: "Eliminate 100 players",
        icon: "🎖️",
        rarity: "legendary",
        unlockedAt: new Date(),
      },
      {
        id: "4",
        name: "Win 1B",
        description: "Win 1 billion chips total",
        icon: "💎",
        rarity: "legendary",
        unlockedAt: new Date(),
      },
      {
        id: "5",
        name: "Royal Flush",
        description: "Get a Royal Flush",
        icon: "👑",
        rarity: "legendary",
      },
      {
        id: "6",
        name: "All-in Master",
        description: "Win 50 all-in situations",
        icon: "⚡",
        rarity: "epic",
      },
      {
        id: "7",
        name: "Tournament Winner",
        description: "Win a tournament",
        icon: "🏆",
        rarity: "epic",
      },
      {
        id: "8",
        name: "High Roller",
        description: "Play at high stakes tables",
        icon: "💸",
        rarity: "rare",
      },
    ],
    bigFans: [
      {
        id: "fan1",
        name: "Jeanon Glen Aquilana",
        chips: 3190000000,
      },
      {
        id: "fan2",
        name: "Pauline❤️",
        chips: 3070000000,
      },
      {
        id: "fan3",
        name: "Monnna",
        chips: 2440000000,
      },
    ],
    giftsReceived: [
      { id: "g1", name: "Pipe", icon: "🚬", forSale: true, price: 1000 },
      { id: "g2", name: "Champagne", icon: "🍾", forSale: true, price: 5000 },
      { id: "g3", name: "Cocktail", icon: "🍹", forSale: true, price: 2000 },
      { id: "g4", name: "Rose", icon: "🌹", forSale: true, price: 500 },
      { id: "g5", name: "Chocolates", icon: "🍫", forSale: true, price: 1500 },
      { id: "g6", name: "Ring", icon: "💍", forSale: false },
      { id: "g7", name: "Crown", icon: "👑", forSale: false },
      { id: "g8", name: "Trophy", icon: "🏆", forSale: false },
      { id: "g9", name: "Diamond", icon: "💎", forSale: false },
      { id: "g10", name: "Medal", icon: "🏅", forSale: false },
    ],
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(true)}
        className="text-white hover:bg-white/10 rounded-full"
      >
        <User className="w-5 h-5" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="p-0 max-w-full h-full m-0 border-0">
          <UserProfile profile={mockProfile} isOwnProfile={true} onClose={() => setIsOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  )
}
