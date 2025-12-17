"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Gift, Package, ShoppingBag, Heart, Sparkles, Trophy, Filter } from "lucide-react"
import { cn } from "@/lib/utils"

interface GiftsPageProps {
  profile: any
  onClose: () => void
}

export default function GiftsPage({ profile, onClose }: GiftsPageProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [showForSaleOnly, setShowForSaleOnly] = useState(false)

  // Expanded mock data with more gifts
  const allGifts = [
    // Received gifts from profile
    ...profile.giftsReceived,
    // Add more mock gifts
    {
      id: "11",
      icon: "🎁",
      name: "Mystery Box",
      from: "Player123",
      date: "2024-01-15",
      forSale: false,
      category: "fun",
    },
    {
      id: "12",
      icon: "🌟",
      name: "Star",
      from: "LuckyWinner",
      date: "2024-01-14",
      forSale: true,
      category: "celebration",
    },
    { id: "13", icon: "🔥", name: "Fire", from: "HotShot88", date: "2024-01-13", forSale: false, category: "special" },
    { id: "14", icon: "❤️", name: "Heart", from: "Admirer", date: "2024-01-12", forSale: false, category: "romantic" },
    {
      id: "15",
      icon: "💰",
      name: "Money Bag",
      from: "HighRoller",
      date: "2024-01-11",
      forSale: true,
      category: "luxury",
    },
    { id: "16", icon: "🎪", name: "Circus", from: "FunPlayer", date: "2024-01-10", forSale: false, category: "fun" },
    {
      id: "17",
      icon: "🏆",
      name: "Trophy",
      from: "Champion",
      date: "2024-01-09",
      forSale: false,
      category: "celebration",
    },
    { id: "18", icon: "💎", name: "Diamond", from: "VIPMember", date: "2024-01-08", forSale: true, category: "luxury" },
    {
      id: "19",
      icon: "🎈",
      name: "Balloon",
      from: "PartyKing",
      date: "2024-01-07",
      forSale: false,
      category: "celebration",
    },
    { id: "20", icon: "🌹", name: "Rose", from: "Romeo", date: "2024-01-06", forSale: false, category: "romantic" },
  ]

  const categories = [
    { id: "all", name: "All", icon: Package },
    { id: "fun", name: "Fun", icon: Gift },
    { id: "romantic", name: "Love", icon: Heart },
    { id: "luxury", name: "Luxury", icon: Sparkles },
    { id: "celebration", name: "Party", icon: Trophy },
  ]

  const filteredGifts = allGifts.filter((gift) => {
    const matchesCategory = selectedCategory === "all" || gift.category === selectedCategory
    const matchesForSale = !showForSaleOnly || gift.forSale
    return matchesCategory && matchesForSale
  })

  const forSaleCount = allGifts.filter((g) => g.forSale).length
  const totalValue = forSaleCount * 15000 // Mock calculation

  const formatNumber = (num: number): string => {
    if (num >= 1000000000) {
      return `${(num / 1000000000).toFixed(2)}B`
    } else if (num >= 1000000) {
      return `${(num / 1000000).toFixed(2)}M`
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`
    }
    return num.toString()
  }

  return (
    <div className="relative w-full h-[100dvh] bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
      {/* Header */}
      <div className="relative z-20 bg-black/80 backdrop-blur-sm border-b border-gray-700">
        <div className="flex items-center justify-between p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="w-12 h-12 rounded-full border-2 border-white/50 text-white hover:bg-white/10 touch-manipulation"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white">Gifts Received</h1>
            <p className="text-sm text-cyan-400">{allGifts.length} total gifts</p>
          </div>
          <div className="w-12" />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="p-4 grid grid-cols-2 gap-3">
        {/* Total Gifts */}
        <div className="bg-gradient-to-br from-purple-900/50 to-purple-800/50 rounded-xl p-4 border-2 border-purple-500/50">
          <div className="flex items-center gap-2 mb-2">
            <Gift className="w-5 h-5 text-purple-300" />
            <p className="text-xs text-purple-200">Total Gifts</p>
          </div>
          <p className="text-2xl font-bold text-white">{allGifts.length}</p>
        </div>

        {/* For Sale */}
        <div className="bg-gradient-to-br from-emerald-900/50 to-emerald-800/50 rounded-xl p-4 border-2 border-emerald-500/50">
          <div className="flex items-center gap-2 mb-2">
            <ShoppingBag className="w-5 h-5 text-emerald-300" />
            <p className="text-xs text-emerald-200">For Sale</p>
          </div>
          <p className="text-2xl font-bold text-white">{forSaleCount}</p>
          <p className="text-xs text-emerald-300 mt-1">{formatNumber(totalValue)} value</p>
        </div>
      </div>

      {/* Filter Toggle */}
      <div className="px-4 pb-3">
        <Button
          variant={showForSaleOnly ? "default" : "outline"}
          size="sm"
          onClick={() => setShowForSaleOnly(!showForSaleOnly)}
          className={cn(
            "w-full transition-all",
            showForSaleOnly
              ? "bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white"
              : "bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700",
          )}
        >
          <Filter className="w-4 h-4 mr-2" />
          {showForSaleOnly ? "Showing For Sale Only" : "Show All Gifts"}
        </Button>
      </div>

      {/* Category Tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="flex-1 flex flex-col">
        <TabsList className="w-full grid grid-cols-5 p-1 mx-4 bg-gray-800/50 rounded-lg">
          {categories.map((category) => (
            <TabsTrigger
              key={category.id}
              value={category.id}
              className={cn(
                "text-xs font-bold py-2 rounded-lg transition-all touch-manipulation flex items-center gap-1",
                selectedCategory === category.id
                  ? "bg-gradient-to-r from-yellow-600 to-amber-600 text-white"
                  : "bg-transparent text-gray-400 hover:text-white hover:bg-gray-700",
              )}
            >
              <category.icon className="w-3 h-3" />
              <span className="hidden sm:inline">{category.name}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory} className="flex-1 mt-0">
          <ScrollArea className="h-[calc(100vh-340px)]">
            <div className="p-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {filteredGifts.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <Gift className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                  <p className="text-gray-400">No gifts found</p>
                </div>
              )}

              {filteredGifts.map((gift) => (
                <button
                  key={gift.id}
                  className="group relative aspect-square bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border-2 border-gray-600 hover:border-yellow-500 transition-all hover:scale-105 active:scale-95 touch-manipulation overflow-hidden"
                >
                  {/* Gift Icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-5xl group-hover:scale-110 transition-transform">{gift.icon}</span>
                  </div>

                  {/* For Sale Badge */}
                  {gift.forSale && (
                    <div className="absolute top-2 right-2 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white shadow-lg" />
                  )}

                  {/* Hover Info */}
                  <div className="absolute inset-x-0 bottom-0 bg-black/90 backdrop-blur-sm p-2 translate-y-full group-hover:translate-y-0 transition-transform">
                    <p className="text-xs font-bold text-yellow-400 truncate">{gift.name}</p>
                    <p className="text-[10px] text-gray-400 truncate">From: {gift.from}</p>
                    <p className="text-[10px] text-gray-500">{gift.date}</p>
                  </div>

                  {/* Glow effect on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-yellow-400/0 to-yellow-400/0 group-hover:from-yellow-400/10 group-hover:to-yellow-400/5 transition-all pointer-events-none" />
                </button>
              ))}
            </div>

            {/* Bottom Padding */}
            <div className="h-20" />
          </ScrollArea>
        </TabsContent>
      </Tabs>

      {/* Bottom Action Bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/90 backdrop-blur-sm border-t border-gray-700 p-4">
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1 bg-gray-800 border-gray-600 hover:bg-gray-700 text-white touch-manipulation"
          >
            <ShoppingBag className="w-4 h-4 mr-2" />
            Manage Sales
          </Button>
          <Button className="flex-1 bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-700 hover:to-amber-700 text-white touch-manipulation">
            <Gift className="w-4 h-4 mr-2" />
            Send Gift
          </Button>
        </div>
      </div>
    </div>
  )
}
