"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Camera, Zap, Edit2, ChevronRight, Trophy, CheckCircle, Crown, Check, X } from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import StatsDashboard from "./stats-dashboard"
import AchievementsPage from "./achievements-page"
import GiftsPage from "./gifts-page"

interface UserProfileProps {
  profile: any
  isOwnProfile?: boolean
  onClose?: () => void
}

export default function UserProfile({ profile, isOwnProfile = true, onClose }: UserProfileProps) {
  const [activeTab, setActiveTab] = useState<"stats" | "achievements" | "fans" | "gifts">("stats")
  const [showFullStats, setShowFullStats] = useState(false)
  const [showAchievements, setShowAchievements] = useState(false)
  const [showGifts, setShowGifts] = useState(false)
  const [isEditingBio, setIsEditingBio] = useState(false)
  const [bioText, setBioText] = useState(profile.bio || "")

  const formatNumber = (num: number): string => {
    if (num >= 1000000000) {
      return `${(num / 1000000000).toFixed(2)}B`
    } else if (num >= 1000000) {
      return `${(num / 1000000).toFixed(2)}M`
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(2)}K`
    }
    return num.toString()
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "border-gray-400"
      case "rare":
        return "border-blue-500"
      case "epic":
        return "border-purple-500"
      case "legendary":
        return "border-yellow-500"
      default:
        return "border-gray-400"
    }
  }

  const handleSaveBio = () => {
    profile.bio = bioText
    setIsEditingBio(false)
  }

  const handleCancelBio = () => {
    setBioText(profile.bio || "")
    setIsEditingBio(false)
  }

  if (showFullStats) {
    return <StatsDashboard onClose={() => setShowFullStats(false)} />
  }

  if (showAchievements) {
    return <AchievementsPage profile={profile} onClose={() => setShowAchievements(false)} />
  }

  if (showGifts) {
    return <GiftsPage profile={profile} onClose={() => setShowGifts(false)} />
  }

  return (
    <div className="relative w-full h-[100dvh] bg-gradient-to-b from-background via-card to-background overflow-hidden">
      {/* Header */}
      <div className="relative z-20 bg-card/60 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between p-3 md:p-4">
          <Button variant="ghost" size="icon" onClick={onClose} className="text-foreground hover:bg-muted">
            <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" />
          </Button>
          <h1 className="text-lg md:text-2xl font-bold text-foreground">My profile</h1>
          <div className="w-9 md:w-10" />
        </div>
      </div>

      <ScrollArea className="h-[calc(100vh-56px)] md:h-[calc(100vh-64px)]">
        <div className="p-3 md:p-4 space-y-3 md:space-y-4 bg-primary">
          {/* Profile ID */}
          <p className="text-xs md:text-sm text-secondary">ID: {profile.id}</p>

          {/* Profile Header Card */}
          <div className="backdrop-blur-sm rounded-xl md:rounded-2xl border border-border p-3 md:p-4 bg-slate-400 shadow-md">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 md:gap-4">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full overflow-hidden border-4 border-chart-1 shadow-lg">
                  {profile.avatar ? (
                    <Image
                      src={profile.avatar || "/placeholder.svg"}
                      alt={profile.name}
                      width={112}
                      height={112}
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-2xl md:text-3xl font-bold shadow-xl">
                      {profile.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 w-full min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                      <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-chart-4 truncate">{profile.name}</h2>
                      {profile.isVerified && (
                        <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-chart-2 flex-shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center justify-center sm:justify-start gap-2 text-xs md:text-sm text-foreground mb-2">
                      <span>🇺🇸 {profile.country}</span>
                      <span>💬 {profile.language}</span>
                    </div>
                    <div className="flex items-center justify-center sm:justify-start gap-2 mb-2 flex-wrap">
                      <Badge className="bg-chart-4 text-chart-4-foreground border-0 text-xs">
                        <Crown className="w-3 h-3 mr-1" />
                        VIP{profile.vipLevel}
                      </Badge>
                      <span className="text-xs md:text-sm font-bold text-foreground">lv.{profile.level}</span>
                      <div className="flex-1 min-w-[80px] max-w-[120px] h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-chart-2 to-chart-3"
                          style={{ width: `${profile.levelProgress}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-center sm:justify-start gap-1 text-chart-4 font-bold">
                      <Trophy className="w-4 h-4" />
                      <span className="text-base md:text-lg">{formatNumber(profile.chips)}</span>
                    </div>
                  </div>

                  {isOwnProfile && (
                    <div className="flex sm:flex-col gap-2">
                      <Button size="icon" variant="secondary" className="w-8 h-8 sm:w-10 sm:h-10 rounded-full">
                        <Camera className="w-4 h-4 sm:w-5 sm:h-5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="secondary"
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-chart-4 text-chart-4-foreground"
                      >
                        <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="mt-3 md:mt-4">
              {isEditingBio ? (
                <div className="space-y-2">
                  <textarea
                    value={bioText}
                    onChange={(e) => setBioText(e.target.value)}
                    placeholder="Tell others about yourself..."
                    className="w-full bg-muted text-foreground text-xs md:text-sm rounded-lg p-2 md:p-3 focus:border-chart-1 focus:outline-none resize-none border-slate-500 border-2 shadow-md"
                    rows={3}
                    maxLength={150}
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{bioText.length}/150</span>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleCancelBio}
                        className="text-muted-foreground hover:text-foreground hover:bg-muted text-xs h-8"
                      >
                        <X className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                        Cancel
                      </Button>
                      <Button size="sm" onClick={handleSaveBio} className="text-xs h-8">
                        <Check className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                        Save
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-2 text-muted-foreground text-xs md:text-sm">
                  {isOwnProfile && (
                    <button
                      onClick={() => setIsEditingBio(true)}
                      className="text-chart-1 hover:text-chart-1/80 transition-colors"
                      aria-label="Edit bio"
                    >
                      <Edit2 className="w-3.5 h-3.5 md:w-4 md:h-4 mt-0.5 flex-shrink-0" />
                    </button>
                  )}
                  {!isOwnProfile && <Edit2 className="w-3.5 h-3.5 md:w-4 md:h-4 mt-0.5 flex-shrink-0" />}
                  <p className="italic">{profile.bio || "This player did not enter any info."}</p>
                </div>
              )}
            </div>
          </div>

          {/* Stats Section */}
          <button
            onClick={() => {
              setShowFullStats(true)
            }}
            className="w-full backdrop-blur-sm rounded-xl md:rounded-2xl border border-border p-3 md:p-4 hover:bg-card/90 transition-colors cursor-pointer bg-[rgba(144,161,185,1)]"
          >
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <h3 className="text-base md:text-lg font-bold text-foreground">Data</h3>
              <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground" />
            </div>
            <div className="grid grid-cols-3 gap-2 md:gap-4">
              <div className="text-center">
                <p className="text-[10px] md:text-xs text-muted-foreground mb-1">Total Hands</p>
                <p className="text-lg md:text-2xl font-bold text-chart-2">{formatNumber(profile.stats.totalHands)}</p>
              </div>
              <div className="text-center border-x border-border">
                <p className="text-[10px] md:text-xs text-muted-foreground mb-1">Hand Max Profit</p>
                <p className="text-lg md:text-2xl font-bold text-chart-2">{formatNumber(profile.stats.maxProfit)}</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] md:text-xs text-muted-foreground mb-1">Win Rate</p>
                <p className="text-lg md:text-2xl font-bold text-chart-2">{profile.stats.winRate}%</p>
              </div>
            </div>
          </button>

          {/* Achievements Section */}
          <button
            onClick={() => setShowAchievements(true)}
            className="w-full backdrop-blur-sm rounded-xl md:rounded-2xl border border-border p-3 md:p-4 hover:bg-card/90 transition-colors cursor-pointer bg-[rgba(144,161,185,1)]"
          >
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <h3 className="text-base md:text-lg font-bold text-foreground">Achievements</h3>
              <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground" />
            </div>
            <div className="grid grid-cols-4 gap-2 md:gap-3">
              {profile.achievements.slice(0, 8).map((achievement) => (
                <div key={achievement.id} className="relative">
                  <div
                    className={cn(
                      "aspect-square bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border-2 flex flex-col items-center justify-center p-1.5 md:p-2 relative overflow-hidden",
                      getRarityColor(achievement.rarity),
                    )}
                  >
                    {achievement.rarity === "legendary" && (
                      <div className="absolute inset-0 bg-yellow-400/20 animate-pulse" />
                    )}
                    <div className="relative z-10 text-2xl md:text-3xl mb-0.5 md:mb-1">{achievement.icon}</div>
                    <div className="relative z-10 w-full bg-yellow-600 text-white text-[8px] md:text-[10px] font-bold text-center py-0.5 px-0.5 md:px-1 rounded">
                      {achievement.name}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </button>

          {/* Big Fans Section */}
          <div className="bg-card/80 backdrop-blur-sm rounded-xl md:rounded-2xl border border-border p-3 md:p-4">
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <div className="flex items-center gap-2">
                <h3 className="text-base md:text-lg font-bold text-foreground">Big fans</h3>
                <div className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-gray-700 flex items-center justify-center text-[10px] md:text-xs text-gray-300">
                  ?
                </div>
              </div>
              <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground" />
            </div>
            <div className="grid grid-cols-3 gap-2 md:gap-4">
              {profile.bigFans.slice(0, 3).map((fan) => (
                <div key={fan.id} className="text-center">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 mx-auto mb-1.5 md:mb-2 rounded-full overflow-hidden border-2 border-purple-500">
                    {fan.avatar ? (
                      <Image
                        src={fan.avatar || "/placeholder.svg"}
                        alt={fan.name}
                        width={80}
                        height={80}
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-lg md:text-xl font-bold">
                        {fan.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <p className="text-[10px] md:text-xs font-semibold text-yellow-400 truncate mb-0.5 md:mb-1">
                    {fan.name}
                  </p>
                  <p className="text-[10px] md:text-xs font-bold text-white">{formatNumber(fan.chips)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Gifts Section */}
          <button
            onClick={() => setShowGifts(true)}
            className="w-full bg-card/80 backdrop-blur-sm rounded-xl md:rounded-2xl border border-border p-3 md:p-4 mb-16 md:mb-20 hover:bg-card/90 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <h3 className="text-base md:text-lg font-bold text-foreground">
                Gifts received ({profile.giftsReceived.filter((g) => g.forSale).length} gifts for sale)
              </h3>
              <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground" />
            </div>
            <div className="grid grid-cols-5 gap-2 md:gap-3">
              {profile.giftsReceived.slice(0, 10).map((gift) => (
                <div
                  key={gift.id}
                  className="aspect-square bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border border-input flex items-center justify-center text-2xl md:text-3xl relative"
                >
                  {gift.icon}
                  {gift.forSale && (
                    <div className="absolute top-0.5 right-0.5 md:top-1 md:right-1 w-1.5 h-1.5 md:w-2 md:h-2 bg-green-500 rounded-full border border-white" />
                  )}
                </div>
              ))}
            </div>
          </button>
        </div>
      </ScrollArea>
    </div>
  )
}
