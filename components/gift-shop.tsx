"use client"

import { useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Gift, Heart, Sparkles, Trophy, Search, ShoppingCart } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Gift as GiftType } from "@/types/gift"

interface GiftShopProps {
  onSelectGift: (gift: GiftType) => void
  playerChips: number
}

export default function GiftShop({ onSelectGift, playerChips }: GiftShopProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  const gifts: GiftType[] = [
    // Fun Category
    {
      id: "1",
      name: "Coffee",
      icon: "☕",
      description: "A warm cup of coffee",
      price: 100,
      category: "fun",
      rarity: "common",
    },
    { id: "2", name: "Donut", icon: "🍩", description: "Sweet treat", price: 150, category: "fun", rarity: "common" },
    {
      id: "3",
      name: "Pizza",
      icon: "🍕",
      description: "Everyone loves pizza",
      price: 250,
      category: "fun",
      rarity: "common",
    },
    { id: "4", name: "Beer", icon: "🍺", description: "Cheers!", price: 300, category: "fun", rarity: "common" },
    { id: "5", name: "Taco", icon: "🌮", description: "Taco Tuesday", price: 200, category: "fun", rarity: "common" },
    {
      id: "6",
      name: "Sushi",
      icon: "🍣",
      description: "Fresh and delicious",
      price: 400,
      category: "fun",
      rarity: "rare",
    },

    // Romantic Category
    {
      id: "7",
      name: "Rose",
      icon: "🌹",
      description: "Classic romance",
      price: 500,
      category: "romantic",
      rarity: "common",
    },
    {
      id: "8",
      name: "Bouquet",
      icon: "💐",
      description: "Beautiful flowers",
      price: 1000,
      category: "romantic",
      rarity: "rare",
    },
    {
      id: "9",
      name: "Chocolate",
      icon: "🍫",
      description: "Sweet gesture",
      price: 800,
      category: "romantic",
      rarity: "common",
    },
    {
      id: "10",
      name: "Love Letter",
      icon: "💌",
      description: "From the heart",
      price: 1500,
      category: "romantic",
      rarity: "rare",
    },
    {
      id: "11",
      name: "Diamond Ring",
      icon: "💍",
      description: "Ultimate commitment",
      price: 50000,
      category: "romantic",
      rarity: "legendary",
    },
    { id: "12", name: "Heart", icon: "❤️", description: "Pure love", price: 2000, category: "romantic", rarity: "epic" },

    // Luxury Category
    {
      id: "13",
      name: "Champagne",
      icon: "🍾",
      description: "Celebrate in style",
      price: 5000,
      category: "luxury",
      rarity: "epic",
    },
    {
      id: "14",
      name: "Sports Car",
      icon: "🏎️",
      description: "Fast and furious",
      price: 100000,
      category: "luxury",
      rarity: "legendary",
    },
    {
      id: "15",
      name: "Yacht",
      icon: "🛥️",
      description: "Sail in luxury",
      price: 500000,
      category: "luxury",
      rarity: "legendary",
    },
    {
      id: "16",
      name: "Private Jet",
      icon: "🛩️",
      description: "Fly first class",
      price: 1000000,
      category: "luxury",
      rarity: "legendary",
    },
    {
      id: "17",
      name: "Crown",
      icon: "👑",
      description: "Royal treatment",
      price: 75000,
      category: "luxury",
      rarity: "legendary",
    },
    {
      id: "18",
      name: "Diamond",
      icon: "💎",
      description: "Precious gem",
      price: 25000,
      category: "luxury",
      rarity: "epic",
    },

    // Celebration Category
    {
      id: "19",
      name: "Trophy",
      icon: "🏆",
      description: "You're a winner",
      price: 3000,
      category: "celebration",
      rarity: "rare",
    },
    {
      id: "20",
      name: "Medal",
      icon: "🏅",
      description: "Award of honor",
      price: 2500,
      category: "celebration",
      rarity: "rare",
    },
    {
      id: "21",
      name: "Party Popper",
      icon: "🎉",
      description: "Let's celebrate",
      price: 1000,
      category: "celebration",
      rarity: "common",
    },
    {
      id: "22",
      name: "Fireworks",
      icon: "🎆",
      description: "Spectacular show",
      price: 10000,
      category: "celebration",
      rarity: "epic",
    },
    {
      id: "23",
      name: "Balloon",
      icon: "🎈",
      description: "Party time",
      price: 500,
      category: "celebration",
      rarity: "common",
    },
    {
      id: "24",
      name: "Cake",
      icon: "🎂",
      description: "Sweet celebration",
      price: 1200,
      category: "celebration",
      rarity: "common",
    },
  ]

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "text-gray-400 border-gray-400"
      case "rare":
        return "text-blue-400 border-blue-400"
      case "epic":
        return "text-purple-400 border-purple-400"
      case "legendary":
        return "text-yellow-400 border-yellow-400"
      default:
        return "text-gray-400 border-gray-400"
    }
  }

  const formatPrice = (price: number) => {
    if (price >= 1000000) return `${(price / 1000000).toFixed(1)}M`
    if (price >= 1000) return `${(price / 1000).toFixed(1)}K`
    return price.toString()
  }

  const filteredGifts = gifts.filter((gift) => {
    const matchesSearch = gift.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || gift.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const canAfford = (price: number) => playerChips >= price

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border bg-card/50">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold text-foreground">Gift Shop</h2>
          <div className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-full">
            <ShoppingCart className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-bold text-foreground">{formatPrice(playerChips)}</span>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search gifts..."
            className="pl-10"
          />
        </div>
      </div>

      {/* Categories */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="flex-1 flex flex-col">
        <TabsList className="w-full grid grid-cols-5 p-2 bg-muted/50">
          <TabsTrigger value="all" className="text-xs">
            All
          </TabsTrigger>
          <TabsTrigger value="fun" className="text-xs">
            <Gift className="w-3 h-3 mr-1" />
            Fun
          </TabsTrigger>
          <TabsTrigger value="romantic" className="text-xs">
            <Heart className="w-3 h-3 mr-1" />
            Love
          </TabsTrigger>
          <TabsTrigger value="luxury" className="text-xs">
            <Sparkles className="w-3 h-3 mr-1" />
            Luxury
          </TabsTrigger>
          <TabsTrigger value="celebration" className="text-xs">
            <Trophy className="w-3 h-3 mr-1" />
            Party
          </TabsTrigger>
        </TabsList>

        <TabsContent value={selectedCategory} className="flex-1 mt-0">
          <ScrollArea className="h-[450px]">
            <div className="grid grid-cols-3 gap-3 p-4">
              {filteredGifts.map((gift) => {
                const affordable = canAfford(gift.price)
                return (
                  <button
                    key={gift.id}
                    onClick={() => affordable && onSelectGift(gift)}
                    disabled={!affordable}
                    className={cn(
                      "relative aspect-square rounded-xl border-2 transition-all",
                      "flex flex-col items-center justify-center p-2",
                      "hover:scale-105 active:scale-95",
                      affordable
                        ? "bg-card hover:bg-accent cursor-pointer"
                        : "bg-muted/50 opacity-50 cursor-not-allowed",
                      getRarityColor(gift.rarity),
                    )}
                  >
                    {/* Legendary glow */}
                    {gift.rarity === "legendary" && (
                      <div className="absolute inset-0 bg-yellow-400/10 rounded-xl animate-pulse" />
                    )}

                    {/* Gift Icon */}
                    <div className="text-4xl mb-1 relative z-10">{gift.icon}</div>

                    {/* Gift Name */}
                    <p className="text-[10px] font-semibold text-center text-foreground mb-1 relative z-10 line-clamp-1">
                      {gift.name}
                    </p>

                    {/* Price */}
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 relative z-10">
                      ${formatPrice(gift.price)}
                    </Badge>

                    {/* Rarity indicator */}
                    <div
                      className={cn(
                        "absolute top-1 right-1 w-2 h-2 rounded-full",
                        gift.rarity === "legendary" && "bg-yellow-400",
                        gift.rarity === "epic" && "bg-purple-400",
                        gift.rarity === "rare" && "bg-blue-400",
                        gift.rarity === "common" && "bg-gray-400",
                      )}
                    />
                  </button>
                )
              })}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      {/* Info Footer */}
      <div className="p-3 border-t border-border bg-muted/30">
        <div className="flex items-center justify-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full" />
            <span className="text-muted-foreground">Common</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-blue-400 rounded-full" />
            <span className="text-muted-foreground">Rare</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-purple-400 rounded-full" />
            <span className="text-muted-foreground">Epic</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-yellow-400 rounded-full" />
            <span className="text-muted-foreground">Legendary</span>
          </div>
        </div>
      </div>
    </div>
  )
}
