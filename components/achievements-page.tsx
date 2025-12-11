"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Trophy, Lock, Star, Flame, Crown, Target, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

interface AchievementsPageProps {
  profile: any
  onClose: () => void
}

export default function AchievementsPage({ profile, onClose }: AchievementsPageProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  // Extended achievements with more details
  const allAchievements = [
    // Unlocked achievements from profile
    ...profile.achievements.map((a: any) => ({ ...a, unlocked: true, progress: 100 })),
    // Locked achievements
    {
      id: "locked1",
      name: "High Roller",
      icon: "💰",
      description: "Win 1M chips in a single hand",
      rarity: "legendary",
      unlocked: false,
      progress: 45,
      total: 100,
      category: "wins",
    },
    {
      id: "locked2",
      name: "Marathon",
      icon: "🏃",
      description: "Play 10,000 hands",
      rarity: "epic",
      unlocked: false,
      progress: 7234,
      total: 10000,
      category: "hands",
    },
    {
      id: "locked3",
      name: "Royal Flush",
      icon: "👑",
      description: "Get a Royal Flush",
      rarity: "legendary",
      unlocked: false,
      progress: 0,
      total: 1,
      category: "special",
    },
    {
      id: "locked4",
      name: "Win Streak",
      icon: "🔥",
      description: "Win 10 hands in a row",
      rarity: "epic",
      unlocked: false,
      progress: 5,
      total: 10,
      category: "streaks",
    },
  ]

  const categories = [
    { id: "all", name: "All", icon: Trophy },
    { id: "wins", name: "Wins", icon: Star },
    { id: "hands", name: "Hands", icon: Target },
    { id: "special", name: "Special", icon: Zap },
    { id: "streaks", name: "Streaks", icon: Flame },
    { id: "vip", name: "VIP", icon: Crown },
  ]

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "border-gray-400 bg-gray-400/10"
      case "rare":
        return "border-blue-500 bg-blue-500/10"
      case "epic":
        return "border-purple-500 bg-purple-500/10"
      case "legendary":
        return "border-yellow-400 bg-yellow-400/10"
      default:
        return "border-gray-400 bg-gray-400/10"
    }
  }

  const getRarityTextColor = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "text-gray-400"
      case "rare":
        return "text-blue-400"
      case "epic":
        return "text-purple-400"
      case "legendary":
        return "text-yellow-400"
      default:
        return "text-gray-400"
    }
  }

  const filteredAchievements = allAchievements.filter(
    (achievement) => selectedCategory === "all" || achievement.category === selectedCategory,
  )

  const unlockedCount = allAchievements.filter((a) => a.unlocked).length
  const totalCount = allAchievements.length
  const completionPercentage = Math.round((unlockedCount / totalCount) * 100)

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
            <h1 className="text-2xl font-bold text-white">Achievements</h1>
            <p className="text-sm text-cyan-400">
              {unlockedCount} / {totalCount} unlocked
            </p>
          </div>
          <div className="w-12" />
        </div>
      </div>

      {/* Progress Card */}
      <div className="p-4">
        <div className="bg-gradient-to-br from-yellow-900/30 to-amber-900/30 rounded-xl p-4 border-2 border-yellow-500/50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-400" />
              <div>
                <p className="text-sm font-bold text-white">Completion</p>
                <p className="text-xs text-gray-400">{completionPercentage}% Complete</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-yellow-400">{unlockedCount}</p>
              <p className="text-xs text-gray-400">of {totalCount}</p>
            </div>
          </div>
          <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-yellow-500 to-amber-500 transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="flex-1 flex flex-col">
        <TabsList className="w-full grid grid-cols-6 p-1 mx-4 bg-gray-800/50 rounded-lg">
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
          <ScrollArea className="h-[calc(100vh-280px)]">
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredAchievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={cn(
                    "relative rounded-xl border-2 p-4 transition-all",
                    getRarityColor(achievement.rarity),
                    achievement.unlocked ? "opacity-100" : "opacity-60",
                  )}
                >
                  {/* Legendary glow */}
                  {achievement.rarity === "legendary" && achievement.unlocked && (
                    <div className="absolute inset-0 bg-yellow-400/20 rounded-xl animate-pulse" />
                  )}

                  <div className="relative z-10 flex gap-4">
                    {/* Icon */}
                    <div className="relative flex-shrink-0">
                      <div
                        className={cn(
                          "w-16 h-16 rounded-xl flex items-center justify-center text-4xl",
                          achievement.unlocked ? "bg-gray-800" : "bg-gray-900",
                        )}
                      >
                        {achievement.unlocked ? achievement.icon : <Lock className="w-6 h-6 text-gray-600" />}
                      </div>

                      {/* Rarity Badge */}
                      <div
                        className={cn(
                          "absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-gray-900",
                          achievement.rarity === "legendary" && "bg-yellow-400",
                          achievement.rarity === "epic" && "bg-purple-400",
                          achievement.rarity === "rare" && "bg-blue-400",
                          achievement.rarity === "common" && "bg-gray-400",
                        )}
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <h3 className={cn("font-bold text-white truncate", achievement.unlocked ? "" : "opacity-50")}>
                          {achievement.name}
                        </h3>
                        {achievement.unlocked && (
                          <Badge
                            className={cn(
                              "ml-2 text-xs border-0 flex-shrink-0",
                              getRarityTextColor(achievement.rarity),
                            )}
                            style={{
                              background:
                                achievement.rarity === "legendary"
                                  ? "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)"
                                  : achievement.rarity === "epic"
                                    ? "linear-gradient(135deg, #a855f7 0%, #9333ea 100%)"
                                    : achievement.rarity === "rare"
                                      ? "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)"
                                      : "linear-gradient(135deg, #6b7280 0%, #4b5563 100%)",
                            }}
                          >
                            {achievement.rarity}
                          </Badge>
                        )}
                      </div>

                      <p className="text-xs text-gray-400 mb-2 line-clamp-2">{achievement.description}</p>

                      {/* Progress Bar for Locked */}
                      {!achievement.unlocked && achievement.progress !== undefined && (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500">Progress</span>
                            <span className="text-gray-400">
                              {achievement.progress} / {achievement.total}
                            </span>
                          </div>
                          <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all"
                              style={{ width: `${(achievement.progress / achievement.total) * 100}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Unlock Date for Unlocked */}
                      {achievement.unlocked && achievement.unlockedAt && (
                        <p className="text-xs text-gray-500 mt-2">Unlocked: {achievement.unlockedAt}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Padding */}
            <div className="h-20" />
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  )
}
