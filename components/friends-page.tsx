"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Search,
  UserPlus,
  MessageCircle,
  Gift,
  Users,
  Clock,
  Trophy,
  Crown,
  Check,
  X,
  MoreVertical,
  Mail,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { Friend, FriendRequest } from "@/types/friends"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface FriendsPageProps {
  onClose: () => void
}

export default function FriendsPage({ onClose }: FriendsPageProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTab, setSelectedTab] = useState<"friends" | "requests" | "search">("friends")

  // Mock data - in a real app, this would come from the backend
  const mockFriends: Friend[] = [
    {
      id: "1",
      name: "Sarah Johnson",
      level: 45,
      chips: 15000000,
      isOnline: true,
      status: "playing",
      currentTable: "High Stakes Table",
      vipLevel: 2,
      country: "USA",
    },
    {
      id: "2",
      name: "Mike Chen",
      level: 62,
      chips: 48000000,
      isOnline: true,
      status: "idle",
      vipLevel: 3,
      country: "Canada",
    },
    {
      id: "3",
      name: "Emma Wilson",
      level: 38,
      chips: 8500000,
      isOnline: false,
      lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000),
      vipLevel: 1,
      country: "UK",
    },
    {
      id: "4",
      name: "Alex Rodriguez",
      level: 71,
      chips: 125000000,
      isOnline: true,
      status: "playing",
      currentTable: "VIP Room",
      vipLevel: 4,
      country: "Spain",
    },
    {
      id: "5",
      name: "Lisa Kim",
      level: 29,
      chips: 3200000,
      isOnline: false,
      lastSeen: new Date(Date.now() - 24 * 60 * 60 * 1000),
      vipLevel: 0,
      country: "South Korea",
    },
  ]

  const mockRequests: FriendRequest[] = [
    {
      id: "r1",
      from: {
        id: "u1",
        name: "John Smith",
        level: 34,
        chips: 5600000,
        isOnline: true,
        vipLevel: 1,
        country: "USA",
      },
      to: { id: "local", name: "You", level: 98, chips: 302480000, isOnline: true, vipLevel: 3, country: "USA" },
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
      status: "pending",
    },
    {
      id: "r2",
      from: {
        id: "u2",
        name: "Maria Garcia",
        level: 51,
        chips: 18000000,
        isOnline: false,
        vipLevel: 2,
        country: "Mexico",
      },
      to: { id: "local", name: "You", level: 98, chips: 302480000, isOnline: true, vipLevel: 3, country: "USA" },
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
      status: "pending",
    },
  ]

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

  const getTimeAgo = (date: Date): string => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000)

    if (seconds < 60) return "just now"
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }

  const filteredFriends = mockFriends.filter((friend) => friend.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const onlineFriends = mockFriends.filter((f) => f.isOnline).length

  return (
    <div className="relative w-full h-[100dvh] bg-gradient-to-b from-gray-900 to-black overflow-hidden">
      {/* Header */}
      <div className="relative z-20 bg-black/90 backdrop-blur-sm border-b border-gray-700">
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
            <h1 className="text-2xl font-bold text-white">Friends</h1>
            <p className="text-sm text-cyan-400">
              {onlineFriends} / {mockFriends.length} online
            </p>
          </div>
          <div className="w-12" />
        </div>

        {/* Search Bar */}
        <div className="px-4 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search friends..."
              className="pl-10 bg-gray-800 border-gray-600 text-white placeholder:text-gray-400"
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={(v) => setSelectedTab(v as any)} className="flex-1 flex flex-col">
        <TabsList className="w-full grid grid-cols-3 p-1 bg-transparent border-b border-gray-700">
          <TabsTrigger
            value="friends"
            className={cn(
              "text-base font-bold py-3 rounded-lg transition-all touch-manipulation relative",
              selectedTab === "friends"
                ? "bg-gray-700 text-white"
                : "bg-transparent text-gray-400 hover:text-white hover:bg-gray-800",
            )}
          >
            <Users className="w-4 h-4 mr-2" />
            Friends
          </TabsTrigger>
          <TabsTrigger
            value="requests"
            className={cn(
              "text-base font-bold py-3 rounded-lg transition-all touch-manipulation relative",
              selectedTab === "requests"
                ? "bg-gray-700 text-white"
                : "bg-transparent text-gray-400 hover:text-white hover:bg-gray-800",
            )}
          >
            <Mail className="w-4 h-4 mr-2" />
            Requests
            {mockRequests.length > 0 && (
              <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 min-w-[20px] h-5">
                {mockRequests.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="search"
            className={cn(
              "text-base font-bold py-3 rounded-lg transition-all touch-manipulation",
              selectedTab === "search"
                ? "bg-gray-700 text-white"
                : "bg-transparent text-gray-400 hover:text-white hover:bg-gray-800",
            )}
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Add
          </TabsTrigger>
        </TabsList>

        {/* Friends List */}
        <TabsContent value="friends" className="flex-1 mt-0">
          <ScrollArea className="h-[calc(100vh-220px)]">
            <div className="p-4 space-y-3">
              {filteredFriends.length === 0 && (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                  <p className="text-gray-400">No friends found</p>
                </div>
              )}

              {filteredFriends.map((friend) => (
                <div
                  key={friend.id}
                  className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 border-2 border-gray-700"
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="relative">
                      <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-purple-500">
                        {friend.avatar ? (
                          <img
                            src={friend.avatar || "/placeholder.svg"}
                            alt={friend.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-xl font-bold">
                            {friend.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>

                      {/* Online Status */}
                      <div
                        className={cn(
                          "absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-gray-900",
                          friend.isOnline ? "bg-green-500" : "bg-gray-600",
                        )}
                      />
                    </div>

                    {/* Friend Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-white truncate">{friend.name}</h3>
                        {friend.vipLevel > 0 && (
                          <Badge className="bg-yellow-600 text-white border-0 text-xs">
                            <Crown className="w-3 h-3 mr-1" />
                            VIP{friend.vipLevel}
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                        <Trophy className="w-4 h-4 text-yellow-400" />
                        <span>Lv.{friend.level}</span>
                        <span className="text-gray-600">•</span>
                        <span className="text-cyan-400">{formatNumber(friend.chips)}</span>
                      </div>

                      {friend.isOnline ? (
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                          {friend.status === "playing" && friend.currentTable ? (
                            <span className="text-xs text-green-400">Playing: {friend.currentTable}</span>
                          ) : (
                            <span className="text-xs text-green-400">Online</span>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          {friend.lastSeen && <span>Last seen {getTimeAgo(friend.lastSeen)}</span>}
                        </div>
                      )}
                    </div>

                    {/* Actions Menu */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-8 h-8 rounded-full hover:bg-gray-700 touch-manipulation"
                        >
                          <MoreVertical className="w-4 h-4 text-gray-400" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                          <MessageCircle className="w-4 h-4" />
                          <span>Send Message</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                          <Gift className="w-4 h-4" />
                          <span>Send Gift</span>
                        </DropdownMenuItem>
                        {friend.isOnline && friend.status !== "playing" && (
                          <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                            <Users className="w-4 h-4" />
                            <span>Invite to Game</span>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem className="flex items-center gap-2 cursor-pointer text-destructive">
                          <X className="w-4 h-4" />
                          <span>Remove Friend</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 bg-gray-700 border-gray-600 hover:bg-gray-600 touch-manipulation"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Message
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 bg-gray-700 border-gray-600 hover:bg-gray-600 touch-manipulation"
                    >
                      <Gift className="w-4 h-4 mr-2" />
                      Gift
                    </Button>
                  </div>
                </div>
              ))}

              {/* Bottom Padding */}
              <div className="h-16" />
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Friend Requests */}
        <TabsContent value="requests" className="flex-1 mt-0">
          <ScrollArea className="h-[calc(100vh-220px)]">
            <div className="p-4 space-y-3">
              {mockRequests.length === 0 && (
                <div className="text-center py-12">
                  <Mail className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                  <p className="text-gray-400">No pending requests</p>
                </div>
              )}

              {mockRequests.map((request) => (
                <div
                  key={request.id}
                  className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 rounded-xl p-4 border-2 border-purple-500/50"
                >
                  <div className="flex items-start gap-3 mb-3">
                    {/* Avatar */}
                    <div className="relative">
                      <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-purple-500">
                        <div className="w-full h-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-xl font-bold">
                          {request.from.name.charAt(0).toUpperCase()}
                        </div>
                      </div>
                    </div>

                    {/* Request Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-white mb-1">{request.from.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                        <Trophy className="w-4 h-4 text-yellow-400" />
                        <span>Lv.{request.from.level}</span>
                        <span className="text-gray-600">•</span>
                        <span className="text-cyan-400">{formatNumber(request.from.chips)}</span>
                      </div>
                      <p className="text-xs text-gray-400">{getTimeAgo(request.timestamp)}</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 touch-manipulation"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 bg-gray-700 border-gray-600 hover:bg-gray-600 touch-manipulation"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Decline
                    </Button>
                  </div>
                </div>
              ))}

              {/* Bottom Padding */}
              <div className="h-16" />
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Add Friends */}
        <TabsContent value="search" className="flex-1 mt-0">
          <div className="p-4">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border-2 border-gray-700 text-center">
              <UserPlus className="w-16 h-16 mx-auto text-cyan-400 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Add Friends</h3>
              <p className="text-gray-400 mb-4">Search for players by username or ID</p>

              <Input
                placeholder="Enter username or player ID..."
                className="bg-gray-700 border-gray-600 text-white mb-4"
              />

              <Button className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 touch-manipulation">
                <Search className="w-4 h-4 mr-2" />
                Search Players
              </Button>
            </div>

            {/* Suggested Friends */}
            <div className="mt-6">
              <h3 className="text-lg font-bold text-white mb-3">Suggested Friends</h3>
              <div className="space-y-2">
                {[
                  { name: "David Lee", level: 42, chips: 12000000, mutual: 3 },
                  { name: "Sophie Turner", level: 55, chips: 28000000, mutual: 5 },
                ].map((suggested, idx) => (
                  <div
                    key={idx}
                    className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-3 border-2 border-gray-700 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold">
                        {suggested.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-white font-semibold">{suggested.name}</p>
                        <p className="text-xs text-gray-400">{suggested.mutual} mutual friends</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-gray-700 border-gray-600 hover:bg-gray-600 touch-manipulation"
                    >
                      <UserPlus className="w-4 h-4 mr-1" />
                      Add
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
