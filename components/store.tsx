"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, HelpCircle, Sparkles, Crown } from "lucide-react"
import { cn } from "@/lib/utils"
import type { CoinPackage, DiamondPackage } from "@/types/store"

interface StoreProps {
  onClose: () => void
  playerChips: number
  playerDiamonds: number
}

export default function Store({ onClose, playerChips, playerDiamonds }: StoreProps) {
  const [selectedTab, setSelectedTab] = useState<"coins" | "diamonds" | "subscription">("coins")

  const formatNumber = (num: number): string => {
    if (num >= 1000000000) {
      return num.toLocaleString()
    } else if (num >= 1000000) {
      return num.toLocaleString()
    }
    return num.toLocaleString()
  }

  const coinPackages: CoinPackage[] = [
    {
      id: "mega",
      baseAmount: 1500000000,
      bonusPercentage: 157,
      totalAmount: 3850000000,
      bonusTickets: 12,
      price: 99.99,
      bestValue: true,
    },
    {
      id: "super",
      baseAmount: 750000000,
      bonusPercentage: 124,
      totalAmount: 1680000000,
      bonusTickets: 6,
      price: 49.99,
      popular: true,
    },
    {
      id: "large",
      baseAmount: 525000000,
      bonusPercentage: 100,
      totalAmount: 1050000000,
      bonusTickets: 4,
      price: 35.99,
    },
    {
      id: "medium",
      baseAmount: 305000000,
      bonusPercentage: 70,
      totalAmount: 535000000,
      bonusTickets: 2,
      price: 19.99,
    },
    {
      id: "small",
      baseAmount: 155000000,
      bonusPercentage: 47,
      totalAmount: 220000000,
      bonusTickets: 1,
      price: 9.99,
    },
    {
      id: "starter",
      baseAmount: 75000000,
      bonusPercentage: 20,
      totalAmount: 90000000,
      bonusTickets: 5,
      price: 4.99,
    },
    {
      id: "mini",
      baseAmount: 30000000,
      bonusPercentage: 0,
      totalAmount: 30000000,
      bonusTickets: 2,
      price: 1.99,
    },
  ]

  const diamondPackages: DiamondPackage[] = [
    { id: "d1", amount: 14000, bonusPercentage: 100, price: 99.99 },
    { id: "d2", amount: 6000, bonusPercentage: 50, price: 49.99, popular: true },
    { id: "d3", amount: 3200, bonusPercentage: 25, price: 24.99 },
    { id: "d4", amount: 1200, bonusPercentage: 20, price: 9.99 },
    { id: "d5", amount: 600, bonusPercentage: 0, price: 4.99 },
    { id: "d6", amount: 120, bonusPercentage: 0, price: 0.99 },
  ]

  return (
    <div className="relative w-full h-[100dvh] bg-gradient-to-b from-background to-background/80 overflow-hidden">
      {/* Header */}
      <div className="relative z-20 bg-background/90 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between p-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="w-14 h-14 rounded-full border-2 border-foreground/50 text-foreground hover:bg-foreground/10 touch-manipulation"
          >
            <ArrowLeft className="w-7 h-7" />
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Store</h1>
          <Button
            variant="ghost"
            size="icon"
            className="w-14 h-14 rounded-full border-2 border-foreground/50 text-foreground touch-manipulation"
          >
            <HelpCircle className="w-7 h-7" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={(v) => setSelectedTab(v as any)} className="flex-1 flex flex-col">
        <TabsList className="w-full grid grid-cols-3 p-1 bg-transparent border-b border-border">
          <TabsTrigger
            value="coins"
            className={cn(
              "text-base md:text-lg font-bold py-4 rounded-lg transition-all touch-manipulation",
              selectedTab === "coins"
                ? "bg-card text-foreground"
                : "bg-transparent text-muted-foreground hover:text-foreground hover:bg-card/50",
            )}
          >
            Coins
          </TabsTrigger>
          <TabsTrigger
            value="diamonds"
            className={cn(
              "text-base md:text-lg font-bold py-4 rounded-lg transition-all touch-manipulation",
              selectedTab === "diamonds"
                ? "bg-card text-foreground"
                : "bg-transparent text-muted-foreground hover:text-foreground hover:bg-card/50",
            )}
          >
            Diamonds
          </TabsTrigger>
          <TabsTrigger
            value="subscription"
            className={cn(
              "text-base md:text-lg font-bold py-4 rounded-lg transition-all touch-manipulation",
              selectedTab === "subscription"
                ? "bg-card text-foreground"
                : "bg-transparent text-muted-foreground hover:text-foreground hover:bg-card/50",
            )}
          >
            Subscription
          </TabsTrigger>
        </TabsList>

        {/* Coins Tab */}
        <TabsContent value="coins" className="flex-1 mt-0">
          <ScrollArea className="h-[calc(100vh-140px)]">
            <div className="p-4 space-y-3">
              {/* Balance Display */}
              <div className="bg-gradient-to-r from-card to-card/80 rounded-2xl p-3 border-2 border-border flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="text-4xl md:text-5xl">💰</div>
                  <span className="text-2xl md:text-3xl font-bold text-chart-4">{formatNumber(playerChips)}</span>
                </div>
              </div>

              {/* Piggy Bank */}
              <div className="relative bg-gradient-to-br from-chart-4/20 to-chart-5/20 rounded-2xl p-3 border-2 border-chart-4/30 overflow-hidden mb-4">
                <div className="absolute top-0 right-0 w-32 h-32 bg-chart-4/10 rounded-full blur-3xl" />
                <div className="relative flex items-center justify-between">
                  <div>
                    <p className="text-sm md:text-sm text-chart-4/80 mb-1">Save up to</p>
                    <p className="text-lg md:text-xl font-bold text-foreground">PIGGY BANK</p>
                  </div>
                  <div className="text-5xl md:text-6xl">🐷</div>
                </div>
              </div>

              {/* Coin Packages */}
              <div className="space-y-3">
                {coinPackages.map((pkg, index) => (
                  <div
                    key={pkg.id}
                    className={cn(
                      "relative bg-gradient-to-br from-card to-card/50 rounded-2xl p-2.5 border-2 transition-all active:scale-98",
                      pkg.bestValue
                        ? "border-chart-4 ring-2 ring-chart-4/50"
                        : pkg.popular
                          ? "border-chart-2 ring-2 ring-chart-2/50"
                          : "border-border",
                    )}
                  >
                    {pkg.bestValue && (
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-10">
                        <Badge className="bg-chart-4 text-primary border-0 px-3 py-1.5 text-xs font-bold">
                          <Crown className="w-3 h-3 mr-1" />
                          BEST VALUE
                        </Badge>
                      </div>
                    )}

                    {pkg.popular && (
                      <div className="absolute -top-2 -right-2 z-10">
                        <Badge className="bg-chart-2 text-primary border-0 px-3 py-1">
                          <Sparkles className="w-3 h-3 mr-1" />
                          POPULAR
                        </Badge>
                      </div>
                    )}

                    <div className="flex items-center gap-3 pt-2">
                      <div className="relative w-16 h-16 md:w-18 md:h-18 flex-shrink-0">
                        <div className="absolute inset-0 bg-chart-4/20 rounded-full blur-xl" />
                        <div className="relative text-5xl md:text-5xl flex items-center justify-center">
                          {index === 0 ? "💰" : index === 1 ? "🪙" : index === 2 ? "💵" : "🟡"}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2 mb-1">
                          <span className="text-sm md:text-base text-muted-foreground line-through">
                            {formatNumber(pkg.baseAmount)}
                          </span>
                          {pkg.bonusPercentage > 0 && (
                            <span className="text-sm font-bold text-chart-5">+{pkg.bonusPercentage}%</span>
                          )}
                        </div>
                        <p className="text-xl md:text-2xl font-bold text-chart-2 mb-2">
                          {formatNumber(pkg.totalAmount)}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] md:text-xs font-bold text-chart-2">Bonus</span>
                          <span className="text-base md:text-lg">🎫</span>
                          <span className="text-[10px] md:text-xs font-bold text-foreground">x{pkg.bonusTickets}</span>
                        </div>
                      </div>

                      <Button
                        size="lg"
                        className="bg-chart-2 hover:bg-chart-2/90 text-primary font-bold text-base md:text-lg px-4 md:px-5 py-5 md:py-5 rounded-2xl shadow-lg touch-manipulation min-w-[80px]"
                      >
                        ${pkg.price.toFixed(2)}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="h-16" />
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Diamonds Tab */}
        <TabsContent value="diamonds" className="flex-1 mt-0">
          <ScrollArea className="h-[calc(100vh-140px)]">
            <div className="p-4 space-y-4">
              {/* Balance Display */}
              <div className="bg-gradient-to-r from-cyan-900 to-blue-900 rounded-xl p-4 border-2 border-cyan-600 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-5xl">💎</div>
                  <span className="text-3xl font-bold text-cyan-400">{playerDiamonds}</span>
                </div>
              </div>

              {/* Diamond Packages */}
              <div className="space-y-3">
                {diamondPackages.map((pkg, index) => (
                  <div
                    key={pkg.id}
                    className={cn(
                      "relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 border-2 transition-all hover:scale-[1.02]",
                      pkg.popular ? "border-purple-500 ring-2 ring-purple-400/50" : "border-gray-700",
                    )}
                  >
                    {pkg.popular && (
                      <div className="absolute -top-2 -right-2 z-10">
                        <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 px-3 py-1">
                          <Sparkles className="w-3 h-3 mr-1" />
                          POPULAR
                        </Badge>
                      </div>
                    )}

                    <div className="flex items-center gap-4">
                      {/* Diamond Image */}
                      <div className="relative w-20 h-20 flex-shrink-0">
                        <div className="absolute inset-0 bg-cyan-400/20 rounded-full blur-lg" />
                        <div className="relative text-6xl">💎</div>
                      </div>

                      {/* Package Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-3xl font-bold text-cyan-400 mb-2">{pkg.amount.toLocaleString()}</p>
                        {pkg.bonusPercentage && (
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-orange-400 font-bold">+{pkg.bonusPercentage}% Bonus</span>
                          </div>
                        )}
                      </div>

                      {/* Price Button */}
                      <Button
                        size="lg"
                        className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold text-xl px-6 py-6 rounded-xl shadow-lg"
                      >
                        ${pkg.price.toFixed(2)}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom Padding */}
              <div className="h-8" />
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Subscription Tab */}
        <TabsContent value="subscription" className="flex-1 mt-0">
          <ScrollArea className="h-[calc(100vh-140px)]">
            <div className="p-4 space-y-4">
              {/* VIP Subscription */}
              <div className="relative bg-gradient-to-br from-yellow-900/50 to-orange-900/50 rounded-xl p-6 border-2 border-yellow-600 overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-yellow-400/10 rounded-full blur-3xl" />
                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <Crown className="w-8 h-8 text-yellow-400" />
                    <h3 className="text-2xl font-bold text-white">VIP Premium</h3>
                  </div>
                  <ul className="space-y-2 mb-6">
                    <li className="text-white flex items-center gap-2">
                      <span className="text-green-400">✓</span>
                      Daily bonus chips x2
                    </li>
                    <li className="text-white flex items-center gap-2">
                      <span className="text-green-400">✓</span>
                      Exclusive VIP tables
                    </li>
                    <li className="text-white flex items-center gap-2">
                      <span className="text-green-400">✓</span>
                      Priority support
                    </li>
                    <li className="text-white flex items-center gap-2">
                      <span className="text-green-400">✓</span>
                      Special gifts & rewards
                    </li>
                  </ul>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-3xl font-bold text-white">$9.99</p>
                      <p className="text-sm text-gray-300">per month</p>
                    </div>
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold px-8 py-6 rounded-xl shadow-lg"
                    >
                      Subscribe
                    </Button>
                  </div>
                </div>
              </div>

              {/* Bottom Padding */}
              <div className="h-8" />
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  )
}
